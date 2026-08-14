import type { IStorage } from "../storage";
import type { Order } from "@shared/schema";

function dayOf(order: Order): string {
  return new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export async function getDailyBillingNumber(st: IStorage, order: Order): Promise<string> {
  const orders = (await st.getOrders()).filter((o) => dayOf(o) === dayOf(order))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const sequence = Math.max(1, orders.findIndex((o) => o.id === order.id) + 1);
  const yymmdd = dayOf(order).replace(/-/g, "").slice(2);
  return `BG${yymmdd}${String(sequence).padStart(2, "0")}`;
}

export async function getDailyKotSequence(st: IStorage, order: Order): Promise<number> {
  // KOT numbers are ticket numbers, not order numbers. An add-on creates
  // another ticket for the same order, so counting order.kotCount against
  // other orders can reuse a number when tickets were created out of order.
  const orders = (await st.getOrders()).filter((o) => dayOf(o) === dayOf(order));
  const tickets: { key: string; createdAt: number }[] = [];

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
    for (const [key, createdAt] of batches) tickets.push({ key, createdAt });
  }

  tickets.sort((a, b) => a.createdAt - b.createdAt || a.key.localeCompare(b.key));
  const currentBatch = Math.max(1, order.kotCount ?? 1);
  const currentKey = `${order.id}:${currentBatch}`;
  const index = tickets.findIndex((ticket) => ticket.key === currentKey);
  return index >= 0 ? index + 1 : tickets.length + 1;
}