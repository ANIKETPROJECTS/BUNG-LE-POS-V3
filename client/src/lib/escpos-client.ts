/**
 * Browser-side ESC/POS formatter — mirrors server/utils/escpos.ts
 * but returns Uint8Array instead of Node.js Buffer.
 */

const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;

const enc = new TextEncoder();

function cmd(...bytes: number[]): number[] {
  return bytes;
}

function text(str: string): number[] {
  return Array.from(enc.encode(str));
}

function lines(n = 1): number[] {
  return Array(n).fill(LF);
}

function concat(parts: number[][]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

// ─── Test Print ──────────────────────────────────────────────────────────────

export function buildTestPrint(printerName: string, ip: string): Uint8Array {
  const now = new Date().toLocaleString("en-IN");
  const sep = "--------------------------------";

  return concat([
    cmd(ESC, 0x40),           // init
    cmd(ESC, 0x61, 0x01),    // center
    cmd(ESC, 0x21, 0x30),    // double size
    text("TEST PRINT\n"),
    cmd(ESC, 0x21, 0x00),    // normal
    text(sep + "\n"),
    cmd(ESC, 0x61, 0x00),    // left
    text(`Printer : ${printerName}\n`),
    text(`IP      : ${ip}\n`),
    text(`Time    : ${now}\n`),
    text(sep + "\n"),
    cmd(ESC, 0x61, 0x01),    // center
    cmd(ESC, 0x45, 0x01),    // bold on
    text("Printer is working!\n"),
    cmd(ESC, 0x45, 0x00),    // bold off
    lines(4),
    cmd(GS, 0x56, 0x42, 0x03), // partial cut
  ]);
}

// ─── KOT Slip ────────────────────────────────────────────────────────────────

export interface KOTItem {
  name: string;
  quantity: number;
  notes?: string | null;
}

export interface KOTOptions {
  restaurantName?: string;
  kotNumber: string;
  orderType: string;
  tableNumber?: string;
  floorName?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string | Date;
  items: KOTItem[];
  isUpdated?: boolean;
}

export function buildKOTEscPos(opts: KOTOptions): Uint8Array {
  const {
    restaurantName = "Restaurant POS",
    kotNumber,
    orderType,
    tableNumber,
    floorName,
    customerName,
    customerPhone,
    createdAt,
    items,
    isUpdated = false,
  } = opts;

  const now = new Date(createdAt);
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const sep = "--------------------------------";

  const parts: number[][] = [];

  parts.push(cmd(ESC, 0x40));           // init
  parts.push(cmd(ESC, 0x61, 0x01));    // center

  parts.push(cmd(ESC, 0x21, 0x30));    // double size
  parts.push(text(restaurantName + "\n"));
  parts.push(cmd(ESC, 0x21, 0x00));    // normal
  parts.push(text("Kitchen Order Ticket\n"));

  if (isUpdated) {
    parts.push(text(sep + "\n"));
    parts.push(cmd(ESC, 0x21, 0x10));
    parts.push(cmd(ESC, 0x45, 0x01));
    parts.push(text("  *** UPDATED KOT ***\n"));
    parts.push(cmd(ESC, 0x45, 0x00));
    parts.push(cmd(ESC, 0x21, 0x00));
  }

  parts.push(text(sep + "\n"));
  parts.push(cmd(ESC, 0x61, 0x00));    // left

  parts.push(cmd(ESC, 0x45, 0x01));
  parts.push(text(`${kotNumber}\n`));
  parts.push(cmd(ESC, 0x45, 0x00));

  parts.push(text(`Date : ${dateStr}  ${timeStr}\n`));

  if (orderType === "dine-in" && tableNumber) {
    parts.push(text(`Table: ${tableNumber}${floorName ? `  (${floorName})` : ""}\n`));
  } else {
    const typeLabel = orderType === "delivery" ? "Delivery" : "Pickup";
    parts.push(text(`Type : ${typeLabel}\n`));
  }

  if (customerName) {
    parts.push(text(`Cust : ${customerName}${customerPhone ? `  ${customerPhone}` : ""}\n`));
  }

  parts.push(text(sep + "\n"));

  parts.push(cmd(ESC, 0x45, 0x01));
  parts.push(text("# Item                         Qty\n"));
  parts.push(cmd(ESC, 0x45, 0x00));
  parts.push(text(sep + "\n"));

  items.forEach((item, idx) => {
    const num  = String(idx + 1).padEnd(2);
    const name = item.name.substring(0, 24).padEnd(24);
    const qty  = String(item.quantity).padStart(3);
    parts.push(cmd(ESC, 0x21, 0x08));  // double height
    parts.push(text(`${num} ${name} ${qty}\n`));
    parts.push(cmd(ESC, 0x21, 0x00));
    if (item.notes) {
      parts.push(text(`   >> ${item.notes}\n`));
    }
  });

  parts.push(text(sep + "\n"));
  parts.push(cmd(ESC, 0x61, 0x01));    // center
  parts.push(cmd(ESC, 0x45, 0x01));
  parts.push(text("*** ORDERED ***\n"));
  parts.push(cmd(ESC, 0x45, 0x00));

  parts.push(lines(4));
  parts.push(cmd(GS, 0x56, 0x42, 0x03)); // partial cut

  return concat(parts);
}
