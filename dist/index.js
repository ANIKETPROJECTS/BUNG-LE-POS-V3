var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categoryUnits: () => categoryUnits,
  insertCustomerSchema: () => insertCustomerSchema,
  insertDeliveryPersonSchema: () => insertDeliveryPersonSchema,
  insertFeedbackSchema: () => insertFeedbackSchema,
  insertFloorSchema: () => insertFloorSchema,
  insertInventoryItemSchema: () => insertInventoryItemSchema,
  insertInventoryUsageSchema: () => insertInventoryUsageSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPrinterSchema: () => insertPrinterSchema,
  insertPurchaseOrderItemSchema: () => insertPurchaseOrderItemSchema,
  insertPurchaseOrderSchema: () => insertPurchaseOrderSchema,
  insertRecipeIngredientSchema: () => insertRecipeIngredientSchema,
  insertRecipeSchema: () => insertRecipeSchema,
  insertReservationSchema: () => insertReservationSchema,
  insertSupplierSchema: () => insertSupplierSchema,
  insertTableSchema: () => insertTableSchema,
  insertUserSchema: () => insertUserSchema,
  insertWastageSchema: () => insertWastageSchema
});
import { z as z2 } from "zod";
var insertUserSchema, insertFloorSchema, insertTableSchema, insertMenuItemSchema, insertOrderSchema, insertOrderItemSchema, insertInventoryItemSchema, insertRecipeSchema, insertRecipeIngredientSchema, insertSupplierSchema, insertPurchaseOrderSchema, insertPurchaseOrderItemSchema, insertWastageSchema, insertInvoiceSchema, insertReservationSchema, insertCustomerSchema, insertFeedbackSchema, insertInventoryUsageSchema, categoryUnits, insertPrinterSchema, insertDeliveryPersonSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    insertUserSchema = z2.object({
      username: z2.string(),
      password: z2.string()
    });
    insertFloorSchema = z2.object({
      name: z2.string(),
      displayOrder: z2.number().default(0)
    });
    insertTableSchema = z2.object({
      tableNumber: z2.string(),
      seats: z2.number(),
      status: z2.string().default("free"),
      floorId: z2.string().nullable().optional()
    });
    insertMenuItemSchema = z2.object({
      name: z2.string(),
      category: z2.string(),
      price: z2.string(),
      cost: z2.string(),
      available: z2.boolean().default(true),
      isVeg: z2.boolean().default(true),
      variants: z2.array(z2.string()).nullable().optional(),
      image: z2.string().nullable().optional(),
      description: z2.string().nullable().optional(),
      quickCode: z2.string().nullable().optional()
    });
    insertOrderSchema = z2.object({
      tableId: z2.string().nullable().optional(),
      orderType: z2.string(),
      status: z2.string().default("saved"),
      total: z2.string().default("0"),
      customerName: z2.string().nullable().optional(),
      customerPhone: z2.string().nullable().optional(),
      customerAddress: z2.string().nullable().optional(),
      paymentMode: z2.string().nullable().optional(),
      waiterId: z2.string().nullable().optional(),
      deliveryPersonId: z2.string().nullable().optional(),
      expectedPickupTime: z2.coerce.date().nullable().optional()
    });
    insertOrderItemSchema = z2.object({
      orderId: z2.string(),
      menuItemId: z2.string(),
      name: z2.string(),
      quantity: z2.number(),
      price: z2.string(),
      notes: z2.string().nullable().optional(),
      status: z2.string().default("new"),
      isVeg: z2.boolean().default(true)
    });
    insertInventoryItemSchema = z2.object({
      name: z2.string(),
      category: z2.string(),
      currentStock: z2.string(),
      unit: z2.string(),
      minStock: z2.string().default("0"),
      supplierId: z2.string().nullable().optional(),
      costPerUnit: z2.string().default("0"),
      image: z2.string().nullable().optional()
    });
    insertRecipeSchema = z2.object({
      menuItemId: z2.string()
    });
    insertRecipeIngredientSchema = z2.object({
      recipeId: z2.string(),
      inventoryItemId: z2.string(),
      quantity: z2.string(),
      unit: z2.string()
    });
    insertSupplierSchema = z2.object({
      name: z2.string(),
      contactPerson: z2.string().nullable().optional(),
      phone: z2.string(),
      email: z2.string().nullable().optional(),
      address: z2.string().nullable().optional(),
      status: z2.string().default("active")
    });
    insertPurchaseOrderSchema = z2.object({
      orderNumber: z2.string(),
      supplierId: z2.string(),
      orderDate: z2.coerce.date(),
      expectedDeliveryDate: z2.coerce.date().nullable().optional(),
      status: z2.string().default("pending"),
      totalAmount: z2.string().default("0"),
      notes: z2.string().nullable().optional()
    });
    insertPurchaseOrderItemSchema = z2.object({
      purchaseOrderId: z2.string(),
      inventoryItemId: z2.string(),
      quantity: z2.string(),
      unit: z2.string(),
      costPerUnit: z2.string(),
      totalCost: z2.string()
    });
    insertWastageSchema = z2.object({
      inventoryItemId: z2.string(),
      quantity: z2.string(),
      unit: z2.string(),
      reason: z2.string(),
      reportedBy: z2.string().nullable().optional(),
      notes: z2.string().nullable().optional()
    });
    insertInvoiceSchema = z2.object({
      invoiceNumber: z2.string(),
      orderId: z2.string(),
      tableNumber: z2.string().nullable().optional(),
      floorName: z2.string().nullable().optional(),
      customerName: z2.string().nullable().optional(),
      customerPhone: z2.string().nullable().optional(),
      subtotal: z2.string(),
      tax: z2.string(),
      cgst: z2.string().default("0"),
      sgst: z2.string().default("0"),
      serviceCharge: z2.string().default("0"),
      discount: z2.string().default("0"),
      total: z2.string(),
      paymentMode: z2.string(),
      splitPayments: z2.string().nullable().optional(),
      status: z2.string().default("Paid"),
      items: z2.string(),
      notes: z2.string().nullable().optional()
    });
    insertReservationSchema = z2.object({
      tableId: z2.string(),
      customerName: z2.string(),
      customerPhone: z2.string(),
      numberOfPeople: z2.number(),
      timeSlot: z2.coerce.date(),
      notes: z2.string().nullable().optional(),
      status: z2.string().default("active")
    });
    insertCustomerSchema = z2.object({
      name: z2.string(),
      phone: z2.string(),
      email: z2.string().nullable().optional(),
      address: z2.string().nullable().optional()
    });
    insertFeedbackSchema = z2.object({
      customerId: z2.string().nullable().optional(),
      customerName: z2.string(),
      rating: z2.number().min(1).max(5),
      comment: z2.string(),
      sentiment: z2.enum(["Positive", "Neutral", "Negative"]).default("Neutral")
    });
    insertInventoryUsageSchema = z2.object({
      inventoryItemId: z2.string(),
      itemName: z2.string(),
      quantity: z2.string(),
      unit: z2.string(),
      source: z2.string().default("manual"),
      notes: z2.string().nullable().optional()
    });
    categoryUnits = {
      "Vegetables & Produce": ["kg", "g", "pcs", "bunch", "box"],
      "Meat & Poultry": ["kg", "g", "pcs", "lb"],
      "Fish & Seafood": ["kg", "g", "pcs", "lb"],
      "Dairy & Cheese": ["L", "ml", "kg", "g", "pcs", "box"],
      "Bakery & Bread": ["kg", "g", "pcs", "dozen", "box"],
      "Grains & Pasta": ["kg", "g", "pcs", "bag"],
      "Oils & Condiments": ["L", "ml", "kg", "bottle", "jar"],
      "Spices & Seasonings": ["kg", "g", "ml", "jar"],
      "Beverages": ["L", "ml", "pcs", "bottle", "can"],
      "Fruits": ["kg", "g", "pcs", "bunch", "box"],
      "Frozen Items": ["kg", "g", "pcs", "box"],
      "Canned & Packaged": ["pcs", "can", "jar", "box", "kg"],
      "Sauces & Dressings": ["L", "ml", "kg", "bottle", "jar"],
      "Sugar & Sweeteners": ["kg", "g", "pcs", "box"],
      "Coffee & Tea": ["kg", "g", "pcs", "box", "bag"],
      "Eggs": ["pcs", "dozen", "crate"],
      "Nuts & Seeds": ["kg", "g", "pcs", "bag"],
      "Herbs & Aromatics": ["kg", "g", "bunch", "pcs"],
      "Dry Goods": ["kg", "g", "pcs", "bag", "box"],
      "Other": ["kg", "g", "L", "ml", "pcs", "box"]
    };
    insertPrinterSchema = z2.object({
      name: z2.string().min(1),
      ip: z2.string().min(1),
      port: z2.number().default(9100),
      type: z2.enum(["KOT", "Bill", "Label"]).default("KOT"),
      autoPrint: z2.boolean().default(true)
    });
    insertDeliveryPersonSchema = z2.object({
      name: z2.string(),
      phone: z2.string(),
      status: z2.string().default("available")
    });
  }
});

// server/utils/escpos.ts
var escpos_exports = {};
__export(escpos_exports, {
  buildBillEscPos: () => buildBillEscPos,
  buildKOTEscPos: () => buildKOTEscPos,
  checkPrinterOnline: () => checkPrinterOnline,
  printToThermal: () => printToThermal
});
import * as net from "net";
function cmd(...bytes) {
  return Buffer.from(bytes);
}
function text(str) {
  return Buffer.from(str, "utf8");
}
function lines(n = 1) {
  return Buffer.from(Array(n).fill(LF));
}
function buildKOTEscPos(opts) {
  const {
    order,
    items,
    tableNumber,
    floorName,
    kotNumber,
    restaurantName = "BUNGLE",
    isUpdated = false
  } = opts;
  const now = /* @__PURE__ */ new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });
  const sep = "-".repeat(48);
  const parts = [];
  parts.push(cmd(ESC, 64));
  parts.push(cmd(ESC, 97, 1));
  parts.push(cmd(ESC, 33, 48));
  parts.push(text(restaurantName + "\n"));
  parts.push(cmd(ESC, 33, 0));
  parts.push(text("Kitchen Order Ticket\n"));
  parts.push(text(sep + "\n"));
  parts.push(cmd(ESC, 97, 0));
  const sequence = opts.sequence ?? kotNumber.slice(-2);
  parts.push(cmd(ESC, 97, 1));
  parts.push(cmd(ESC, 33, 48));
  parts.push(cmd(ESC, 69, 1));
  parts.push(text(`SEQ ${sequence}
`));
  parts.push(cmd(ESC, 69, 0));
  parts.push(cmd(ESC, 33, 0));
  parts.push(cmd(ESC, 97, 0));
  parts.push(cmd(ESC, 69, 1));
  parts.push(text(`KOT: ${kotNumber}
`));
  parts.push(cmd(ESC, 69, 0));
  parts.push(text(`Date : ${dateStr}  ${timeStr}
`));
  if (order.orderType === "dine-in" && tableNumber) {
    parts.push(
      text(`Table: ${tableNumber}${floorName ? `  (${floorName})` : ""}
`)
    );
  } else {
    const typeLabel = order.orderType === "delivery" ? "Delivery" : "Pickup";
    parts.push(text(`Type : ${typeLabel}
`));
  }
  if (order.customerName) {
    parts.push(
      text(
        `Cust : ${order.customerName}${order.customerPhone ? `  ${order.customerPhone}` : ""}
`
      )
    );
  }
  parts.push(text(sep + "\n"));
  parts.push(cmd(ESC, 69, 1));
  parts.push(text("# Item                              Qty\n"));
  parts.push(cmd(ESC, 69, 0));
  parts.push(text(sep + "\n"));
  items.forEach((item, idx) => {
    const num = String(idx + 1).padEnd(2);
    const qty = String(item.quantity).padStart(3);
    const words = item.name.split(/\s+/);
    const nameLines = [];
    let line = "";
    for (const word of words) {
      if ((line + (line ? " " : "") + word).length > 34 && line) {
        nameLines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) nameLines.push(line);
    parts.push(cmd(ESC, 33, 8));
    nameLines.forEach((nameLine, lineIndex) => {
      const prefix = lineIndex === 0 ? `${num} ` : "   ";
      const itemText = `${prefix}${nameLine}`;
      const suffix = lineIndex === nameLines.length - 1 ? qty : "";
      parts.push(text(`${itemText.padEnd(39)}${suffix}
`));
    });
    parts.push(cmd(ESC, 33, 0));
    if (item.notes) {
      parts.push(text(`   >> ${item.notes}
`));
    }
  });
  parts.push(text(sep + "\n"));
  parts.push(cmd(ESC, 97, 1));
  parts.push(cmd(ESC, 69, 1));
  parts.push(text("*** ORDERED ***\n"));
  parts.push(cmd(ESC, 69, 0));
  parts.push(lines(4));
  parts.push(cmd(GS, 86, 66, 3));
  return Buffer.concat(parts);
}
function buildBillEscPos(opts) {
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
    gstNumber = ""
  } = opts;
  const sep = "-".repeat(48);
  const sep2 = "=".repeat(48);
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });
  const parts = [];
  parts.push(cmd(ESC, 64));
  parts.push(cmd(ESC, 97, 1));
  parts.push(cmd(ESC, 33, 48));
  parts.push(text(restaurantName + "\n"));
  parts.push(cmd(ESC, 33, 0));
  parts.push(text("TAX INVOICE\n"));
  if (gstEnabled && gstNumber) {
    parts.push(text(`GSTIN: ${gstNumber}
`));
  }
  parts.push(text(sep + "\n"));
  parts.push(cmd(ESC, 97, 0));
  parts.push(text(`Invoice : ${invoiceNumber}
`));
  parts.push(text(`Date    : ${dateStr}  ${timeStr}
`));
  if (orderType === "dine-in" && tableNumber) {
    parts.push(
      text(`Table   : ${tableNumber}${floorName ? `  (${floorName})` : ""}
`)
    );
  } else if (orderType === "delivery") {
    parts.push(text(`Type    : Delivery
`));
  } else if (orderType === "pickup") {
    parts.push(text(`Type    : Pickup
`));
  }
  if (customerName) {
    parts.push(
      text(
        `Customer: ${customerName}${customerPhone ? `  ${customerPhone}` : ""}
`
      )
    );
  }
  parts.push(text(sep + "\n"));
  parts.push(cmd(ESC, 69, 1));
  parts.push(text("Item                           Qty    Amount\n"));
  parts.push(cmd(ESC, 69, 0));
  parts.push(text(sep + "\n"));
  items.forEach((item) => {
    const words = item.name.split(/\s+/);
    const nameLines = [];
    let line = "";
    for (const word of words) {
      if ((line + (line ? " " : "") + word).length > 27 && line) {
        nameLines.push(line);
        line = word;
      } else {
        line += (line ? " " : "") + word;
      }
    }
    if (line) nameLines.push(line);
    const qty = String(item.quantity).padStart(3);
    const amount = (item.price * item.quantity).toFixed(0).padStart(9);
    nameLines.forEach((nameLine, lineIndex) => {
      const suffix = lineIndex === nameLines.length - 1 ? `${qty.padStart(8)}${amount}` : "";
      parts.push(text(`${nameLine.padEnd(27)}${suffix}
`));
    });
    if (item.notes) {
      parts.push(text(`  >> ${item.notes}
`));
    }
  });
  parts.push(text(sep + "\n"));
  const row = (label, value) => {
    const l = label.padEnd(32);
    const v = value.padStart(16);
    parts.push(text(`${l}${v}
`));
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
  parts.push(cmd(ESC, 69, 1));
  parts.push(cmd(ESC, 33, 16));
  const totalLabel = "TOTAL".padEnd(13);
  const totalVal = `Rs.${total.toFixed(2)}`.padStart(18);
  parts.push(text(`${totalLabel}${totalVal}
`));
  parts.push(cmd(ESC, 33, 0));
  parts.push(cmd(ESC, 69, 0));
  parts.push(text(sep2 + "\n"));
  parts.push(text(`Payment : ${paymentMode.toUpperCase()}
`));
  parts.push(text(sep + "\n"));
  parts.push(cmd(ESC, 97, 1));
  parts.push(text("Thank you! Visit again.\n"));
  parts.push(lines(4));
  parts.push(cmd(GS, 86, 66, 3));
  return Buffer.concat(parts);
}
function printToThermal(ip, port, data, timeoutMs = 5e3) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };
    const timer = setTimeout(
      () => done({ success: false, error: "Connection timed out" }),
      timeoutMs
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
function checkPrinterOnline(ip, port, timeoutMs = 3e3) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (result) => {
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
var ESC, GS, LF;
var init_escpos = __esm({
  "server/utils/escpos.ts"() {
    "use strict";
    ESC = 27;
    GS = 29;
    LF = 10;
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import crypto from "crypto";
import QRCode from "qrcode";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  floors;
  tables;
  menuItems;
  orders;
  orderItems;
  inventoryItems;
  invoices;
  reservations;
  settings;
  deliveryPersons;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.floors = /* @__PURE__ */ new Map();
    this.tables = /* @__PURE__ */ new Map();
    this.menuItems = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.orderItems = /* @__PURE__ */ new Map();
    this.inventoryItems = /* @__PURE__ */ new Map();
    this.invoices = /* @__PURE__ */ new Map();
    this.reservations = /* @__PURE__ */ new Map();
    this.settings = /* @__PURE__ */ new Map();
    this.deliveryPersons = /* @__PURE__ */ new Map();
    this.seedData();
  }
  seedData() {
    const defaultFloorId = randomUUID();
    const defaultFloor = {
      id: defaultFloorId,
      name: "Ground Floor",
      displayOrder: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.floors.set(defaultFloorId, defaultFloor);
    const tableNumbers = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const seats = [4, 6, 4, 2, 8, 4, 2, 6, 4, 4, 2, 4];
    tableNumbers.forEach((num, index) => {
      const id = randomUUID();
      const table = {
        id,
        tableNumber: num,
        seats: seats[index],
        status: "free",
        currentOrderId: null,
        floorId: defaultFloorId
      };
      this.tables.set(id, table);
    });
    const menuData = [
      { name: "Chicken Burger", category: "Burgers", price: "199.00", cost: "80.00", available: true, isVeg: false, variants: ["Regular", "Large"], image: null, description: null, quickCode: "1" },
      { name: "Veggie Pizza", category: "Pizza", price: "299.00", cost: "120.00", available: true, isVeg: true, variants: null, image: null, description: null, quickCode: "2" },
      { name: "French Fries", category: "Fast Food", price: "99.00", cost: "35.00", available: true, isVeg: true, variants: ["Small", "Medium", "Large"], image: null, description: null, quickCode: "3" },
      { name: "Coca Cola", category: "Beverages", price: "50.00", cost: "20.00", available: true, isVeg: true, variants: null, image: null, description: null, quickCode: "4" },
      { name: "Caesar Salad", category: "Salads", price: "149.00", cost: "60.00", available: true, isVeg: true, variants: null, image: null, description: null, quickCode: "5" },
      { name: "Pasta Alfredo", category: "Pasta", price: "249.00", cost: "100.00", available: true, isVeg: true, variants: null, image: null, description: null, quickCode: "6" },
      { name: "Chocolate Cake", category: "Desserts", price: "129.00", cost: "50.00", available: true, isVeg: true, variants: null, image: null, description: null, quickCode: "7" },
      { name: "Ice Cream", category: "Desserts", price: "79.00", cost: "30.00", available: true, isVeg: true, variants: ["Vanilla", "Chocolate", "Strawberry"], image: null, description: null, quickCode: "8" }
    ];
    menuData.forEach((item) => {
      const id = randomUUID();
      const menuItem = {
        id,
        name: item.name,
        category: item.category,
        price: item.price,
        cost: item.cost,
        available: item.available,
        isVeg: item.isVeg,
        variants: item.variants,
        image: item.image,
        description: item.description,
        quickCode: item.quickCode
      };
      this.menuItems.set(id, menuItem);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getFloors() {
    return Array.from(this.floors.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }
  async getFloor(id) {
    return this.floors.get(id);
  }
  async createFloor(insertFloor) {
    const id = randomUUID();
    const floor = {
      id,
      name: insertFloor.name,
      displayOrder: insertFloor.displayOrder ?? 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.floors.set(id, floor);
    return floor;
  }
  async updateFloor(id, floorData) {
    const existing = this.floors.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      name: floorData.name ?? existing.name,
      displayOrder: floorData.displayOrder ?? existing.displayOrder
    };
    this.floors.set(id, updated);
    return updated;
  }
  async deleteFloor(id) {
    const tablesOnFloor = Array.from(this.tables.values()).filter((t) => t.floorId === id);
    if (tablesOnFloor.length > 0) {
      throw new Error(`Cannot delete floor: ${tablesOnFloor.length} table(s) are assigned to this floor`);
    }
    return this.floors.delete(id);
  }
  async getTables() {
    return Array.from(this.tables.values());
  }
  async getTable(id) {
    return this.tables.get(id);
  }
  async getTableByNumber(tableNumber) {
    return Array.from(this.tables.values()).find((t) => t.tableNumber === tableNumber);
  }
  async createTable(insertTable) {
    const id = randomUUID();
    const table = {
      id,
      tableNumber: insertTable.tableNumber,
      seats: insertTable.seats,
      status: insertTable.status ?? "free",
      currentOrderId: null,
      floorId: insertTable.floorId ?? null
    };
    this.tables.set(id, table);
    return table;
  }
  async updateTable(id, tableData) {
    const existing = this.tables.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      tableNumber: tableData.tableNumber ?? existing.tableNumber,
      seats: tableData.seats ?? existing.seats,
      status: tableData.status ?? existing.status,
      floorId: tableData.floorId !== void 0 ? tableData.floorId : existing.floorId
    };
    this.tables.set(id, updated);
    return updated;
  }
  async updateTableStatus(id, status) {
    const table = this.tables.get(id);
    if (!table) return void 0;
    const updated = { ...table, status };
    this.tables.set(id, updated);
    return updated;
  }
  async updateTableOrder(id, orderId) {
    const table = this.tables.get(id);
    if (!table) return void 0;
    const updated = { ...table, currentOrderId: orderId };
    this.tables.set(id, updated);
    return updated;
  }
  async deleteTable(id) {
    return this.tables.delete(id);
  }
  async getMenuItems() {
    return Array.from(this.menuItems.values());
  }
  async getMenuItem(id) {
    return this.menuItems.get(id);
  }
  async createMenuItem(item) {
    const id = randomUUID();
    if (item.quickCode) {
      const existingItem = Array.from(this.menuItems.values()).find(
        (menuItem2) => menuItem2.quickCode === item.quickCode
      );
      if (existingItem) {
        throw new Error(`Quick code "${item.quickCode}" is already in use by "${existingItem.name}"`);
      }
    }
    const menuItem = {
      id,
      name: item.name,
      category: item.category,
      price: item.price,
      cost: item.cost,
      available: item.available ?? true,
      isVeg: item.isVeg ?? true,
      variants: item.variants ?? null,
      image: item.image ?? null,
      description: item.description ?? null,
      quickCode: item.quickCode ?? null
    };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }
  async updateMenuItem(id, item) {
    const existing = this.menuItems.get(id);
    if (!existing) return void 0;
    if (item.quickCode !== void 0 && item.quickCode !== null) {
      const existingItem = Array.from(this.menuItems.values()).find(
        (menuItem) => menuItem.id !== id && menuItem.quickCode === item.quickCode
      );
      if (existingItem) {
        throw new Error(`Quick code "${item.quickCode}" is already in use by "${existingItem.name}"`);
      }
    }
    const updated = {
      ...existing,
      name: item.name ?? existing.name,
      category: item.category ?? existing.category,
      price: item.price ?? existing.price,
      cost: item.cost ?? existing.cost,
      available: item.available ?? existing.available,
      isVeg: item.isVeg ?? existing.isVeg,
      variants: item.variants !== void 0 ? item.variants : existing.variants,
      image: item.image !== void 0 ? item.image : existing.image,
      description: item.description !== void 0 ? item.description : existing.description,
      quickCode: item.quickCode !== void 0 ? item.quickCode : existing.quickCode
    };
    this.menuItems.set(id, updated);
    return updated;
  }
  async deleteMenuItem(id) {
    return this.menuItems.delete(id);
  }
  async getOrders() {
    return Array.from(this.orders.values());
  }
  async getOrder(id) {
    return this.orders.get(id);
  }
  async getOrdersByTable(tableId) {
    return Array.from(this.orders.values()).filter((o) => o.tableId === tableId);
  }
  async getActiveOrders() {
    return Array.from(this.orders.values()).filter(
      (o) => o.status === "sent_to_kitchen" || o.status === "ready_to_bill" || o.status === "billed"
    );
  }
  async getCompletedOrders() {
    return Array.from(this.orders.values()).filter(
      (o) => o.status === "paid" || o.status === "completed"
    );
  }
  async getDeliveryOrders() {
    return Array.from(this.orders.values()).filter((o) => o.orderType === "delivery").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createOrder(insertOrder) {
    const id = randomUUID();
    const order = {
      id,
      tableId: insertOrder.tableId ?? null,
      orderType: insertOrder.orderType,
      status: insertOrder.status ?? "saved",
      total: insertOrder.total ?? "0",
      customerName: insertOrder.customerName ?? null,
      customerPhone: insertOrder.customerPhone ?? null,
      customerAddress: insertOrder.customerAddress ?? null,
      paymentMode: insertOrder.paymentMode ?? null,
      waiterId: insertOrder.waiterId ?? null,
      deliveryPersonId: insertOrder.deliveryPersonId ?? null,
      expectedPickupTime: insertOrder.expectedPickupTime ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      completedAt: null,
      billedAt: null,
      paidAt: null,
      kotCount: 0
    };
    this.orders.set(id, order);
    return order;
  }
  async updateOrderStatus(id, status) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }
  async incrementKotCount(id) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updated = { ...order, kotCount: (order.kotCount ?? 0) + 1 };
    this.orders.set(id, updated);
    return updated;
  }
  async updateOrderTotal(id, total) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updated = { ...order, total };
    this.orders.set(id, updated);
    return updated;
  }
  async completeOrder(id) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updated = {
      ...order,
      status: "completed",
      completedAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(id, updated);
    return updated;
  }
  async billOrder(id) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updated = {
      ...order,
      status: "billed",
      billedAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(id, updated);
    return updated;
  }
  async checkoutOrder(id, paymentMode) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updated = {
      ...order,
      status: "completed",
      paymentMode: paymentMode ?? order.paymentMode,
      paidAt: /* @__PURE__ */ new Date(),
      completedAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(id, updated);
    return updated;
  }
  async deleteOrder(id) {
    return this.orders.delete(id);
  }
  async getOrderItems(orderId) {
    return Array.from(this.orderItems.values()).filter((item) => item.orderId === orderId);
  }
  async getOrderItem(id) {
    return this.orderItems.get(id);
  }
  async createOrderItem(item) {
    const id = randomUUID();
    const orderItem = {
      id,
      orderId: item.orderId,
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes ?? null,
      status: item.status ?? "new",
      isVeg: item.isVeg ?? true
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  async updateOrderItemStatus(id, status) {
    const orderItem = this.orderItems.get(id);
    if (!orderItem) return void 0;
    const updated = { ...orderItem, status };
    this.orderItems.set(id, updated);
    return updated;
  }
  async updateOrderItem(id, data) {
    const orderItem = this.orderItems.get(id);
    if (!orderItem) return void 0;
    const updated = { ...orderItem, ...data };
    this.orderItems.set(id, updated);
    return updated;
  }
  async deleteOrderItem(id) {
    return this.orderItems.delete(id);
  }
  async getInventoryItems() {
    return Array.from(this.inventoryItems.values());
  }
  async getInventoryItem(id) {
    return this.inventoryItems.get(id);
  }
  async createInventoryItem(item) {
    const id = randomUUID();
    const inventoryItem = {
      id,
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      minStock: item.minStock ?? "0",
      supplierId: item.supplierId ?? null,
      costPerUnit: item.costPerUnit ?? "0",
      lastUpdated: /* @__PURE__ */ new Date()
    };
    this.inventoryItems.set(id, inventoryItem);
    return inventoryItem;
  }
  async updateInventoryItem(id, data) {
    const item = this.inventoryItems.get(id);
    if (!item) return void 0;
    const updated = { ...item, ...data, lastUpdated: /* @__PURE__ */ new Date() };
    this.inventoryItems.set(id, updated);
    return updated;
  }
  async updateInventoryQuantity(id, quantity) {
    const item = this.inventoryItems.get(id);
    if (!item) return void 0;
    const updated = { ...item, currentStock: quantity, lastUpdated: /* @__PURE__ */ new Date() };
    this.inventoryItems.set(id, updated);
    return updated;
  }
  async deleteInventoryItem(id) {
    return this.inventoryItems.delete(id);
  }
  async deductInventoryForOrder(orderId) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getRecipes() {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getRecipe(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getRecipeByMenuItemId(menuItemId) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async createRecipe(recipe) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async deleteRecipe(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getRecipeIngredients(recipeId) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getRecipeIngredient(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async createRecipeIngredient(ingredient) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async updateRecipeIngredient(id, ingredient) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async deleteRecipeIngredient(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getSuppliers() {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getSupplier(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async createSupplier(supplier) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async updateSupplier(id, supplier) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async deleteSupplier(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getPurchaseOrders() {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getPurchaseOrder(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async createPurchaseOrder(order) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async updatePurchaseOrder(id, order) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async receivePurchaseOrder(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async deletePurchaseOrder(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getPurchaseOrderItems(purchaseOrderId) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getPurchaseOrderItem(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async createPurchaseOrderItem(item) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async updatePurchaseOrderItem(id, item) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async deletePurchaseOrderItem(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getWastages() {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getWastage(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async createWastage(wastage) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async deleteWastage(id) {
    throw new Error("Not implemented in MemStorage - use MongoStorage");
  }
  async getInvoices() {
    return Array.from(this.invoices.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async getInvoice(id) {
    return this.invoices.get(id);
  }
  async getInvoiceByNumber(invoiceNumber) {
    return Array.from(this.invoices.values()).find((inv) => inv.invoiceNumber === invoiceNumber);
  }
  async createInvoice(insertInvoice) {
    const id = randomUUID();
    const invoice = {
      id,
      invoiceNumber: insertInvoice.invoiceNumber,
      orderId: insertInvoice.orderId,
      tableNumber: insertInvoice.tableNumber ?? null,
      floorName: insertInvoice.floorName ?? null,
      customerName: insertInvoice.customerName ?? null,
      customerPhone: insertInvoice.customerPhone ?? null,
      subtotal: insertInvoice.subtotal,
      tax: insertInvoice.tax,
      cgst: insertInvoice.cgst ?? "0",
      sgst: insertInvoice.sgst ?? "0",
      serviceCharge: insertInvoice.serviceCharge ?? "0",
      discount: insertInvoice.discount ?? "0",
      total: insertInvoice.total,
      paymentMode: insertInvoice.paymentMode,
      splitPayments: insertInvoice.splitPayments ?? null,
      status: insertInvoice.status ?? "Paid",
      items: insertInvoice.items,
      notes: insertInvoice.notes ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.invoices.set(id, invoice);
    return invoice;
  }
  async updateInvoice(id, invoiceData) {
    const existing = this.invoices.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...invoiceData,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.invoices.set(id, updated);
    return updated;
  }
  async deleteInvoice(id) {
    return this.invoices.delete(id);
  }
  async getReservations() {
    return Array.from(this.reservations.values()).sort(
      (a, b) => new Date(a.timeSlot).getTime() - new Date(b.timeSlot).getTime()
    );
  }
  async getReservation(id) {
    return this.reservations.get(id);
  }
  async getReservationsByTable(tableId) {
    return Array.from(this.reservations.values()).filter(
      (r) => r.tableId === tableId && r.status === "active"
    );
  }
  async createReservation(insertReservation) {
    const id = randomUUID();
    const reservation = {
      id,
      tableId: insertReservation.tableId,
      customerName: insertReservation.customerName,
      customerPhone: insertReservation.customerPhone,
      numberOfPeople: insertReservation.numberOfPeople,
      timeSlot: insertReservation.timeSlot,
      notes: insertReservation.notes ?? null,
      status: insertReservation.status ?? "active",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.reservations.set(id, reservation);
    return reservation;
  }
  async updateReservation(id, reservationData) {
    const existing = this.reservations.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      tableId: reservationData.tableId ?? existing.tableId,
      customerName: reservationData.customerName ?? existing.customerName,
      customerPhone: reservationData.customerPhone ?? existing.customerPhone,
      numberOfPeople: reservationData.numberOfPeople ?? existing.numberOfPeople,
      timeSlot: reservationData.timeSlot ?? existing.timeSlot,
      notes: reservationData.notes !== void 0 ? reservationData.notes : existing.notes,
      status: reservationData.status ?? existing.status
    };
    this.reservations.set(id, updated);
    return updated;
  }
  async deleteReservation(id) {
    return this.reservations.delete(id);
  }
  async getSetting(key) {
    return this.settings.get(key);
  }
  async setSetting(key, value) {
    this.settings.set(key, value);
  }
  async getDeliveryPersons() {
    return Array.from(this.deliveryPersons.values());
  }
  async getDeliveryPerson(id) {
    return this.deliveryPersons.get(id);
  }
  async createDeliveryPerson(person) {
    const id = randomUUID();
    const deliveryPerson = {
      id,
      name: person.name,
      phone: person.phone,
      status: person.status || "available",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.deliveryPersons.set(id, deliveryPerson);
    return deliveryPerson;
  }
  async updateDeliveryPerson(id, person) {
    const existing = this.deliveryPersons.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      name: person.name ?? existing.name,
      phone: person.phone ?? existing.phone,
      status: person.status ?? existing.status
    };
    this.deliveryPersons.set(id, updated);
    return updated;
  }
  async deleteDeliveryPerson(id) {
    return this.deliveryPersons.delete(id);
  }
  async assignDeliveryPerson(orderId, deliveryPersonId) {
    const order = this.orders.get(orderId);
    if (!order) return void 0;
    const updated = {
      ...order,
      deliveryPersonId
    };
    this.orders.set(orderId, updated);
    return updated;
  }
  // Printer stubs — MemStorage is a dev fallback; printers use MongoStorage
  async getPrinters() {
    return [];
  }
  async getPrinter(_id) {
    return void 0;
  }
  async createPrinter(p) {
    throw new Error("MemStorage does not support printers");
  }
  async updatePrinter(_id, _p) {
    return void 0;
  }
  async deletePrinter(_id) {
    return false;
  }
};
var storage = new MemStorage();

// server/auth-middleware.ts
import session from "express-session";
import MongoStore from "connect-mongo";

// server/auth.ts
import { z } from "zod";
import fs from "fs";
import path from "path";
var ACCOUNTS_FILE = path.join(process.cwd(), "server", "restaurant-accounts.json");
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});
function getAccounts() {
  try {
    const data = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
    const accounts = JSON.parse(data);
    return accounts.map((acc) => ({
      ...acc,
      mongodbUri: acc.mongodbUri === "CURRENT_MONGODB_URI" ? process.env.MONGODB_URI || "" : acc.mongodbUri
    }));
  } catch (error) {
    console.error("Error reading accounts file:", error);
    return [];
  }
}
function validateCredentials(username, password) {
  const accounts = getAccounts();
  const account = accounts.find(
    (acc) => acc.username === username && acc.password === password && acc.isActive
  );
  return account || null;
}

// server/dynamic-mongodb.ts
import { MongoClient } from "mongodb";
var DynamicMongoDBManager = class {
  connections = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  CONNECTION_TTL = 30 * 60 * 1e3;
  constructor() {
    this.startCleanupJob();
  }
  startCleanupJob() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections();
    }, 5 * 60 * 1e3);
  }
  cleanupIdleConnections() {
    const now = Date.now();
    for (const [restaurantId, info] of this.connections.entries()) {
      if (now - info.lastUsed > this.CONNECTION_TTL) {
        console.log(`Closing idle connection for restaurant: ${restaurantId}`);
        info.client.close().catch(console.error);
        this.connections.delete(restaurantId);
      }
    }
  }
  extractDatabaseName(uri) {
    try {
      const url = new URL(uri);
      const pathname = url.pathname.substring(1);
      if (pathname && pathname !== "") {
        return pathname.split("?")[0];
      }
      return "restaurant_pos";
    } catch (error) {
      return "restaurant_pos";
    }
  }
  async getConnection(restaurantId, mongodbUri) {
    const existing = this.connections.get(restaurantId);
    if (existing) {
      existing.lastUsed = Date.now();
      return { client: existing.client, db: existing.db };
    }
    try {
      const client = new MongoClient(mongodbUri);
      await client.connect();
      const db = client.db("POS");
      console.log(`Connected to MongoDB for restaurant ${restaurantId}: POS`);
      this.connections.set(restaurantId, {
        client,
        db,
        lastUsed: Date.now()
      });
      return { client, db };
    } catch (error) {
      console.error(`Failed to connect to MongoDB for restaurant ${restaurantId}:`, error);
      throw error;
    }
  }
  getCollection(restaurantId, collectionName) {
    const connection = this.connections.get(restaurantId);
    if (!connection) {
      return null;
    }
    connection.lastUsed = Date.now();
    return connection.db.collection(collectionName);
  }
  hasConnection(restaurantId) {
    return this.connections.has(restaurantId);
  }
  async closeConnection(restaurantId) {
    const connection = this.connections.get(restaurantId);
    if (connection) {
      await connection.client.close();
      this.connections.delete(restaurantId);
      console.log(`Closed connection for restaurant: ${restaurantId}`);
    }
  }
  /**
   * Reads a settings document from any established restaurant connection.
   * Used by background services that run without a request context.
   */
  async getSettingFromAnyConnection(key) {
    for (const [, info] of this.connections.entries()) {
      try {
        const doc = await info.db.collection("settings").findOne({ key });
        if (doc?.value) return doc.value;
      } catch {
      }
    }
    return void 0;
  }
  async closeAll() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    for (const [restaurantId, info] of this.connections.entries()) {
      await info.client.close();
      console.log(`Closed connection for restaurant: ${restaurantId}`);
    }
    this.connections.clear();
  }
};
var dynamicMongoDB = new DynamicMongoDBManager();

// server/session-storage.ts
import { ObjectId as ObjectId2 } from "mongodb";

// server/mongodb.ts
import { MongoClient as MongoClient2 } from "mongodb";
var CUSTOMERS_DB_NAME = "customersdb";
var MongoDBService = class {
  client = null;
  db = null;
  async connect() {
    if (this.client && this.db) {
      return;
    }
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    try {
      this.client = new MongoClient2(uri);
      await this.client.connect();
      this.db = this.client.db("POS");
      console.log(`\u2705 Connected to MongoDB database: POS`);
    } catch (error) {
      console.error("\u274C MongoDB connection error:", error);
      throw error;
    }
  }
  getDatabase() {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }
  getCollection(name) {
    return this.getDatabase().collection(name);
  }
  /**
   * Returns a collection from the shared `customersdb` database on the same
   * cluster. The MongoClient is already connected; we just switch databases.
   */
  getCustomersCollection(name) {
    if (!this.client) throw new Error("Database not connected. Call connect() first.");
    return this.client.db(CUSTOMERS_DB_NAME).collection(name);
  }
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("Disconnected from MongoDB");
    }
  }
};
var mongodb = new MongoDBService();

// server/mongo-storage.ts
import { ObjectId } from "mongodb";
import { randomUUID as randomUUID2 } from "crypto";
var MongoStorage = class {
  async ensureConnection() {
    await mongodb.connect();
  }
  stripMongoId(doc) {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest;
  }
  async getUser(id) {
    await this.ensureConnection();
    const user = await mongodb.getCollection("users").findOne({ id });
    return user ?? void 0;
  }
  async getUserByUsername(username) {
    await this.ensureConnection();
    const user = await mongodb.getCollection("users").findOne({ username });
    return user ?? void 0;
  }
  async createUser(user) {
    await this.ensureConnection();
    const id = randomUUID2();
    const newUser = { id, ...user };
    await mongodb.getCollection("users").insertOne(newUser);
    return newUser;
  }
  async getFloors() {
    await this.ensureConnection();
    const floors = await mongodb.getCollection("floors").find().sort({ displayOrder: 1 }).toArray();
    return floors;
  }
  async getFloor(id) {
    await this.ensureConnection();
    const floor = await mongodb.getCollection("floors").findOne({ id });
    return floor ?? void 0;
  }
  async createFloor(insertFloor) {
    await this.ensureConnection();
    const id = randomUUID2();
    const floor = {
      id,
      name: insertFloor.name,
      displayOrder: insertFloor.displayOrder ?? 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("floors").insertOne(floor);
    return floor;
  }
  async updateFloor(id, floorData) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("floors").findOneAndUpdate(
      { id },
      { $set: floorData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteFloor(id) {
    await this.ensureConnection();
    const tablesOnFloor = await mongodb.getCollection("tables").countDocuments({ floorId: id });
    if (tablesOnFloor > 0) {
      throw new Error(`Cannot delete floor: ${tablesOnFloor} table(s) are assigned to this floor`);
    }
    const result = await mongodb.getCollection("floors").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getTables() {
    await this.ensureConnection();
    const tables = await mongodb.getCollection("tables").find().toArray();
    return tables;
  }
  async getTable(id) {
    await this.ensureConnection();
    const table = await mongodb.getCollection("tables").findOne({ id });
    return table ?? void 0;
  }
  async getTableByNumber(tableNumber) {
    await this.ensureConnection();
    const table = await mongodb.getCollection("tables").findOne({ tableNumber });
    return table ?? void 0;
  }
  async createTable(insertTable) {
    await this.ensureConnection();
    const id = randomUUID2();
    const table = {
      id,
      tableNumber: insertTable.tableNumber,
      seats: insertTable.seats,
      status: insertTable.status ?? "free",
      currentOrderId: null,
      floorId: insertTable.floorId ?? null
    };
    await mongodb.getCollection("tables").insertOne(table);
    return table;
  }
  async updateTable(id, tableData) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("tables").findOneAndUpdate(
      { id },
      { $set: tableData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateTableStatus(id, status) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("tables").findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateTableOrder(id, orderId) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("tables").findOneAndUpdate(
      { id },
      { $set: { currentOrderId: orderId } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteTable(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("tables").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getMenuItems() {
    await this.ensureConnection();
    const items = await mongodb.getCollection("menuItems").find().toArray();
    return items;
  }
  async getMenuItem(id) {
    await this.ensureConnection();
    const item = await mongodb.getCollection("menuItems").findOne({ id });
    return item ?? void 0;
  }
  async createMenuItem(item) {
    await this.ensureConnection();
    const normalizedQuickCode = item.quickCode ? item.quickCode.trim().toLowerCase() : null;
    if (normalizedQuickCode) {
      const existingItems = await mongodb.getCollection("menuItems").find().toArray();
      const duplicate = existingItems.find(
        (existing) => existing.quickCode && existing.quickCode.toLowerCase() === normalizedQuickCode
      );
      if (duplicate) {
        throw new Error(`Quick code "${item.quickCode}" is already assigned to another item`);
      }
    }
    const id = randomUUID2();
    const menuItem = {
      id,
      name: item.name,
      category: item.category,
      price: item.price,
      cost: item.cost,
      available: item.available ?? true,
      isVeg: item.isVeg ?? true,
      variants: item.variants ?? null,
      image: item.image ?? null,
      description: item.description ?? null,
      quickCode: normalizedQuickCode
    };
    await mongodb.getCollection("menuItems").insertOne(menuItem);
    return menuItem;
  }
  async updateMenuItem(id, item) {
    await this.ensureConnection();
    const normalizedQuickCode = item.quickCode ? item.quickCode.trim().toLowerCase() : null;
    const updateData = { ...item };
    if (item.quickCode !== void 0) {
      updateData.quickCode = normalizedQuickCode;
    }
    if (normalizedQuickCode) {
      const existingItems = await mongodb.getCollection("menuItems").find().toArray();
      const duplicate = existingItems.find(
        (existing) => existing.id !== id && existing.quickCode && existing.quickCode.toLowerCase() === normalizedQuickCode
      );
      if (duplicate) {
        throw new Error(`Quick code "${item.quickCode}" is already assigned to another item`);
      }
    }
    const result = await mongodb.getCollection("menuItems").findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteMenuItem(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("menuItems").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getOrders() {
    await this.ensureConnection();
    const orders = await mongodb.getCollection("orders").find().toArray();
    return orders;
  }
  async getOrder(id) {
    await this.ensureConnection();
    const order = await mongodb.getCollection("orders").findOne({ id });
    return order ?? void 0;
  }
  async getOrdersByTable(tableId) {
    await this.ensureConnection();
    const orders = await mongodb.getCollection("orders").find({ tableId }).toArray();
    return orders;
  }
  async getActiveOrders() {
    await this.ensureConnection();
    const orders = await mongodb.getCollection("orders").find({
      status: { $in: ["sent_to_kitchen", "ready_to_bill", "billed"] }
    }).toArray();
    return orders;
  }
  async getCompletedOrders() {
    await this.ensureConnection();
    const orders = await mongodb.getCollection("orders").find({
      status: { $in: ["paid", "completed"] }
    }).toArray();
    return orders;
  }
  async getDeliveryOrders() {
    await this.ensureConnection();
    const orders = await mongodb.getCollection("orders").find({
      orderType: "delivery"
    }).sort({ createdAt: -1 }).toArray();
    return orders;
  }
  async createOrder(insertOrder) {
    await this.ensureConnection();
    const id = randomUUID2();
    const order = {
      id,
      tableId: insertOrder.tableId ?? null,
      orderType: insertOrder.orderType,
      status: insertOrder.status ?? "saved",
      total: insertOrder.total ?? "0",
      customerName: insertOrder.customerName ?? null,
      customerPhone: insertOrder.customerPhone ?? null,
      customerAddress: insertOrder.customerAddress ?? null,
      paymentMode: insertOrder.paymentMode ?? null,
      waiterId: insertOrder.waiterId ?? null,
      deliveryPersonId: insertOrder.deliveryPersonId ?? null,
      expectedPickupTime: insertOrder.expectedPickupTime ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      completedAt: null,
      billedAt: null,
      paidAt: null,
      kotCount: 0
    };
    await mongodb.getCollection("orders").insertOne(order);
    return order;
  }
  async updateOrderStatus(id, status) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orders").findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async incrementKotCount(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orders").findOneAndUpdate(
      { id },
      { $inc: { kotCount: 1 } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateOrderTotal(id, total) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orders").findOneAndUpdate(
      { id },
      { $set: { total } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async completeOrder(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orders").findOneAndUpdate(
      { id },
      { $set: { status: "completed", completedAt: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async billOrder(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orders").findOneAndUpdate(
      { id },
      { $set: { status: "billed", billedAt: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async checkoutOrder(id, paymentMode) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orders").findOneAndUpdate(
      { id },
      {
        $set: {
          status: "completed",
          paymentMode: paymentMode ?? null,
          paidAt: /* @__PURE__ */ new Date(),
          completedAt: /* @__PURE__ */ new Date()
        }
      },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteOrder(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orders").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getOrderItems(orderId) {
    await this.ensureConnection();
    const items = await mongodb.getCollection("orderItems").find({ orderId }).toArray();
    return items;
  }
  async getOrderItem(id) {
    await this.ensureConnection();
    const item = await mongodb.getCollection("orderItems").findOne({ id });
    return item ?? void 0;
  }
  async createOrderItem(item) {
    await this.ensureConnection();
    const id = randomUUID2();
    const orderItem = {
      id,
      orderId: item.orderId,
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes ?? null,
      status: item.status ?? "new",
      isVeg: item.isVeg ?? true
    };
    await mongodb.getCollection("orderItems").insertOne(orderItem);
    return orderItem;
  }
  async updateOrderItemStatus(id, status) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orderItems").findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateOrderItem(id, data) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orderItems").findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteOrderItem(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("orderItems").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getInventoryItems() {
    await this.ensureConnection();
    const items = await mongodb.getCollection("inventory").find().toArray();
    return items;
  }
  async getInventoryItem(id) {
    await this.ensureConnection();
    const item = await mongodb.getCollection("inventory").findOne({ id });
    return item ?? void 0;
  }
  async createInventoryItem(item) {
    await this.ensureConnection();
    const id = randomUUID2();
    const inventoryItem = {
      id,
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      minStock: item.minStock ?? "0",
      supplierId: item.supplierId ?? null,
      costPerUnit: item.costPerUnit ?? "0",
      lastUpdated: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("inventory").insertOne(inventoryItem);
    return inventoryItem;
  }
  async updateInventoryItem(id, item) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("inventory").findOneAndUpdate(
      { id },
      { $set: { ...item, lastUpdated: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateInventoryQuantity(id, quantity) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("inventory").findOneAndUpdate(
      { id },
      { $set: { currentStock: quantity, lastUpdated: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteInventoryItem(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("inventory").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async deductInventoryForOrder(orderId) {
    await this.ensureConnection();
    const orderItems = await this.getOrderItems(orderId);
    for (const orderItem of orderItems) {
      const recipe = await this.getRecipeByMenuItemId(orderItem.menuItemId);
      if (!recipe) continue;
      const recipeIngredients = await this.getRecipeIngredients(recipe.id);
      for (const ingredient of recipeIngredients) {
        const inventoryItem = await this.getInventoryItem(ingredient.inventoryItemId);
        if (!inventoryItem) continue;
        const quantityToDeduct = parseFloat(ingredient.quantity) * orderItem.quantity;
        const newStock = parseFloat(inventoryItem.currentStock) - quantityToDeduct;
        await this.updateInventoryQuantity(ingredient.inventoryItemId, newStock.toString());
      }
    }
  }
  async getRecipes() {
    await this.ensureConnection();
    const recipes = await mongodb.getCollection("recipes").find().toArray();
    return recipes;
  }
  async getRecipe(id) {
    await this.ensureConnection();
    const recipe = await mongodb.getCollection("recipes").findOne({ id });
    return recipe ?? void 0;
  }
  async getRecipeByMenuItemId(menuItemId) {
    await this.ensureConnection();
    const recipe = await mongodb.getCollection("recipes").findOne({ menuItemId }, {
      sort: { createdAt: -1 }
    });
    return recipe ?? void 0;
  }
  async createRecipe(insertRecipe) {
    await this.ensureConnection();
    const id = randomUUID2();
    const recipe = {
      id,
      menuItemId: insertRecipe.menuItemId,
      createdAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("recipes").insertOne(recipe);
    return recipe;
  }
  async deleteRecipe(id) {
    await this.ensureConnection();
    await mongodb.getCollection("recipeIngredients").deleteMany({ recipeId: id });
    const result = await mongodb.getCollection("recipes").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getRecipeIngredients(recipeId) {
    await this.ensureConnection();
    const ingredients = await mongodb.getCollection("recipeIngredients").find({ recipeId }).toArray();
    return ingredients;
  }
  async getRecipeIngredient(id) {
    await this.ensureConnection();
    const ingredient = await mongodb.getCollection("recipeIngredients").findOne({ id });
    return ingredient ?? void 0;
  }
  async createRecipeIngredient(insertIngredient) {
    await this.ensureConnection();
    const id = randomUUID2();
    const ingredient = {
      id,
      recipeId: insertIngredient.recipeId,
      inventoryItemId: insertIngredient.inventoryItemId,
      quantity: insertIngredient.quantity,
      unit: insertIngredient.unit
    };
    await mongodb.getCollection("recipeIngredients").insertOne(ingredient);
    return ingredient;
  }
  async updateRecipeIngredient(id, data) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("recipeIngredients").findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteRecipeIngredient(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("recipeIngredients").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getSuppliers() {
    await this.ensureConnection();
    const suppliers = await mongodb.getCollection("suppliers").find().toArray();
    return suppliers;
  }
  async getSupplier(id) {
    await this.ensureConnection();
    const supplier = await mongodb.getCollection("suppliers").findOne({ id });
    return supplier ?? void 0;
  }
  async createSupplier(insertSupplier) {
    await this.ensureConnection();
    const id = randomUUID2();
    const supplier = {
      id,
      name: insertSupplier.name,
      contactPerson: insertSupplier.contactPerson ?? null,
      phone: insertSupplier.phone,
      email: insertSupplier.email ?? null,
      address: insertSupplier.address ?? null,
      status: insertSupplier.status ?? "active",
      createdAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("suppliers").insertOne(supplier);
    return supplier;
  }
  async updateSupplier(id, data) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("suppliers").findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteSupplier(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("suppliers").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getPurchaseOrders() {
    await this.ensureConnection();
    const orders = await mongodb.getCollection("purchaseOrders").find().sort({ orderDate: -1 }).toArray();
    return orders;
  }
  async getPurchaseOrder(id) {
    await this.ensureConnection();
    const order = await mongodb.getCollection("purchaseOrders").findOne({ id });
    return order ?? void 0;
  }
  async createPurchaseOrder(insertOrder) {
    await this.ensureConnection();
    const id = randomUUID2();
    const order = {
      id,
      orderNumber: insertOrder.orderNumber,
      supplierId: insertOrder.supplierId,
      orderDate: insertOrder.orderDate,
      expectedDeliveryDate: insertOrder.expectedDeliveryDate ?? null,
      actualDeliveryDate: null,
      status: insertOrder.status ?? "pending",
      totalAmount: insertOrder.totalAmount ?? "0",
      notes: insertOrder.notes ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("purchaseOrders").insertOne(order);
    return order;
  }
  async updatePurchaseOrder(id, data) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("purchaseOrders").findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async receivePurchaseOrder(id) {
    await this.ensureConnection();
    const purchaseOrderItems = await this.getPurchaseOrderItems(id);
    for (const item of purchaseOrderItems) {
      const inventoryItem = await this.getInventoryItem(item.inventoryItemId);
      if (inventoryItem) {
        const newStock = parseFloat(inventoryItem.currentStock) + parseFloat(item.quantity);
        await this.updateInventoryQuantity(item.inventoryItemId, newStock.toString());
      }
    }
    const result = await mongodb.getCollection("purchaseOrders").findOneAndUpdate(
      { id },
      { $set: { status: "received", actualDeliveryDate: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deletePurchaseOrder(id) {
    await this.ensureConnection();
    await mongodb.getCollection("purchaseOrderItems").deleteMany({ purchaseOrderId: id });
    const result = await mongodb.getCollection("purchaseOrders").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getPurchaseOrderItems(purchaseOrderId) {
    await this.ensureConnection();
    const items = await mongodb.getCollection("purchaseOrderItems").find({ purchaseOrderId }).toArray();
    return items;
  }
  async getPurchaseOrderItem(id) {
    await this.ensureConnection();
    const item = await mongodb.getCollection("purchaseOrderItems").findOne({ id });
    return item ?? void 0;
  }
  async createPurchaseOrderItem(insertItem) {
    await this.ensureConnection();
    const id = randomUUID2();
    const item = {
      id,
      purchaseOrderId: insertItem.purchaseOrderId,
      inventoryItemId: insertItem.inventoryItemId,
      quantity: insertItem.quantity,
      unit: insertItem.unit,
      costPerUnit: insertItem.costPerUnit,
      totalCost: insertItem.totalCost
    };
    await mongodb.getCollection("purchaseOrderItems").insertOne(item);
    return item;
  }
  async updatePurchaseOrderItem(id, data) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("purchaseOrderItems").findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deletePurchaseOrderItem(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("purchaseOrderItems").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getWastages() {
    await this.ensureConnection();
    const wastages = await mongodb.getCollection("wastages").find().sort({ createdAt: -1 }).toArray();
    return wastages;
  }
  async getWastage(id) {
    await this.ensureConnection();
    const wastage = await mongodb.getCollection("wastages").findOne({ id });
    return wastage ?? void 0;
  }
  async createWastage(insertWastage) {
    await this.ensureConnection();
    const id = randomUUID2();
    const wastage = {
      id,
      inventoryItemId: insertWastage.inventoryItemId,
      quantity: insertWastage.quantity,
      unit: insertWastage.unit,
      reason: insertWastage.reason,
      reportedBy: insertWastage.reportedBy ?? null,
      notes: insertWastage.notes ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    const inventoryItem = await this.getInventoryItem(insertWastage.inventoryItemId);
    if (inventoryItem) {
      const newStock = parseFloat(inventoryItem.currentStock) - parseFloat(insertWastage.quantity);
      await this.updateInventoryQuantity(insertWastage.inventoryItemId, newStock.toString());
    }
    await mongodb.getCollection("wastages").insertOne(wastage);
    return wastage;
  }
  async deleteWastage(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("wastages").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getInvoices() {
    await this.ensureConnection();
    const invoices = await mongodb.getCollection("invoices").find().sort({ createdAt: -1 }).toArray();
    return invoices;
  }
  async getInvoice(id) {
    await this.ensureConnection();
    const invoice = await mongodb.getCollection("invoices").findOne({ id });
    return invoice ?? void 0;
  }
  async getInvoiceByNumber(invoiceNumber) {
    await this.ensureConnection();
    const invoice = await mongodb.getCollection("invoices").findOne({ invoiceNumber });
    return invoice ?? void 0;
  }
  async createInvoice(insertInvoice) {
    await this.ensureConnection();
    const id = randomUUID2();
    const invoice = {
      id,
      invoiceNumber: insertInvoice.invoiceNumber,
      orderId: insertInvoice.orderId,
      tableNumber: insertInvoice.tableNumber ?? null,
      floorName: insertInvoice.floorName ?? null,
      customerName: insertInvoice.customerName ?? null,
      customerPhone: insertInvoice.customerPhone ?? null,
      subtotal: insertInvoice.subtotal,
      tax: insertInvoice.tax,
      cgst: insertInvoice.cgst ?? "0",
      sgst: insertInvoice.sgst ?? "0",
      serviceCharge: insertInvoice.serviceCharge ?? "0",
      discount: insertInvoice.discount ?? "0",
      total: insertInvoice.total,
      paymentMode: insertInvoice.paymentMode,
      splitPayments: insertInvoice.splitPayments ?? null,
      status: insertInvoice.status ?? "Paid",
      items: insertInvoice.items,
      notes: insertInvoice.notes ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("invoices").insertOne(invoice);
    return invoice;
  }
  async updateInvoice(id, invoiceData) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("invoices").findOneAndUpdate(
      { id },
      { $set: { ...invoiceData, updatedAt: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteInvoice(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("invoices").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getReservations() {
    await this.ensureConnection();
    const reservations = await mongodb.getCollection("reservations").find().sort({ timeSlot: 1 }).toArray();
    return reservations;
  }
  async getReservation(id) {
    await this.ensureConnection();
    const reservation = await mongodb.getCollection("reservations").findOne({ id });
    return reservation ?? void 0;
  }
  async getReservationsByTable(tableId) {
    await this.ensureConnection();
    const reservations = await mongodb.getCollection("reservations").find({
      tableId,
      status: "active"
    }).toArray();
    return reservations;
  }
  async createReservation(insertReservation) {
    await this.ensureConnection();
    const id = randomUUID2();
    const reservation = {
      id,
      tableId: insertReservation.tableId,
      customerName: insertReservation.customerName,
      customerPhone: insertReservation.customerPhone,
      numberOfPeople: insertReservation.numberOfPeople,
      timeSlot: insertReservation.timeSlot,
      notes: insertReservation.notes ?? null,
      status: insertReservation.status ?? "active",
      createdAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("reservations").insertOne(reservation);
    return reservation;
  }
  async updateReservation(id, reservationData) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("reservations").findOneAndUpdate(
      { id },
      { $set: reservationData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteReservation(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("reservations").deleteOne({ id });
    return result.deletedCount > 0;
  }
  // ── Customer helpers ────────────────────────────────────────────────────
  // Customers live in `customersdb.customers` on the shared cluster.
  // External schema uses `contactNumber` instead of `phone`, plus
  // `visitCount` / `lastVisitDate` / `updatedAt`.  We map on the way in/out.
  customersCol() {
    return mongodb.getCustomersCollection("customers");
  }
  docToCustomer(doc) {
    return {
      id: doc._id.toString(),
      name: doc.name ?? "",
      phone: doc.contactNumber ?? doc.phone ?? "",
      email: doc.email ?? null,
      address: doc.address ?? null,
      createdAt: doc.createdAt ?? /* @__PURE__ */ new Date()
    };
  }
  async getCustomers() {
    await this.ensureConnection();
    const docs = await this.customersCol().find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => this.docToCustomer(d));
  }
  async getCustomer(id) {
    await this.ensureConnection();
    try {
      const doc = await this.customersCol().findOne({ _id: new ObjectId(id) });
      return doc ? this.docToCustomer(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async getCustomerByPhone(phone) {
    await this.ensureConnection();
    const doc = await this.customersCol().findOne({ contactNumber: phone });
    return doc ? this.docToCustomer(doc) : void 0;
  }
  async createCustomer(insertCustomer) {
    await this.ensureConnection();
    const now = /* @__PURE__ */ new Date();
    const doc = {
      name: insertCustomer.name,
      contactNumber: insertCustomer.phone,
      email: insertCustomer.email ?? null,
      address: insertCustomer.address ?? null,
      visitCount: 1,
      lastVisitDate: now,
      createdAt: now,
      updatedAt: now
    };
    const result = await this.customersCol().insertOne(doc);
    return this.docToCustomer({ _id: result.insertedId, ...doc });
  }
  async updateCustomer(id, customerData) {
    await this.ensureConnection();
    try {
      const update = { updatedAt: /* @__PURE__ */ new Date() };
      if (customerData.name !== void 0) update.name = customerData.name;
      if (customerData.phone !== void 0) update.contactNumber = customerData.phone;
      if (customerData.email !== void 0) update.email = customerData.email;
      if (customerData.address !== void 0) update.address = customerData.address;
      const result = await this.customersCol().findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" }
      );
      return result ? this.docToCustomer(result) : void 0;
    } catch {
      return void 0;
    }
  }
  async deleteCustomer(id) {
    await this.ensureConnection();
    try {
      const result = await this.customersCol().deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch {
      return false;
    }
  }
  async getFeedbacks() {
    await this.ensureConnection();
    const feedbacks = await mongodb.getCollection("feedbacks").find().sort({ createdAt: -1 }).toArray();
    return feedbacks;
  }
  async getFeedback(id) {
    await this.ensureConnection();
    const feedback = await mongodb.getCollection("feedbacks").findOne({ id });
    return feedback ?? void 0;
  }
  async createFeedback(insertFeedback) {
    await this.ensureConnection();
    const id = randomUUID2();
    const feedback = {
      id,
      customerId: insertFeedback.customerId ?? null,
      customerName: insertFeedback.customerName,
      rating: insertFeedback.rating,
      comment: insertFeedback.comment,
      sentiment: insertFeedback.sentiment || "Neutral",
      createdAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("feedbacks").insertOne(feedback);
    return feedback;
  }
  async deleteFeedback(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("feedbacks").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getSetting(key) {
    await this.ensureConnection();
    const setting = await mongodb.getCollection("settings").findOne({ key });
    return setting?.value;
  }
  async setSetting(key, value) {
    await this.ensureConnection();
    await mongodb.getCollection("settings").updateOne(
      { key },
      { $set: { key, value } },
      { upsert: true }
    );
  }
  async getInventoryUsages() {
    await this.ensureConnection();
    const usages = await mongodb.getCollection("inventoryUsages").find().sort({ usedAt: -1 }).toArray();
    return usages;
  }
  async getInventoryUsagesByItem(inventoryItemId) {
    await this.ensureConnection();
    const usages = await mongodb.getCollection("inventoryUsages").find({ inventoryItemId }).sort({ usedAt: -1 }).toArray();
    return usages;
  }
  async createInventoryUsage(usage) {
    await this.ensureConnection();
    const id = randomUUID2();
    const newUsage = {
      id,
      inventoryItemId: usage.inventoryItemId,
      itemName: usage.itemName,
      quantity: usage.quantity,
      unit: usage.unit,
      usedAt: /* @__PURE__ */ new Date(),
      source: usage.source || "manual",
      notes: usage.notes || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("inventoryUsages").insertOne(newUsage);
    return newUsage;
  }
  async getMostUsedItems(limit = 10) {
    await this.ensureConnection();
    const usages = await mongodb.getCollection("inventoryUsages").find().toArray();
    const itemMap = /* @__PURE__ */ new Map();
    for (const usage of usages) {
      const key = usage.inventoryItemId;
      const qty = parseFloat(usage.quantity) || 0;
      if (!itemMap.has(key)) {
        itemMap.set(key, { itemName: usage.itemName, totalQuantity: qty, count: 1 });
      } else {
        const existing = itemMap.get(key);
        existing.totalQuantity += qty;
        existing.count += 1;
      }
    }
    const sorted = Array.from(itemMap.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, limit).map(([itemId, data]) => ({
      itemId,
      itemName: data.itemName,
      totalQuantity: data.totalQuantity.toString(),
      count: data.count
    }));
    return sorted;
  }
  async seedInventoryAndRecipes() {
    await this.ensureConnection();
    const existingInventory = await this.getInventoryItems();
    if (existingInventory.length > 0) {
      return { inventoryCount: existingInventory.length, recipesCount: 0, suppliersCount: 0 };
    }
    const supplier1 = await this.createSupplier({
      name: "Fresh Foods Inc.",
      contactPerson: "John Smith",
      phone: "+1-555-0101",
      email: "john@freshfoods.com",
      address: "123 Market Street, City, State 12345",
      status: "active"
    });
    const supplier2 = await this.createSupplier({
      name: "Quality Ingredients Co.",
      contactPerson: "Sarah Johnson",
      phone: "+1-555-0202",
      email: "sarah@qualityingredients.com",
      address: "456 Supply Lane, City, State 12345",
      status: "active"
    });
    const inventoryItemsData = [
      { name: "Chicken Breast", category: "Meat & Poultry", currentStock: "50000", unit: "g", minStock: "10000", costPerUnit: "0.015", supplierId: supplier1.id },
      { name: "Baby Corn", category: "Vegetables", currentStock: "20000", unit: "g", minStock: "5000", costPerUnit: "0.008", supplierId: supplier1.id },
      { name: "Cooking Oil", category: "Cooking Essentials", currentStock: "10000", unit: "ml", minStock: "2000", costPerUnit: "0.005", supplierId: supplier2.id },
      { name: "Soy Sauce", category: "Condiments", currentStock: "5000", unit: "ml", minStock: "1000", costPerUnit: "0.010", supplierId: supplier2.id },
      { name: "Spices Mix", category: "Spices", currentStock: "5000", unit: "g", minStock: "1000", costPerUnit: "0.020", supplierId: supplier2.id },
      { name: "Wheat Flour", category: "Baking", currentStock: "30000", unit: "g", minStock: "5000", costPerUnit: "0.003", supplierId: supplier2.id },
      { name: "Cheese", category: "Dairy", currentStock: "15000", unit: "g", minStock: "3000", costPerUnit: "0.012", supplierId: supplier1.id },
      { name: "Mixed Vegetables", category: "Vegetables", currentStock: "25000", unit: "g", minStock: "5000", costPerUnit: "0.006", supplierId: supplier1.id },
      { name: "Burger Buns", category: "Bakery", currentStock: "200", unit: "pcs", minStock: "50", costPerUnit: "0.50", supplierId: supplier1.id },
      { name: "Pizza Dough", category: "Bakery", currentStock: "100", unit: "pcs", minStock: "20", costPerUnit: "1.20", supplierId: supplier1.id },
      { name: "Tomato Sauce", category: "Condiments", currentStock: "8000", unit: "ml", minStock: "2000", costPerUnit: "0.008", supplierId: supplier2.id },
      { name: "Potatoes", category: "Vegetables", currentStock: "40000", unit: "g", minStock: "10000", costPerUnit: "0.002", supplierId: supplier1.id },
      { name: "Lettuce", category: "Vegetables", currentStock: "3000", unit: "g", minStock: "500", costPerUnit: "0.015", supplierId: supplier1.id },
      { name: "Pasta", category: "Pasta & Grains", currentStock: "20000", unit: "g", minStock: "5000", costPerUnit: "0.004", supplierId: supplier2.id },
      { name: "Cream", category: "Dairy", currentStock: "8000", unit: "ml", minStock: "2000", costPerUnit: "0.012", supplierId: supplier1.id },
      { name: "Chocolate", category: "Desserts", currentStock: "5000", unit: "g", minStock: "1000", costPerUnit: "0.025", supplierId: supplier2.id },
      { name: "Vanilla Extract", category: "Flavorings", currentStock: "2000", unit: "ml", minStock: "500", costPerUnit: "0.030", supplierId: supplier2.id },
      { name: "Strawberries", category: "Fruits", currentStock: "3000", unit: "g", minStock: "1000", costPerUnit: "0.020", supplierId: supplier1.id },
      { name: "Coca Cola Syrup", category: "Beverages", currentStock: "10000", unit: "ml", minStock: "2000", costPerUnit: "0.008", supplierId: supplier2.id }
    ];
    const inventoryItems = [];
    for (const itemData of inventoryItemsData) {
      const item = await this.createInventoryItem(itemData);
      inventoryItems.push(item);
    }
    const inventoryMap = new Map(inventoryItems.map((item) => [item.name, item]));
    const menuItems = await this.getMenuItems();
    let recipesCreated = 0;
    const recipeData = {
      "Chicken Burger": {
        ingredients: ["Chicken Breast", "Burger Buns", "Lettuce"],
        quantities: ["150", "1", "30"],
        units: ["g", "pcs", "g"]
      },
      "Veggie Pizza": {
        ingredients: ["Pizza Dough", "Cheese", "Mixed Vegetables", "Tomato Sauce"],
        quantities: ["1", "200", "150", "100"],
        units: ["pcs", "g", "g", "ml"]
      },
      "French Fries": {
        ingredients: ["Potatoes", "Cooking Oil"],
        quantities: ["300", "50"],
        units: ["g", "ml"]
      },
      "Coca Cola": {
        ingredients: ["Coca Cola Syrup"],
        quantities: ["30"],
        units: ["ml"]
      },
      "Caesar Salad": {
        ingredients: ["Lettuce", "Cheese", "Chicken Breast"],
        quantities: ["100", "50", "80"],
        units: ["g", "g", "g"]
      },
      "Pasta Alfredo": {
        ingredients: ["Pasta", "Cream", "Cheese"],
        quantities: ["200", "150", "80"],
        units: ["g", "ml", "g"]
      },
      "Chocolate Cake": {
        ingredients: ["Wheat Flour", "Chocolate", "Cream"],
        quantities: ["150", "100", "50"],
        units: ["g", "g", "ml"]
      },
      "Ice Cream": {
        ingredients: ["Cream", "Vanilla Extract", "Strawberries"],
        quantities: ["150", "10", "50"],
        units: ["ml", "ml", "g"]
      }
    };
    for (const menuItem of menuItems) {
      const recipeInfo = recipeData[menuItem.name];
      if (!recipeInfo) continue;
      const recipe = await this.createRecipe({
        menuItemId: menuItem.id
      });
      for (let i = 0; i < recipeInfo.ingredients.length; i++) {
        const ingredientName = recipeInfo.ingredients[i];
        const inventoryItem = inventoryMap.get(ingredientName);
        if (!inventoryItem) continue;
        await this.createRecipeIngredient({
          recipeId: recipe.id,
          inventoryItemId: inventoryItem.id,
          quantity: recipeInfo.quantities[i],
          unit: recipeInfo.units[i]
        });
      }
      recipesCreated++;
    }
    return {
      inventoryCount: inventoryItems.length,
      recipesCount: recipesCreated,
      suppliersCount: 2
    };
  }
  async getDeliveryPersons() {
    await this.ensureConnection();
    return await mongodb.getCollection("deliveryPersons").find().toArray();
  }
  async getDeliveryPerson(id) {
    await this.ensureConnection();
    const person = await mongodb.getCollection("deliveryPersons").findOne({ id });
    return person ?? void 0;
  }
  async createDeliveryPerson(person) {
    await this.ensureConnection();
    const id = randomUUID2();
    const newPerson = {
      id,
      name: person.name,
      phone: person.phone,
      status: person.status || "available",
      createdAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("deliveryPersons").insertOne(newPerson);
    return newPerson;
  }
  async updateDeliveryPerson(id, person) {
    await this.ensureConnection();
    const collection = mongodb.getCollection("deliveryPersons");
    const existing = await collection.findOne({ id });
    if (!existing) return void 0;
    const update = {};
    if (person.name !== void 0) update.name = person.name;
    if (person.phone !== void 0) update.phone = person.phone;
    if (person.status !== void 0) update.status = person.status;
    await collection.updateOne({ id }, { $set: update });
    const updated = await collection.findOne({ id });
    return updated ?? void 0;
  }
  async deleteDeliveryPerson(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("deliveryPersons").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async assignDeliveryPerson(orderId, deliveryPersonId) {
    await this.ensureConnection();
    const collection = mongodb.getCollection("orders");
    const existing = await collection.findOne({ id: orderId });
    if (!existing) return void 0;
    await collection.updateOne({ id: orderId }, { $set: { deliveryPersonId } });
    const updated = await collection.findOne({ id: orderId });
    return updated ?? void 0;
  }
  // ── Printer CRUD ──────────────────────────────────────────────────────────
  async getPrinters() {
    await this.ensureConnection();
    const docs = await mongodb.getCollection("printers").find({}).toArray();
    return docs.map((d) => {
      const { _id, ...rest } = d;
      return rest;
    });
  }
  async getPrinter(id) {
    await this.ensureConnection();
    const doc = await mongodb.getCollection("printers").findOne({ id });
    if (!doc) return void 0;
    const { _id, ...rest } = doc;
    return rest;
  }
  async createPrinter(printer) {
    await this.ensureConnection();
    const newPrinter = {
      id: randomUUID2(),
      name: printer.name,
      ip: printer.ip,
      port: printer.port ?? 9100,
      type: printer.type ?? "KOT",
      autoPrint: printer.autoPrint ?? true,
      createdAt: /* @__PURE__ */ new Date()
    };
    await mongodb.getCollection("printers").insertOne(newPrinter);
    return newPrinter;
  }
  async updatePrinter(id, data) {
    await this.ensureConnection();
    const collection = mongodb.getCollection("printers");
    const existing = await collection.findOne({ id });
    if (!existing) return void 0;
    const update = {};
    if (data.name !== void 0) update.name = data.name;
    if (data.ip !== void 0) update.ip = data.ip;
    if (data.port !== void 0) update.port = data.port;
    if (data.type !== void 0) update.type = data.type;
    if (data.autoPrint !== void 0) update.autoPrint = data.autoPrint;
    await collection.updateOne({ id }, { $set: update });
    const updated = await collection.findOne({ id });
    if (!updated) return void 0;
    const { _id, ...rest } = updated;
    return rest;
  }
  async deletePrinter(id) {
    await this.ensureConnection();
    const result = await mongodb.getCollection("printers").deleteOne({ id });
    return result.deletedCount > 0;
  }
  // ── Print Jobs ────────────────────────────────────────────────────────────
  async createPrintJob(job) {
    await this.ensureConnection();
    const newJob = { id: randomUUID2(), ...job, createdAt: /* @__PURE__ */ new Date() };
    await mongodb.getCollection("print_jobs").insertOne(newJob);
    return newJob;
  }
  async getPendingPrintJobs() {
    await this.ensureConnection();
    const docs = await mongodb.getCollection("print_jobs").find({ status: "pending" }).sort({ createdAt: 1 }).toArray();
    return docs.map((d) => {
      const { _id, ...rest } = d;
      return rest;
    });
  }
  async markPrintJobDone(id) {
    await this.ensureConnection();
    await mongodb.getCollection("print_jobs").updateOne(
      { id },
      { $set: { status: "done", doneAt: /* @__PURE__ */ new Date() } }
    );
  }
  async markPrintJobFailed(id) {
    await this.ensureConnection();
    await mongodb.getCollection("print_jobs").updateOne(
      { id },
      { $set: { status: "failed", doneAt: /* @__PURE__ */ new Date() } }
    );
  }
};
var mongoStorage = new MongoStorage();

// server/session-storage.ts
import { randomUUID as randomUUID3 } from "crypto";
var SessionStorage = class {
  restaurantId;
  mongodbUri;
  connected = false;
  constructor(restaurantId, mongodbUri) {
    this.restaurantId = restaurantId;
    this.mongodbUri = mongodbUri;
  }
  async ensureConnection() {
    if (!this.connected) {
      await dynamicMongoDB.getConnection(this.restaurantId, this.mongodbUri);
      this.connected = true;
    }
  }
  getCollection(name) {
    const collection = dynamicMongoDB.getCollection(this.restaurantId, name);
    if (!collection) {
      throw new Error(`Not connected to database for restaurant ${this.restaurantId}`);
    }
    return collection;
  }
  async getUser(id) {
    await this.ensureConnection();
    const user = await this.getCollection("users").findOne({ id });
    return user ?? void 0;
  }
  async getUserByUsername(username) {
    await this.ensureConnection();
    const user = await this.getCollection("users").findOne({ username });
    return user ?? void 0;
  }
  async createUser(user) {
    await this.ensureConnection();
    const id = randomUUID3();
    const newUser = { id, ...user };
    await this.getCollection("users").insertOne(newUser);
    return newUser;
  }
  async getFloors() {
    await this.ensureConnection();
    const floors = await this.getCollection("floors").find().sort({ displayOrder: 1 }).toArray();
    return floors;
  }
  async getFloor(id) {
    await this.ensureConnection();
    const floor = await this.getCollection("floors").findOne({ id });
    return floor ?? void 0;
  }
  async createFloor(insertFloor) {
    await this.ensureConnection();
    const id = randomUUID3();
    const floor = {
      id,
      name: insertFloor.name,
      displayOrder: insertFloor.displayOrder ?? 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("floors").insertOne(floor);
    return floor;
  }
  async updateFloor(id, floorData) {
    await this.ensureConnection();
    const result = await this.getCollection("floors").findOneAndUpdate(
      { id },
      { $set: floorData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteFloor(id) {
    await this.ensureConnection();
    const tablesOnFloor = await this.getCollection("tables").countDocuments({ floorId: id });
    if (tablesOnFloor > 0) {
      throw new Error(`Cannot delete floor: ${tablesOnFloor} table(s) are assigned to this floor`);
    }
    const result = await this.getCollection("floors").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getTables() {
    await this.ensureConnection();
    const tables = await this.getCollection("tables").find().toArray();
    return tables;
  }
  async getTable(id) {
    await this.ensureConnection();
    const table = await this.getCollection("tables").findOne({ id });
    return table ?? void 0;
  }
  async getTableByNumber(tableNumber) {
    await this.ensureConnection();
    const table = await this.getCollection("tables").findOne({ tableNumber });
    return table ?? void 0;
  }
  async createTable(insertTable) {
    await this.ensureConnection();
    const id = randomUUID3();
    const table = {
      id,
      tableNumber: insertTable.tableNumber,
      seats: insertTable.seats,
      status: insertTable.status ?? "free",
      currentOrderId: null,
      floorId: insertTable.floorId ?? null
    };
    await this.getCollection("tables").insertOne(table);
    return table;
  }
  async updateTable(id, tableData) {
    await this.ensureConnection();
    const result = await this.getCollection("tables").findOneAndUpdate(
      { id },
      { $set: tableData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateTableStatus(id, status) {
    await this.ensureConnection();
    const result = await this.getCollection("tables").findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateTableOrder(id, orderId) {
    await this.ensureConnection();
    const result = await this.getCollection("tables").findOneAndUpdate(
      { id },
      { $set: { currentOrderId: orderId } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteTable(id) {
    await this.ensureConnection();
    const result = await this.getCollection("tables").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getMenuItems() {
    await this.ensureConnection();
    const items = await this.getCollection("menuItems").find().toArray();
    return items;
  }
  async getMenuItem(id) {
    await this.ensureConnection();
    const item = await this.getCollection("menuItems").findOne({ id });
    return item ?? void 0;
  }
  async createMenuItem(insertItem) {
    await this.ensureConnection();
    const id = randomUUID3();
    const item = {
      id,
      name: insertItem.name,
      category: insertItem.category,
      price: insertItem.price,
      cost: insertItem.cost,
      available: insertItem.available ?? true,
      isVeg: insertItem.isVeg ?? true,
      variants: insertItem.variants ?? null,
      image: insertItem.image ?? null,
      description: insertItem.description ?? null,
      quickCode: insertItem.quickCode ?? null
    };
    await this.getCollection("menuItems").insertOne(item);
    return item;
  }
  async updateMenuItem(id, itemData) {
    await this.ensureConnection();
    const result = await this.getCollection("menuItems").findOneAndUpdate(
      { id },
      { $set: itemData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteMenuItem(id) {
    await this.ensureConnection();
    const result = await this.getCollection("menuItems").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getOrders() {
    await this.ensureConnection();
    const orders = await this.getCollection("orders").find().sort({ createdAt: -1 }).toArray();
    return orders;
  }
  async getOrder(id) {
    await this.ensureConnection();
    const order = await this.getCollection("orders").findOne({ id });
    return order ?? void 0;
  }
  async getOrdersByTable(tableId) {
    await this.ensureConnection();
    const orders = await this.getCollection("orders").find({ tableId }).toArray();
    return orders;
  }
  async getActiveOrders() {
    await this.ensureConnection();
    const orders = await this.getCollection("orders").find({ status: { $nin: ["completed", "cancelled"] } }).sort({ createdAt: -1 }).toArray();
    return orders;
  }
  async getCompletedOrders() {
    await this.ensureConnection();
    const orders = await this.getCollection("orders").find({ status: { $in: ["paid", "completed"] } }).sort({ completedAt: -1 }).toArray();
    return orders;
  }
  async getDeliveryOrders() {
    await this.ensureConnection();
    const orders = await this.getCollection("orders").find({ orderType: "delivery" }).sort({ createdAt: -1 }).toArray();
    return orders;
  }
  async createOrder(insertOrder) {
    await this.ensureConnection();
    const id = randomUUID3();
    const order = {
      id,
      tableId: insertOrder.tableId ?? null,
      orderType: insertOrder.orderType,
      status: insertOrder.status ?? "saved",
      total: insertOrder.total ?? "0",
      customerName: insertOrder.customerName ?? null,
      customerPhone: insertOrder.customerPhone ?? null,
      customerAddress: insertOrder.customerAddress ?? null,
      paymentMode: insertOrder.paymentMode ?? null,
      waiterId: insertOrder.waiterId ?? null,
      deliveryPersonId: insertOrder.deliveryPersonId ?? null,
      expectedPickupTime: insertOrder.expectedPickupTime ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      completedAt: null,
      billedAt: null,
      paidAt: null,
      kotCount: 0
    };
    await this.getCollection("orders").insertOne(order);
    return order;
  }
  async updateOrderStatus(id, status) {
    await this.ensureConnection();
    const result = await this.getCollection("orders").findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async incrementKotCount(id) {
    await this.ensureConnection();
    const result = await this.getCollection("orders").findOneAndUpdate(
      { id },
      { $inc: { kotCount: 1 } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateOrderTotal(id, total) {
    await this.ensureConnection();
    const result = await this.getCollection("orders").findOneAndUpdate(
      { id },
      { $set: { total } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async completeOrder(id) {
    await this.ensureConnection();
    const result = await this.getCollection("orders").findOneAndUpdate(
      { id },
      { $set: { status: "completed", completedAt: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async billOrder(id) {
    await this.ensureConnection();
    const result = await this.getCollection("orders").findOneAndUpdate(
      { id },
      { $set: { status: "billed", billedAt: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async checkoutOrder(id, paymentMode) {
    await this.ensureConnection();
    const updateData = { status: "completed", paidAt: /* @__PURE__ */ new Date(), completedAt: /* @__PURE__ */ new Date() };
    if (paymentMode) {
      updateData.paymentMode = paymentMode;
    }
    const result = await this.getCollection("orders").findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteOrder(id) {
    await this.ensureConnection();
    await this.getCollection("orderItems").deleteMany({ orderId: id });
    const result = await this.getCollection("orders").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getOrderItems(orderId) {
    await this.ensureConnection();
    const items = await this.getCollection("orderItems").find({ orderId }).toArray();
    return items;
  }
  async getOrderItem(id) {
    await this.ensureConnection();
    const item = await this.getCollection("orderItems").findOne({ id });
    return item ?? void 0;
  }
  async createOrderItem(insertItem) {
    await this.ensureConnection();
    const id = randomUUID3();
    const item = {
      id,
      orderId: insertItem.orderId,
      menuItemId: insertItem.menuItemId,
      name: insertItem.name,
      quantity: insertItem.quantity,
      price: insertItem.price,
      notes: insertItem.notes ?? null,
      status: insertItem.status ?? "new",
      isVeg: insertItem.isVeg ?? true
    };
    await this.getCollection("orderItems").insertOne(item);
    return item;
  }
  async updateOrderItemStatus(id, status) {
    await this.ensureConnection();
    const result = await this.getCollection("orderItems").findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateOrderItem(id, data) {
    await this.ensureConnection();
    const result = await this.getCollection("orderItems").findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteOrderItem(id) {
    await this.ensureConnection();
    const result = await this.getCollection("orderItems").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getInventoryItems() {
    await this.ensureConnection();
    const items = await this.getCollection("inventoryItems").find().toArray();
    return items;
  }
  async getInventoryItem(id) {
    await this.ensureConnection();
    const item = await this.getCollection("inventoryItems").findOne({ id });
    return item ?? void 0;
  }
  async createInventoryItem(insertItem) {
    await this.ensureConnection();
    const id = randomUUID3();
    const item = {
      id,
      name: insertItem.name,
      category: insertItem.category,
      currentStock: insertItem.currentStock,
      unit: insertItem.unit,
      minStock: insertItem.minStock ?? "0",
      supplierId: insertItem.supplierId ?? null,
      costPerUnit: insertItem.costPerUnit ?? "0",
      image: insertItem.image ?? null,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    await this.getCollection("inventoryItems").insertOne(item);
    return item;
  }
  async updateInventoryItem(id, itemData) {
    await this.ensureConnection();
    const result = await this.getCollection("inventoryItems").findOneAndUpdate(
      { id },
      { $set: { ...itemData, lastUpdated: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async updateInventoryQuantity(id, quantity) {
    await this.ensureConnection();
    const result = await this.getCollection("inventoryItems").findOneAndUpdate(
      { id },
      { $set: { currentStock: quantity, lastUpdated: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteInventoryItem(id) {
    await this.ensureConnection();
    const result = await this.getCollection("inventoryItems").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async deductInventoryForOrder(orderId) {
    await this.ensureConnection();
  }
  async getRecipes() {
    await this.ensureConnection();
    const recipes = await this.getCollection("recipes").find().toArray();
    return recipes;
  }
  async getRecipe(id) {
    await this.ensureConnection();
    const recipe = await this.getCollection("recipes").findOne({ id });
    return recipe ?? void 0;
  }
  async getRecipeByMenuItemId(menuItemId) {
    await this.ensureConnection();
    const recipe = await this.getCollection("recipes").findOne({ menuItemId });
    return recipe ?? void 0;
  }
  async createRecipe(insertRecipe) {
    await this.ensureConnection();
    const id = randomUUID3();
    const recipe = {
      id,
      menuItemId: insertRecipe.menuItemId,
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("recipes").insertOne(recipe);
    return recipe;
  }
  async deleteRecipe(id) {
    await this.ensureConnection();
    await this.getCollection("recipeIngredients").deleteMany({ recipeId: id });
    const result = await this.getCollection("recipes").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getRecipeIngredients(recipeId) {
    await this.ensureConnection();
    const ingredients = await this.getCollection("recipeIngredients").find({ recipeId }).toArray();
    return ingredients;
  }
  async getRecipeIngredient(id) {
    await this.ensureConnection();
    const ingredient = await this.getCollection("recipeIngredients").findOne({ id });
    return ingredient ?? void 0;
  }
  async createRecipeIngredient(insertIngredient) {
    await this.ensureConnection();
    const id = randomUUID3();
    const ingredient = {
      id,
      recipeId: insertIngredient.recipeId,
      inventoryItemId: insertIngredient.inventoryItemId,
      quantity: insertIngredient.quantity,
      unit: insertIngredient.unit
    };
    await this.getCollection("recipeIngredients").insertOne(ingredient);
    return ingredient;
  }
  async updateRecipeIngredient(id, ingredientData) {
    await this.ensureConnection();
    const result = await this.getCollection("recipeIngredients").findOneAndUpdate(
      { id },
      { $set: ingredientData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteRecipeIngredient(id) {
    await this.ensureConnection();
    const result = await this.getCollection("recipeIngredients").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getSuppliers() {
    await this.ensureConnection();
    const suppliers = await this.getCollection("suppliers").find().toArray();
    return suppliers;
  }
  async getSupplier(id) {
    await this.ensureConnection();
    const supplier = await this.getCollection("suppliers").findOne({ id });
    return supplier ?? void 0;
  }
  async createSupplier(insertSupplier) {
    await this.ensureConnection();
    const id = randomUUID3();
    const supplier = {
      id,
      name: insertSupplier.name,
      contactPerson: insertSupplier.contactPerson ?? null,
      phone: insertSupplier.phone,
      email: insertSupplier.email ?? null,
      address: insertSupplier.address ?? null,
      status: insertSupplier.status ?? "active",
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("suppliers").insertOne(supplier);
    return supplier;
  }
  async updateSupplier(id, supplierData) {
    await this.ensureConnection();
    const result = await this.getCollection("suppliers").findOneAndUpdate(
      { id },
      { $set: supplierData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteSupplier(id) {
    await this.ensureConnection();
    const result = await this.getCollection("suppliers").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getPurchaseOrders() {
    await this.ensureConnection();
    const orders = await this.getCollection("purchaseOrders").find().sort({ createdAt: -1 }).toArray();
    return orders;
  }
  async getPurchaseOrder(id) {
    await this.ensureConnection();
    const order = await this.getCollection("purchaseOrders").findOne({ id });
    return order ?? void 0;
  }
  async createPurchaseOrder(insertOrder) {
    await this.ensureConnection();
    const id = randomUUID3();
    const order = {
      id,
      orderNumber: insertOrder.orderNumber,
      supplierId: insertOrder.supplierId,
      orderDate: insertOrder.orderDate,
      expectedDeliveryDate: insertOrder.expectedDeliveryDate ?? null,
      actualDeliveryDate: null,
      status: insertOrder.status ?? "pending",
      totalAmount: insertOrder.totalAmount ?? "0",
      notes: insertOrder.notes ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("purchaseOrders").insertOne(order);
    return order;
  }
  async updatePurchaseOrder(id, orderData) {
    await this.ensureConnection();
    const result = await this.getCollection("purchaseOrders").findOneAndUpdate(
      { id },
      { $set: orderData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async receivePurchaseOrder(id) {
    await this.ensureConnection();
    const result = await this.getCollection("purchaseOrders").findOneAndUpdate(
      { id },
      { $set: { status: "received", actualDeliveryDate: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deletePurchaseOrder(id) {
    await this.ensureConnection();
    await this.getCollection("purchaseOrderItems").deleteMany({ purchaseOrderId: id });
    const result = await this.getCollection("purchaseOrders").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getPurchaseOrderItems(purchaseOrderId) {
    await this.ensureConnection();
    const items = await this.getCollection("purchaseOrderItems").find({ purchaseOrderId }).toArray();
    return items;
  }
  async getPurchaseOrderItem(id) {
    await this.ensureConnection();
    const item = await this.getCollection("purchaseOrderItems").findOne({ id });
    return item ?? void 0;
  }
  async createPurchaseOrderItem(insertItem) {
    await this.ensureConnection();
    const id = randomUUID3();
    const item = {
      id,
      purchaseOrderId: insertItem.purchaseOrderId,
      inventoryItemId: insertItem.inventoryItemId,
      quantity: insertItem.quantity,
      unit: insertItem.unit,
      costPerUnit: insertItem.costPerUnit,
      totalCost: insertItem.totalCost
    };
    await this.getCollection("purchaseOrderItems").insertOne(item);
    return item;
  }
  async updatePurchaseOrderItem(id, itemData) {
    await this.ensureConnection();
    const result = await this.getCollection("purchaseOrderItems").findOneAndUpdate(
      { id },
      { $set: itemData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deletePurchaseOrderItem(id) {
    await this.ensureConnection();
    const result = await this.getCollection("purchaseOrderItems").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getWastages() {
    await this.ensureConnection();
    const wastages = await this.getCollection("wastages").find().sort({ createdAt: -1 }).toArray();
    return wastages;
  }
  async getWastage(id) {
    await this.ensureConnection();
    const wastage = await this.getCollection("wastages").findOne({ id });
    return wastage ?? void 0;
  }
  async createWastage(insertWastage) {
    await this.ensureConnection();
    const id = randomUUID3();
    const wastage = {
      id,
      inventoryItemId: insertWastage.inventoryItemId,
      quantity: insertWastage.quantity,
      unit: insertWastage.unit,
      reason: insertWastage.reason,
      reportedBy: insertWastage.reportedBy ?? null,
      notes: insertWastage.notes ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("wastages").insertOne(wastage);
    return wastage;
  }
  async deleteWastage(id) {
    await this.ensureConnection();
    const result = await this.getCollection("wastages").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getInvoices() {
    await this.ensureConnection();
    const invoices = await this.getCollection("invoices").find().sort({ createdAt: -1 }).toArray();
    return invoices;
  }
  async getInvoice(id) {
    await this.ensureConnection();
    const invoice = await this.getCollection("invoices").findOne({ id });
    return invoice ?? void 0;
  }
  async getInvoiceByNumber(invoiceNumber) {
    await this.ensureConnection();
    const invoice = await this.getCollection("invoices").findOne({ invoiceNumber });
    return invoice ?? void 0;
  }
  async createInvoice(insertInvoice) {
    await this.ensureConnection();
    const id = randomUUID3();
    const invoice = {
      id,
      invoiceNumber: insertInvoice.invoiceNumber,
      orderId: insertInvoice.orderId,
      tableNumber: insertInvoice.tableNumber ?? null,
      floorName: insertInvoice.floorName ?? null,
      customerName: insertInvoice.customerName ?? null,
      customerPhone: insertInvoice.customerPhone ?? null,
      subtotal: insertInvoice.subtotal,
      tax: insertInvoice.tax,
      cgst: insertInvoice.cgst ?? "0",
      sgst: insertInvoice.sgst ?? "0",
      serviceCharge: insertInvoice.serviceCharge ?? "0",
      discount: insertInvoice.discount ?? "0",
      total: insertInvoice.total,
      paymentMode: insertInvoice.paymentMode,
      splitPayments: insertInvoice.splitPayments ?? null,
      status: insertInvoice.status ?? "Paid",
      items: insertInvoice.items,
      notes: insertInvoice.notes ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("invoices").insertOne(invoice);
    return invoice;
  }
  async updateInvoice(id, invoiceData) {
    await this.ensureConnection();
    const result = await this.getCollection("invoices").findOneAndUpdate(
      { id },
      { $set: { ...invoiceData, updatedAt: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteInvoice(id) {
    await this.ensureConnection();
    const result = await this.getCollection("invoices").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getReservations() {
    await this.ensureConnection();
    const reservations = await this.getCollection("reservations").find().sort({ timeSlot: 1 }).toArray();
    return reservations;
  }
  async getReservation(id) {
    await this.ensureConnection();
    const reservation = await this.getCollection("reservations").findOne({ id });
    return reservation ?? void 0;
  }
  async getReservationsByTable(tableId) {
    await this.ensureConnection();
    const reservations = await this.getCollection("reservations").find({ tableId }).toArray();
    return reservations;
  }
  async createReservation(insertReservation) {
    await this.ensureConnection();
    const id = randomUUID3();
    const reservation = {
      id,
      tableId: insertReservation.tableId,
      customerName: insertReservation.customerName,
      customerPhone: insertReservation.customerPhone,
      numberOfPeople: insertReservation.numberOfPeople,
      timeSlot: insertReservation.timeSlot,
      notes: insertReservation.notes ?? null,
      status: insertReservation.status ?? "active",
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("reservations").insertOne(reservation);
    return reservation;
  }
  async updateReservation(id, reservationData) {
    await this.ensureConnection();
    const result = await this.getCollection("reservations").findOneAndUpdate(
      { id },
      { $set: reservationData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteReservation(id) {
    await this.ensureConnection();
    const result = await this.getCollection("reservations").deleteOne({ id });
    return result.deletedCount > 0;
  }
  // ── Customer helpers ────────────────────────────────────────────────────
  // Customers live in `customersdb.customers` on the shared cluster.
  // External schema: contactNumber (= phone), visitCount, lastVisitDate.
  customersCol() {
    return mongodb.getCustomersCollection("customers");
  }
  docToCustomer(doc) {
    return {
      id: doc._id.toString(),
      name: doc.name ?? "",
      phone: doc.contactNumber ?? doc.phone ?? "",
      email: doc.email ?? null,
      address: doc.address ?? null,
      createdAt: doc.createdAt ?? /* @__PURE__ */ new Date()
    };
  }
  async getCustomers() {
    await this.ensureConnection();
    const docs = await this.customersCol().find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => this.docToCustomer(d));
  }
  async getCustomer(id) {
    await this.ensureConnection();
    try {
      const doc = await this.customersCol().findOne({ _id: new ObjectId2(id) });
      return doc ? this.docToCustomer(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async getCustomerByPhone(phone) {
    await this.ensureConnection();
    const doc = await this.customersCol().findOne({ contactNumber: phone });
    return doc ? this.docToCustomer(doc) : void 0;
  }
  async createCustomer(insertCustomer) {
    await this.ensureConnection();
    const now = /* @__PURE__ */ new Date();
    const doc = {
      name: insertCustomer.name,
      contactNumber: insertCustomer.phone,
      email: insertCustomer.email ?? null,
      address: insertCustomer.address ?? null,
      visitCount: 1,
      lastVisitDate: now,
      createdAt: now,
      updatedAt: now
    };
    const result = await this.customersCol().insertOne(doc);
    return this.docToCustomer({ _id: result.insertedId, ...doc });
  }
  async updateCustomer(id, customerData) {
    await this.ensureConnection();
    try {
      const update = { updatedAt: /* @__PURE__ */ new Date() };
      if (customerData.name !== void 0) update.name = customerData.name;
      if (customerData.phone !== void 0) update.contactNumber = customerData.phone;
      if (customerData.email !== void 0) update.email = customerData.email;
      if (customerData.address !== void 0) update.address = customerData.address;
      const result = await this.customersCol().findOneAndUpdate(
        { _id: new ObjectId2(id) },
        { $set: update },
        { returnDocument: "after" }
      );
      return result ? this.docToCustomer(result) : void 0;
    } catch {
      return void 0;
    }
  }
  async deleteCustomer(id) {
    await this.ensureConnection();
    try {
      const result = await this.customersCol().deleteOne({ _id: new ObjectId2(id) });
      return result.deletedCount > 0;
    } catch {
      return false;
    }
  }
  async getFeedbacks() {
    await this.ensureConnection();
    const feedbacks = await this.getCollection("feedbacks").find().sort({ createdAt: -1 }).toArray();
    return feedbacks;
  }
  async getFeedback(id) {
    await this.ensureConnection();
    const feedback = await this.getCollection("feedbacks").findOne({ id });
    return feedback ?? void 0;
  }
  async createFeedback(insertFeedback) {
    await this.ensureConnection();
    const id = randomUUID3();
    const feedback = {
      id,
      customerId: insertFeedback.customerId ?? null,
      customerName: insertFeedback.customerName,
      rating: insertFeedback.rating,
      comment: insertFeedback.comment,
      sentiment: insertFeedback.sentiment ?? "Neutral",
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("feedbacks").insertOne(feedback);
    return feedback;
  }
  async deleteFeedback(id) {
    await this.ensureConnection();
    const result = await this.getCollection("feedbacks").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async getSetting(key) {
    await this.ensureConnection();
    const setting = await this.getCollection("settings").findOne({ key });
    return setting?.value;
  }
  async setSetting(key, value) {
    await this.ensureConnection();
    await this.getCollection("settings").updateOne(
      { key },
      { $set: { key, value } },
      { upsert: true }
    );
  }
  async getInventoryUsages() {
    await this.ensureConnection();
    const usages = await this.getCollection("inventoryUsages").find().sort({ createdAt: -1 }).toArray();
    return usages;
  }
  async getInventoryUsagesByItem(inventoryItemId) {
    await this.ensureConnection();
    const usages = await this.getCollection("inventoryUsages").find({ inventoryItemId }).sort({ createdAt: -1 }).toArray();
    return usages;
  }
  async createInventoryUsage(insertUsage) {
    await this.ensureConnection();
    const id = randomUUID3();
    const usage = {
      id,
      inventoryItemId: insertUsage.inventoryItemId,
      itemName: insertUsage.itemName,
      quantity: insertUsage.quantity,
      unit: insertUsage.unit,
      usedAt: /* @__PURE__ */ new Date(),
      source: insertUsage.source ?? "manual",
      notes: insertUsage.notes ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("inventoryUsages").insertOne(usage);
    return usage;
  }
  async getMostUsedItems(limit = 10) {
    await this.ensureConnection();
    const result = await this.getCollection("inventoryUsages").aggregate([
      {
        $group: {
          _id: "$inventoryItemId",
          itemName: { $first: "$itemName" },
          totalQuantity: { $sum: { $toDouble: "$quantity" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          itemId: "$_id",
          itemName: 1,
          totalQuantity: { $toString: "$totalQuantity" },
          count: 1
        }
      }
    ]).toArray();
    return result;
  }
  async getDeliveryPersons() {
    await this.ensureConnection();
    const persons = await this.getCollection("deliveryPersons").find().toArray();
    return persons;
  }
  async getDeliveryPerson(id) {
    await this.ensureConnection();
    const person = await this.getCollection("deliveryPersons").findOne({ id });
    return person ?? void 0;
  }
  async createDeliveryPerson(insertPerson) {
    await this.ensureConnection();
    const id = randomUUID3();
    const person = {
      id,
      name: insertPerson.name,
      phone: insertPerson.phone,
      status: insertPerson.status ?? "available",
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.getCollection("deliveryPersons").insertOne(person);
    return person;
  }
  async updateDeliveryPerson(id, personData) {
    await this.ensureConnection();
    const result = await this.getCollection("deliveryPersons").findOneAndUpdate(
      { id },
      { $set: personData },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  async deleteDeliveryPerson(id) {
    await this.ensureConnection();
    const result = await this.getCollection("deliveryPersons").deleteOne({ id });
    return result.deletedCount > 0;
  }
  async assignDeliveryPerson(orderId, deliveryPersonId) {
    await this.ensureConnection();
    const result = await this.getCollection("orders").findOneAndUpdate(
      { id: orderId },
      { $set: { deliveryPersonId } },
      { returnDocument: "after" }
    );
    return result ?? void 0;
  }
  // Printers are global (not per-restaurant session) — delegate to shared mongoStorage
  async getPrinters() {
    return mongoStorage.getPrinters();
  }
  async getPrinter(id) {
    return mongoStorage.getPrinter(id);
  }
  async createPrinter(p) {
    return mongoStorage.createPrinter(p);
  }
  async updatePrinter(id, p) {
    return mongoStorage.updatePrinter(id, p);
  }
  async deletePrinter(id) {
    return mongoStorage.deletePrinter(id);
  }
};

// server/auth-middleware.ts
var storageCache = /* @__PURE__ */ new Map();
function getStorageForSession(req) {
  if (!req.session?.isAuthenticated || !req.session.restaurantId || !req.session.mongodbUri) {
    return null;
  }
  const cacheKey = req.session.restaurantId;
  let storage2 = storageCache.get(cacheKey);
  if (!storage2) {
    storage2 = new SessionStorage(req.session.restaurantId, req.session.mongodbUri);
    storageCache.set(cacheKey, storage2);
  }
  return storage2;
}
function requireAuth(req, res, next) {
  if (!req.session?.isAuthenticated) {
    return res.status(401).json({ error: "Not authenticated", code: "UNAUTHORIZED" });
  }
  next();
}
var REMEMBER_ME_AGE = 30 * 24 * 60 * 60 * 1e3;
function setupAuthRoutes(app2) {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI environment variable is required");
  app2.use(session({
    secret: process.env.SESSION_SECRET || (() => {
      throw new Error("SESSION_SECRET environment variable is required");
    })(),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      dbName: "restaurant_pos",
      collectionName: "sessions",
      ttl: REMEMBER_ME_AGE / 1e3
      // max TTL in seconds; per-session cookie handles the client side
    }),
    cookie: {
      secure: false,
      httpOnly: true
      // No maxAge here — we set it per-login based on rememberMe
    }
  }));
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid credentials format" });
      }
      const { username, password } = result.data;
      const rememberMe = req.body.rememberMe === true;
      const account = validateCredentials(username, password);
      if (!account) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      if (!account.mongodbUri) {
        return res.status(500).json({ error: "Restaurant database not configured" });
      }
      const storage2 = new SessionStorage(account.id, account.mongodbUri);
      try {
        await storage2.getFloors();
      } catch (error) {
        console.error("MongoDB connection test failed:", error);
        return res.status(500).json({ error: "Database connection failed", code: "DB_ERROR" });
      }
      req.session.restaurantId = account.id;
      req.session.restaurantName = account.name;
      req.session.mongodbUri = account.mongodbUri;
      req.session.username = account.username;
      req.session.isAuthenticated = true;
      if (rememberMe) {
        req.session.cookie.maxAge = REMEMBER_ME_AGE;
      }
      storageCache.set(account.id, storage2);
      res.json({
        success: true,
        restaurant: {
          id: account.id,
          name: account.name,
          username: account.username
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    const restaurantId = req.session?.restaurantId;
    if (restaurantId) {
      storageCache.delete(restaurantId);
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
  app2.get("/api/auth/session", (req, res) => {
    if (req.session?.isAuthenticated) {
      res.json({
        isAuthenticated: true,
        restaurant: {
          id: req.session.restaurantId,
          name: req.session.restaurantName,
          username: req.session.username
        }
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  });
}

// server/routes.ts
init_schema();
import { z as z3 } from "zod";

// server/mongodbService.ts
import { MongoClient as MongoClient3 } from "mongodb";
async function fetchMenuItemsFromMongoDB(mongoUri, databaseName) {
  let client = null;
  try {
    let dbName;
    if (databaseName) {
      dbName = databaseName;
    } else {
      dbName = extractDatabaseName(mongoUri);
    }
    client = new MongoClient3(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    const allItems = [];
    const categorySet = /* @__PURE__ */ new Set();
    for (const collection of collections) {
      const collectionName = collection.name;
      if (collectionName === "system.indexes" || collectionName.startsWith("system.")) {
        continue;
      }
      const coll = db.collection(collectionName);
      const items = await coll.find({}).toArray();
      for (const item of items) {
        const category = item.category || collectionName;
        categorySet.add(category);
        const menuItem = {
          name: item.name,
          category,
          price: item.price?.toString() || "0",
          cost: item.price ? (item.price * 0.4).toFixed(2) : "0",
          available: item.isAvailable !== void 0 ? item.isAvailable : true,
          isVeg: item.isVeg !== void 0 ? item.isVeg : true,
          variants: null,
          image: item.image || null,
          description: item.description || null
        };
        allItems.push(menuItem);
      }
    }
    return {
      items: allItems,
      categories: Array.from(categorySet).sort()
    };
  } catch (error) {
    console.error("Error fetching from MongoDB:", error);
    throw new Error(`Failed to fetch menu items from MongoDB: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (client) {
      await client.close();
    }
  }
}
function extractDatabaseName(mongoUri) {
  const appNameMatch = mongoUri.match(/appName=([^&]+)/i);
  if (appNameMatch && appNameMatch[1]) {
    return appNameMatch[1].toLowerCase();
  }
  const pathMatch = mongoUri.match(/mongodb(?:\+srv)?:\/\/[^\/]+\/([^?&]+)/);
  if (pathMatch && pathMatch[1] && pathMatch[1] !== "") {
    return pathMatch[1];
  }
  return "test";
}

// server/utils/invoiceGenerator.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
function generateInvoicePDF(data) {
  const { invoice, order, orderItems, restaurantName = "BUNGLE", restaurantAddress = "", restaurantPhone = "", restaurantGSTIN = "" } = data;
  if (!invoice || !order || !orderItems) {
    throw new Error("Missing required data for PDF generation");
  }
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(restaurantName, pageWidth / 2, yPosition, { align: "center" });
  if (restaurantAddress) {
    yPosition += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(restaurantAddress, pageWidth / 2, yPosition, { align: "center" });
  }
  if (restaurantPhone) {
    yPosition += 5;
    doc.text(`Phone: ${restaurantPhone}`, pageWidth / 2, yPosition, { align: "center" });
  }
  if (restaurantGSTIN) {
    yPosition += 5;
    doc.text(`GSTIN: ${restaurantGSTIN}`, pageWidth / 2, yPosition, { align: "center" });
  }
  yPosition += 10;
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 10;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  if (order.orderType === "delivery") {
    doc.text("DELIVERY INVOICE", pageWidth / 2, yPosition, { align: "center" });
  } else if (order.orderType === "pickup") {
    doc.text("PICKUP INVOICE", pageWidth / 2, yPosition, { align: "center" });
  } else {
    doc.text("DINE-IN INVOICE", pageWidth / 2, yPosition, { align: "center" });
  }
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const invoiceDate = invoice.createdAt instanceof Date ? invoice.createdAt : new Date(invoice.createdAt || Date.now());
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 15, yPosition);
  doc.text(`Date: ${invoiceDate.toLocaleString()}`, pageWidth - 15, yPosition, { align: "right" });
  yPosition += 7;
  if (order.orderType === "dine-in" && invoice.tableNumber) {
    doc.text(`Table: ${invoice.tableNumber}`, 15, yPosition);
    if (invoice.floorName) {
      doc.text(`Floor: ${invoice.floorName}`, 60, yPosition);
    }
  } else if ((order.orderType === "delivery" || order.orderType === "pickup") && invoice.customerName) {
    doc.text(`Customer: ${invoice.customerName}`, 15, yPosition);
    if (invoice.customerPhone) {
      doc.text(`Phone: ${invoice.customerPhone}`, pageWidth - 15, yPosition, { align: "right" });
    }
    if (order.orderType === "delivery" && order.customerAddress) {
      yPosition += 7;
      doc.text(`Address: ${order.customerAddress}`, 15, yPosition);
    }
  }
  yPosition += 10;
  const tableData = orderItems.map((item) => [
    item.name + (item.isVeg ? " \u{1F331}" : ""),
    item.quantity.toString(),
    `\u20B9${parseFloat(item.price).toFixed(2)}`,
    `\u20B9${(parseFloat(item.price) * item.quantity).toFixed(2)}`
  ]);
  autoTable(doc, {
    startY: yPosition,
    head: [["Item", "Qty", "Price", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [231, 76, 60], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 35, halign: "right" }
    }
  });
  yPosition = doc.lastAutoTable.finalY + 10;
  const subtotal = parseFloat(invoice.subtotal);
  const tax = parseFloat(invoice.tax);
  const cgst = parseFloat(invoice.cgst || "0");
  const sgst = parseFloat(invoice.sgst || "0");
  const serviceCharge = parseFloat(invoice.serviceCharge || "0");
  const discount = parseFloat(invoice.discount || "0");
  const total = parseFloat(invoice.total);
  const taxRatePercent = subtotal > 0 ? tax / subtotal * 100 : 0;
  doc.setFontSize(11);
  const summaryX = pageWidth - 70;
  doc.text("Subtotal:", summaryX, yPosition);
  doc.text(`\u20B9${subtotal.toFixed(2)}`, pageWidth - 15, yPosition, { align: "right" });
  yPosition += 7;
  doc.text(`Tax (${taxRatePercent.toFixed(1)}%):`, summaryX, yPosition);
  doc.text(`\u20B9${tax.toFixed(2)}`, pageWidth - 15, yPosition, { align: "right" });
  yPosition += 7;
  doc.text(`CGST (${(taxRatePercent / 2).toFixed(1)}%):`, summaryX, yPosition);
  doc.text(`\u20B9${cgst.toFixed(2)}`, pageWidth - 15, yPosition, { align: "right" });
  yPosition += 7;
  doc.text(`SGST (${(taxRatePercent / 2).toFixed(1)}%):`, summaryX, yPosition);
  doc.text(`\u20B9${sgst.toFixed(2)}`, pageWidth - 15, yPosition, { align: "right" });
  if (serviceCharge > 0) {
    yPosition += 7;
    doc.text("Service Charge:", summaryX, yPosition);
    doc.text(`\u20B9${serviceCharge.toFixed(2)}`, pageWidth - 15, yPosition, { align: "right" });
  }
  if (discount > 0) {
    yPosition += 7;
    doc.text("Discount:", summaryX, yPosition);
    doc.text(`-\u20B9${discount.toFixed(2)}`, pageWidth - 15, yPosition, { align: "right" });
  }
  yPosition += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Grand Total:", summaryX, yPosition);
  doc.text(`\u20B9${total.toFixed(2)}`, pageWidth - 15, yPosition, { align: "right" });
  yPosition += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const paymentText = invoice.splitPayments ? `Split Payment (${JSON.parse(invoice.splitPayments).length} ways)` : `Payment Mode: ${invoice.paymentMode?.toUpperCase() || "CASH"}`;
  doc.text(paymentText, summaryX, yPosition);
  doc.text("PAID", pageWidth - 15, yPosition, { align: "right" });
  if (order.orderType === "delivery") {
    yPosition += 15;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("This is a delivery order. Please ensure items are delivered to the customer address.", 15, yPosition);
  } else if (order.orderType === "pickup") {
    yPosition += 15;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("This is a pickup order. Customer will collect the items from the restaurant.", 15, yPosition);
  }
  yPosition = doc.internal.pageSize.getHeight() - 30;
  doc.setLineWidth(0.3);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  doc.setFontSize(8);
  doc.text("This is a computer-generated invoice and does not require a signature.", pageWidth / 2, yPosition, { align: "center" });
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}

// server/utils/kotGenerator.ts
import { jsPDF as jsPDF2 } from "jspdf";
import { format } from "date-fns";
var C = {
  white: [255, 255, 255],
  pageBg: [255, 255, 255],
  // meta table
  labelBg: [249, 250, 251],
  // gray-50
  labelText: [107, 114, 128],
  // gray-500
  valueText: [31, 41, 55],
  // gray-800
  border: [229, 231, 235],
  // gray-200  (table borders)
  rowDiv: [243, 244, 246],
  // gray-100  (row dividers)
  // header/title
  titleText: [17, 24, 39],
  // gray-900
  // items table header  ← matches UI bg-gray-50
  tblHdrBg: [249, 250, 251],
  // gray-50
  tblHdrText: [75, 85, 99],
  // gray-600
  // status pills
  statusAmber: [180, 83, 9],
  // amber-700
  statusBlue: [29, 78, 216],
  // blue-700
  statusGreen: [21, 128, 61],
  // green-700
  statusPurple: [109, 40, 217],
  // purple-700
  statusGray: [107, 114, 128],
  // gray-500
  // veg indicators  (border-green-600 / border-red-600, light bg)
  vegBorder: [22, 163, 74],
  // green-600
  nonVegBorder: [220, 38, 38],
  // red-600
  vegFill: [240, 253, 244],
  // green-50
  nonVegFill: [254, 242, 242]
  // red-50
};
function generateKOTPDF(data) {
  const {
    order,
    orderItems,
    tableNumber,
    floorName,
    kotNumber = `KOT-${order.id.substring(0, 8).toUpperCase()}`,
    restaurantName = "BUNGLE",
    isUpdated = false
  } = data;
  const doc = new jsPDF2({ unit: "mm", format: "a5" });
  const PW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const inner = PW - margin * 2;
  let y = margin;
  const rect = (x, ry, w, h, fill, stroke, lw = 0.25) => {
    doc.setFillColor(...fill);
    if (stroke) {
      doc.setDrawColor(...stroke);
      doc.setLineWidth(lw);
      doc.rect(x, ry, w, h, "FD");
    } else {
      doc.rect(x, ry, w, h, "F");
    }
  };
  const hline = (ry, color = C.rowDiv, lw = 0.2) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(lw);
    doc.line(margin, ry, margin + inner, ry);
  };
  const vline = (x, ry, h, color = C.border, lw = 0.2) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(lw);
    doc.line(x, ry, x, ry + h);
  };
  const txt = (s, x, ry, size, style, color = C.valueText, align = "left") => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    doc.text(s, x, ry, { align });
  };
  y += 4;
  txt(restaurantName.toUpperCase(), PW / 2, y, 13, "bold", C.titleText, "center");
  y += 5.5;
  txt("Kitchen Order Ticket", PW / 2, y, 8, "normal", C.labelText, "center");
  y += 5;
  if (isUpdated) {
    const bannerH = 7;
    const bannerBg = [255, 237, 213];
    const bannerText = [194, 65, 12];
    const bannerBorder = [234, 88, 12];
    rect(margin, y, inner, bannerH, bannerBg, bannerBorder, 0.4);
    txt("\u2605  UPDATED KOT  \u2605", PW / 2, y + bannerH * 0.67, 8, "bold", bannerText, "center");
    y += bannerH + 3;
  }
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + inner, y);
  y += 6;
  const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt || Date.now());
  const typeLabel = order.orderType === "dine-in" ? "Dine-In" : order.orderType === "delivery" ? "Delivery" : "Pickup";
  const statusLabel = order.status === "completed" ? "Completed" : order.status === "sent_to_kitchen" ? "New" : order.status === "preparing" ? "Preparing" : order.status === "ready" ? "Ready" : order.status === "served" ? "Served" : "New";
  const statusColor = statusLabel === "New" ? C.statusAmber : statusLabel === "Preparing" ? C.statusBlue : statusLabel === "Ready" ? C.statusGreen : statusLabel === "Served" ? C.statusPurple : C.statusGray;
  const statusBg = statusLabel === "New" ? [255, 251, 235] : (
    // amber-50
    statusLabel === "Preparing" ? [239, 246, 255] : (
      // blue-50
      statusLabel === "Ready" ? [240, 253, 244] : (
        // green-50
        statusLabel === "Served" ? [250, 245, 255] : (
          // purple-50
          [243, 244, 246]
        )
      )
    )
  );
  const metaRows = [
    ["KOT No", kotNumber, false],
    ["Order Date", format(orderDate, "dd/MM/yyyy, hh:mm a"), false],
    ["Type", typeLabel, false]
  ];
  if (order.orderType === "dine-in" && tableNumber) {
    metaRows.push(["Table", tableNumber, false]);
    if (floorName) metaRows.push(["Floor", floorName, false]);
  }
  if (order.customerName) metaRows.push(["Customer", order.customerName, false]);
  if (order.customerPhone) metaRows.push(["Phone", order.customerPhone, false]);
  metaRows.push(["Status", statusLabel, true]);
  const rowH = 7.5;
  const labelW = 36;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, inner, rowH * metaRows.length, "S");
  metaRows.forEach(([label, value, isStatus], idx) => {
    const ry = y + idx * rowH;
    rect(margin, ry, labelW, rowH, C.labelBg);
    rect(margin + labelW, ry, inner - labelW, rowH, C.white);
    txt(label, margin + 3, ry + rowH * 0.65, 7.5, "normal", C.labelText);
    if (isStatus) {
      const pillW = 22;
      const pillH = 4.5;
      const pillX = margin + inner - pillW - 2;
      const pillY = ry + (rowH - pillH) / 2;
      doc.setFillColor(...statusBg);
      doc.setDrawColor(...statusBg);
      doc.roundedRect(pillX, pillY, pillW, pillH, 1.5, 1.5, "F");
      txt(value, margin + inner - pillW / 2 - 2, ry + rowH * 0.65, 7, "bold", statusColor, "center");
    } else {
      const isBold = label === "KOT No";
      txt(value, margin + inner - 3, ry + rowH * 0.65, 7.5, isBold ? "bold" : "normal", C.valueText, "right");
    }
    if (idx < metaRows.length - 1) {
      doc.setDrawColor(...C.rowDiv);
      doc.setLineWidth(0.2);
      doc.line(margin, ry + rowH, margin + inner, ry + rowH);
    }
    vline(margin + labelW, ry, rowH, C.border, 0.25);
  });
  y += rowH * metaRows.length + 7;
  const colW = { num: 10, qty: 14 };
  const itemColW = inner - colW.num - colW.qty;
  const headerH = 8;
  rect(margin, y, colW.num, headerH, C.tblHdrBg, C.border, 0.3);
  rect(margin + colW.num, y, itemColW, headerH, C.tblHdrBg, C.border, 0.3);
  rect(margin + colW.num + itemColW, y, colW.qty, headerH, C.tblHdrBg, C.border, 0.3);
  txt("#", margin + colW.num / 2, y + headerH * 0.67, 8, "bold", C.tblHdrText, "center");
  txt("Item", margin + colW.num + 3, y + headerH * 0.67, 8, "bold", C.tblHdrText, "left");
  txt("Qty", margin + colW.num + itemColW + colW.qty / 2, y + headerH * 0.67, 8, "bold", C.tblHdrText, "center");
  y += headerH;
  orderItems.forEach((item, idx) => {
    const hasNotes = !!(item.notes && item.notes.trim());
    const itemH = hasNotes ? 11 : 8;
    rect(margin, y, colW.num, itemH, C.white, C.border, 0.25);
    rect(margin + colW.num, y, itemColW, itemH, C.white, C.border, 0.25);
    rect(margin + colW.num + itemColW, y, colW.qty, itemH, C.white, C.border, 0.25);
    vline(margin + colW.num, y, itemH, C.border, 0.2);
    vline(margin + colW.num + itemColW, y, itemH, C.border, 0.2);
    txt(String(idx + 1), margin + colW.num / 2, y + itemH * 0.6, 7.5, "normal", C.labelText, "center");
    const dotSize = 2.8;
    const dotX = margin + colW.num + 3;
    const dotY = y + (hasNotes ? 3.2 : itemH / 2) - dotSize / 2;
    const vegBorder = item.isVeg ? C.vegBorder : C.nonVegBorder;
    const vegFill = item.isVeg ? C.vegFill : C.nonVegFill;
    doc.setFillColor(...vegFill);
    doc.setDrawColor(...vegBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(dotX, dotY, dotSize, dotSize, 0.4, 0.4, "FD");
    const nameX = dotX + dotSize + 2;
    const nameW = itemColW - (nameX - (margin + colW.num)) - 2;
    const nameY = hasNotes ? y + 4.2 : y + itemH * 0.63;
    const lines2 = doc.splitTextToSize(item.name, nameW);
    txt(lines2[0], nameX, nameY, 7.5, "normal", C.valueText);
    if (hasNotes) {
      txt(item.notes, nameX, y + 8, 6.5, "italic", C.labelText);
    }
    txt(
      String(item.quantity),
      margin + colW.num + itemColW + colW.qty / 2,
      y + itemH * 0.63,
      8,
      "bold",
      C.valueText,
      "center"
    );
    hline(y + itemH, C.rowDiv, 0.2);
    y += itemH;
  });
  const footH = 8;
  rect(margin, y, inner, footH, C.labelBg, C.border, 0.3);
  const totalQty = orderItems.reduce((s, i) => s + i.quantity, 0);
  txt("Total Items :", margin + colW.num + 3, y + footH * 0.67, 7.5, "bold", C.labelText);
  txt(String(totalQty), margin + inner - 3, y + footH * 0.67, 8, "bold", C.valueText, "right");
  y += footH;
  const totalAmt = orderItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  if (totalAmt > 0) {
    const amtH = 8;
    rect(margin, y, inner, amtH, C.white, C.border, 0.25);
    txt("Total Amount :", margin + colW.num + 3, y + amtH * 0.67, 7.5, "bold", C.labelText);
    txt(`\u20B9${totalAmt.toFixed(2)}`, margin + inner - 3, y + amtH * 0.67, 8, "bold", C.valueText, "right");
    y += amtH;
  }
  y += 8;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.25);
  doc.line(margin, y, margin + inner, y);
  y += 4.5;
  txt(
    `Printed: ${format(/* @__PURE__ */ new Date(), "dd/MM/yyyy, hh:mm a")}`,
    PW / 2,
    y,
    6.5,
    "italic",
    C.labelText,
    "center"
  );
  return Buffer.from(doc.output("arraybuffer"));
}

// server/digital-menu-sync.ts
import { ObjectId as ObjectId3 } from "mongodb";

// shared/tax.ts
var DEFAULT_TAX_SETTINGS = {
  taxRate: 18,
  serviceCharge: 0,
  gstEnabled: true,
  gstNumber: ""
};
function computeBillTotals(subtotal, taxRatePercent, serviceChargePercent) {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const safeTaxRate = Number.isFinite(taxRatePercent) ? taxRatePercent : 0;
  const safeServiceChargeRate = Number.isFinite(serviceChargePercent) ? serviceChargePercent : 0;
  const tax = safeSubtotal * safeTaxRate / 100;
  const cgst = tax / 2;
  const sgst = tax / 2;
  const serviceCharge = safeSubtotal * safeServiceChargeRate / 100;
  const total = safeSubtotal + tax + serviceCharge;
  return { subtotal: safeSubtotal, tax, cgst, sgst, serviceCharge, total };
}

// server/utils/billing-sequence.ts
function dayOf(order) {
  return new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
async function getDailyBillingNumber(st, order) {
  const orders = (await st.getOrders()).filter((o) => dayOf(o) === dayOf(order)).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const sequence = Math.max(1, orders.findIndex((o) => o.id === order.id) + 1);
  const yymmdd = dayOf(order).replace(/-/g, "").slice(2);
  return `BG${yymmdd}${String(sequence).padStart(2, "0")}`;
}
async function getDailyKotSequence(st, order) {
  const orders = (await st.getOrders()).filter((o) => dayOf(o) === dayOf(order)).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return orders.filter((o) => new Date(o.createdAt).getTime() < new Date(order.createdAt).getTime()).reduce((total, o) => total + (o.kotCount ?? 0), 0) + (order.kotCount ?? 1);
}

// server/digital-menu-sync.ts
var STALE_CLAIM_MS = 2 * 60 * 1e3;
var DigitalMenuSyncService = class {
  storage;
  syncInterval = null;
  processedOrderIds = /* @__PURE__ */ new Set();
  orderStatusMap = /* @__PURE__ */ new Map();
  orderPaymentStatusMap = /* @__PURE__ */ new Map();
  isRunning = false;
  broadcastFn = null;
  constructor(storage2) {
    this.storage = storage2;
  }
  setBroadcastFunction(fn) {
    this.broadcastFn = fn;
  }
  async start(intervalMs = 5e3) {
    if (this.isRunning) {
      console.log("\u26A0\uFE0F  Digital menu sync service is already running");
      return;
    }
    this.isRunning = true;
    console.log("\u{1F504} Starting digital menu sync service...");
    await this.loadSyncState();
    await this.syncOrders();
    this.syncInterval = setInterval(async () => {
      await this.syncOrders();
    }, intervalMs);
    console.log(`\u2705 Digital menu sync service started (polling every ${intervalMs / 1e3}s)`);
  }
  async loadSyncState() {
    try {
      await mongodb.connect();
      const collection = mongodb.getCollection("digital_menu_customer_orders");
      const customerDocs = await collection.find({
        "orders": { $exists: true, $ne: [] }
      }).toArray();
      let syncedCount = 0;
      for (const customerDoc of customerDocs) {
        if (!customerDoc.orders || !Array.isArray(customerDoc.orders)) continue;
        for (const order of customerDoc.orders) {
          if (order.syncedToPOS === true) {
            const orderId = order._id?.toString() || `${customerDoc._id.toString()}_${order.orderDate}`;
            if (order.posOrderId) {
              this.processedOrderIds.add(orderId);
            }
            this.orderStatusMap.set(orderId, order.status);
            this.orderPaymentStatusMap.set(orderId, order.paymentStatus || "pending");
            syncedCount++;
          }
        }
      }
      console.log(`\u{1F4CA} Loaded ${syncedCount} synced orders from MongoDB`);
    } catch (error) {
      console.error("\u274C Error loading sync state:", error);
    }
  }
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.isRunning = false;
      console.log("\u{1F6D1} Digital menu sync service stopped");
    }
  }
  async syncOrders() {
    try {
      await mongodb.connect();
      const collection = mongodb.getCollection("digital_menu_customer_orders");
      const customerDocs = await collection.find({
        "orders": { $exists: true, $ne: [] }
      }).toArray();
      let synced = 0;
      for (const customerDoc of customerDocs) {
        if (!customerDoc.orders || !Array.isArray(customerDoc.orders)) continue;
        for (const digitalOrder of customerDoc.orders) {
          if (digitalOrder.syncedToPOS === true) {
            const claimedAt = digitalOrder.syncClaimedAt ? new Date(digitalOrder.syncClaimedAt).getTime() : 0;
            const isStaleClaim = !digitalOrder.posOrderId && !digitalOrder.linkWriteFailed && Date.now() - claimedAt > STALE_CLAIM_MS;
            if (!isStaleClaim) continue;
          }
          if (digitalOrder.status !== "pending" && digitalOrder.status !== "confirmed") continue;
          const orderId = digitalOrder._id?.toString() || `${customerDoc._id.toString()}_${digitalOrder.orderDate}`;
          if (this.processedOrderIds.has(orderId)) continue;
          try {
            this.orderStatusMap.set(orderId, digitalOrder.status);
            this.orderPaymentStatusMap.set(orderId, digitalOrder.paymentStatus || "pending");
            const staleClaimCutoff = new Date(Date.now() - STALE_CLAIM_MS);
            const claimResult = await collection.updateOne(
              { _id: customerDoc._id },
              {
                $set: {
                  "orders.$[elem].syncedToPOS": true,
                  "orders.$[elem].syncClaimedAt": /* @__PURE__ */ new Date()
                }
              },
              {
                arrayFilters: [
                  {
                    "elem._id": digitalOrder._id,
                    $or: [
                      { "elem.syncedToPOS": { $ne: true } },
                      {
                        "elem.syncedToPOS": true,
                        "elem.posOrderId": { $exists: false },
                        "elem.linkWriteFailed": { $ne: true },
                        $or: [
                          { "elem.syncClaimedAt": { $exists: false } },
                          { "elem.syncClaimedAt": { $lt: staleClaimCutoff } }
                        ]
                      }
                    ]
                  }
                ]
              }
            );
            if (claimResult.modifiedCount === 0) {
              console.log(`\u23ED\uFE0F  Order ${orderId} already claimed elsewhere, skipping`);
              continue;
            }
            this.processedOrderIds.add(orderId);
            const orderWithCustomer = {
              ...digitalOrder,
              _id: digitalOrder._id || orderId,
              customerId: customerDoc.customerId,
              customerName: customerDoc.customerName,
              customerPhone: customerDoc.customerPhone
            };
            let createdPosOrderId = null;
            try {
              createdPosOrderId = await this.convertAndCreatePOSOrder(orderWithCustomer);
              synced++;
              console.log(`\u2705 Synced digital menu order ${orderId} for ${customerDoc.customerName}`);
              await collection.updateOne(
                {
                  _id: customerDoc._id,
                  "orders._id": digitalOrder._id
                },
                {
                  $set: {
                    "orders.$.syncedAt": /* @__PURE__ */ new Date(),
                    "orders.$.posOrderId": createdPosOrderId
                  }
                }
              );
              if (this.broadcastFn) {
                this.broadcastFn("digital_menu_order_synced", {
                  orderId,
                  customerName: customerDoc.customerName,
                  status: digitalOrder.status
                });
              }
            } catch (error) {
              console.error(`\u274C Failed to sync order ${orderId}:`, error);
              this.processedOrderIds.delete(orderId);
              this.orderStatusMap.delete(orderId);
              this.orderPaymentStatusMap.delete(orderId);
              if (createdPosOrderId) {
                console.error(`\u274C POS order ${createdPosOrderId} was created for ${orderId} but linking it back failed \u2014 leaving claimed for manual reconciliation`);
                await collection.updateOne(
                  { _id: customerDoc._id, "orders._id": digitalOrder._id },
                  { $set: { "orders.$.posOrderId": createdPosOrderId, "orders.$.linkWriteFailed": true } }
                ).catch(() => {
                });
              } else {
                await collection.updateOne(
                  { _id: customerDoc._id, "orders._id": digitalOrder._id },
                  { $set: { "orders.$.syncedToPOS": false }, $unset: { "orders.$.syncClaimedAt": "" } }
                ).catch(() => {
                });
              }
            }
          } catch (outerError) {
            console.error(`\u274C Unexpected error processing order ${orderId}:`, outerError);
            this.processedOrderIds.delete(orderId);
          }
        }
      }
      const syncedCustomerDocs = await collection.find({
        "orders": { $exists: true, $ne: [] }
      }).toArray();
      let updated = 0;
      for (const customerDoc of syncedCustomerDocs) {
        if (!customerDoc.orders || !Array.isArray(customerDoc.orders)) continue;
        for (const digitalOrder of customerDoc.orders) {
          if (digitalOrder.syncedToPOS !== true) continue;
          const orderId = digitalOrder._id?.toString() || `${customerDoc._id.toString()}_${digitalOrder.orderDate}`;
          const previousStatus = this.orderStatusMap.get(orderId);
          const previousPaymentStatus = this.orderPaymentStatusMap.get(orderId);
          const currentPaymentStatus = digitalOrder.paymentStatus || "pending";
          const statusChanged = previousStatus && previousStatus !== digitalOrder.status;
          const paymentStatusChanged = previousPaymentStatus && previousPaymentStatus !== currentPaymentStatus;
          const needsCheckout = (currentPaymentStatus === "invoice_generated" || currentPaymentStatus === "invoice generated") && digitalOrder.posOrderId;
          if (needsCheckout && digitalOrder.posOrderId) {
            try {
              const posOrder = await this.storage.getOrder(digitalOrder.posOrderId);
              if (posOrder && posOrder.status !== "completed" && posOrder.status !== "paid" && posOrder.status !== "billed") {
                console.log(`\u{1F4B3} Order ${orderId} has invoice_generated payment status but not checked out - processing now`);
                const orderWithCustomer = {
                  ...digitalOrder,
                  customerId: customerDoc.customerId,
                  customerName: customerDoc.customerName,
                  customerPhone: customerDoc.customerPhone
                };
                await this.updatePOSOrderStatus(orderWithCustomer);
                updated++;
                continue;
              }
            } catch (error) {
              console.error(`\u274C Failed to check/process order ${orderId}:`, error);
            }
          }
          if (statusChanged || paymentStatusChanged) {
            try {
              const orderWithCustomer = {
                ...digitalOrder,
                customerId: customerDoc.customerId,
                customerName: customerDoc.customerName,
                customerPhone: customerDoc.customerPhone
              };
              await this.updatePOSOrderStatus(orderWithCustomer);
              this.orderStatusMap.set(orderId, digitalOrder.status);
              this.orderPaymentStatusMap.set(orderId, currentPaymentStatus);
              updated++;
              if (statusChanged) {
                console.log(`\u{1F504} Updated digital menu order ${orderId} status: ${previousStatus} \u2192 ${digitalOrder.status}`);
              }
              if (paymentStatusChanged) {
                console.log(`\u{1F4B3} Updated digital menu order ${orderId} paymentStatus: ${previousPaymentStatus} \u2192 ${currentPaymentStatus}`);
              }
              if (this.broadcastFn) {
                this.broadcastFn("digital_menu_order_updated", {
                  orderId,
                  customerName: customerDoc.customerName,
                  previousStatus,
                  newStatus: digitalOrder.status,
                  previousPaymentStatus,
                  newPaymentStatus: currentPaymentStatus
                });
              }
            } catch (error) {
              console.error(`\u274C Failed to update order ${orderId} status:`, error);
            }
          } else if (!previousStatus || !previousPaymentStatus) {
            this.orderStatusMap.set(orderId, digitalOrder.status);
            this.orderPaymentStatusMap.set(orderId, currentPaymentStatus);
          }
        }
      }
      if (synced > 0 || updated > 0) {
        console.log(`\u{1F4CA} Digital menu sync: ${synced} new, ${updated} updated`);
        if (this.broadcastFn) {
          this.broadcastFn("digital_menu_synced", { newOrders: synced, updatedOrders: updated });
        }
      }
      return synced + updated;
    } catch (error) {
      console.error("\u274C Error during digital menu sync:", error);
      return 0;
    }
  }
  async convertAndCreatePOSOrder(digitalOrder) {
    let tableId = null;
    if (digitalOrder.tableNumber) {
      const table = await this.findTableByNumberAndFloor(
        digitalOrder.tableNumber,
        digitalOrder.floorNumber
      );
      if (table) {
        tableId = table.id;
        if (table.status === "free") {
          await this.storage.updateTableStatus(table.id, "occupied");
          const updatedTable = await this.storage.getTable(table.id);
          if (updatedTable && this.broadcastFn) {
            this.broadcastFn("table_updated", updatedTable);
          }
        }
      } else {
        const locationInfo = digitalOrder.floorNumber ? `${digitalOrder.tableNumber} on floor ${digitalOrder.floorNumber}` : digitalOrder.tableNumber;
        console.warn(`\u26A0\uFE0F  Table ${locationInfo} not found in POS system`);
      }
    }
    const orderStatus = digitalOrder.paymentStatus === "paid" ? "billed" : "sent_to_kitchen";
    const posOrder = await this.storage.createOrder({
      tableId,
      orderType: "dine-in",
      status: orderStatus,
      total: "0",
      customerName: digitalOrder.customerName,
      customerPhone: digitalOrder.customerPhone,
      customerAddress: null,
      paymentMode: digitalOrder.paymentMethod || null,
      waiterId: null,
      deliveryPersonId: null,
      expectedPickupTime: null
    });
    if (this.broadcastFn) {
      this.broadcastFn("order_created", posOrder);
      console.log(`[WebSocket] Broadcast order_created for digital menu order ${posOrder.id}`);
    }
    if (tableId) {
      await this.storage.updateTableOrder(tableId, posOrder.id);
      const updatedTable = await this.storage.getTable(tableId);
      if (updatedTable && this.broadcastFn) {
        this.broadcastFn("table_updated", updatedTable);
      }
    }
    let calculatedSubtotal = 0;
    for (const item of digitalOrder.items || []) {
      const menuItem = await this.findMenuItemByName(item.menuItemName);
      const notes = [
        item.notes,
        item.spiceLevel ? `Spice: ${item.spiceLevel}` : null
      ].filter(Boolean).join(" | ") || null;
      const itemPrice = (item.price || 0).toFixed(2);
      calculatedSubtotal += (item.price || 0) * (item.quantity || 0);
      const createdItem = await this.storage.createOrderItem({
        orderId: posOrder.id,
        menuItemId: menuItem?.id || "unknown",
        name: item.menuItemName,
        quantity: item.quantity,
        price: itemPrice,
        notes,
        status: "new",
        isVeg: menuItem?.isVeg ?? true
      });
      if (this.broadcastFn) {
        this.broadcastFn("order_item_added", { orderId: posOrder.id, item: createdItem });
        console.log(`[WebSocket] Broadcast order_item_added for item ${createdItem.name}`);
      }
    }
    const orderTotal = (digitalOrder.total || 0).toFixed(2);
    const calculatedTotal = (calculatedSubtotal + (digitalOrder.tax || 0)).toFixed(2);
    if (Math.abs(parseFloat(orderTotal) - parseFloat(calculatedTotal)) > 0.01) {
      console.warn(`\u26A0\uFE0F  Order total mismatch for ${digitalOrder.customerName}: Digital Menu=${orderTotal}, Calculated=${calculatedTotal}`);
    }
    await this.storage.updateOrderTotal(posOrder.id, orderTotal);
    try {
      const updatedOrder = await this.storage.incrementKotCount(posOrder.id) ?? posOrder;
      const kotPrinters = (await mongoStorage.getPrinters()).filter(
        (p) => p.type === "KOT" && p.autoPrint
      );
      if (kotPrinters.length > 0) {
        const { buildKOTEscPos: buildKOTEscPos2 } = await Promise.resolve().then(() => (init_escpos(), escpos_exports));
        const orderItems = await this.storage.getOrderItems(posOrder.id);
        let tableNumber;
        let floorName;
        if (tableId) {
          const tbl = await this.storage.getTable(tableId);
          tableNumber = tbl?.tableNumber;
          if (tbl?.floorId) floorName = (await this.storage.getFloor(tbl.floorId))?.name;
        }
        const kotNumber = await getDailyBillingNumber(this.storage, updatedOrder);
        const kotSequence = await getDailyKotSequence(this.storage, updatedOrder);
        const escData = buildKOTEscPos2({
          order: updatedOrder,
          items: orderItems,
          tableNumber,
          floorName,
          kotNumber,
          sequence: String(kotSequence).padStart(2, "0")
        });
        const escBase64 = Buffer.from(escData).toString("base64");
        for (const printer of kotPrinters) {
          await mongoStorage.createPrintJob({
            orderId: updatedOrder.id,
            kotNumber,
            printerIp: printer.ip,
            printerPort: printer.port,
            escposData: escBase64,
            status: "pending"
          });
          console.log(`[PrintJob] Queued ${kotNumber} \u2192 ${printer.ip}:${printer.port} (digital menu order)`);
        }
      }
    } catch (e) {
      console.error("[PrintJob] Failed to enqueue KOT for digital menu order:", e);
    }
    if (digitalOrder.customerPhone) {
      await this.updateCustomerTableStatus(digitalOrder.customerPhone, "occupied");
    }
    return posOrder.id;
  }
  async findTableByNumberAndFloor(tableNumber, floorNumber) {
    const tables = await this.storage.getTables();
    if (floorNumber) {
      const floors = await this.storage.getFloors();
      const floor = floors.find(
        (f) => f.name.toLowerCase() === floorNumber.toLowerCase()
      );
      if (floor) {
        const matchingTable = tables.find(
          (t) => t.tableNumber === tableNumber && t.floorId === floor.id
        );
        if (matchingTable) {
          return matchingTable;
        }
      }
      console.warn(`\u26A0\uFE0F  Floor "${floorNumber}" not found, searching all floors for table ${tableNumber}`);
    }
    const matchingTables = tables.filter((t) => t.tableNumber === tableNumber);
    if (matchingTables.length > 1) {
      console.warn(`\u26A0\uFE0F  Multiple tables with number "${tableNumber}" found on different floors. Using first match.`);
    }
    return matchingTables[0];
  }
  async updatePOSOrderStatus(digitalOrder) {
    try {
      if (!digitalOrder.posOrderId) {
        console.warn(`\u26A0\uFE0F  No POS order ID linked to digital menu order ${digitalOrder._id}`);
        return;
      }
      const posOrder = await this.storage.getOrder(digitalOrder.posOrderId);
      if (!posOrder) {
        console.warn(`\u26A0\uFE0F  POS order ${digitalOrder.posOrderId} not found`);
        return;
      }
      const paymentStatus = digitalOrder.paymentStatus || "";
      const orderStatus = digitalOrder.status || "";
      if (paymentStatus === "invoice_generated" || paymentStatus === "invoice generated" || orderStatus === "invoice_generated" || orderStatus === "invoice generated") {
        await this.autoCheckoutAndGenerateInvoice(digitalOrder, posOrder);
        return;
      }
      const statusMapping = {
        "pending": "new",
        "confirmed": "new",
        "preparing": "preparing",
        "completed": "served",
        "cancelled": "served"
        // Mark as served to remove from active
      };
      const newItemStatus = statusMapping[digitalOrder.status] || "new";
      const orderItems = await this.storage.getOrderItems(posOrder.id);
      for (const item of orderItems) {
        if (item.status !== newItemStatus) {
          await this.storage.updateOrderItemStatus(item.id, newItemStatus);
        }
      }
      console.log(`\u2705 Updated POS order ${posOrder.id} items to status: ${newItemStatus} (from digital menu status: ${digitalOrder.status})`);
    } catch (error) {
      console.error(`\u274C Failed to update POS order status:`, error);
    }
  }
  async autoCheckoutAndGenerateInvoice(digitalOrder, posOrder) {
    try {
      console.log(`\u{1F4B3} Auto-generating invoice for digital menu order ${digitalOrder._id}`);
      const orderItems = await this.storage.getOrderItems(posOrder.id);
      const subtotal = orderItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );
      const taxRateSetting = await this.storage.getSetting("tax_rate");
      const serviceChargeSetting = await this.storage.getSetting("service_charge");
      const { tax, cgst, sgst, serviceCharge, total } = computeBillTotals(
        subtotal,
        taxRateSetting !== void 0 ? parseFloat(taxRateSetting) : DEFAULT_TAX_SETTINGS.taxRate,
        serviceChargeSetting !== void 0 ? parseFloat(serviceChargeSetting) : DEFAULT_TAX_SETTINGS.serviceCharge
      );
      const paymentMode = (digitalOrder.paymentMethod || "cash").toLowerCase();
      const checkedOutOrder = await this.storage.checkoutOrder(posOrder.id, paymentMode);
      if (!checkedOutOrder) {
        console.error(`\u274C Failed to checkout order ${posOrder.id}`);
        return;
      }
      let tableInfo = null;
      if (checkedOutOrder.tableId) {
        tableInfo = await this.storage.getTable(checkedOutOrder.tableId);
        await this.storage.updateTableOrder(checkedOutOrder.tableId, null);
        await this.storage.updateTableStatus(checkedOutOrder.tableId, "free");
        const updatedTable = await this.storage.getTable(checkedOutOrder.tableId);
        if (updatedTable && this.broadcastFn) {
          this.broadcastFn("table_updated", updatedTable);
        }
      }
      if (checkedOutOrder.customerPhone) {
        await this.updateCustomerTableStatus(checkedOutOrder.customerPhone, "free");
      }
      const invoices = await this.storage.getInvoices();
      const invoiceNumber = await getDailyBillingNumber(this.storage, checkedOutOrder);
      const invoiceItemsData = orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        isVeg: item.isVeg,
        notes: item.notes || void 0
      }));
      const invoice = await this.storage.createInvoice({
        invoiceNumber,
        orderId: checkedOutOrder.id,
        tableNumber: tableInfo?.tableNumber || null,
        floorName: tableInfo?.floorId ? (await this.storage.getFloor(tableInfo.floorId))?.name || null : null,
        customerName: checkedOutOrder.customerName,
        customerPhone: checkedOutOrder.customerPhone,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        serviceCharge: serviceCharge.toFixed(2),
        discount: "0",
        total: total.toFixed(2),
        paymentMode,
        splitPayments: null,
        status: "Paid",
        items: JSON.stringify(invoiceItemsData),
        notes: null
      });
      await this.markDigitalOrderCompleted(digitalOrder._id.toString());
      if (this.broadcastFn) {
        this.broadcastFn("order_paid", checkedOutOrder);
        this.broadcastFn("invoice_created", invoice);
      }
      console.log(`\u2705 Auto-generated invoice ${invoiceNumber} for digital menu order ${digitalOrder._id}`);
    } catch (error) {
      console.error(`\u274C Failed to auto-generate invoice:`, error);
    }
  }
  async markDigitalOrderCompleted(orderId) {
    try {
      await mongodb.connect();
      const collection = mongodb.getCollection("digital_menu_customer_orders");
      const result = await collection.updateOne(
        { _id: new ObjectId3(orderId) },
        {
          $set: {
            status: "completed",
            paymentStatus: "paid"
          }
        }
      );
      if (result.modifiedCount === 0) {
        console.warn(`\u26A0\uFE0F  Failed to mark digital menu order ${orderId} as completed - no document matched`);
      } else {
        this.orderStatusMap.set(orderId, "completed");
        if (this.broadcastFn) {
          this.broadcastFn("digital_menu_order_updated", { orderId, status: "completed" });
        }
      }
    } catch (error) {
      console.error(`\u274C Failed to mark digital menu order ${orderId} as completed:`, error);
    }
  }
  async markOrderAsSynced(orderId, posOrderId) {
    try {
      await mongodb.connect();
      const collection = mongodb.getCollection("digital_menu_customer_orders");
      const result = await collection.updateOne(
        { _id: new ObjectId3(orderId) },
        {
          $set: {
            syncedToPOS: true,
            syncedAt: /* @__PURE__ */ new Date(),
            posOrderId
          }
        }
      );
      if (result.modifiedCount === 0) {
        console.warn(`\u26A0\uFE0F  Failed to mark order ${orderId} as synced - no document matched`);
      }
    } catch (error) {
      console.error(`\u274C Failed to mark order ${orderId} as synced:`, error);
    }
  }
  async findMenuItemByName(name) {
    const menuItems = await this.storage.getMenuItems();
    return menuItems.find(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );
  }
  async updateCustomerTableStatus(customerPhone, tableStatus) {
    try {
      await mongodb.connect();
      const collection = mongodb.getCollection("customers");
      const result = await collection.updateOne(
        { phoneNumber: customerPhone },
        {
          $set: {
            tableStatus,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }
      );
      if (result.modifiedCount > 0) {
        console.log(`\u2705 Updated customer ${customerPhone} tableStatus to: ${tableStatus}`);
      }
    } catch (error) {
      console.error(`\u274C Failed to update customer tableStatus:`, error);
    }
  }
  async syncTableStatusFromPOSOrder(posOrderId) {
    try {
      const posOrder = await this.storage.getOrder(posOrderId);
      if (!posOrder || !posOrder.customerPhone) {
        return;
      }
      const orderItems = await this.storage.getOrderItems(posOrderId);
      if (orderItems.length === 0) {
        return;
      }
      const allServed = orderItems.every((item) => item.status === "served");
      const anyReady = orderItems.some((item) => item.status === "ready");
      const anyPreparing = orderItems.some((item) => item.status === "preparing");
      let tableStatus = "occupied";
      if (allServed) {
        tableStatus = "served";
      } else if (anyReady && !anyPreparing && orderItems.every((item) => item.status === "ready" || item.status === "served")) {
        tableStatus = "ready";
      } else if (anyPreparing || anyReady) {
        tableStatus = "preparing";
      }
      await this.updateCustomerTableStatus(posOrder.customerPhone, tableStatus);
    } catch (error) {
      console.error(`\u274C Failed to sync table status from POS order:`, error);
    }
  }
  async getDigitalMenuOrders() {
    try {
      await mongodb.connect();
      const collection = mongodb.getCollection("digital_menu_customer_orders");
      const orders = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return orders.map((order) => ({
        ...order,
        _id: order._id.toString()
      }));
    } catch (error) {
      console.error("\u274C Error fetching digital menu orders:", error);
      return [];
    }
  }
  async getDigitalMenuCustomers() {
    try {
      await mongodb.connect();
      const collection = mongodb.getCollection("customers");
      const customers = await collection.find({ loginStatus: "loggedin" }).toArray();
      return customers.map((customer) => ({
        ...customer,
        _id: customer._id.toString()
      }));
    } catch (error) {
      console.error("\u274C Error fetching digital menu customers:", error);
      return [];
    }
  }
  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      processedOrders: this.processedOrderIds.size
    };
  }
};

// server/external-orders-sync.ts
import { MongoClient as MongoClient4 } from "mongodb";
var EXTERNAL_DB_NAME = "Orders";
var EXTERNAL_COLL = "orders";
var STALE_CLAIM_MS2 = 2 * 60 * 1e3;
var ExternalOrdersSyncService = class {
  storage;
  client = null;
  db = null;
  currentUri = null;
  syncInterval = null;
  processedIds = /* @__PURE__ */ new Set();
  isRunning = false;
  broadcastFn = null;
  constructor(storage2) {
    this.storage = storage2;
  }
  setBroadcastFunction(fn) {
    this.broadcastFn = fn;
  }
  /* ── lifecycle ──────────────────────────────────────────────────── */
  async start(intervalMs = 5e3) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("\u{1F504} [ExternalOrders] Starting external orders sync service...");
    await this.connect().catch(
      (err) => console.warn("\u26A0\uFE0F [ExternalOrders] Initial connect failed (will retry):", err.message)
    );
    await this.sync();
    this.syncInterval = setInterval(() => this.sync(), intervalMs);
    console.log(`\u2705 [ExternalOrders] Sync running every ${intervalMs / 1e3}s`);
  }
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log("\u{1F6D1} [ExternalOrders] Sync stopped");
  }
  getStatus() {
    return { isRunning: this.isRunning, processedOrders: this.processedIds.size };
  }
  /* ── internal helpers ───────────────────────────────────────────── */
  /**
   * Resolve the URI for the external Orders database.
   *
   * Since the POS and digital menu now share the same MongoDB cluster,
   * MONGODB_URI is used for both. The POS stores its data in the "POS"
   * database; digital menu orders live in the "Orders" database on the
   * same cluster. No separate URI setting is needed.
   */
  async resolveUri() {
    if (process.env.MONGODB_URI)
      return { uri: process.env.MONGODB_URI, source: "MONGODB_URI (shared cluster)" };
    throw new Error("MONGODB_URI is not set");
  }
  async connect() {
    const { uri, source } = await this.resolveUri();
    if (this.client && this.currentUri === uri) return;
    if (this.client) {
      console.log("\u{1F504} [ExternalOrders] URI changed \u2014 reconnecting...");
      await this.client.close().catch(() => {
      });
      this.client = null;
      this.db = null;
    }
    this.currentUri = uri;
    this.client = new MongoClient4(uri);
    await this.client.connect();
    this.db = this.client.db(EXTERNAL_DB_NAME);
    console.log(`\u2705 [ExternalOrders] Connected to "${EXTERNAL_DB_NAME}" database (via ${source})`);
    await this.loadAlreadySynced();
  }
  collection() {
    if (!this.db) throw new Error("Not connected to external DB");
    return this.db.collection(EXTERNAL_COLL);
  }
  /**
   * Mark already-synced orders so we don't re-process them on restart.
   * Only orders with a `posOrderId` are truly finished — a doc with
   * `syncedToPOS: true` but no `posOrderId` is just a claim (possibly from a
   * process that crashed before finishing). Adding claim-only docs here would
   * make the in-memory guard permanently skip them, silently defeating the
   * stale-claim reclaim logic in `sync()`.
   */
  async loadAlreadySynced() {
    try {
      const docs = await this.collection().find({ syncedToPOS: true, posOrderId: { $exists: true } }, { projection: { _id: 1 } }).toArray();
      docs.forEach((d) => this.processedIds.add(d._id.toString()));
      console.log(`\u{1F4CA} [ExternalOrders] Loaded ${docs.length} already-synced orders`);
    } catch (err) {
      console.error("[ExternalOrders] Failed to load sync state:", err);
    }
  }
  /** Main poll cycle */
  async sync() {
    try {
      await this.connect();
      const coll = this.collection();
      const staleClaimCutoff = new Date(Date.now() - STALE_CLAIM_MS2);
      const staleClaimClause = {
        syncedToPOS: true,
        posOrderId: { $exists: false },
        linkWriteFailed: { $ne: true },
        $or: [
          { syncClaimedAt: { $exists: false } },
          { syncClaimedAt: { $lt: staleClaimCutoff } }
        ]
      };
      const docs = await coll.find({
        $or: [
          { syncedToPOS: { $ne: true } },
          staleClaimClause
        ],
        status: { $nin: ["cancelled", "rejected", "cancel", "reject"] }
      }).sort({ createdAt: 1 }).toArray();
      const totalUnsynced = await coll.countDocuments({ syncedToPOS: { $ne: true } });
      if (totalUnsynced !== docs.length) {
        console.log(`\u{1F50D} [ExternalOrders] ${totalUnsynced} total unsynced (${totalUnsynced - docs.length} skipped by status filter)`);
      }
      if (docs.length > 0) {
        console.log(`\u{1F50D} [ExternalOrders] Found ${docs.length} unsynced document(s) to process`);
      }
      let synced = 0;
      for (const doc of docs) {
        const id = doc._id.toString();
        if (this.processedIds.has(id)) {
          console.log(`\u23ED\uFE0F  [ExternalOrders] Skipping ${id} \u2014 already in processedIds`);
          continue;
        }
        const claimResult = await coll.updateOne(
          {
            _id: doc._id,
            $or: [
              { syncedToPOS: { $ne: true } },
              staleClaimClause
            ]
          },
          { $set: { syncedToPOS: true, syncClaimedAt: /* @__PURE__ */ new Date() } }
        );
        if (claimResult.modifiedCount === 0) {
          console.log(`\u23ED\uFE0F  [ExternalOrders] ${id} already claimed elsewhere, skipping`);
          continue;
        }
        this.processedIds.add(id);
        console.log(`\u2699\uFE0F  [ExternalOrders] Processing order ${id} (customer: ${doc.customerName}, table: ${doc.tableId}, floor: ${doc.floorId})`);
        let createdPosOrderId = null;
        try {
          createdPosOrderId = await this.createPOSOrder(doc);
          await coll.updateOne(
            { _id: doc._id },
            { $set: { syncedAt: /* @__PURE__ */ new Date(), posOrderId: createdPosOrderId } }
          );
          synced++;
          console.log(`\u2705 [ExternalOrders] Synced order ${id} \u2192 POS order ${createdPosOrderId}`);
          this.broadcastFn?.("external_order_synced", {
            externalOrderId: id,
            posOrderId: createdPosOrderId,
            customerName: doc.customerName,
            customerPhone: doc.customerPhone
          });
        } catch (err) {
          this.processedIds.delete(id);
          if (createdPosOrderId) {
            console.error(`\u274C [ExternalOrders] POS order ${createdPosOrderId} was created for ${id} but linking it back failed \u2014 leaving claimed for manual reconciliation:`, err);
            await coll.updateOne(
              { _id: doc._id },
              { $set: { posOrderId: createdPosOrderId, linkWriteFailed: true } }
            ).catch(() => {
            });
          } else {
            await coll.updateOne(
              { _id: doc._id },
              { $set: { syncedToPOS: false }, $unset: { syncClaimedAt: "" } }
            ).catch(() => {
            });
            console.error(`\u274C [ExternalOrders] Failed to sync order ${id}:`, err);
          }
        }
      }
      if (synced > 0) {
        console.log(`\u{1F4E6} [ExternalOrders] ${synced} new order(s) synced to POS`);
        this.broadcastFn?.("external_orders_batch_synced", { count: synced });
      }
      return synced;
    } catch (err) {
      console.error("[ExternalOrders] Sync cycle error:", err);
      return 0;
    }
  }
  /**
   * Resolve a table in the POS by matching:
   *   doc.floorId  →  floor.name  (case-insensitive)
   *   doc.tableId  →  table.tableNumber  (case-insensitive, then numeric normalisation)
   *
   * If floorId is provided, prefer the table that belongs to that floor.
   * Falls back to any table that matches the name/number if floor lookup fails.
   */
  async resolveTable(doc) {
    const rawTableRef = (doc.tableId || doc.tableNumber || doc.table || "").toString().trim();
    const rawFloorRef = (doc.floorId || doc.floorName || doc.floor || "").toString().trim();
    if (!rawTableRef) return null;
    const allTables = await this.storage.getTables();
    const nameLower = rawTableRef.toLowerCase();
    let candidates = allTables.filter(
      (t) => t.tableNumber.toLowerCase() === nameLower
    );
    if (candidates.length === 0) {
      const numMatch = rawTableRef.match(/\d+/);
      if (numMatch) {
        const normalised = `T${parseInt(numMatch[0], 10)}`;
        candidates = allTables.filter(
          (t) => t.tableNumber.toLowerCase() === normalised.toLowerCase()
        );
      }
    }
    if (candidates.length === 0) {
      console.warn(`\u26A0\uFE0F  [ExternalOrders] No table found matching "${rawTableRef}"`);
      return null;
    }
    if (rawFloorRef && candidates.length > 1) {
      const floors = await this.storage.getFloors();
      const floor = floors.find(
        (f) => f.name.toLowerCase() === rawFloorRef.toLowerCase()
      );
      if (floor) {
        const floorMatch = candidates.find((t) => t.floorId === floor.id);
        if (floorMatch) {
          console.log(`\u{1FA91} [ExternalOrders] Matched table "${rawTableRef}" on floor "${rawFloorRef}" \u2192 ${floorMatch.tableNumber} (id: ${floorMatch.id})`);
          return floorMatch;
        }
      }
    }
    if (rawFloorRef) {
      const floors = await this.storage.getFloors();
      const floor = floors.find(
        (f) => f.name.toLowerCase() === rawFloorRef.toLowerCase()
      );
      if (floor) {
        const floorMatch = candidates.find((t) => t.floorId === floor.id);
        if (floorMatch) {
          console.log(`\u{1FA91} [ExternalOrders] Matched table "${rawTableRef}" on floor "${rawFloorRef}" \u2192 ${floorMatch.tableNumber} (id: ${floorMatch.id})`);
          return floorMatch;
        }
      }
    }
    const fallback = candidates[0];
    console.log(`\u{1FA91} [ExternalOrders] Matched table "${rawTableRef}" \u2192 ${fallback.tableNumber} (id: ${fallback.id})`);
    return fallback;
  }
  /* ── backward sync helpers (POS → external DB) ─────────────────── */
  /**
   * Find the external DB document that was synced as a given POS order.
   * Returns null silently if the POS order didn't come from the external DB.
   */
  async findExternalDoc(posOrderId) {
    try {
      await this.connect();
      return await this.collection().findOne({ posOrderId });
    } catch {
      return null;
    }
  }
  /**
   * Delete the external-DB order that corresponds to `posOrderId`.
   * Called when a KOT order is deleted from the POS.
   */
  async deleteExternalOrder(posOrderId) {
    try {
      await this.connect();
      const result = await this.collection().deleteOne({ posOrderId });
      if (result.deletedCount > 0) {
        console.log(`\u{1F5D1}\uFE0F  [ExternalOrders] Deleted external order for POS order ${posOrderId}`);
      }
    } catch (err) {
      console.error(`\u26A0\uFE0F  [ExternalOrders] Could not delete external order for POS order ${posOrderId}:`, err);
    }
  }
  /**
   * Update an item (quantity / notes) inside the external-DB order that
   * corresponds to `posOrderId`. Matches by item name.
   */
  async syncItemUpdate(posOrderId, itemName, updates) {
    try {
      const doc = await this.findExternalDoc(posOrderId);
      if (!doc) return;
      const items = doc.items || [];
      const idx = items.findIndex(
        (i) => (i.name || i.menuItemName || i.itemName || "") === itemName
      );
      if (idx === -1) {
        console.warn(`\u26A0\uFE0F  [ExternalOrders] syncItemUpdate: item "${itemName}" not found in external order for POS ${posOrderId}`);
        return;
      }
      const setFields = {};
      if (updates.quantity !== void 0) setFields[`items.${idx}.quantity`] = updates.quantity;
      if (updates.notes !== void 0) setFields[`items.${idx}.notes`] = updates.notes;
      const updatedItems = items.map((item, i) => ({
        ...item,
        ...i === idx ? updates : {}
      }));
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      );
      setFields["total"] = newTotal;
      await this.collection().updateOne({ posOrderId }, { $set: setFields });
      console.log(`\u270F\uFE0F  [ExternalOrders] Updated item "${itemName}" in external order for POS ${posOrderId}`);
    } catch (err) {
      console.error(`\u26A0\uFE0F  [ExternalOrders] Could not update item in external order for POS ${posOrderId}:`, err);
    }
  }
  /**
   * Remove an item from the external-DB order that corresponds to `posOrderId`.
   * Matches by item name; removes the first match.
   */
  async syncItemDelete(posOrderId, itemName) {
    try {
      const doc = await this.findExternalDoc(posOrderId);
      if (!doc) return;
      const items = doc.items || [];
      const idx = items.findIndex(
        (i) => (i.name || i.menuItemName || i.itemName || "") === itemName
      );
      if (idx === -1) {
        console.warn(`\u26A0\uFE0F  [ExternalOrders] syncItemDelete: item "${itemName}" not found in external order for POS ${posOrderId}`);
        return;
      }
      const updatedItems = items.filter((_, i) => i !== idx);
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      );
      await this.collection().updateOne(
        { posOrderId },
        { $set: { items: updatedItems, total: newTotal } }
      );
      console.log(`\u{1F5D1}\uFE0F  [ExternalOrders] Removed item "${itemName}" from external order for POS ${posOrderId}`);
    } catch (err) {
      console.error(`\u26A0\uFE0F  [ExternalOrders] Could not remove item from external order for POS ${posOrderId}:`, err);
    }
  }
  /**
   * Add a new item to the external-DB order that corresponds to `posOrderId`.
   * Called when an item is added to a KOT order from the POS.
   */
  async syncItemAdd(posOrderId, item) {
    try {
      const doc = await this.findExternalDoc(posOrderId);
      if (!doc) return;
      const newItem = {
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes ?? null,
        isVeg: item.isVeg ?? true
      };
      const existingItems = doc.items || [];
      const newTotal = existingItems.reduce(
        (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
        0
      ) + item.price * item.quantity;
      await this.collection().updateOne(
        { posOrderId },
        { $push: { items: newItem }, $set: { total: newTotal } }
      );
      console.log(`\u2795 [ExternalOrders] Added item "${item.name}" to external order for POS ${posOrderId}`);
    } catch (err) {
      console.error(`\u26A0\uFE0F  [ExternalOrders] Could not add item to external order for POS ${posOrderId}:`, err);
    }
  }
  /** Convert an external order document into POS entities */
  async createPOSOrder(doc) {
    const phone = (doc.customerPhone || doc.phone || "").toString().trim();
    const name = (doc.customerName || doc.name || "Guest").toString().trim();
    if (phone) {
      const existing = await this.storage.getCustomerByPhone(phone);
      if (!existing) {
        await this.storage.createCustomer({
          name,
          phone,
          email: doc.customerEmail || doc.email || null,
          address: doc.customerAddress || doc.address || null
        });
        console.log(`\u{1F464} [ExternalOrders] Registered new customer: ${name} (${phone})`);
        this.broadcastFn?.("customer_registered", { name, phone });
      } else {
        console.log(`\u{1F464} [ExternalOrders] Existing customer: ${name} (${phone})`);
      }
    }
    const hasTableRef = !!(doc.tableId || doc.tableNumber || doc.table);
    const rawType = (doc.orderType || doc.type || (hasTableRef ? "dine-in" : "delivery")).toLowerCase();
    const orderType = rawType.includes("dine") || rawType.includes("table") ? "dine-in" : rawType.includes("pick") || rawType.includes("take") ? "pickup" : "delivery";
    console.log(`\u{1F4CB} [ExternalOrders] Order type: ${orderType}`);
    const resolvedTable = orderType === "dine-in" ? await this.resolveTable(doc) : null;
    const resolvedTableId = resolvedTable?.id ?? null;
    const isPaid = (doc.paymentStatus || "").toLowerCase() === "paid";
    const posStatus = isPaid ? "billed" : "sent_to_kitchen";
    const posOrder = await this.storage.createOrder({
      tableId: resolvedTableId,
      orderType,
      status: posStatus,
      total: "0",
      customerName: name || null,
      customerPhone: phone || null,
      customerAddress: doc.customerAddress || doc.address || null,
      paymentMode: doc.paymentMode || doc.paymentMethod || null,
      waiterId: null,
      deliveryPersonId: null,
      expectedPickupTime: null
    });
    console.log(`\u{1F4DD} [ExternalOrders] Created POS order ${posOrder.id} (status: ${posStatus})`);
    this.broadcastFn?.("order_created", posOrder);
    if (resolvedTable) {
      await this.storage.updateTableStatus(resolvedTable.id, "occupied");
      await this.storage.updateTableOrder(resolvedTable.id, posOrder.id);
      console.log(`\u{1FA91} [ExternalOrders] Table ${resolvedTable.tableNumber} \u2192 occupied, linked to order ${posOrder.id}`);
      this.broadcastFn?.("table_updated", {
        id: resolvedTable.id,
        tableNumber: resolvedTable.tableNumber,
        status: "occupied",
        currentOrderId: posOrder.id
      });
    }
    const items = doc.items || doc.orderItems || doc.cart || [];
    let subtotal = 0;
    const parseBoolFlag = (v) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v !== 0;
      const s = String(v).toLowerCase().trim();
      return s !== "false" && s !== "0" && s !== "no";
    };
    const isNonVegCategory = (s) => /non[-_\s]?veg/i.test(s);
    for (const item of items) {
      const itemName = item.name || item.menuItemName || item.itemName || "Unknown Item";
      const qty = Number(item.quantity || item.qty || 1);
      const price = Number(item.price || item.unitPrice || item.rate || 0);
      let isVeg;
      if (item.isVeg !== void 0) isVeg = parseBoolFlag(item.isVeg);
      else if (item.vegetarian !== void 0) isVeg = parseBoolFlag(item.vegetarian);
      else if (item.category) isVeg = !isNonVegCategory(String(item.category));
      else if (item.type) isVeg = !isNonVegCategory(String(item.type));
      else isVeg = true;
      const notes = item.notes || item.instructions || item.specialRequest || null;
      subtotal += qty * price;
      const created = await this.storage.createOrderItem({
        orderId: posOrder.id,
        menuItemId: "external",
        name: itemName,
        quantity: qty,
        price: price.toFixed(2),
        notes,
        status: "new",
        isVeg
      });
      console.log(`  \u{1F37D}\uFE0F  [ExternalOrders] Item: ${itemName} x${qty} (${isVeg ? "veg" : "non-veg"})`);
      this.broadcastFn?.("order_item_added", { orderId: posOrder.id, item: created });
    }
    const total = doc.total ?? doc.totalAmount ?? doc.grandTotal ?? subtotal;
    const totalStr = Number(total).toFixed(2);
    await this.storage.updateOrderTotal(posOrder.id, totalStr);
    console.log(`\u{1F4B0} [ExternalOrders] Order total: \u20B9${totalStr}`);
    const finalOrder = await this.storage.getOrder(posOrder.id);
    if (finalOrder) {
      this.broadcastFn?.("order_updated", finalOrder);
      this.broadcastFn?.("kot_created", {
        orderId: posOrder.id,
        tableNumber: resolvedTable?.tableNumber ?? null,
        customerName: name,
        itemCount: items.length
      });
    }
    console.log(`\u{1F3AB} [ExternalOrders] Auto-KOT broadcast for order ${posOrder.id}`);
    try {
      const updatedOrder = await this.storage.incrementKotCount(posOrder.id) ?? posOrder;
      const kotPrinters = (await mongoStorage.getPrinters()).filter(
        (p) => p.type === "KOT" && p.autoPrint
      );
      if (kotPrinters.length > 0) {
        const { buildKOTEscPos: buildKOTEscPos2 } = await Promise.resolve().then(() => (init_escpos(), escpos_exports));
        const orderItems = await this.storage.getOrderItems(posOrder.id);
        let tableNumber = resolvedTable?.tableNumber;
        let floorName;
        if (resolvedTable?.floorId) {
          floorName = (await this.storage.getFloor(resolvedTable.floorId))?.name;
        }
        const kotNumber = await getDailyBillingNumber(this.storage, updatedOrder);
        const kotSequence = await getDailyKotSequence(this.storage, updatedOrder);
        const escData = buildKOTEscPos2({
          order: updatedOrder,
          items: orderItems,
          tableNumber,
          floorName,
          kotNumber,
          sequence: String(kotSequence).padStart(2, "0")
        });
        const escBase64 = Buffer.from(escData).toString("base64");
        for (const printer of kotPrinters) {
          await mongoStorage.createPrintJob({
            orderId: updatedOrder.id,
            kotNumber,
            printerIp: printer.ip,
            printerPort: printer.port,
            escposData: escBase64,
            status: "pending"
          });
          console.log(`[PrintJob] Queued ${kotNumber} \u2192 ${printer.ip}:${printer.port} (external order)`);
        }
      }
    } catch (e) {
      console.error("[PrintJob] Failed to enqueue KOT for external order:", e);
    }
    return posOrder.id;
  }
};

// server/routes.ts
var orderActionSchema = z3.object({
  print: z3.boolean().optional().default(false),
  taxRate: z3.number().min(0).max(100).optional(),
  serviceCharge: z3.number().min(0).max(100).optional()
});
var checkoutSchema = z3.object({
  paymentMode: z3.string().optional(),
  print: z3.boolean().optional().default(false),
  taxRate: z3.number().min(0).max(100).optional(),
  serviceCharge: z3.number().min(0).max(100).optional(),
  splitPayments: z3.array(
    z3.object({
      person: z3.number(),
      amount: z3.number(),
      paymentMode: z3.string()
    })
  ).optional()
});
async function getTaxSettings(st) {
  const [taxRate, serviceCharge, gstEnabled, gstNumber] = await Promise.all([
    st.getSetting("tax_rate"),
    st.getSetting("service_charge"),
    st.getSetting("gst_enabled"),
    st.getSetting("gst_number")
  ]);
  return {
    taxRate: taxRate !== void 0 ? parseFloat(taxRate) : DEFAULT_TAX_SETTINGS.taxRate,
    serviceCharge: serviceCharge !== void 0 ? parseFloat(serviceCharge) : DEFAULT_TAX_SETTINGS.serviceCharge,
    gstEnabled: gstEnabled !== void 0 ? gstEnabled === "true" : DEFAULT_TAX_SETTINGS.gstEnabled,
    gstNumber: gstNumber !== void 0 ? gstNumber : DEFAULT_TAX_SETTINGS.gstNumber
  };
}
async function upsertInvoice(st, orderId, data) {
  const existing = (await st.getInvoices()).find(
    (inv) => inv.orderId === orderId
  );
  if (existing) {
    const updated = await st.updateInvoice(existing.id, data);
    return updated ?? existing;
  }
  return st.createInvoice(data);
}
async function queueBillPrintJobs(opts) {
  try {
    const { buildBillEscPos: buildBillEscPos2 } = await Promise.resolve().then(() => (init_escpos(), escpos_exports));
    const printers = await mongoStorage.getPrinters();
    let billPrinters = printers.filter(
      (p) => p.type === "Bill" && p.autoPrint
    );
    if (billPrinters.length === 0) {
      billPrinters = printers.filter((p) => p.type === "KOT" && p.autoPrint);
    }
    if (billPrinters.length === 0) return;
    const parsedItems = JSON.parse(opts.invoice.items || "[]");
    const escData = buildBillEscPos2({
      invoiceNumber: opts.invoice.invoiceNumber,
      date: /* @__PURE__ */ new Date(),
      tableNumber: opts.invoice.tableNumber,
      floorName: opts.invoice.floorName,
      customerName: opts.invoice.customerName,
      customerPhone: opts.invoice.customerPhone,
      orderType: opts.orderType,
      items: parsedItems,
      subtotal: parseFloat(opts.invoice.subtotal),
      cgst: parseFloat(opts.invoice.cgst),
      sgst: parseFloat(opts.invoice.sgst),
      serviceCharge: parseFloat(opts.invoice.serviceCharge),
      total: parseFloat(opts.invoice.total),
      paymentMode: opts.invoice.paymentMode || "cash",
      gstEnabled: opts.taxSettings.gstEnabled,
      gstNumber: opts.taxSettings.gstNumber
    });
    await Promise.all(
      billPrinters.map(
        (p) => mongoStorage.createPrintJob({
          orderId: "bill",
          kotNumber: opts.invoice.invoiceNumber,
          printerIp: p.ip,
          printerPort: p.port,
          escposData: escData.toString("base64"),
          status: "pending"
        })
      )
    );
  } catch (err) {
    console.error("[BillPrint] Failed to queue bill print job:", err);
  }
}
var wss;
function getStorage(req) {
  const sessionStorage = getStorageForSession(req);
  return sessionStorage || storage;
}
function broadcastUpdate(type, data) {
  if (!wss) {
    console.log("[WebSocket] No WSS instance, cannot broadcast");
    return;
  }
  const message = JSON.stringify({ type, data });
  const clientCount = Array.from(wss.clients).filter(
    (c) => c.readyState === WebSocket.OPEN
  ).length;
  console.log(`[WebSocket] Broadcasting ${type} to ${clientCount} clients`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
async function registerRoutes(app2) {
  const externalOrdersSync = new ExternalOrdersSyncService(mongoStorage);
  app2.get("/api/floors", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const floors = await st.getFloors();
    res.json(floors);
  });
  app2.get("/api/floors/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const floor = await st.getFloor(req.params.id);
    if (!floor) {
      return res.status(404).json({ error: "Floor not found" });
    }
    res.json(floor);
  });
  app2.post("/api/floors", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertFloorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const existingFloors = await st.getFloors();
    if (existingFloors.some(
      (f) => f.name.trim().toLowerCase() === result.data.name.trim().toLowerCase()
    )) {
      return res.status(409).json({ error: "A floor with this name already exists" });
    }
    const floor = await st.createFloor(result.data);
    broadcastUpdate("floor_created", floor);
    res.json(floor);
  });
  app2.patch("/api/floors/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    if (req.body.name !== void 0) {
      if (typeof req.body.name !== "string") {
        return res.status(400).json({ error: "Floor name must be a string" });
      }
      const trimmedName = req.body.name.trim();
      if (!trimmedName) {
        return res.status(400).json({ error: "Floor name cannot be empty" });
      }
      const existingFloors = await st.getFloors();
      const conflict = existingFloors.find(
        (f) => f.id !== req.params.id && f.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (conflict) {
        return res.status(409).json({ error: "A floor with this name already exists" });
      }
    }
    const floor = await st.updateFloor(req.params.id, req.body);
    if (!floor) {
      return res.status(404).json({ error: "Floor not found" });
    }
    broadcastUpdate("floor_updated", floor);
    res.json(floor);
  });
  app2.delete("/api/floors/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteFloor(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Floor not found" });
    }
    broadcastUpdate("floor_deleted", { id: req.params.id });
    res.json({ success: true });
  });
  app2.get("/api/tables", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const tables = await st.getTables();
    res.json(tables);
  });
  app2.post("/api/admin/qr-token", requireAuth, async (req, res) => {
    try {
      const input = z3.object({
        tableId: z3.string().min(1).max(100).optional(),
        tableName: z3.string().trim().min(1).max(100),
        floorName: z3.string().trim().min(1).max(100),
        sessionSecret: z3.string().min(1).max(500)
      }).safeParse(req.body);
      if (!input.success) return res.status(400).json({ error: "Table name, floor name, and session secret are required" });
      const tableName = input.data.tableName;
      const floorName = input.data.floorName;
      if (!/^[^\u0000-\u001f\u007f]+$/.test(tableName) || !/^[^\u0000-\u001f\u007f]+$/.test(floorName)) {
        return res.status(400).json({ error: "Table or floor name is invalid" });
      }
      const encodedPayload = Buffer.from(JSON.stringify({ tableName, floorName, v: 1 }), "utf8").toString("base64url");
      const encodedSignature = crypto.createHmac("sha256", input.data.sessionSecret).update(encodedPayload).digest("base64url");
      const token = `${encodedPayload}.${encodedSignature}`;
      const url = `https://bungle.atdigitalmenu.com/${token}`;
      const qrDataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 2, width: 320 });
      res.json({ url, token, qrDataUrl });
    } catch (error) {
      console.error("[QR] Generation failed:", error instanceof Error ? error.message : "unknown error");
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });
  app2.get("/api/tables/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const table = await st.getTable(req.params.id);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }
    res.json(table);
  });
  app2.post("/api/tables", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertTableSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const existingTables = await st.getTables();
    const floorId = result.data.floorId ?? null;
    const conflict = existingTables.find(
      (t) => t.floorId === floorId && t.tableNumber.trim().toLowerCase() === result.data.tableNumber.trim().toLowerCase()
    );
    if (conflict) {
      return res.status(409).json({ error: "A table with this name already exists on this floor" });
    }
    const table = await st.createTable(result.data);
    broadcastUpdate("table_created", table);
    res.json(table);
  });
  app2.patch("/api/tables/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    if (req.body.tableNumber !== void 0 && typeof req.body.tableNumber !== "string") {
      return res.status(400).json({ error: "Table number must be a string" });
    }
    if (req.body.tableNumber !== void 0 || req.body.floorId !== void 0) {
      const currentTable = await st.getTable(req.params.id);
      if (currentTable) {
        const existingTables = await st.getTables();
        const floorId = req.body.floorId !== void 0 ? req.body.floorId : currentTable.floorId;
        const tableNumber = (req.body.tableNumber !== void 0 ? req.body.tableNumber : currentTable.tableNumber).trim();
        if (!tableNumber) {
          return res.status(400).json({ error: "Table number cannot be empty" });
        }
        const conflict = existingTables.find(
          (t) => t.id !== req.params.id && t.floorId === floorId && t.tableNumber.trim().toLowerCase() === tableNumber.toLowerCase()
        );
        if (conflict) {
          return res.status(409).json({
            error: "A table with this name already exists on this floor"
          });
        }
      }
    }
    const table = await st.updateTable(req.params.id, req.body);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }
    broadcastUpdate("table_updated", table);
    res.json(table);
  });
  app2.delete("/api/tables/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteTable(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Table not found" });
    }
    broadcastUpdate("table_deleted", { id: req.params.id });
    res.json({ success: true });
  });
  app2.patch("/api/tables/:id/status", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { status } = req.body;
    const table = await st.updateTableStatus(req.params.id, status);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }
    broadcastUpdate("table_updated", table);
    res.json(table);
  });
  app2.patch("/api/tables/:id/order", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { orderId } = req.body;
    const table = await st.updateTableOrder(req.params.id, orderId);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }
    broadcastUpdate("table_updated", table);
    res.json(table);
  });
  app2.get("/api/menu", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const items = await st.getMenuItems();
    res.json(items);
  });
  app2.get("/api/menu/categories", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const categoriesJson = await st.getSetting("menu_categories");
    const categories = categoriesJson ? JSON.parse(categoriesJson) : [];
    res.json({ categories });
  });
  app2.get("/api/menu/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const item = await st.getMenuItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(item);
  });
  app2.post("/api/menu", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertMenuItemSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const item = await st.createMenuItem(result.data);
    broadcastUpdate("menu_updated", item);
    res.json(item);
  });
  app2.patch("/api/menu/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const item = await st.updateMenuItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    broadcastUpdate("menu_updated", item);
    res.json(item);
  });
  app2.delete("/api/menu/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteMenuItem(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    broadcastUpdate("menu_deleted", { id: req.params.id });
    res.json({ success: true });
  });
  app2.post("/api/menu/generate-quick-codes", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const items = await st.getMenuItems();
      const usedCodes = /* @__PURE__ */ new Set();
      const itemsNeedingCodes = [];
      for (const item of items) {
        if (item.quickCode) {
          usedCodes.add(item.quickCode);
        } else {
          itemsNeedingCodes.push(item);
        }
      }
      const letters = "abcdefghijklmnopqrstuvwxyz";
      let updated = 0;
      for (const item of itemsNeedingCodes) {
        let found = false;
        for (let letterIdx = 0; letterIdx < letters.length && !found; letterIdx++) {
          for (let num = 1; num <= 99 && !found; num++) {
            const code = `${letters[letterIdx]}${num}`;
            if (!usedCodes.has(code)) {
              usedCodes.add(code);
              await st.updateMenuItem(item.id, { quickCode: code });
              updated++;
              found = true;
            }
          }
        }
      }
      res.json({
        success: true,
        updated,
        message: `Generated quick codes for ${updated} menu items`
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to generate quick codes"
      });
    }
  });
  app2.post("/api/menu/seed-sample-recipes", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const recipes = [
        {
          menuItemName: "Thai Basil Paneer (Starter)",
          ingredients: [
            { name: "Paneer", quantity: "150", unit: "g" },
            { name: "Thai Basil", quantity: "15", unit: "g" },
            { name: "Red Chili", quantity: "2", unit: "pcs" },
            { name: "Garlic", quantity: "6", unit: "cloves" },
            { name: "Cooking Oil", quantity: "30", unit: "ml" },
            { name: "Soy Sauce", quantity: "20", unit: "ml" }
          ]
        },
        {
          menuItemName: "Thai Basil Chicken (Starter)",
          ingredients: [
            { name: "Chicken Breast", quantity: "150", unit: "g" },
            { name: "Thai Basil", quantity: "15", unit: "g" },
            { name: "Red Chili", quantity: "2", unit: "pcs" },
            { name: "Garlic", quantity: "6", unit: "cloves" },
            { name: "Cooking Oil", quantity: "30", unit: "ml" },
            { name: "Soy Sauce", quantity: "20", unit: "ml" }
          ]
        },
        {
          menuItemName: "Thai Basil Prawns (Starter)",
          ingredients: [
            { name: "Prawns", quantity: "150", unit: "g" },
            { name: "Thai Basil", quantity: "15", unit: "g" },
            { name: "Red Chili", quantity: "2", unit: "pcs" },
            { name: "Garlic", quantity: "6", unit: "cloves" },
            { name: "Cooking Oil", quantity: "30", unit: "ml" },
            { name: "Soy Sauce", quantity: "20", unit: "ml" }
          ]
        },
        {
          menuItemName: "Thai Curry With Steam Rice Paneer",
          ingredients: [
            { name: "Paneer", quantity: "200", unit: "g" },
            { name: "Coconut Milk", quantity: "200", unit: "ml" },
            { name: "Lemongrass", quantity: "10", unit: "g" },
            { name: "Garlic", quantity: "8", unit: "cloves" },
            { name: "Ginger", quantity: "15", unit: "g" },
            { name: "Green Chili", quantity: "2", unit: "pcs" },
            { name: "Lime", quantity: "0.5", unit: "pcs" },
            { name: "Fish Sauce", quantity: "15", unit: "ml" },
            { name: "Cooking Oil", quantity: "40", unit: "ml" }
          ]
        },
        {
          menuItemName: "Thai Curry With Steam Rice Chicken",
          ingredients: [
            { name: "Chicken Breast", quantity: "200", unit: "g" },
            { name: "Coconut Milk", quantity: "200", unit: "ml" },
            { name: "Lemongrass", quantity: "10", unit: "g" },
            { name: "Garlic", quantity: "8", unit: "cloves" },
            { name: "Ginger", quantity: "15", unit: "g" },
            { name: "Green Chili", quantity: "2", unit: "pcs" },
            { name: "Lime", quantity: "0.5", unit: "pcs" },
            { name: "Fish Sauce", quantity: "15", unit: "ml" },
            { name: "Cooking Oil", quantity: "40", unit: "ml" }
          ]
        }
      ];
      const existingRecipes = await st.getRecipes();
      for (const recipe of recipes) {
        const menuItem = (await st.getMenuItems()).find(
          (m) => m.name === recipe.menuItemName
        );
        if (menuItem) {
          const oldRecipe = existingRecipes.find(
            (r) => r.menuItemId === menuItem.id
          );
          if (oldRecipe) {
            await st.deleteRecipe(oldRecipe.id);
            console.log(`\u{1F5D1}\uFE0F Deleted old recipe for: ${menuItem.name}`);
          }
        }
      }
      let addedRecipes = 0;
      const inventoryItems = await st.getInventoryItems();
      const inventoryMap = new Map(
        inventoryItems.map((item) => [item.name.toLowerCase(), item])
      );
      for (const recipe of recipes) {
        const menuItem = (await st.getMenuItems()).find(
          (m) => m.name === recipe.menuItemName
        );
        if (!menuItem) {
          console.log(`Menu item not found: ${recipe.menuItemName}`);
          continue;
        }
        const recipeData = {
          menuItemId: menuItem.id,
          name: `Recipe for ${menuItem.name}`,
          ingredients: []
        };
        for (const ing of recipe.ingredients) {
          const invItem = inventoryMap.get(ing.name.toLowerCase());
          if (invItem) {
            recipeData.ingredients.push({
              inventoryItemId: invItem.id,
              quantity: parseFloat(ing.quantity),
              unit: ing.unit
            });
          }
        }
        if (recipe.ingredients.length > 0) {
          const createdRecipe = await st.createRecipe({
            menuItemId: menuItem.id
          });
          console.log(
            `Created recipe for: ${menuItem.name} with ID: ${createdRecipe.id}`
          );
          let addedIngredients = 0;
          for (const ing of recipe.ingredients) {
            const invItem = inventoryMap.get(ing.name.toLowerCase());
            if (invItem) {
              try {
                await st.createRecipeIngredient({
                  recipeId: createdRecipe.id,
                  inventoryItemId: invItem.id,
                  quantity: String(ing.quantity),
                  unit: ing.unit
                });
                addedIngredients++;
                console.log(
                  `  \u2705 Added ingredient: ${ing.name} (ID: ${invItem.id}) - ${ing.quantity}${ing.unit}`
                );
              } catch (ingError) {
                console.error(
                  `  \u274C Failed to add ingredient ${ing.name}:`,
                  ingError
                );
              }
            } else {
              console.warn(
                `  \u26A0\uFE0F  Ingredient not found in inventory: ${ing.name}`
              );
            }
          }
          if (addedIngredients > 0) {
            addedRecipes++;
            console.log(
              `\u2705 Recipe fully populated for: ${menuItem.name} (${addedIngredients} ingredients)`
            );
          } else {
            console.warn(
              `\u26A0\uFE0F  No ingredients were added to recipe for ${menuItem.name}`
            );
          }
        } else {
          console.warn(
            `\u26A0\uFE0F  No ingredients found for recipe ${recipe.menuItemName}`
          );
        }
      }
      res.json({
        success: true,
        addedRecipes,
        message: `Seeded ${addedRecipes} sample recipes with all ingredients`
      });
    } catch (error) {
      console.error("Error seeding recipes:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to seed recipes"
      });
    }
  });
  app2.get("/api/orders", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const orders = await st.getOrders();
    res.json(orders);
  });
  app2.get("/api/orders/active", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const orders = await st.getActiveOrders();
    res.json(orders);
  });
  app2.get("/api/orders/completed", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const orders = await st.getCompletedOrders();
    res.json(orders);
  });
  app2.get("/api/orders/delivery", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const orders = await st.getDeliveryOrders();
    res.json(orders);
  });
  app2.get("/api/delivery-persons", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const persons = await st.getDeliveryPersons();
    res.json(persons);
  });
  app2.get("/api/delivery-persons/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const person = await st.getDeliveryPerson(req.params.id);
    if (!person) {
      return res.status(404).json({ error: "Delivery person not found" });
    }
    res.json(person);
  });
  app2.post("/api/delivery-persons", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const person = await st.createDeliveryPerson(req.body);
      res.status(201).json(person);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to create delivery person"
      });
    }
  });
  app2.patch("/api/delivery-persons/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const person = await st.updateDeliveryPerson(req.params.id, req.body);
    if (!person) {
      return res.status(404).json({ error: "Delivery person not found" });
    }
    res.json(person);
  });
  app2.delete("/api/delivery-persons/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteDeliveryPerson(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Delivery person not found" });
    }
    res.status(204).send();
  });
  app2.patch("/api/orders/:id/assign-driver", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { deliveryPersonId } = req.body;
    const existingOrder = await st.getOrder(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (existingOrder.orderType !== "delivery") {
      return res.status(400).json({ error: "Can only assign drivers to delivery orders" });
    }
    if (deliveryPersonId) {
      const driver = await st.getDeliveryPerson(deliveryPersonId);
      if (!driver) {
        return res.status(400).json({ error: "Delivery person not found" });
      }
    }
    const order = await st.assignDeliveryPerson(
      req.params.id,
      deliveryPersonId
    );
    if (!order) {
      return res.status(500).json({ error: "Failed to assign driver" });
    }
    res.json(order);
  });
  app2.get("/api/orders/:id/invoice/pdf", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const order = await st.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const invoices = await st.getInvoices();
      const invoice = invoices.find((inv) => inv.orderId === req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found for this order" });
      }
      const orderItems = await st.getOrderItems(req.params.id);
      const pdfBuffer = generateInvoicePDF({
        invoice,
        order,
        orderItems,
        restaurantName: "BUNGLE",
        restaurantAddress: "123 Main Street, City, State 12345",
        restaurantPhone: "+1 (555) 123-4567",
        restaurantGSTIN: "GSTIN1234567890"
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF invoice" });
    }
  });
  app2.get("/api/orders/:id/kot/pdf", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const order = await st.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const orderItems = await st.getOrderItems(req.params.id);
      if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ error: "No items in order" });
      }
      let tableInfo = null;
      if (order.tableId) {
        tableInfo = await st.getTable(order.tableId);
      }
      const pdfBuffer = generateKOTPDF({
        order,
        orderItems,
        tableNumber: tableInfo?.tableNumber || void 0,
        floorName: tableInfo?.floorId ? (await st.getFloor(tableInfo.floorId))?.name || void 0 : void 0,
        restaurantName: "BUNGLE",
        isUpdated: (order.kotCount ?? 0) > 1
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="KOT-${order.id.substring(0, 8)}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating KOT PDF:", error);
      res.status(500).json({ error: "Failed to generate KOT PDF" });
    }
  });
  app2.get("/api/orders/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const order = await st.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  });
  app2.get("/api/orders/:id/items", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const items = await st.getOrderItems(req.params.id);
    res.json(items);
  });
  app2.post("/api/orders", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertOrderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const order = await st.createOrder(result.data);
    if (order.tableId) {
      await st.updateTableOrder(order.tableId, order.id);
      await st.updateTableStatus(order.tableId, "occupied");
    }
    broadcastUpdate("order_created", order);
    res.json(order);
  });
  app2.post("/api/orders/:id/items", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertOrderItemSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    console.log("[Server] Creating order item for order:", req.params.id);
    const item = await st.createOrderItem(result.data);
    const orderItems = await st.getOrderItems(req.params.id);
    const total = orderItems.reduce((sum, item2) => {
      return sum + parseFloat(item2.price) * item2.quantity;
    }, 0);
    await st.updateOrderTotal(req.params.id, total.toFixed(2));
    const order = await st.getOrder(req.params.id);
    if (order && order.tableId) {
      await st.updateTableStatus(order.tableId, "occupied");
      const updatedTable = await st.getTable(order.tableId);
      if (updatedTable) {
        broadcastUpdate("table_updated", updatedTable);
      }
    }
    console.log(
      "[Server] Broadcasting order_item_added for orderId:",
      req.params.id
    );
    broadcastUpdate("order_item_added", { orderId: req.params.id, item });
    externalOrdersSync.syncItemAdd(req.params.id, {
      name: item.name,
      price: parseFloat(item.price),
      quantity: item.quantity,
      notes: item.notes ?? null,
      isVeg: item.isVeg
    }).catch(() => {
    });
    res.json(item);
  });
  app2.patch("/api/orders/:id/status", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { status } = req.body;
    const order = await st.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    broadcastUpdate("order_updated", order);
    res.json(order);
  });
  app2.post("/api/orders/:id/complete", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const order = await st.completeOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.tableId) {
      await st.updateTableOrder(order.tableId, null);
      await st.updateTableStatus(order.tableId, "free");
    }
    broadcastUpdate("order_completed", order);
    res.json(order);
  });
  app2.post("/api/orders/:id/kot", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = orderActionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    console.log("[Server] Sending order to kitchen:", req.params.id);
    const order = await st.updateOrderStatus(req.params.id, "sent_to_kitchen");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const updatedOrder = await st.incrementKotCount(req.params.id) ?? order;
    console.log(
      "[Server] Broadcasting order_updated for KOT, orderId:",
      updatedOrder.id,
      "status:",
      updatedOrder.status,
      "kotCount:",
      updatedOrder.kotCount
    );
    broadcastUpdate("order_updated", updatedOrder);
    (async () => {
      try {
        const kotPrinters = (await mongoStorage.getPrinters()).filter(
          (p) => p.type === "KOT" && p.autoPrint
        );
        if (kotPrinters.length === 0) return;
        const { buildKOTEscPos: buildKOTEscPos2 } = await Promise.resolve().then(() => (init_escpos(), escpos_exports));
        const orderItems = (await st.getOrderItems(req.params.id)).filter((item) => item.status === "new");
        let tableNumber;
        let floorName;
        if (updatedOrder.tableId) {
          const tbl = await st.getTable(updatedOrder.tableId);
          tableNumber = tbl?.tableNumber;
          if (tbl?.floorId) floorName = (await st.getFloor(tbl.floorId))?.name;
        }
        const baseKotNumber = await getDailyBillingNumber(st, updatedOrder);
        const kotSequence = await getDailyKotSequence(st, updatedOrder);
        const kotNumber = baseKotNumber;
        const escData = buildKOTEscPos2({
          order: updatedOrder,
          items: orderItems,
          tableNumber,
          floorName,
          kotNumber,
          sequence: String(kotSequence).padStart(2, "0"),
          isUpdated: (updatedOrder.kotCount ?? 0) > 1
        });
        const escBase64 = Buffer.from(escData).toString("base64");
        for (const printer of kotPrinters) {
          await mongoStorage.createPrintJob({
            orderId: updatedOrder.id,
            kotNumber,
            printerIp: printer.ip,
            printerPort: printer.port,
            escposData: escBase64,
            status: "pending"
          });
          console.log(
            `[PrintJob] Queued ${kotNumber} \u2192 ${printer.ip}:${printer.port}`
          );
        }
        await Promise.all(orderItems.map((item) => st.updateOrderItemStatus(item.id, "sent_to_kitchen")));
      } catch (e) {
        console.error("[PrintJob] Failed to enqueue:", e);
      }
    })();
    res.json({ order: updatedOrder, shouldPrint: result.data.print });
  });
  app2.post("/api/orders/:id/save", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = orderActionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const order = await st.updateOrderStatus(req.params.id, "saved");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    let invoice = null;
    if (result.data.print) {
      const orderItems = await st.getOrderItems(req.params.id);
      const subtotal = orderItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );
      const taxSettings = await getTaxSettings(st);
      const effectiveTaxRate = result.data.taxRate ?? taxSettings.taxRate;
      const effectiveServiceCharge = result.data.serviceCharge ?? taxSettings.serviceCharge;
      const { tax, cgst, sgst, serviceCharge, total } = computeBillTotals(
        subtotal,
        effectiveTaxRate,
        effectiveServiceCharge
      );
      let tableInfo = null;
      if (order.tableId) {
        tableInfo = await st.getTable(order.tableId);
      }
      const invoiceNumber = await getDailyBillingNumber(st, order);
      const invoiceItemsData = orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        isVeg: item.isVeg,
        notes: item.notes || void 0
      }));
      invoice = await upsertInvoice(st, order.id, {
        invoiceNumber,
        orderId: order.id,
        tableNumber: tableInfo?.tableNumber || null,
        floorName: tableInfo?.floorId ? (await st.getFloor(tableInfo.floorId))?.name || null : null,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        serviceCharge: serviceCharge.toFixed(2),
        discount: "0",
        total: total.toFixed(2),
        paymentMode: order.paymentMode || "cash",
        splitPayments: null,
        status: "Saved",
        items: JSON.stringify(invoiceItemsData),
        notes: null
      });
      broadcastUpdate("invoice_created", invoice);
      await queueBillPrintJobs({
        invoice,
        orderType: order.orderType,
        taxSettings
      });
    }
    broadcastUpdate("order_updated", order);
    res.json({ order, invoice, shouldPrint: result.data.print });
  });
  app2.post("/api/orders/:id/bill", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = orderActionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const order = await st.billOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderItems = await st.getOrderItems(req.params.id);
    const subtotal = orderItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    const taxSettings = await getTaxSettings(st);
    const effectiveTaxRate = result.data.taxRate ?? taxSettings.taxRate;
    const effectiveServiceCharge = result.data.serviceCharge ?? taxSettings.serviceCharge;
    const { tax, cgst, sgst, serviceCharge, total } = computeBillTotals(
      subtotal,
      effectiveTaxRate,
      effectiveServiceCharge
    );
    let tableInfo = null;
    if (order.tableId) {
      tableInfo = await st.getTable(order.tableId);
    }
    const invoiceNumber = await getDailyBillingNumber(st, order);
    const invoiceItemsData = orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      isVeg: item.isVeg,
      notes: item.notes || void 0
    }));
    const invoice = await upsertInvoice(st, order.id, {
      invoiceNumber,
      orderId: order.id,
      tableNumber: tableInfo?.tableNumber || null,
      floorName: tableInfo?.floorId ? (await st.getFloor(tableInfo.floorId))?.name || null : null,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      serviceCharge: serviceCharge.toFixed(2),
      discount: "0",
      total: total.toFixed(2),
      paymentMode: order.paymentMode || "cash",
      splitPayments: null,
      status: "Billed",
      items: JSON.stringify(invoiceItemsData),
      notes: null
    });
    broadcastUpdate("order_updated", order);
    broadcastUpdate("invoice_created", invoice);
    if (result.data.print) {
      await queueBillPrintJobs({
        invoice,
        orderType: order.orderType,
        taxSettings: await getTaxSettings(st)
      });
    }
    res.json({ order, invoice, shouldPrint: result.data.print });
  });
  app2.post("/api/orders/:id/checkout", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = checkoutSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const order = await st.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderItems = await st.getOrderItems(req.params.id);
    const subtotal = orderItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    const taxSettings = await getTaxSettings(st);
    const effectiveTaxRate = result.data.taxRate ?? taxSettings.taxRate;
    const effectiveServiceCharge = result.data.serviceCharge ?? taxSettings.serviceCharge;
    const { tax, cgst, sgst, serviceCharge, total } = computeBillTotals(
      subtotal,
      effectiveTaxRate,
      effectiveServiceCharge
    );
    if (result.data.splitPayments && result.data.splitPayments.length > 0) {
      const splitSum = result.data.splitPayments.reduce(
        (sum, split) => sum + split.amount,
        0
      );
      const tolerance = 0.01;
      if (Math.abs(splitSum - total) > tolerance) {
        return res.status(400).json({
          error: "Split payment amounts must equal the total bill",
          splitSum,
          total
        });
      }
      for (const split of result.data.splitPayments) {
        if (split.amount <= 0) {
          return res.status(400).json({ error: "Split payment amounts must be positive" });
        }
      }
    }
    const checkedOutOrder = await st.checkoutOrder(
      req.params.id,
      result.data.paymentMode
    );
    if (!checkedOutOrder) {
      return res.status(500).json({ error: "Failed to checkout order" });
    }
    let tableInfo = null;
    if (checkedOutOrder.tableId) {
      tableInfo = await st.getTable(checkedOutOrder.tableId);
      await st.updateTableOrder(checkedOutOrder.tableId, null);
      await st.updateTableStatus(checkedOutOrder.tableId, "free");
    }
    if (checkedOutOrder.customerPhone) {
      await digitalMenuSync.updateCustomerTableStatus(
        checkedOutOrder.customerPhone,
        "free"
      );
    }
    const invoiceNumber = await getDailyBillingNumber(st, checkedOutOrder);
    const invoiceItemsData = orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      isVeg: item.isVeg,
      notes: item.notes || void 0
    }));
    const invoice = await upsertInvoice(st, checkedOutOrder.id, {
      invoiceNumber,
      orderId: checkedOutOrder.id,
      tableNumber: tableInfo?.tableNumber || null,
      floorName: tableInfo?.floorId ? (await st.getFloor(tableInfo.floorId))?.name || null : null,
      customerName: checkedOutOrder.customerName,
      customerPhone: checkedOutOrder.customerPhone,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      serviceCharge: serviceCharge.toFixed(2),
      discount: "0",
      total: total.toFixed(2),
      paymentMode: result.data.paymentMode || "cash",
      splitPayments: result.data.splitPayments ? JSON.stringify(result.data.splitPayments) : null,
      status: "Paid",
      items: JSON.stringify(invoiceItemsData),
      notes: null
    });
    try {
      await st.deductInventoryForOrder(checkedOutOrder.id);
      broadcastUpdate("inventory_updated", { orderId: checkedOutOrder.id });
    } catch (error) {
      console.error("Error deducting inventory for order:", error);
    }
    broadcastUpdate("order_paid", checkedOutOrder);
    broadcastUpdate("invoice_created", invoice);
    if (result.data.print) {
      await queueBillPrintJobs({
        invoice,
        orderType: checkedOutOrder.orderType,
        taxSettings: await getTaxSettings(st)
      });
    }
    res.json({
      order: checkedOutOrder,
      invoice,
      shouldPrint: result.data.print
    });
  });
  app2.get("/api/invoices/:id/pdf", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const invoice = await st.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const order = await st.getOrder(invoice.orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const orderItems = await st.getOrderItems(invoice.orderId);
      const taxSettings = await getTaxSettings(st);
      const pdfBuffer = generateInvoicePDF({
        invoice,
        order,
        orderItems,
        restaurantName: "BUNGLE",
        restaurantAddress: "123 Main Street, City, State 12345",
        restaurantPhone: "+1 (555) 123-4567",
        restaurantGSTIN: taxSettings.gstEnabled ? taxSettings.gstNumber : ""
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${invoice.invoiceNumber}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      res.status(500).json({ error: "Failed to generate invoice PDF" });
    }
  });
  app2.patch("/api/order-items/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { quantity, notes, name } = req.body;
    const data = {};
    if (quantity !== void 0) data.quantity = quantity;
    if (notes !== void 0) data.notes = notes;
    if (name !== void 0) data.name = name;
    const item = await st.updateOrderItem(req.params.id, data);
    if (!item) return res.status(404).json({ error: "Order item not found" });
    const orderItems = await st.getOrderItems(item.orderId);
    const total = orderItems.reduce(
      (s, i) => s + parseFloat(i.price) * i.quantity,
      0
    );
    await st.updateOrderTotal(item.orderId, total.toFixed(2));
    broadcastUpdate("order_item_updated", item);
    externalOrdersSync.syncItemUpdate(item.orderId, item.name, data).catch(() => {
    });
    res.json(item);
  });
  app2.delete("/api/orders/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const order = await st.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    const items = await st.getOrderItems(req.params.id);
    for (const item of items) await st.deleteOrderItem(item.id);
    if (order.tableId) {
      await st.updateTableOrder(order.tableId, null);
      await st.updateTableStatus(order.tableId, "free");
      const updatedTable = await st.getTable(order.tableId);
      if (updatedTable) broadcastUpdate("table_updated", updatedTable);
    }
    await st.deleteOrder(req.params.id);
    broadcastUpdate("order_updated", { id: req.params.id, deleted: true });
    externalOrdersSync.deleteExternalOrder(req.params.id).catch(() => {
    });
    res.json({ success: true });
  });
  app2.patch("/api/order-items/:id/status", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { status } = req.body;
    const item = await st.updateOrderItemStatus(req.params.id, status);
    if (!item) {
      return res.status(404).json({ error: "Order item not found" });
    }
    const order = await st.getOrder(item.orderId);
    if (order && order.tableId) {
      const allItems = await st.getOrderItems(item.orderId);
      await st.updateTableStatus(order.tableId, "occupied");
      const updatedTable = await st.getTable(order.tableId);
      if (updatedTable) {
        broadcastUpdate("table_updated", updatedTable);
      }
    }
    if (order && order.customerPhone) {
      await digitalMenuSync.syncTableStatusFromPOSOrder(item.orderId);
    }
    broadcastUpdate("order_item_updated", item);
    res.json(item);
  });
  app2.delete("/api/order-items/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const item = await st.getOrderItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Order item not found" });
    }
    const success = await st.deleteOrderItem(req.params.id);
    if (!success) {
      return res.status(500).json({ error: "Failed to delete order item" });
    }
    const orderItems = await st.getOrderItems(item.orderId);
    const total = orderItems.reduce((sum, orderItem) => {
      return sum + parseFloat(orderItem.price) * orderItem.quantity;
    }, 0);
    await st.updateOrderTotal(item.orderId, total.toFixed(2));
    broadcastUpdate("order_item_deleted", {
      id: req.params.id,
      orderId: item.orderId
    });
    externalOrdersSync.syncItemDelete(item.orderId, item.name).catch(() => {
    });
    res.json({ success: true });
  });
  app2.get("/api/inventory", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const items = await st.getInventoryItems();
    res.json(items);
  });
  app2.post("/api/inventory", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertInventoryItemSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const item = await st.createInventoryItem(result.data);
    res.json(item);
  });
  app2.patch("/api/inventory/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { quantity } = req.body;
    const item = await st.updateInventoryQuantity(req.params.id, quantity);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.json(item);
  });
  app2.get("/api/invoices", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const invoices = await st.getInvoices();
    res.json(invoices);
  });
  app2.get("/api/invoices/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const invoice = await st.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(invoice);
  });
  app2.get(
    "/api/invoices/number/:invoiceNumber",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      const invoice = await st.getInvoiceByNumber(req.params.invoiceNumber);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    }
  );
  app2.post("/api/invoices", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertInvoiceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const invoice = await st.createInvoice(result.data);
    broadcastUpdate("invoice_created", invoice);
    res.json(invoice);
  });
  app2.patch("/api/invoices/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const invoice = await st.updateInvoice(req.params.id, req.body);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    broadcastUpdate("invoice_updated", invoice);
    res.json(invoice);
  });
  app2.delete("/api/invoices/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteInvoice(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    broadcastUpdate("invoice_deleted", { id: req.params.id });
    res.json({ success: true });
  });
  app2.get("/api/reservations", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const reservations = await st.getReservations();
    res.json(reservations);
  });
  app2.get("/api/reservations/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const reservation = await st.getReservation(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    res.json(reservation);
  });
  app2.get("/api/reservations/table/:tableId", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const reservations = await st.getReservationsByTable(req.params.tableId);
    res.json(reservations);
  });
  app2.post("/api/reservations", requireAuth, async (req, res) => {
    const st = getStorage(req);
    console.log("=== SERVER: CREATE RESERVATION ===");
    console.log("Received body:", req.body);
    console.log("Body type:", typeof req.body);
    console.log("Body keys:", Object.keys(req.body));
    console.log("timeSlot value:", req.body.timeSlot);
    console.log("timeSlot type:", typeof req.body.timeSlot);
    const result = insertReservationSchema.safeParse(req.body);
    console.log("Validation result:", result.success);
    if (!result.success) {
      console.error(
        "Validation errors:",
        JSON.stringify(result.error, null, 2)
      );
      return res.status(400).json({ error: result.error });
    }
    console.log("Validated data:", result.data);
    const existingReservations = await st.getReservationsByTable(
      result.data.tableId
    );
    if (existingReservations.length > 0) {
      return res.status(409).json({ error: "This table already has an active reservation" });
    }
    const reservation = await st.createReservation(result.data);
    console.log("Created reservation:", reservation);
    const table = await st.getTable(reservation.tableId);
    if (table && table.status === "free") {
      const updatedTable = await st.updateTableStatus(
        reservation.tableId,
        "reserved"
      );
      if (updatedTable) {
        broadcastUpdate("table_updated", updatedTable);
      }
    }
    broadcastUpdate("reservation_created", reservation);
    res.json(reservation);
  });
  app2.patch("/api/reservations/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const existingReservation = await st.getReservation(req.params.id);
    if (!existingReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    const oldTableId = existingReservation.tableId;
    const newTableId = req.body.tableId || oldTableId;
    const tableChanged = oldTableId !== newTableId;
    if (tableChanged) {
      const newTableReservations = await st.getReservationsByTable(newTableId);
      if (newTableReservations.length > 0) {
        return res.status(409).json({
          error: "The destination table already has an active reservation"
        });
      }
    }
    const reservation = await st.updateReservation(req.params.id, req.body);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    if (tableChanged) {
      const oldTableReservations = await st.getReservationsByTable(oldTableId);
      if (oldTableReservations.length === 0) {
        const oldTable = await st.getTable(oldTableId);
        if (oldTable && oldTable.status === "reserved" && !oldTable.currentOrderId) {
          const updatedOldTable = await st.updateTableStatus(
            oldTableId,
            "free"
          );
          if (updatedOldTable) {
            broadcastUpdate("table_updated", updatedOldTable);
          }
        }
      }
      const newTable = await st.getTable(newTableId);
      if (newTable && newTable.status === "free") {
        const updatedNewTable = await st.updateTableStatus(
          newTableId,
          "reserved"
        );
        if (updatedNewTable) {
          broadcastUpdate("table_updated", updatedNewTable);
        }
      }
    }
    if (req.body.status === "cancelled") {
      const tableReservations = await st.getReservationsByTable(
        reservation.tableId
      );
      if (tableReservations.length === 0) {
        const table = await st.getTable(reservation.tableId);
        if (table && table.status === "reserved" && !table.currentOrderId) {
          const updatedTable = await st.updateTableStatus(
            reservation.tableId,
            "free"
          );
          if (updatedTable) {
            broadcastUpdate("table_updated", updatedTable);
          }
        }
      }
    }
    broadcastUpdate("reservation_updated", reservation);
    res.json(reservation);
  });
  app2.delete("/api/reservations/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const reservation = await st.getReservation(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    const success = await st.deleteReservation(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Failed to delete reservation" });
    }
    const tableReservations = await st.getReservationsByTable(
      reservation.tableId
    );
    if (tableReservations.length === 0) {
      const table = await st.getTable(reservation.tableId);
      if (table && table.status === "reserved" && !table.currentOrderId) {
        const updatedTable = await st.updateTableStatus(
          reservation.tableId,
          "free"
        );
        if (updatedTable) {
          broadcastUpdate("table_updated", updatedTable);
        }
      }
    }
    broadcastUpdate("reservation_deleted", { id: req.params.id });
    res.json({ success: true });
  });
  app2.post("/api/admin/clear-data", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const { types = ["all"] } = req.body;
      const cleared = [];
      if (types.includes("orderItems") || types.includes("all")) {
        const orders = await st.getOrders();
        for (const order of orders) {
          const orderItems = await st.getOrderItems(order.id);
          for (const item of orderItems) {
            await st.deleteOrderItem(item.id);
          }
        }
        cleared.push("orderItems");
      }
      if (types.includes("invoices") || types.includes("all")) {
        const invoices = await st.getInvoices();
        for (const invoice of invoices) {
          await st.deleteInvoice(invoice.id);
        }
        cleared.push("invoices");
      }
      if (types.includes("orders") || types.includes("all")) {
        const orders = await st.getOrders();
        for (const order of orders) {
          await st.deleteOrder(order.id);
        }
        cleared.push("orders");
      }
      broadcastUpdate("data_cleared", { types: cleared });
      res.json({ success: true, cleared });
    } catch (error) {
      console.error("Error clearing data:", error);
      res.status(500).json({ error: "Failed to clear data" });
    }
  });
  app2.get("/api/customers", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customers = await st.getCustomers();
    res.json(customers);
  });
  app2.get("/api/customers/:id/stats", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customer = await st.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    const orders = await st.getOrders();
    const customerOrders = orders.filter(
      (o) => o.customerPhone === customer.phone
    );
    const totalOrders = customerOrders.length;
    const invoices = await st.getInvoices();
    const customerInvoices = invoices.filter((inv) => {
      const order = customerOrders.find((o) => o.id === inv.orderId);
      return !!order;
    });
    const actualTotalSpent = customerInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total || "0"),
      0
    );
    const lastOrder = customerOrders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    res.json({
      totalOrders,
      totalSpent: actualTotalSpent,
      lastVisit: lastOrder ? lastOrder.createdAt : customer.createdAt
    });
  });
  app2.get("/api/customers/phone/:phone", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customer = await st.getCustomerByPhone(req.params.phone);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  });
  app2.get("/api/customers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customer = await st.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  });
  app2.post("/api/customers", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertCustomerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const existingCustomer = await st.getCustomerByPhone(result.data.phone);
    if (existingCustomer) {
      return res.status(409).json({
        error: "Customer with this phone number already exists",
        customer: existingCustomer
      });
    }
    const customer = await st.createCustomer(result.data);
    broadcastUpdate("customer_created", customer);
    res.json(customer);
  });
  app2.patch("/api/customers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customer = await st.updateCustomer(req.params.id, req.body);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    broadcastUpdate("customer_updated", customer);
    res.json(customer);
  });
  app2.delete("/api/customers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteCustomer(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Customer not found" });
    }
    broadcastUpdate("customer_deleted", { id: req.params.id });
    res.json({ success: true });
  });
  app2.get("/api/feedbacks", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const feedbacks = await st.getFeedbacks();
    res.json(feedbacks);
  });
  app2.get("/api/feedbacks/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const feedback = await st.getFeedback(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    res.json(feedback);
  });
  app2.post("/api/feedbacks", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertFeedbackSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const feedback = await st.createFeedback(result.data);
    broadcastUpdate("feedback_created", feedback);
    res.json(feedback);
  });
  app2.delete("/api/feedbacks/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteFeedback(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    broadcastUpdate("feedback_deleted", { id: req.params.id });
    res.json({ success: true });
  });
  app2.get("/api/settings/mongodb-uri", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const uri = await st.getSetting("mongodb_uri");
    res.json({ uri: uri || null, hasUri: !!uri });
  });
  app2.post("/api/settings/mongodb-uri", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { uri } = req.body;
    if (!uri || typeof uri !== "string") {
      return res.status(400).json({ error: "MongoDB URI is required" });
    }
    await st.setSetting("mongodb_uri", uri);
    res.json({ success: true });
  });
  app2.get("/api/settings/tax", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const settings = await getTaxSettings(st);
    res.json(settings);
  });
  const taxSettingsSchema = z3.object({
    taxRate: z3.number().min(0).max(100),
    serviceCharge: z3.number().min(0).max(100),
    gstEnabled: z3.boolean(),
    gstNumber: z3.string().optional().default("")
  });
  app2.post("/api/settings/tax", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = taxSettingsSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const { taxRate, serviceCharge, gstEnabled, gstNumber } = result.data;
    await Promise.all([
      st.setSetting("tax_rate", String(taxRate)),
      st.setSetting("service_charge", String(serviceCharge)),
      st.setSetting("gst_enabled", String(gstEnabled)),
      st.setSetting("gst_number", gstNumber)
    ]);
    res.json({ taxRate, serviceCharge, gstEnabled, gstNumber });
  });
  app2.post("/api/menu/sync-from-mongodb", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const mongoUri = await st.getSetting("mongodb_uri");
      if (!mongoUri) {
        return res.status(400).json({ error: "MongoDB URI not configured. Please set it first." });
      }
      const { databaseName } = req.body;
      const { items, categories } = await fetchMenuItemsFromMongoDB(
        mongoUri,
        databaseName
      );
      const existingItems = await st.getMenuItems();
      for (const existing of existingItems) {
        await st.deleteMenuItem(existing.id);
      }
      const createdItems = [];
      for (const item of items) {
        const created = await st.createMenuItem(item);
        createdItems.push(created);
      }
      await st.setSetting("menu_categories", JSON.stringify(categories));
      broadcastUpdate("menu_synced", { count: createdItems.length });
      res.json({
        success: true,
        itemsImported: createdItems.length,
        items: createdItems
      });
    } catch (error) {
      console.error("Error syncing from MongoDB:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to sync from MongoDB"
      });
    }
  });
  app2.get("/api/inventory", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      let items = await st.getInventoryItems();
      if (req.query.search) {
        const search = req.query.search.toString().toLowerCase();
        items = items.filter(
          (item) => item.name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search)
        );
      }
      if (req.query.category) {
        const category = req.query.category.toString();
        items = items.filter((item) => item.category === category);
      }
      if (req.query.sortBy) {
        const sortBy = req.query.sortBy.toString();
        if (sortBy === "name") {
          items.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "stock") {
          items.sort(
            (a, b) => parseFloat(a.currentStock) - parseFloat(b.currentStock)
          );
        } else if (sortBy === "lowStock") {
          items = items.filter(
            (item) => parseFloat(item.currentStock) <= parseFloat(item.minStock)
          );
        }
      }
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch inventory"
      });
    }
  });
  app2.get("/api/inventory/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const item = await st.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch inventory item"
      });
    }
  });
  app2.post("/api/inventory", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const result = insertInventoryItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const item = await st.createInventoryItem(result.data);
      broadcastUpdate("inventory_created", item);
      res.json(item);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create inventory item"
      });
    }
  });
  app2.patch("/api/inventory/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const item = await st.updateInventoryItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      broadcastUpdate("inventory_updated", item);
      res.json(item);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to update inventory item"
      });
    }
  });
  app2.delete("/api/inventory/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deleteInventoryItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      broadcastUpdate("inventory_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete inventory item"
      });
    }
  });
  app2.get(
    "/api/recipes/menu-item/:menuItemId",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const recipe = await st.getRecipeByMenuItemId(req.params.menuItemId);
        if (!recipe) {
          return res.status(404).json({ error: "Recipe not found for this menu item" });
        }
        const ingredients = await st.getRecipeIngredients(recipe.id);
        const ingredientsWithDetails = await Promise.all(
          ingredients.map(async (ingredient) => {
            const inventoryItem = await st.getInventoryItem(
              ingredient.inventoryItemId
            );
            return {
              ...ingredient,
              inventoryItem
            };
          })
        );
        res.json({
          recipe,
          ingredients: ingredientsWithDetails
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to fetch recipe"
        });
      }
    }
  );
  app2.post("/api/recipes", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const result = insertRecipeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const recipe = await st.createRecipe(result.data);
      broadcastUpdate("recipe_created", recipe);
      res.json(recipe);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create recipe"
      });
    }
  });
  app2.post(
    "/api/recipes/:recipeId/ingredients",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const bodySchema = insertRecipeIngredientSchema.omit({
          recipeId: true
        });
        const result = bodySchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }
        const ingredient = await st.createRecipeIngredient({
          ...result.data,
          recipeId: req.params.recipeId
        });
        broadcastUpdate("recipe_ingredient_added", ingredient);
        res.json(ingredient);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to add recipe ingredient"
        });
      }
    }
  );
  app2.patch(
    "/api/recipes/:recipeId/ingredients/:id",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const ingredient = await st.updateRecipeIngredient(
          req.params.id,
          req.body
        );
        if (!ingredient) {
          return res.status(404).json({ error: "Recipe ingredient not found" });
        }
        broadcastUpdate("recipe_ingredient_updated", ingredient);
        res.json(ingredient);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to update recipe ingredient"
        });
      }
    }
  );
  app2.delete(
    "/api/recipes/:recipeId/ingredients/:id",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const success = await st.deleteRecipeIngredient(req.params.id);
        if (!success) {
          return res.status(404).json({ error: "Recipe ingredient not found" });
        }
        broadcastUpdate("recipe_ingredient_deleted", { id: req.params.id });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to delete recipe ingredient"
        });
      }
    }
  );
  app2.delete("/api/recipes/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deleteRecipe(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      broadcastUpdate("recipe_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete recipe"
      });
    }
  });
  app2.get("/api/suppliers", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const suppliers = await st.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch suppliers"
      });
    }
  });
  app2.post("/api/suppliers", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const result = insertSupplierSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const supplier = await st.createSupplier(result.data);
      broadcastUpdate("supplier_created", supplier);
      res.json(supplier);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create supplier"
      });
    }
  });
  app2.patch("/api/suppliers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const supplier = await st.updateSupplier(req.params.id, req.body);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      broadcastUpdate("supplier_updated", supplier);
      res.json(supplier);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to update supplier"
      });
    }
  });
  app2.delete("/api/suppliers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deleteSupplier(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      broadcastUpdate("supplier_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete supplier"
      });
    }
  });
  app2.get("/api/purchase-orders", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const orders = await st.getPurchaseOrders();
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await st.getPurchaseOrderItems(order.id);
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              const inventoryItem = await st.getInventoryItem(
                item.inventoryItemId
              );
              return {
                ...item,
                inventoryItem
              };
            })
          );
          const supplier = await st.getSupplier(order.supplierId);
          return {
            ...order,
            items: itemsWithDetails,
            supplier
          };
        })
      );
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch purchase orders"
      });
    }
  });
  app2.get("/api/purchase-orders/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const order = await st.getPurchaseOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      const items = await st.getPurchaseOrderItems(order.id);
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const inventoryItem = await st.getInventoryItem(item.inventoryItemId);
          return {
            ...item,
            inventoryItem
          };
        })
      );
      const supplier = await st.getSupplier(order.supplierId);
      res.json({
        ...order,
        items: itemsWithDetails,
        supplier
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch purchase order"
      });
    }
  });
  app2.post("/api/purchase-orders", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const result = insertPurchaseOrderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const order = await st.createPurchaseOrder(result.data);
      broadcastUpdate("purchase_order_created", order);
      res.json(order);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create purchase order"
      });
    }
  });
  app2.post("/api/purchase-orders/:id/items", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const result = insertPurchaseOrderItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const item = await st.createPurchaseOrderItem({
        ...result.data,
        purchaseOrderId: req.params.id
      });
      broadcastUpdate("purchase_order_item_added", item);
      res.json(item);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to add purchase order item"
      });
    }
  });
  app2.patch("/api/purchase-orders/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const order = await st.updatePurchaseOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      broadcastUpdate("purchase_order_updated", order);
      res.json(order);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to update purchase order"
      });
    }
  });
  app2.post(
    "/api/purchase-orders/:id/receive",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const order = await st.receivePurchaseOrder(req.params.id);
        if (!order) {
          return res.status(404).json({ error: "Purchase order not found" });
        }
        broadcastUpdate("purchase_order_received", order);
        broadcastUpdate("inventory_updated", {
          purchaseOrderId: req.params.id
        });
        res.json(order);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to receive purchase order"
        });
      }
    }
  );
  app2.delete("/api/purchase-orders/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deletePurchaseOrder(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      broadcastUpdate("purchase_order_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete purchase order"
      });
    }
  });
  app2.get("/api/wastage", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const wastages = await st.getWastages();
      const wastagesWithDetails = await Promise.all(
        wastages.map(async (wastage) => {
          const inventoryItem = await st.getInventoryItem(
            wastage.inventoryItemId
          );
          return {
            ...wastage,
            inventoryItem
          };
        })
      );
      res.json(wastagesWithDetails);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch wastage records"
      });
    }
  });
  app2.post("/api/wastage", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const result = insertWastageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const inventoryItem = await st.getInventoryItem(
        result.data.inventoryItemId
      );
      if (!inventoryItem) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      const newStock = parseFloat(inventoryItem.currentStock) - parseFloat(result.data.quantity);
      if (newStock < 0) {
        return res.status(400).json({ error: "Insufficient stock for wastage entry" });
      }
      await st.updateInventoryQuantity(
        result.data.inventoryItemId,
        newStock.toString()
      );
      const wastage = await st.createWastage(result.data);
      broadcastUpdate("wastage_created", wastage);
      broadcastUpdate("inventory_updated", { wastageId: wastage.id });
      res.json(wastage);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create wastage record"
      });
    }
  });
  app2.delete("/api/wastage/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deleteWastage(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Wastage record not found" });
      }
      broadcastUpdate("wastage_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete wastage record"
      });
    }
  });
  app2.get("/api/inventory-usage", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const usages = await st.getInventoryUsages();
      res.json(usages);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch inventory usage"
      });
    }
  });
  app2.get(
    "/api/inventory-usage/item/:itemId",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const usages = await st.getInventoryUsagesByItem(req.params.itemId);
        res.json(usages);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to fetch item usage"
        });
      }
    }
  );
  app2.get("/api/inventory-usage/most-used", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const mostUsed = await st.getMostUsedItems(limit);
      res.json(mostUsed);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch most used items"
      });
    }
  });
  app2.post("/api/inventory-usage", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const result = insertInventoryUsageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const usage = await st.createInventoryUsage(result.data);
      broadcastUpdate("inventory_usage_created", usage);
      res.json(usage);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create inventory usage record"
      });
    }
  });
  app2.post("/api/inventory/seed", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      if (typeof storage.seedInventoryAndRecipes !== "function") {
        return res.status(400).json({ error: "Seeding is only available with MongoDB storage" });
      }
      const result = await st.seedInventoryAndRecipes();
      broadcastUpdate("inventory_seeded", result);
      res.json({
        success: true,
        message: "Inventory and recipes seeded successfully",
        ...result
      });
    } catch (error) {
      console.error("Error seeding inventory:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to seed inventory"
      });
    }
  });
  const digitalMenuSync = new DigitalMenuSyncService(storage);
  digitalMenuSync.setBroadcastFunction(broadcastUpdate);
  app2.post("/api/digital-menu/sync-start", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const intervalMs = req.body.intervalMs || 5e3;
      await digitalMenuSync.start(intervalMs);
      res.json({ success: true, message: "Digital menu sync service started" });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to start sync service"
      });
    }
  });
  app2.post("/api/digital-menu/sync-stop", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      digitalMenuSync.stop();
      res.json({ success: true, message: "Digital menu sync service stopped" });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to stop sync service"
      });
    }
  });
  app2.post("/api/digital-menu/sync-now", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const synced = await digitalMenuSync.syncOrders();
      broadcastUpdate("digital_menu_synced", { count: synced });
      res.json({ success: true, syncedOrders: synced });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to sync orders"
      });
    }
  });
  app2.get("/api/digital-menu/status", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const status = digitalMenuSync.getSyncStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get sync status"
      });
    }
  });
  app2.get("/api/digital-menu/orders", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const orders = await digitalMenuSync.getDigitalMenuOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch digital menu orders"
      });
    }
  });
  app2.get("/api/digital-menu/customers", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const customers = await digitalMenuSync.getDigitalMenuCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch digital menu customers"
      });
    }
  });
  digitalMenuSync.start(5e3);
  externalOrdersSync.setBroadcastFunction(broadcastUpdate);
  app2.get("/api/external-orders/status", requireAuth, async (_req, res) => {
    res.json(externalOrdersSync.getStatus());
  });
  app2.post("/api/external-orders/sync-now", requireAuth, async (_req, res) => {
    try {
      const synced = await externalOrdersSync.sync();
      res.json({ success: true, syncedOrders: synced });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Sync failed"
      });
    }
  });
  app2.get("/api/printers", requireAuth, async (req, res) => {
    try {
      const printers = await mongoStorage.getPrinters();
      res.json(printers);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch printers" });
    }
  });
  app2.post("/api/printers", requireAuth, async (req, res) => {
    try {
      const { insertPrinterSchema: insertPrinterSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const result = insertPrinterSchema2.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      const printer = await mongoStorage.createPrinter(result.data);
      res.json(printer);
    } catch (e) {
      res.status(500).json({ error: "Failed to create printer" });
    }
  });
  app2.patch("/api/printers/:id", requireAuth, async (req, res) => {
    try {
      const printer = await mongoStorage.updatePrinter(req.params.id, req.body);
      if (!printer) return res.status(404).json({ error: "Printer not found" });
      res.json(printer);
    } catch (e) {
      res.status(500).json({ error: "Failed to update printer" });
    }
  });
  app2.delete("/api/printers/:id", requireAuth, async (req, res) => {
    try {
      const ok = await mongoStorage.deletePrinter(req.params.id);
      if (!ok) return res.status(404).json({ error: "Printer not found" });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete printer" });
    }
  });
  app2.get("/api/printers/:id/status", requireAuth, async (req, res) => {
    try {
      const { checkPrinterOnline: checkPrinterOnline2 } = await Promise.resolve().then(() => (init_escpos(), escpos_exports));
      const printer = await mongoStorage.getPrinter(req.params.id);
      if (!printer) return res.status(404).json({ error: "Printer not found" });
      const online = await checkPrinterOnline2(printer.ip, printer.port);
      res.json({ id: printer.id, online });
    } catch (e) {
      res.json({ id: req.params.id, online: false });
    }
  });
  app2.post(
    "/api/printers/print-kot/:orderId",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const { buildKOTEscPos: buildKOTEscPos2, printToThermal: printToThermal2 } = await Promise.resolve().then(() => (init_escpos(), escpos_exports));
        const { printerIds } = req.body;
        const order = await st.getOrder(req.params.orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });
        const orderItems = await st.getOrderItems(req.params.orderId);
        let tableNumber;
        let floorName;
        if (order.tableId) {
          const tbl = await st.getTable(order.tableId);
          tableNumber = tbl?.tableNumber;
          if (tbl?.floorId) floorName = (await st.getFloor(tbl.floorId))?.name;
        }
        const allPrinters = await mongoStorage.getPrinters();
        const targets = printerIds?.length ? allPrinters.filter((p) => printerIds.includes(p.id)) : allPrinters.filter((p) => p.type === "KOT");
        if (targets.length === 0) {
          return res.json({ results: [], allFailed: true });
        }
        const baseKotNumber = await getDailyBillingNumber(st, order);
        const kotSequence = await getDailyKotSequence(st, order);
        const kotNumber = baseKotNumber;
        const escData = buildKOTEscPos2({
          order,
          items: orderItems.filter((item) => item.status === "new"),
          tableNumber,
          floorName,
          kotNumber,
          sequence: String(kotSequence).padStart(2, "0"),
          isUpdated: (order.kotCount ?? 0) > 1
        });
        const results = await Promise.all(
          targets.map(async (p) => {
            const result = await printToThermal2(p.ip, p.port, escData);
            return { id: p.id, name: p.name, ...result };
          })
        );
        const allFailed = results.every((r) => !r.success);
        res.json({ results, allFailed });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    }
  );
  app2.post("/api/printers/:id/test", requireAuth, async (req, res) => {
    try {
      const printer = await mongoStorage.getPrinter(req.params.id);
      if (!printer) return res.status(404).json({ error: "Printer not found" });
      const ESC2 = 27, GS2 = 29, LF2 = 10;
      const now = (/* @__PURE__ */ new Date()).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
      });
      const parts = [
        Buffer.from([ESC2, 64]),
        // init
        Buffer.from([ESC2, 97, 1]),
        // center
        Buffer.from([ESC2, 33, 48]),
        // double size
        Buffer.from("TEST PRINT\n", "utf8"),
        Buffer.from([ESC2, 33, 0]),
        // normal
        Buffer.from(`${printer.name}
`, "utf8"),
        Buffer.from(`IP: ${printer.ip}:${printer.port}
`, "utf8"),
        Buffer.from(`Type: ${printer.type}
`, "utf8"),
        Buffer.from(`Time: ${now}
`, "utf8"),
        Buffer.from("--------------------------------\n", "utf8"),
        Buffer.from([ESC2, 69, 1]),
        // bold
        Buffer.from("Printer is Online!\n", "utf8"),
        Buffer.from([ESC2, 69, 0]),
        Buffer.from([LF2, LF2, LF2, LF2]),
        Buffer.from([GS2, 86, 66, 3])
        // cut
      ];
      const data = Buffer.concat(parts);
      await mongoStorage.createPrintJob({
        orderId: "test",
        kotNumber: "TEST",
        printerIp: printer.ip,
        printerPort: printer.port,
        escposData: data.toString("base64"),
        status: "pending"
      });
      res.json({ success: true, queued: true });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.get("/api/print-jobs/pending", requireAuth, async (_req, res) => {
    try {
      const jobs = await mongoStorage.getPendingPrintJobs();
      res.json(jobs);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/print-jobs/:id/done", requireAuth, async (req, res) => {
    try {
      await mongoStorage.markPrintJobDone(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/print-jobs/:id/failed", requireAuth, async (req, res) => {
    try {
      await mongoStorage.markPrintJobFailed(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/printers/:id/check", requireAuth, async (req, res) => {
    try {
      const { checkPrinterOnline: checkPrinterOnline2 } = await Promise.resolve().then(() => (init_escpos(), escpos_exports));
      const printer = await mongoStorage.getPrinter(req.params.id);
      if (!printer) return res.status(404).json({ error: "Printer not found" });
      const online = await checkPrinterOnline2(printer.ip, printer.port);
      res.json({ online });
    } catch (e) {
      res.status(500).json({ online: false, error: e.message });
    }
  });
  externalOrdersSync.start(1e3);
  const httpServer = createServer(app2);
  wss = new WebSocketServer({ server: httpServer, path: "/api/ws" });
  wss.on("connection", (ws) => {
    ws.on("error", console.error);
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    hmr: false
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    allowedHosts: true,
    hmr: false
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
setupAuthRoutes(app);
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
