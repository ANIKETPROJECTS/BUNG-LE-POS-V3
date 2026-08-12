import * as net from "net";
import type { Order, OrderItem } from "@shared/schema";

// ESC/POS command constants
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;
const CR = 0x0d;

function cmd(...bytes: number[]): Buffer {
  return Buffer.from(bytes);
}

function text(str: string): Buffer {
  return Buffer.from(str, "utf8");
}

function lines(n = 1): Buffer {
  return Buffer.from(Array(n).fill(LF));
}

export function buildKOTEscPos(opts: {
  order: Order;
  items: OrderItem[];
  tableNumber?: string;
  floorName?: string;
  kotNumber: string;
  restaurantName?: string;
  isUpdated?: boolean;
}): Buffer {
  const {
    order,
    items,
    tableNumber,
    floorName,
    kotNumber,
    restaurantName = "BUNGLE",
    isUpdated = false,
  } = opts;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  const sep = "--------------------------------";

  const parts: Buffer[] = [];

  // Initialize printer
  parts.push(cmd(ESC, 0x40));

  // Center align
  parts.push(cmd(ESC, 0x61, 0x01));

  // Double-size restaurant name
  parts.push(cmd(ESC, 0x21, 0x30)); // double height+width
  parts.push(text(restaurantName + "\n"));

  // Normal size
  parts.push(cmd(ESC, 0x21, 0x00));
  parts.push(text("Kitchen Order Ticket\n"));

  parts.push(text(sep + "\n"));

  // Left align for details
  parts.push(cmd(ESC, 0x61, 0x00));

  // Large daily chef sequence (01, 02, 03...). The full BG number remains
  // available on the customer invoice; the short sequence is easiest to read
  // and call out in the kitchen.
  const sequence = kotNumber.slice(-2);
  parts.push(cmd(ESC, 0x61, 0x01));
  parts.push(cmd(ESC, 0x21, 0x30));
  parts.push(cmd(ESC, 0x45, 0x01));
  parts.push(text(`SEQ ${sequence}\n`));
  parts.push(cmd(ESC, 0x45, 0x00));
  parts.push(cmd(ESC, 0x21, 0x00));
  parts.push(cmd(ESC, 0x61, 0x00));
  parts.push(cmd(ESC, 0x45, 0x01));
  parts.push(text(`KOT: ${kotNumber}\n`));
  parts.push(cmd(ESC, 0x45, 0x00));

  parts.push(text(`Date : ${dateStr}  ${timeStr}\n`));

  if (order.orderType === "dine-in" && tableNumber) {
    parts.push(
      text(`Table: ${tableNumber}${floorName ? `  (${floorName})` : ""}\n`),
    );
  } else {
    const typeLabel = order.orderType === "delivery" ? "Delivery" : "Pickup";
    parts.push(text(`Type : ${typeLabel}\n`));
  }

  if (order.customerName) {
    parts.push(
      text(
        `Cust : ${order.customerName}${order.customerPhone ? `  ${order.customerPhone}` : ""}\n`,
      ),
    );
  }

  parts.push(text(sep + "\n"));

  // Items header
  parts.push(cmd(ESC, 0x45, 0x01));
  parts.push(text("# Item                         Qty\n"));
  parts.push(cmd(ESC, 0x45, 0x00));
  parts.push(text(sep + "\n"));

  // Items
  items.forEach((item, idx) => {
    const num = String(idx + 1).padEnd(2);
    const qty = String(item.quantity).padStart(3);
    const words = item.name.split(/\s+/);
    const nameLines: string[] = [];
    let line = "";
    for (const word of words) {
      if ((line + (line ? " " : "") + word).length > 24 && line) {
        nameLines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) nameLines.push(line);
    parts.push(cmd(ESC, 0x21, 0x08));
    nameLines.forEach((nameLine, lineIndex) => {
      const prefix = lineIndex === 0 ? `${num} ` : "   ";
      const suffix = lineIndex === nameLines.length - 1 ? ` ${qty}` : "";
      parts.push(text(`${prefix}${nameLine}${suffix}\n`));
    });
    parts.push(cmd(ESC, 0x21, 0x00));
    if (item.notes) {
      parts.push(text(`   >> ${item.notes}\n`));
    }
  });

  parts.push(text(sep + "\n"));

  // Center "ORDERED"
  parts.push(cmd(ESC, 0x61, 0x01));
  parts.push(cmd(ESC, 0x45, 0x01));
  parts.push(text("*** ORDERED ***\n"));
  parts.push(cmd(ESC, 0x45, 0x00));

  // Feed and cut
  parts.push(lines(4));
  parts.push(cmd(GS, 0x56, 0x42, 0x03)); // partial cut

  return Buffer.concat(parts);
}

export interface BillItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export function buildBillEscPos(opts: {
  restaurantName?: string;
  invoiceNumber: string;
  date: Date;
  tableNumber?: string | null;
  floorName?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  orderType?: string;
  items: BillItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  total: number;
  paymentMode?: string;
  gstEnabled?: boolean;
  gstNumber?: string;
}): Buffer {
  const {
    restaurantName = "BUNGLE",
    invoiceNumber,
    date,
    tableNumber,
    floorName,
    customerName,
    customerPhone,
    orderType,
    items,
    subtotal,
    cgst,
    sgst,
    serviceCharge,
    total,
    paymentMode = "Cash",
    gstEnabled = false,
    gstNumber = "",
  } = opts;

  const sep = "--------------------------------";
  const sep2 = "================================";
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const parts: Buffer[] = [];

  // Init
  parts.push(cmd(ESC, 0x40));

  // Center + large restaurant name
  parts.push(cmd(ESC, 0x61, 0x01));
  parts.push(cmd(ESC, 0x21, 0x30));
  parts.push(text(restaurantName + "\n"));
  parts.push(cmd(ESC, 0x21, 0x00));
  parts.push(text("TAX INVOICE\n"));
  if (gstEnabled && gstNumber) {
    parts.push(text(`GSTIN: ${gstNumber}\n`));
  }
  parts.push(text(sep + "\n"));

  // Left align for details
  parts.push(cmd(ESC, 0x61, 0x00));
  parts.push(text(`Invoice : ${invoiceNumber}\n`));
  parts.push(text(`Date    : ${dateStr}  ${timeStr}\n`));

  if (orderType === "dine-in" && tableNumber) {
    parts.push(
      text(`Table   : ${tableNumber}${floorName ? `  (${floorName})` : ""}\n`),
    );
  } else if (orderType === "delivery") {
    parts.push(text(`Type    : Delivery\n`));
  } else if (orderType === "pickup") {
    parts.push(text(`Type    : Pickup\n`));
  }

  if (customerName) {
    parts.push(
      text(
        `Customer: ${customerName}${customerPhone ? `  ${customerPhone}` : ""}\n`,
      ),
    );
  }

  parts.push(text(sep + "\n"));

  // Items header
  parts.push(cmd(ESC, 0x45, 0x01));
  parts.push(text("Item             Qty    Amount\n"));
  parts.push(cmd(ESC, 0x45, 0x00));
  parts.push(text(sep + "\n"));

  // Items
  items.forEach((item) => {
    const name = item.name.substring(0, 17).padEnd(17);
    const qty = String(item.quantity).padStart(3);
    const amount = (item.price * item.quantity).toFixed(0).padStart(9);
    parts.push(text(`${name}${qty}${amount}\n`));
    if (item.notes) {
      parts.push(text(`  >> ${item.notes}\n`));
    }
  });

  parts.push(text(sep + "\n"));

  // Totals
  const row = (label: string, value: string) => {
    const l = label.padEnd(20);
    const v = value.padStart(12);
    parts.push(text(`${l}${v}\n`));
  };

  row("Subtotal", `Rs.${subtotal.toFixed(2)}`);
  if (gstEnabled && cgst > 0) {
    row("CGST", `Rs.${cgst.toFixed(2)}`);
    row("SGST", `Rs.${sgst.toFixed(2)}`);
  } else if (!gstEnabled && cgst + sgst > 0) {
    row("Tax", `Rs.${(cgst + sgst).toFixed(2)}`);
  }
  if (serviceCharge > 0) {
    row("Service Charge", `Rs.${serviceCharge.toFixed(2)}`);
  }

  parts.push(text(sep2 + "\n"));

  // Bold total
  parts.push(cmd(ESC, 0x45, 0x01));
  parts.push(cmd(ESC, 0x21, 0x10)); // double width
  const totalLabel = "TOTAL".padEnd(13);
  const totalVal = `Rs.${total.toFixed(2)}`.padStart(18);
  parts.push(text(`${totalLabel}${totalVal}\n`));
  parts.push(cmd(ESC, 0x21, 0x00));
  parts.push(cmd(ESC, 0x45, 0x00));

  parts.push(text(sep2 + "\n"));
  parts.push(text(`Payment : ${paymentMode.toUpperCase()}\n`));
  parts.push(text(sep + "\n"));

  // Footer
  parts.push(cmd(ESC, 0x61, 0x01));
  parts.push(text("Thank you! Visit again.\n"));

  // Feed + cut
  parts.push(lines(4));
  parts.push(cmd(GS, 0x56, 0x42, 0x03));

  return Buffer.concat(parts);
}

export interface PrintResult {
  success: boolean;
  error?: string;
}

export function printToThermal(
  ip: string,
  port: number,
  data: Buffer,
  timeoutMs = 5000,
): Promise<PrintResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const done = (result: PrintResult) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    const timer = setTimeout(
      () => done({ success: false, error: "Connection timed out" }),
      timeoutMs,
    );

    socket.connect(port, ip, () => {
      socket.write(data, (err) => {
        clearTimeout(timer);
        if (err) {
          done({ success: false, error: err.message });
        } else {
          setTimeout(() => done({ success: true }), 300);
        }
      });
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      done({ success: false, error: err.message });
    });
  });
}

export function checkPrinterOnline(
  ip: string,
  port: number,
  timeoutMs = 3000,
): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const finish = (result: boolean) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(result);
    };

    setTimeout(() => finish(false), timeoutMs);
    socket.connect(port, ip, () => finish(true));
    socket.on("error", () => finish(false));
  });
}
