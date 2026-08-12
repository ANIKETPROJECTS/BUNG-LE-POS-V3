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
  const orders = (await st.getOrders()).filter((o) => dayOf(o) === dayOf(order))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return orders.filter((o) => new Date(o.createdAt).getTime() < new Date(order.createdAt).getTime())
    .reduce((total, o) => total + (o.kotCount ?? 0), 0) + (order.kotCount ?? 1);
}