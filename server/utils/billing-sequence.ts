import type { IStorage } from "../storage";
import type { Invoice, Order } from "@shared/schema";

function dayOf(order: Order): string {
  return new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function calculateDailyKotInvoiceNumbers(
  orders: Order[],
  invoices: Invoice[],
  targetOrders: Order[],
): Map<string, string> {
  const results = new Map<string, string>();
  if (targetOrders.length === 0) return results;

  const ordersByDay = new Map<string, Order[]>();
  for (const order of orders) {
    const day = dayOf(order);
    const dailyOrders = ordersByDay.get(day) ?? [];
    dailyOrders.push(order);
    ordersByDay.set(day, dailyOrders);
  }

  const invoicesByDay = new Map<string, Invoice[]>();
  const invoiceByOrderId = new Map(invoices.map((invoice) => [invoice.orderId, invoice]));
  for (const invoice of invoices) {
    const day = new Date(invoice.createdAt).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    const dailyInvoices = invoicesByDay.get(day) ?? [];
    dailyInvoices.push(invoice);
    invoicesByDay.set(day, dailyInvoices);
  }

  const targetsByDay = new Map<string, Order[]>();
  for (const target of targetOrders) {
    const day = dayOf(target);
    const dailyTargets = targetsByDay.get(day) ?? [];
    dailyTargets.push(target);
    targetsByDay.set(day, dailyTargets);
  }

  targetsByDay.forEach((dailyTargets, day) => {
    const activeOrders = (ordersByDay.get(day) ?? []).filter(
      (candidate) => candidate.status !== "completed" && candidate.status !== "paid",
    );
    const groupKey = (candidate: Order) =>
      candidate.tableId ? `table:${candidate.tableId}` : `order:${candidate.id}`;
    const groups = new Map<string, Order[]>();
    for (const candidate of activeOrders) {
      const key = groupKey(candidate);
      const members = groups.get(key) ?? [];
      members.push(candidate);
      groups.set(key, members);
    }

    const firstCreatedAt = (members: Order[]) =>
      members.reduce(
        (minimum, member) => Math.min(minimum, new Date(member.createdAt).getTime()),
        Infinity,
      );
    const sortedGroups = Array.from(groups.entries()).sort(
      ([, left], [, right]) => firstCreatedAt(left) - firstCreatedAt(right),
    );

    const groupNumbers = new Map<string, Set<string>>();
    const numberGroups = new Map<string, Set<string>>();
    for (const [key, members] of sortedGroups) {
      const numbers = new Set<string>();
      for (const member of members) {
        if (member.invoiceNumber && member.invoiceNumberSource === "pos") {
          numbers.add(member.invoiceNumber);
        }
        const invoiceNumber = invoiceByOrderId.get(member.id)?.invoiceNumber;
        if (invoiceNumber) numbers.add(invoiceNumber);
      }
      groupNumbers.set(key, numbers);
      numbers.forEach((number) => {
        const keys = numberGroups.get(number) ?? new Set<string>();
        keys.add(key);
        numberGroups.set(number, keys);
      });
    }

    const yymmdd = day.replace(/-/g, "").slice(2);
    const usedNumbers = new Set(
      (invoicesByDay.get(day) ?? []).map((invoice) => invoice.invoiceNumber),
    );
    const assigned = new Set<string>();
    const numberByOrderId = new Map<string, string>();
    let next = 1;

    for (const [key, members] of sortedGroups) {
      const uniqueExisting = Array.from(groupNumbers.get(key) ?? []).filter(
        (number) => (numberGroups.get(number)?.size ?? 0) === 1,
      );
      let number = uniqueExisting[0];
      if (!number) {
        do {
          number = `BG${yymmdd}${String(next++).padStart(2, "0")}`;
        } while (usedNumbers.has(number) || assigned.has(number));
      }
      assigned.add(number);
      for (const member of members) {
        numberByOrderId.set(member.id, number);
      }
    }

    let fallbackNumber: string;
    do {
      fallbackNumber = `BG${yymmdd}${String(next++).padStart(2, "0")}`;
    } while (usedNumbers.has(fallbackNumber));

    for (const target of dailyTargets) {
      results.set(target.id, numberByOrderId.get(target.id) ?? fallbackNumber);
    }
  });

  return results;
}

export async function getDailyBillingNumber(st: IStorage, order: Order): Promise<string> {
  const [allOrders, invoices] = await Promise.all([
    st.getOrders(),
    st.getInvoices(),
  ]);
  const invoicedOrderIds = new Set(invoices.map((invoice) => invoice.orderId));
  const orders = allOrders.filter((o) =>
    dayOf(o) === dayOf(order) &&
    (o.id === order.id || invoicedOrderIds.has(o.id))
  )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const sequence = Math.max(1, orders.findIndex((o) => o.id === order.id) + 1);
  const yymmdd = dayOf(order).replace(/-/g, "").slice(2);
  return `BG${yymmdd}${String(sequence).padStart(2, "0")}`;
}

export async function getDailyKotSequence(st: IStorage, order: Order): Promise<number> {
  // KOT numbers are ticket numbers, not order numbers. An add-on creates
  // another ticket for the same order, so counting order.kotCount against
  // other orders can reuse a number when tickets were created out of order.
  const [allOrders, invoices] = await Promise.all([
    st.getOrders(),
    st.getInvoices(),
  ]);
  const invoicedOrderIds = new Set(invoices.map((invoice) => invoice.orderId));
  const orders = allOrders.filter((o) =>
    dayOf(o) === dayOf(order) &&
    (o.status !== "completed" || invoicedOrderIds.has(o.id))
  );
  const orderItems = await st.getOrderItemsByOrderIds(orders.map((candidate) => candidate.id));
  const itemsByOrderId = new Map<string, typeof orderItems>();
  for (const item of orderItems) {
    const items = itemsByOrderId.get(item.orderId) ?? [];
    items.push(item);
    itemsByOrderId.set(item.orderId, items);
  }
  const tickets: { key: string; createdAt: number; day: string }[] = [];

  for (const candidate of orders) {
    const items = itemsByOrderId.get(candidate.id) ?? [];
    const batches = new Map<string, number>();
    for (const item of items) {
      const batch = item.kotBatch ?? 1;
      const createdAt = new Date(item.createdAt ?? candidate.createdAt).getTime();
      const key = `${candidate.id}:${batch}`;
      batches.set(key, Math.min(batches.get(key) ?? Infinity, createdAt));
    }
    // Orders with no persisted item timestamps still contribute their
    // historical KOT count in creation order.
    if (!items.length) {
      for (let batch = 1; batch <= (candidate.kotCount ?? 0); batch++) {
        batches.set(`${candidate.id}:${batch}`, new Date(candidate.createdAt).getTime() + batch);
      }
    }
    batches.forEach((createdAt, key) => {
      tickets.push({ key, createdAt, day: dayOf(candidate) });
    });
  }

  tickets.sort((a, b) => a.createdAt - b.createdAt || a.key.localeCompare(b.key));
  const currentBatch = Math.max(1, order.kotCount ?? 1);
  const currentKey = `${order.id}:${currentBatch}`;
  const index = tickets.findIndex((ticket) => ticket.key === currentKey);
  return index >= 0 ? index + 1 : tickets.length + 1;
}

export async function getDailyKotInvoiceNumber(
  st: IStorage,
  order: Order,
): Promise<string> {
  const [orders, invoices] = await Promise.all([
    st.getOrders(),
    st.getInvoices(),
  ]);
  return calculateDailyKotInvoiceNumbers(orders, invoices, [order]).get(order.id)!;
}

export async function ensureDailyKotInvoiceNumber(
  st: IStorage,
  order: Order,
): Promise<{ order: Order; invoiceNumber: string }> {
  // Keep a POS-assigned invoice number stable across every KOT for an ongoing
  // order instead of rescanning the day's orders and invoices on each add-on.
  if (order.invoiceNumber && order.invoiceNumberSource === "pos") {
    return { order, invoiceNumber: order.invoiceNumber };
  }

  const generated = await getDailyKotInvoiceNumber(st, order);
  const persisted = await st.setOrderInvoiceNumber(order.id, generated);
  const resolved = persisted ?? { ...order, invoiceNumber: generated };
  return {
    order: resolved,
    invoiceNumber: resolved.invoiceNumber ?? generated,
  };
}

/**
 * Resolve invoice references for a group of KOT-board orders from one
 * consistent order and invoice snapshot.
 */
export async function getDailyKotInvoiceNumbers(
  st: IStorage,
  targetOrders: Order[],
): Promise<Map<string, string>> {
  if (targetOrders.length === 0) return new Map();

  const [orders, invoices] = await Promise.all([
    st.getOrders(),
    st.getInvoices(),
  ]);
  return calculateDailyKotInvoiceNumbers(orders, invoices, targetOrders);
}