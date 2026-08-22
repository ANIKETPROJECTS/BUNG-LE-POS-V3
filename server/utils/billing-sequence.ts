import type { IStorage } from "../storage";
import type { Order } from "@shared/schema";

function dayOf(order: Order): string {
  return new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
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
  const tickets: { key: string; createdAt: number; day: string }[] = [];

  for (const candidate of orders) {
    const items = await st.getOrderItems(candidate.id);
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
    for (const [key, createdAt] of batches) {
      tickets.push({ key, createdAt, day: dayOf(candidate) });
    }
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
  const invoiceByOrderId = new Map(invoices.map((invoice) => [invoice.orderId, invoice]));
  const active = orders.filter((candidate) =>
    dayOf(candidate) === dayOf(order) &&
    candidate.status !== "completed" &&
    candidate.status !== "paid",
  );
  const groupKey = (candidate: Order) =>
    candidate.tableId ? `table:${candidate.tableId}` : `order:${candidate.id}`;
  const groups = new Map<string, Order[]>();
  for (const candidate of active) {
    const key = groupKey(candidate);
    groups.set(key, [...(groups.get(key) ?? []), candidate]);
  }
  const sortedGroups = [...groups.entries()].sort(([, left], [, right]) =>
    Math.min(...left.map((item) => new Date(item.createdAt).getTime())) -
    Math.min(...right.map((item) => new Date(item.createdAt).getTime())),
  );
  const groupNumbers = new Map<string, Set<string>>();
  const numberGroups = new Map<string, Set<string>>();
  for (const [key, members] of sortedGroups) {
    const numbers = new Set<string>();
    for (const member of members) {
      // An invoiceNumber copied from an external order document is not trusted.
      // Only a number explicitly assigned by this POS can anchor a table session.
      if (member.invoiceNumber && member.invoiceNumberSource === "pos") {
        numbers.add(member.invoiceNumber);
      }
      const invoice = invoiceByOrderId.get(member.id);
      if (invoice?.invoiceNumber) numbers.add(invoice.invoiceNumber);
    }
    groupNumbers.set(key, numbers);
    for (const number of numbers) {
      numberGroups.set(number, new Set([...(numberGroups.get(number) ?? []), key]));
    }
  }
  const yymmdd = dayOf(order).replace(/-/g, "").slice(2);
  const usedNumbers = new Set(
    invoices
      .filter((invoice) => new Date(invoice.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) === dayOf(order))
      .map((invoice) => invoice.invoiceNumber),
  );
  const assigned = new Set<string>();
  let next = 1;
  for (const [key, members] of sortedGroups) {
    const uniqueExisting = [...(groupNumbers.get(key) ?? [])]
      .filter((number) => (numberGroups.get(number)?.size ?? 0) === 1);
    let number = uniqueExisting[0];
    if (!number) {
      do {
        number = `BG${yymmdd}${String(next++).padStart(2, "0")}`;
      } while (usedNumbers.has(number) || assigned.has(number));
    }
    assigned.add(number);
    if (members.some((member) => member.id === order.id)) return number;
  }
  do {
    const number = `BG${yymmdd}${String(next++).padStart(2, "0")}`;
    if (!usedNumbers.has(number)) return number;
  } while (true);
}

export async function ensureDailyKotInvoiceNumber(
  st: IStorage,
  order: Order,
): Promise<{ order: Order; invoiceNumber: string }> {
  const generated = await getDailyKotInvoiceNumber(st, order);
  const persisted = await st.setOrderInvoiceNumber(order.id, generated);
  const resolved = persisted ?? { ...order, invoiceNumber: generated };
  return {
    order: resolved,
    invoiceNumber: resolved.invoiceNumber ?? generated,
  };
}

/**
 * Resolve invoice references for a group of KOT-board orders in one pass.
 * The single-order helper is appropriate for a print action, but calling it
 * once per order causes every call to reload all orders, invoices, and items.
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
  const invoiceByOrderId = new Map(invoices.map((invoice) => [invoice.orderId, invoice]));
  const eligibleOrders = orders.filter((candidate) =>
    targetOrders.some((target) => dayOf(candidate) === dayOf(target)) &&
    (candidate.status !== "completed" || invoiceByOrderId.has(candidate.id)),
  );
  const itemEntries = await Promise.all(
    eligibleOrders.map(async (candidate) => [candidate.id, await st.getOrderItems(candidate.id)] as const),
  );
  const itemsByOrderId = new Map(itemEntries);
  const tickets: { key: string; createdAt: number }[] = [];

  for (const candidate of eligibleOrders) {
    const items = itemsByOrderId.get(candidate.id) ?? [];
    const batches = new Map<string, number>();
    for (const item of items) {
      const batch = item.kotBatch ?? 1;
      const createdAt = new Date(item.createdAt ?? candidate.createdAt).getTime();
      const key = `${candidate.id}:${batch}`;
      batches.set(key, Math.min(batches.get(key) ?? Infinity, createdAt));
    }
    if (!items.length) {
      for (let batch = 1; batch <= (candidate.kotCount ?? 0); batch++) {
        batches.set(
          `${candidate.id}:${batch}`,
          new Date(candidate.createdAt).getTime() + batch,
        );
      }
    }
    for (const [key, createdAt] of batches) tickets.push({ key, createdAt });
  }

  tickets.sort((a, b) => a.createdAt - b.createdAt || a.key.localeCompare(b.key));
  const result = new Map<string, string>();
  for (const order of targetOrders) {
    result.set(order.id, await getDailyKotInvoiceNumber(st, order));
  }
  return result;
}