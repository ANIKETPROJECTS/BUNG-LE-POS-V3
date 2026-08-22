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

  // Keep one invoice number for an ongoing table order. This also covers a
  // new order added to a table that already has an invoiced order in progress.
  const existingInvoiceOrder = orders
    .filter((candidate) =>
      candidate.id === order.id ||
      (order.tableId &&
        candidate.tableId === order.tableId &&
        candidate.status !== "completed")
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((candidate) => invoiceByOrderId.get(candidate.id))
    .find((invoice) => invoice);
  if (existingInvoiceOrder) {
    return existingInvoiceOrder.invoiceNumber;
  }

  // Multiple KOTs can be printed before checkout creates the final invoice.
  // In that case, keep the invoice number anchored to this order's first KOT.
  const sequence = await getDailyKotSequence(
    st,
    order.kotCount && order.kotCount > 1
      ? { ...order, kotCount: 1 }
      : order,
  );
  const yymmdd = dayOf(order).replace(/-/g, "").slice(2);
  return `BG${yymmdd}${String(sequence).padStart(2, "0")}`;
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
    const existingInvoice = orders
      .filter((candidate) =>
        candidate.id === order.id ||
        (order.tableId &&
          candidate.tableId === order.tableId &&
          candidate.status !== "completed"),
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((candidate) => invoiceByOrderId.get(candidate.id))
      .find((invoice) => invoice);

    const sequence = existingInvoice
      ? null
      : (() => {
          const firstBatchOrder =
            order.kotCount && order.kotCount > 1
              ? { ...order, kotCount: 1 }
              : order;
          const currentBatch = Math.max(1, firstBatchOrder.kotCount ?? 1);
          const currentKey = `${firstBatchOrder.id}:${currentBatch}`;
          const index = tickets.findIndex(
            (ticket) =>
              ticket.day === dayOf(firstBatchOrder) &&
              ticket.key === currentKey,
          );
          return index >= 0 ? index + 1 : tickets.length + 1;
        })();

    const yymmdd = dayOf(order).replace(/-/g, "").slice(2);
    result.set(
      order.id,
      existingInvoice?.invoiceNumber ??
        `BG${yymmdd}${String(sequence).padStart(2, "0")}`,
    );
  }
  return result;
}