import type { Express, Request, Response } from "express";
import crypto from "crypto";
import QRCode from "qrcode";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { getStorageForSession, requireAuth } from "./auth-middleware";
import { IStorage } from "./storage";
import {
  insertFloorSchema,
  insertTableSchema,
  insertMenuItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertInventoryItemSchema,
  insertRecipeSchema,
  insertRecipeIngredientSchema,
  insertSupplierSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema,
  insertWastageSchema,
  insertInvoiceSchema,
  insertReservationSchema,
  insertCustomerSchema,
  insertFeedbackSchema,
  insertInventoryUsageSchema,
  type OrderItem,
} from "@shared/schema";
import { z } from "zod";
import { fetchMenuItemsFromMongoDB } from "./mongodbService";
import { generateInvoicePDF } from "./utils/invoiceGenerator";
import { generateKOTPDF } from "./utils/kotGenerator";
import { DigitalMenuSyncService } from "./digital-menu-sync";
import { ExternalOrdersSyncService } from "./external-orders-sync";
import { mongoStorage } from "./mongo-storage";
import {
  getDailyBillingNumber,
  getDailyKotInvoiceNumber,
  getDailyKotInvoiceNumbers,
  getDailyKotSequence,
  ensureDailyKotInvoiceNumber,
} from "./utils/billing-sequence";
import {
  computeBillTotals,
  DEFAULT_TAX_SETTINGS,
  type TaxSettings,
} from "@shared/tax";

const orderActionSchema = z.object({
  print: z.boolean().optional().default(false),
  printVia: z.enum(["qz", "agent"]).optional().default("qz"),
  taxRate: z.number().min(0).max(100).optional(),
  serviceCharge: z.number().min(0).max(100).optional(),
});

const checkoutSchema = z.object({
  paymentMode: z.string().optional(),
  print: z.boolean().optional().default(false),
  printVia: z.enum(["qz", "agent"]).optional().default("agent"),
  taxRate: z.number().min(0).max(100).optional(),
  serviceCharge: z.number().min(0).max(100).optional(),
  splitPayments: z
    .array(
      z.object({
        person: z.number(),
        amount: z.number(),
        paymentMode: z.string(),
      }),
    )
    .optional(),
});

function normalizeQzPem(raw: string): string {
  const value = raw.replace(/\\n/g, "\n").trim();
  const match = value.match(/-----BEGIN (.+?)-----/);
  if (!match) throw new Error("Invalid QZ PEM");
  const type = match[1];
  const body = value
    .replace(/-----BEGIN .+?-----/g, "")
    .replace(/-----END .+?-----/g, "")
    .replace(/\s+/g, "");
  return `-----BEGIN ${type}-----\n${(body.match(/.{1,64}/g) || []).join("\n")}\n-----END ${type}-----`;
}

async function getTaxSettings(st: IStorage): Promise<TaxSettings> {
  const [taxRate, serviceCharge, gstEnabled, gstNumber] = await Promise.all([
    st.getSetting("tax_rate"),
    st.getSetting("service_charge"),
    st.getSetting("gst_enabled"),
    st.getSetting("gst_number"),
  ]);

  return {
    taxRate:
      taxRate !== undefined
        ? parseFloat(taxRate)
        : DEFAULT_TAX_SETTINGS.taxRate,
    serviceCharge:
      serviceCharge !== undefined
        ? parseFloat(serviceCharge)
        : DEFAULT_TAX_SETTINGS.serviceCharge,
    gstEnabled:
      gstEnabled !== undefined
        ? gstEnabled === "true"
        : DEFAULT_TAX_SETTINGS.gstEnabled,
    gstNumber:
      gstNumber !== undefined ? gstNumber : DEFAULT_TAX_SETTINGS.gstNumber,
  };
}

/**
 * Upsert an invoice for an order — updates the existing one if present so that
 * Save → Bill → Checkout never creates duplicate invoices for the same order,
 * which was causing customer "Total Spent" to be counted multiple times.
 */
async function upsertInvoice(
  st: IStorage,
  orderId: string,
  data: Parameters<IStorage["createInvoice"]>[0],
): Promise<import("@shared/schema").Invoice> {
  const existing = (await st.getInvoices()).find(
    (inv) => inv.orderId === orderId,
  );
  if (existing) {
    const updated = await st.updateInvoice(existing.id, data);
    return updated ?? existing;
  }
  return st.createInvoice(data);
}

/** Human-readable daily sequence shared by KOT and the final customer invoice. */

async function queueBillPrintJobs(opts: {
  invoice: {
    invoiceNumber: string;
    tableNumber?: string | null;
    floorName?: string | null;
    customerName?: string | null;
    customerPhone?: string | null;
    subtotal: string;
    cgst: string;
    sgst: string;
    serviceCharge: string;
    total: string;
    paymentMode?: string | null;
    splitPayments?: string | null;
    items: string;
  };
  orderType?: string;
  taxSettings: TaxSettings;
}): Promise<void> {
  try {
    const { buildBillEscPos } = await import("./utils/escpos");
    const printers = await mongoStorage.getPrinters();
    let billPrinters = printers.filter(
      (p) => p.type === "Bill" && p.autoPrint,
    );
    // Many installations use one thermal printer for both KOT and customer
    // bills. If no dedicated bill printer exists, use the configured KOT
    // printer rather than silently skipping the checkout print.
    if (billPrinters.length === 0) {
      billPrinters = printers.filter((p) => p.type === "KOT" && p.autoPrint);
    }
    if (billPrinters.length === 0) return;

    const parsedItems = JSON.parse(opts.invoice.items || "[]");
    const escData = buildBillEscPos({
      invoiceNumber: opts.invoice.invoiceNumber,
      date: new Date(),
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
      splitPayments: opts.invoice.splitPayments
        ? JSON.parse(opts.invoice.splitPayments)
        : [],
      gstEnabled: opts.taxSettings.gstEnabled,
      gstNumber: opts.taxSettings.gstNumber,
    });

    await Promise.all(
      billPrinters.map((p) =>
        mongoStorage.createPrintJob({
          orderId: "bill",
          kotNumber: opts.invoice.invoiceNumber,
          printerIp: p.ip,
          printerPort: p.port,
          printerName: p.name,
          escposData: escData.toString("base64"),
          status: "pending",
        }),
      ),
    );
  } catch (err) {
    console.error("[BillPrint] Failed to queue bill print job:", err);
  }
}

let wss: WebSocketServer;

function getStorage(req: Request): IStorage {
  const sessionStorage = getStorageForSession(req);
  return sessionStorage || storage;
}

function broadcastUpdate(type: string, data: any) {
  if (!wss) {
    console.log("[WebSocket] No WSS instance, cannot broadcast");
    return;
  }
  const message = JSON.stringify({ type, data });
  const clientCount = Array.from(wss.clients).filter(
    (c) => c.readyState === WebSocket.OPEN,
  ).length;
  console.log(`[WebSocket] Broadcasting ${type} to ${clientCount} clients`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Instantiate early so all routes below can call backward-sync helpers
  const externalOrdersSync = new ExternalOrdersSyncService(mongoStorage);

  app.get("/api/floors", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const floors = await st.getFloors();
    res.json(floors);
  });

  app.get("/api/floors/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const floor = await st.getFloor(req.params.id);
    if (!floor) {
      return res.status(404).json({ error: "Floor not found" });
    }
    res.json(floor);
  });

  app.post("/api/floors", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertFloorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    // Uniqueness: floor names must be unique
    const existingFloors = await st.getFloors();
    if (
      existingFloors.some(
        (f) =>
          f.name.trim().toLowerCase() === result.data.name.trim().toLowerCase(),
      )
    ) {
      return res
        .status(409)
        .json({ error: "A floor with this name already exists" });
    }
    const floor = await st.createFloor(result.data);
    broadcastUpdate("floor_created", floor);
    res.json(floor);
  });

  app.patch("/api/floors/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    // Uniqueness: if renaming, check no other floor has the same name
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string") {
        return res.status(400).json({ error: "Floor name must be a string" });
      }
      const trimmedName = req.body.name.trim();
      if (!trimmedName) {
        return res.status(400).json({ error: "Floor name cannot be empty" });
      }
      const existingFloors = await st.getFloors();
      const conflict = existingFloors.find(
        (f) =>
          f.id !== req.params.id &&
          f.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );
      if (conflict) {
        return res
          .status(409)
          .json({ error: "A floor with this name already exists" });
      }
    }
    const floor = await st.updateFloor(req.params.id, req.body);
    if (!floor) {
      return res.status(404).json({ error: "Floor not found" });
    }
    broadcastUpdate("floor_updated", floor);
    res.json(floor);
  });

  app.delete("/api/floors/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteFloor(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Floor not found" });
    }
    broadcastUpdate("floor_deleted", { id: req.params.id });
    res.json({ success: true });
  });

  app.get("/api/tables", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const tables = await st.getTables();
    res.json(tables);
  });

  app.post("/api/admin/qr-token", requireAuth, async (req, res) => {
    try {
      const input = z.object({
        tableId: z.string().min(1).max(100).optional(),
        tableName: z.string().trim().min(1).max(100).optional(),
        floorName: z.string().trim().min(1).max(100).optional(),
      }).safeParse(req.body);
      if (!input.success) return res.status(400).json({ error: "A table is required" });
      let tableName = input.data.tableName;
      let floorName = input.data.floorName;
      if (input.data.tableId) {
        const st = getStorage(req);
        const table = await st.getTable(input.data.tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });
        const floor = await st.getFloor(table.floorId);
        if (!floor) return res.status(404).json({ error: "Floor not found" });
        tableName = table.tableNumber;
        floorName = floor.name;
      }
      const sessionSecret = process.env.QR_SESSION_SECRET;
      if (!tableName || !floorName || !sessionSecret) {
        return res.status(400).json({ error: "QR session secret is not configured" });
      }
      if (!/^[^\u0000-\u001f\u007f]+$/.test(tableName) || !/^[^\u0000-\u001f\u007f]+$/.test(floorName)) {
        return res.status(400).json({ error: "Table or floor name is invalid" });
      }
      const encodedPayload = Buffer.from(JSON.stringify({ tableName, floorName, v: 1 }), "utf8").toString("base64url");
      const encodedSignature = crypto.createHmac("sha256", sessionSecret).update(encodedPayload).digest("base64url");
      const token = `${encodedPayload}.${encodedSignature}`;
      const url = `https://bungle.atdigitalmenu.com/${token}`;
      const qrDataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 2, width: 320 });
      res.json({ url, token, qrDataUrl });
    } catch (error) {
      console.error("[QR] Generation failed:", error instanceof Error ? error.message : "unknown error");
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  app.get("/api/tables/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const table = await st.getTable(req.params.id);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }
    res.json(table);
  });

  app.post("/api/tables", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertTableSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    // Uniqueness: table numbers must be unique within the same floor
    const existingTables = await st.getTables();
    const floorId = result.data.floorId ?? null;
    const conflict = existingTables.find(
      (t) =>
        t.floorId === floorId &&
        t.tableNumber.trim().toLowerCase() ===
          result.data.tableNumber.trim().toLowerCase(),
    );
    if (conflict) {
      return res
        .status(409)
        .json({ error: "A table with this name already exists on this floor" });
    }
    const table = await st.createTable(result.data);
    broadcastUpdate("table_created", table);
    res.json(table);
  });

  app.patch("/api/tables/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    // Validate string fields before trim
    if (
      req.body.tableNumber !== undefined &&
      typeof req.body.tableNumber !== "string"
    ) {
      return res.status(400).json({ error: "Table number must be a string" });
    }
    // Uniqueness: if renaming or moving floor, check for conflicts
    if (req.body.tableNumber !== undefined || req.body.floorId !== undefined) {
      const currentTable = await st.getTable(req.params.id);
      if (currentTable) {
        const existingTables = await st.getTables();
        const floorId =
          req.body.floorId !== undefined
            ? req.body.floorId
            : currentTable.floorId;
        const tableNumber = (
          req.body.tableNumber !== undefined
            ? req.body.tableNumber
            : currentTable.tableNumber
        ).trim();
        if (!tableNumber) {
          return res
            .status(400)
            .json({ error: "Table number cannot be empty" });
        }
        const conflict = existingTables.find(
          (t) =>
            t.id !== req.params.id &&
            t.floorId === floorId &&
            t.tableNumber.trim().toLowerCase() === tableNumber.toLowerCase(),
        );
        if (conflict) {
          return res
            .status(409)
            .json({
              error: "A table with this name already exists on this floor",
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

  app.delete("/api/tables/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteTable(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Table not found" });
    }
    broadcastUpdate("table_deleted", { id: req.params.id });
    res.json({ success: true });
  });

  app.patch("/api/tables/:id/status", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { status } = req.body;
    const table = await st.updateTableStatus(req.params.id, status);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }
    broadcastUpdate("table_updated", table);
    res.json(table);
  });

  app.patch("/api/tables/:id/order", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { orderId } = req.body;
    const table = await st.updateTableOrder(req.params.id, orderId);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }
    broadcastUpdate("table_updated", table);
    res.json(table);
  });

  app.get("/api/menu", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const items = await st.getMenuItems();
    res.json(items);
  });

  app.get("/api/menu/categories", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const categoriesJson = await st.getSetting("menu_categories");
    const categories = categoriesJson ? JSON.parse(categoriesJson) : [];
    res.json({ categories });
  });

  app.get("/api/menu/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const item = await st.getMenuItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(item);
  });

  app.post("/api/menu", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertMenuItemSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const item = await st.createMenuItem(result.data);
    broadcastUpdate("menu_updated", item);
    res.json(item);
  });

  app.patch("/api/menu/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const item = await st.updateMenuItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    broadcastUpdate("menu_updated", item);
    res.json(item);
  });

  app.delete("/api/menu/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteMenuItem(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    broadcastUpdate("menu_deleted", { id: req.params.id });
    res.json({ success: true });
  });

  app.post("/api/menu/generate-quick-codes", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const items = await st.getMenuItems();
      const usedCodes = new Set<string>();
      const itemsNeedingCodes: typeof items = [];

      // First pass: collect existing codes and items that need codes
      for (const item of items) {
        if (item.quickCode) {
          usedCodes.add(item.quickCode);
        } else {
          itemsNeedingCodes.push(item);
        }
      }

      // Generate unique codes for items that need them
      const letters = "abcdefghijklmnopqrstuvwxyz";
      let updated = 0;

      for (const item of itemsNeedingCodes) {
        let found = false;
        for (
          let letterIdx = 0;
          letterIdx < letters.length && !found;
          letterIdx++
        ) {
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
        message: `Generated quick codes for ${updated} menu items`,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate quick codes",
        });
    }
  });

  app.post("/api/menu/seed-sample-recipes", requireAuth, async (req, res) => {
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
            { name: "Soy Sauce", quantity: "20", unit: "ml" },
          ],
        },
        {
          menuItemName: "Thai Basil Chicken (Starter)",
          ingredients: [
            { name: "Chicken Breast", quantity: "150", unit: "g" },
            { name: "Thai Basil", quantity: "15", unit: "g" },
            { name: "Red Chili", quantity: "2", unit: "pcs" },
            { name: "Garlic", quantity: "6", unit: "cloves" },
            { name: "Cooking Oil", quantity: "30", unit: "ml" },
            { name: "Soy Sauce", quantity: "20", unit: "ml" },
          ],
        },
        {
          menuItemName: "Thai Basil Prawns (Starter)",
          ingredients: [
            { name: "Prawns", quantity: "150", unit: "g" },
            { name: "Thai Basil", quantity: "15", unit: "g" },
            { name: "Red Chili", quantity: "2", unit: "pcs" },
            { name: "Garlic", quantity: "6", unit: "cloves" },
            { name: "Cooking Oil", quantity: "30", unit: "ml" },
            { name: "Soy Sauce", quantity: "20", unit: "ml" },
          ],
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
            { name: "Cooking Oil", quantity: "40", unit: "ml" },
          ],
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
            { name: "Cooking Oil", quantity: "40", unit: "ml" },
          ],
        },
      ];

      // First, delete all existing recipes for these menu items to avoid duplicates
      const existingRecipes = await st.getRecipes();
      for (const recipe of recipes) {
        const menuItem = (await st.getMenuItems()).find(
          (m) => m.name === recipe.menuItemName,
        );
        if (menuItem) {
          const oldRecipe = existingRecipes.find(
            (r) => r.menuItemId === menuItem.id,
          );
          if (oldRecipe) {
            await st.deleteRecipe(oldRecipe.id);
            console.log(`🗑️ Deleted old recipe for: ${menuItem.name}`);
          }
        }
      }

      let addedRecipes = 0;
      const inventoryItems = await st.getInventoryItems();
      const inventoryMap = new Map(
        inventoryItems.map((item) => [item.name.toLowerCase(), item]),
      );

      for (const recipe of recipes) {
        const menuItem = (await st.getMenuItems()).find(
          (m) => m.name === recipe.menuItemName,
        );
        if (!menuItem) {
          console.log(`Menu item not found: ${recipe.menuItemName}`);
          continue;
        }

        const recipeData = {
          menuItemId: menuItem.id,
          name: `Recipe for ${menuItem.name}`,
          ingredients: [] as any[],
        };

        for (const ing of recipe.ingredients) {
          const invItem = inventoryMap.get(ing.name.toLowerCase());
          if (invItem) {
            recipeData.ingredients.push({
              inventoryItemId: invItem.id,
              quantity: parseFloat(ing.quantity),
              unit: ing.unit,
            });
          }
        }

        if (recipe.ingredients.length > 0) {
          const createdRecipe = await st.createRecipe({
            menuItemId: menuItem.id,
          });
          console.log(
            `Created recipe for: ${menuItem.name} with ID: ${createdRecipe.id}`,
          );

          let addedIngredients = 0;
          // Now add ingredients to the recipe
          for (const ing of recipe.ingredients) {
            const invItem = inventoryMap.get(ing.name.toLowerCase());
            if (invItem) {
              try {
                await st.createRecipeIngredient({
                  recipeId: createdRecipe.id,
                  inventoryItemId: invItem.id,
                  quantity: String(ing.quantity),
                  unit: ing.unit,
                });
                addedIngredients++;
                console.log(
                  `  ✅ Added ingredient: ${ing.name} (ID: ${invItem.id}) - ${ing.quantity}${ing.unit}`,
                );
              } catch (ingError) {
                console.error(
                  `  ❌ Failed to add ingredient ${ing.name}:`,
                  ingError,
                );
              }
            } else {
              console.warn(
                `  ⚠️  Ingredient not found in inventory: ${ing.name}`,
              );
            }
          }

          if (addedIngredients > 0) {
            addedRecipes++;
            console.log(
              `✅ Recipe fully populated for: ${menuItem.name} (${addedIngredients} ingredients)`,
            );
          } else {
            console.warn(
              `⚠️  No ingredients were added to recipe for ${menuItem.name}`,
            );
          }
        } else {
          console.warn(
            `⚠️  No ingredients found for recipe ${recipe.menuItemName}`,
          );
        }
      }

      res.json({
        success: true,
        addedRecipes,
        message: `Seeded ${addedRecipes} sample recipes with all ingredients`,
      });
    } catch (error) {
      console.error("Error seeding recipes:", error);
      res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to seed recipes",
        });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const orders = await st.getOrders();
    res.json(orders);
  });

  app.get("/api/orders/active", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const orders = await st.getActiveOrders();
    const invoiceNumbers = await getDailyKotInvoiceNumbers(st, orders);
    const ordersWithInvoiceNumbers = orders.map((order) => ({
      ...order,
      invoiceNumber: invoiceNumbers.get(order.id),
    }));
    res.json(ordersWithInvoiceNumbers);
  });

  app.get("/api/orders/completed", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const orders = await st.getCompletedOrders();
    const invoiceNumbers = await getDailyKotInvoiceNumbers(st, orders);
    const ordersWithInvoiceNumbers = orders.map((order) => ({
      ...order,
      invoiceNumber: invoiceNumbers.get(order.id),
    }));
    res.json(ordersWithInvoiceNumbers);
  });

  app.get("/api/orders/delivery", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const orders = await st.getDeliveryOrders();
    res.json(orders);
  });

  // Dashboard aggregates computed from real stored data. The client passes its
  // UTC offset (minutes east of UTC) so "today" lines up with the browser.
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const tzEast = Number(req.query.tzOffset) || 0; // minutes east of UTC

    const startOfLocalDay = (instant: Date, daysBack = 0): number => {
      const localMs = instant.getTime() + tzEast * 60000 +
        Math.floor(daysBack) * 86400000;
      const localDayStartMs = Math.floor(localMs / 86400000) * 86400000;
      // Convert back to an absolute UTC instant.
      return localDayStartMs - tzEast * 60000;
    };

    const localHourOf = (instant: Date): number => {
      const localMs = instant.getTime() + tzEast * 60000;
      return Math.floor((localMs % 86400000) / 3600000);
    };

    try {
      const [
        orders,
        invoices,
        tables,
        menuItems,
      ] = await Promise.all([
        st.getOrders(),
        st.getInvoices(),
        st.getTables(),
        st.getMenuItems(),
      ]);

      const now = new Date();
      const todayStart = startOfLocalDay(now, 0);
      const yesterdayStart = startOfLocalDay(now, -1);

      const isToday = (d: Date) => new Date(d).getTime() >= todayStart;
      const isRange = (d: Date, s: number, e: number) => {
        const t = new Date(d).getTime();
        return t >= s && t < e;
      };
      const toMoney = (v: string | number) => Number(v) || 0;

      const todaysInvoices = invoices.filter((i) => isToday(i.createdAt));
      const yesterdaysInvoices = invoices.filter((i) =>
        isRange(i.createdAt, yesterdayStart, todayStart)
      );

      const todaySales = todaysInvoices.reduce(
        (s, i) => s + toMoney(i.total), 0
      );
      const yesterdaySales = yesterdaysInvoices.reduce(
        (s, i) => s + toMoney(i.total), 0
      );
      const salesChange = yesterdaySales > 0
        ? ((todaySales - yesterdaySales) / yesterdaySales) * 100
        : todaySales > 0 ? 100 : 0;

      // An order is counted on the dashboard only once it has an invoice.
      // Using invoices here keeps the count in sync when invoices are deleted.
      const todaysOrders = todaysInvoices;
      const yesterdaysOrders = yesterdaysInvoices;
      const ordersChange = yesterdaysOrders.length > 0
        ? ((todaysOrders.length - yesterdaysOrders.length) / yesterdaysOrders.length) * 100
        : todaysOrders.length > 0 ? 100 : 0;

      const distinctCust = (list: { customerPhone: string | null; customerName: string | null }[]) => {
        const set = new Set<string>();
        for (const o of list) {
          const key = (o.customerPhone || o.customerName || "").trim();
          if (key) set.add(key);
        }
        return set.size;
      };
      const todayCustomers = distinctCust(todaysOrders);
      const yesterdayCustomers = distinctCust(yesterdaysOrders);
      const customersChange = yesterdayCustomers > 0
        ? ((todayCustomers - yesterdayCustomers) / yesterdayCustomers) * 100
        : todayCustomers > 0 ? 100 : 0;

      const invoiceCountToday = todaysInvoices.length;
      const avgOrderValue = invoiceCountToday > 0
        ? todaySales / invoiceCountToday
        : todaysOrders.length > 0 ? todaySales / todaysOrders.length : 0;

      // Hourly buckets 9AM→8PM (matching the chart's 12 bars).
      const hourlyData = Array.from({ length: 12 }, (_, i) => {
        const hour = 9 + i;
        const hourOrders = todaysOrders.filter((o) => localHourOf(o.createdAt) === hour);
        const hourInvoices = todaysInvoices.filter((i2) => localHourOf(i2.createdAt) === hour);
        const label = hour <= 12 ? `${hour}AM` : `${hour - 12}PM`;
        return {
          hour: label,
          orders: hourOrders.length,
          revenue: hourInvoices.reduce((s, i2) => s + toMoney(i2.total), 0),
        };
      });

      // Weekly: current week Mon→Sun.
      const weekdayLabel = (d: Date) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[new Date(d).getUTCDay()];
      };
      const dayStartUtc = (offsetDays: number) => {
        const d = new Date(now);
        d.setUTCHours(0, 0, 0, 0);
        d.setUTCDate(d.getUTCDate() + offsetDays);
        return d.getTime();
      };
      const dow = new Date(now).getUTCDay();
      const weekStartKey = startOfLocalDay(now, -dow); // local Monday
      const weeklyData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        .map((day, index) => {
          const s = startOfLocalDay(now, -dow + index);
          const e = s + 86400000;
          const dayInvoices = invoices.filter((i) => isRange(i.createdAt, s, e));
          const dayOrders = orders.filter((o) => isRange(o.createdAt, s, e));
          return {
            day,
            sales: dayInvoices.reduce((sum, i) => sum + toMoney(i.total), 0),
            orders: dayOrders.length,
          };
        });

      // Invoice items are stored as JSON: [{name,quantity,price,isVeg}].
      const nameToCategory = new Map<string, string>();
      for (const m of menuItems) nameToCategory.set(m.name, m.category);

      const categoryAgg = new Map<string, number>();
      const itemAgg = new Map<string, { name: string; qty: number; revenue: number }>();
      for (const inv of invoices) {
        if (inv.status !== "Paid" && inv.paymentMode !== "paid") continue;
        let itemsArr: { name?: string; quantity?: number | string; price?: number | string }[] = [];
        try {
          itemsArr = JSON.parse(inv.items || "[]");
        } catch { itemsArr = []; }
        for (const it of itemsArr) {
          if (!it || typeof it.name !== "string") continue;
          const qty = Math.max(1, Number(it.quantity ?? 1) || 1);
          const price = Number(it.price ?? 0) || 0;
          const revenue = qty * price;
          const cat = nameToCategory.get(it.name) || "Other";
          categoryAgg.set(cat, (categoryAgg.get(cat) || 0) + revenue);
          const cur = itemAgg.get(it.name) || { name: it.name, qty: 0, revenue: 0 };
          cur.qty += qty;
          cur.revenue += revenue;
          itemAgg.set(it.name, cur);
        }
      }

      const categoryData = Array.from(categoryAgg.entries())
        .map(([name, value]) => ({ name, value: Math.round(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      const topItems = Array.from(itemAgg.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((t) => ({ name: t.name, orders: t.qty, revenue: t.revenue }));

      // Payment methods from paymentMode on paid invoices/orders.
      const paymentAgg = new Map<string, number>();
      for (const inv of todaysInvoices) {
        const mode = (inv.paymentMode || "other").toLowerCase();
        const key = ["cash", "card", "upi", "other"].includes(mode) ? mode : "other";
        paymentAgg.set(key, (paymentAgg.get(key) || 0) + toMoney(inv.total));
      }
      const paymentData = [
        { name: "Cash", value: paymentAgg.get("cash") || 0, color: "#10B981" },
        { name: "Card", value: paymentAgg.get("card") || 0, color: "#3B82F6" },
        { name: "UPI",  value: paymentAgg.get("upi")  || 0, color: "#F59E0B" },
        { name: "Other",value: paymentAgg.get("other") || 0, color: "#8B5CF6" },
      ].filter((p) => p.value > 0);

      // Quick stats.
      const completed = orders.filter((o) =>
        o.status === "completed" || o.status === "paid"
      ).length;
      const pending = orders.filter((o) =>
        !["completed", "paid"].includes(o.status)
      ).length;
      const tableToNumber = new Map(tables.map((t) => [t.id, t.tableNumber]));
      const occupiedTables = tables.filter((t) => t.status === "occupied" || !!t.currentOrderId).length;
      const orderById = new Map(orders.map((o) => [o.id, o]));
      const prepTimes = todaysOrders
        .filter((o) => o.completedAt || o.paidAt)
        .map((o) => {
          const end = new Date(o.completedAt || o.paidAt!).getTime();
          const start = new Date(o.createdAt).getTime();
          return Math.max(0, (end - start) / 60000);
        });
      const avgPrepTime = prepTimes.length > 0
        ? Math.round(prepTimes.reduce((s, m) => s + m, 0) / prepTimes.length)
        : 0;

      // Recent orders (Top 5 by creation time).
      const recentOrders = [...todaysOrders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .concat([...orders.filter((o) => !isToday(o.createdAt))].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
        .slice(0, 5)
        .map((o) => ({
          // Recent orders are invoice-backed records. Show the human-facing
          // invoice number instead of the internal invoice UUID, and resolve
          // the table through the source order relationship.
          invoiceNumber: o.invoiceNumber,
          table: o.tableNumber || tableToNumber.get(orderById.get(o.orderId)?.tableId || "") || "—",
          createdAt: o.createdAt,
          status: o.status,
          total: toMoney(o.total),
        }));

      res.json({
        todaySales,
        salesChange,
        todayOrders: todaysOrders.length,
        ordersChange,
        todayCustomers,
        customersChange,
        avgOrderValue,
        hourlyData,
        weeklyData,
        categoryData,
        paymentData,
        topItems,
        quickStats: {
          completed,
          pending,
          occupiedTables,
          totalTables: tables.length,
          avgPrepTime,
        },
        recentOrders,
      });
    } catch (error) {
      console.error("Error building dashboard stats:", error);
      res.status(500).json({ error: "Failed to load dashboard stats" });
    }
  });

  app.get("/api/delivery-persons", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const persons = await st.getDeliveryPersons();
    res.json(persons);
  });

  app.get("/api/delivery-persons/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const person = await st.getDeliveryPerson(req.params.id);
    if (!person) {
      return res.status(404).json({ error: "Delivery person not found" });
    }
    res.json(person);
  });

  app.post("/api/delivery-persons", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const person = await st.createDeliveryPerson(req.body);
      res.status(201).json(person);
    } catch (error) {
      res
        .status(400)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to create delivery person",
        });
    }
  });

  app.patch("/api/delivery-persons/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const person = await st.updateDeliveryPerson(req.params.id, req.body);
    if (!person) {
      return res.status(404).json({ error: "Delivery person not found" });
    }
    res.json(person);
  });

  app.delete("/api/delivery-persons/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteDeliveryPerson(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Delivery person not found" });
    }
    res.status(204).send();
  });

  app.patch("/api/orders/:id/assign-driver", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { deliveryPersonId } = req.body;

    const existingOrder = await st.getOrder(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (existingOrder.orderType !== "delivery") {
      return res
        .status(400)
        .json({ error: "Can only assign drivers to delivery orders" });
    }

    if (deliveryPersonId) {
      const driver = await st.getDeliveryPerson(deliveryPersonId);
      if (!driver) {
        return res.status(400).json({ error: "Delivery person not found" });
      }
    }

    const order = await st.assignDeliveryPerson(
      req.params.id,
      deliveryPersonId,
    );
    if (!order) {
      return res.status(500).json({ error: "Failed to assign driver" });
    }
    res.json(order);
  });

  app.get("/api/orders/:id/invoice/pdf", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const order = await st.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const invoices = await st.getInvoices();
      const invoice = invoices.find((inv) => inv.orderId === req.params.id);

      if (!invoice) {
        return res
          .status(404)
          .json({ error: "Invoice not found for this order" });
      }

      const orderItems = (await st.getOrderItems(req.params.id))
        .filter(item => item.status !== "non_kot");

      const pdfBuffer = generateInvoicePDF({
        invoice,
        order,
        orderItems,
        restaurantName: "BUNGLE",
        restaurantAddress: "123 Main Street, City, State 12345",
        restaurantPhone: "+1 (555) 123-4567",
        restaurantGSTIN: "GSTIN1234567890",
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF invoice" });
    }
  });

  app.get("/api/orders/:id/kot/pdf", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const order = await st.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const orderItems = (await st.getOrderItems(req.params.id))
        .filter(item => item.status !== "non_kot");
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
        tableNumber: tableInfo?.tableNumber || undefined,
        floorName: tableInfo?.floorId
          ? (await st.getFloor(tableInfo.floorId))?.name || undefined
          : undefined,
        restaurantName: "BUNGLE",
        isUpdated: (order.kotCount ?? 0) > 1,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="KOT-${order.id.substring(0, 8)}.pdf"`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating KOT PDF:", error);
      res.status(500).json({ error: "Failed to generate KOT PDF" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const order = await st.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  });

  app.get("/api/orders/:id/items", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const items = await st.getOrderItems(req.params.id);
    const menuItems = await st.getMenuItems();
    for (const item of items) {
      const menuItem = menuItems.find(menu => menu.id === item.menuItemId);
      if (menuItem?.kotEnabled === false && item.status !== "non_kot") {
        item.status = "non_kot";
        await st.updateOrderItemStatus(item.id, "non_kot");
      }
    }
    res.json(items);
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
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

    // Publish POS-created table orders so the digital menu can show the
    // ongoing order. This is best-effort and never blocks POS order creation.
    externalOrdersSync.mirrorPOSOrder(order.id).catch(() => {});
    broadcastUpdate("order_created", order);
    res.json(order);
  });

  app.post("/api/orders/:id/items", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertOrderItemSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    console.log("[Server] Creating order item for order:", req.params.id);
    const menuItem = await st.getMenuItem(result.data.menuItemId);
    const item = await st.createOrderItem({
      ...result.data,
      status: menuItem?.kotEnabled === false ? "non_kot" : result.data.status,
    });

    const orderItems = await st.getOrderItems(req.params.id);
    const total = orderItems.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    await st.updateOrderTotal(req.params.id, total.toFixed(2));

    const order = await st.getOrder(req.params.id);
    if (order && order.tableId) {
      // Table is always just "occupied" while it has an active order
      await st.updateTableStatus(order.tableId, "occupied");

      const updatedTable = await st.getTable(order.tableId);
      if (updatedTable) {
        broadcastUpdate("table_updated", updatedTable);
      }
    }

    console.log(
      "[Server] Broadcasting order_item_added for orderId:",
      req.params.id,
    );
    broadcastUpdate("order_item_added", { orderId: req.params.id, item });
    // Backward-sync: add this item to the external DB order if applicable
    externalOrdersSync
      .syncItemAdd(req.params.id, {
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        notes: item.notes ?? null,
        isVeg: item.isVeg,
      })
      .catch(() => {});
    res.json(item);
  });

  app.patch("/api/orders/:id/status", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { status } = req.body;
    const order = await st.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    externalOrdersSync.mirrorPOSOrder(order.id).catch(() => {});
    broadcastUpdate("order_updated", order);
    res.json(order);
  });

  app.post("/api/orders/:id/complete", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const order = await st.completeOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.tableId) {
      await st.updateTableOrder(order.tableId, null);
      await st.updateTableStatus(order.tableId, "free");
    }

    externalOrdersSync.mirrorPOSOrder(order.id).catch(() => {});
    broadcastUpdate("order_completed", order);
    res.json(order);
  });

  app.post("/api/orders/:id/kot", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = orderActionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const allOrderItems = await st.getOrderItems(req.params.id);
    const menuItems = await st.getMenuItems();
    for (const item of allOrderItems) {
      const menuItem = menuItems.find(menu => menu.id === item.menuItemId);
      if (menuItem?.kotEnabled === false && item.status !== "non_kot") {
        item.status = "non_kot";
        await st.updateOrderItemStatus(item.id, "non_kot");
      }
    }
    console.log("[Server] Sending order to kitchen:", req.params.id);
    const order = await st.updateOrderStatus(req.params.id, "sent_to_kitchen");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    externalOrdersSync.mirrorPOSOrder(order.id).catch(() => {});
    const pendingKotItems = (await st.getOrderItems(req.params.id))
      .filter((item) => item.status === "new");
    if (pendingKotItems.length === 0) {
      return res.status(400).json({ error: "There are no KOT items in this order" });
    }
    const { order: orderWithInvoice, invoiceNumber } =
      await ensureDailyKotInvoiceNumber(st, order);
    // POS-created items do not always carry a batch until the KOT is sent.
    // Assign the pending items to this KOT before incrementing the count so
    // add-ons get their own ticket just like Digital Menu orders.
    const kotBatch = (order.kotCount ?? 0) + 1;
    await st.assignMissingKotBatch(req.params.id, kotBatch);
    // Track how many times KOT has been sent — used to show "UPDATED" badge
    const updatedOrder = (await st.incrementKotCount(req.params.id)) ?? orderWithInvoice;
    console.log(
      "[Server] Broadcasting order_updated for KOT, orderId:",
      updatedOrder.id,
      "status:",
      updatedOrder.status,
      "kotCount:",
      updatedOrder.kotCount,
    );
    broadcastUpdate("order_updated", updatedOrder);

    // Enqueue print jobs for every autoPrint KOT printer
    (async () => {
      try {
        const kotPrinters = (await mongoStorage.getPrinters()).filter(
          (p) => p.type === "KOT" && p.autoPrint,
        );
        if (kotPrinters.length === 0) return;
        const { buildKOTEscPos } = await import("./utils/escpos");
        const orderItems = (await st.getOrderItems(req.params.id)).filter((item) => item.status === "new");
        let tableNumber: string | undefined;
        let floorName: string | undefined;
        if (updatedOrder.tableId) {
          const tbl = await st.getTable(updatedOrder.tableId);
          tableNumber = tbl?.tableNumber;
          if (tbl?.floorId) floorName = (await st.getFloor(tbl.floorId))?.name;
        }
        const kotSequence = await getDailyKotSequence(st, updatedOrder);
        const escData = buildKOTEscPos({
          order: updatedOrder,
          items: orderItems,
          tableNumber,
          floorName,
          kotNumber: invoiceNumber,
          sequence: String(kotSequence),
          isUpdated: (updatedOrder.kotCount ?? 0) > 1,
        });
        const escBase64 = Buffer.from(escData).toString("base64");
        for (const printer of kotPrinters) {
          await mongoStorage.createPrintJob({
            orderId: updatedOrder.id,
            kotNumber: invoiceNumber,
            printerIp: printer.ip,
            printerPort: printer.port,
            printerName: printer.name,
            kotBatch,
            dedupeKey: `${updatedOrder.id}:${invoiceNumber}:${kotBatch}:${printer.name}`,
            escposData: escBase64,
            status: "pending",
          });
          console.log(
            `[PrintJob] Queued ${invoiceNumber} → ${printer.ip}:${printer.port}`,
          );
        }
        await Promise.all(orderItems.map((item) => st.updateOrderItemStatus(item.id, "sent_to_kitchen")));
      } catch (e) {
        console.error("[PrintJob] Failed to enqueue:", e);
      }
    })();

    res.json({ order: updatedOrder, shouldPrint: result.data.print });
  });

  app.post("/api/orders/:id/save", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = orderActionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const order = await st.updateOrderStatus(req.params.id, "saved");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    externalOrdersSync.mirrorPOSOrder(order.id).catch(() => {});

    let invoice = null;
    if (result.data.print && result.data.printVia !== "qz") {
      const orderItems = await st.getOrderItems(req.params.id);
      const subtotal = orderItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0,
      );
      const taxSettings = await getTaxSettings(st);
      const effectiveTaxRate = result.data.taxRate ?? taxSettings.taxRate;
      const effectiveServiceCharge =
        result.data.serviceCharge ?? taxSettings.serviceCharge;
      const { tax, cgst, sgst, serviceCharge, total } = computeBillTotals(
        subtotal,
        effectiveTaxRate,
        effectiveServiceCharge,
      );

      let tableInfo = null;
      if (order.tableId) {
        tableInfo = await st.getTable(order.tableId);
      }

      // Keep the invoice number anchored to this ongoing table/order.  KOTs
      // already use this lookup; billing must use it too so a later Save/Bill
      // action cannot replace the number with another order's daily sequence.
      const { invoiceNumber } = await ensureDailyKotInvoiceNumber(st, order);

      const invoiceItemsData = orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        isVeg: item.isVeg,
        notes: item.notes || undefined,
      }));

      invoice = await upsertInvoice(st, order.id, {
        invoiceNumber,
        orderId: order.id,
        tableNumber: tableInfo?.tableNumber || null,
        floorName: tableInfo?.floorId
          ? (await st.getFloor(tableInfo.floorId))?.name || null
          : null,
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
        notes: null,
      });

      broadcastUpdate("invoice_created", invoice);
      // Queue thermal bill print if any Bill printers are configured
      await queueBillPrintJobs({
        invoice,
        orderType: order.orderType,
        taxSettings,
      });
    }

    broadcastUpdate("order_updated", order);
    res.json({ order, invoice, shouldPrint: result.data.print });
  });

  app.post("/api/orders/:id/bill", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = orderActionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const order = await st.billOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    externalOrdersSync.mirrorPOSOrder(order.id).catch(() => {});

    const orderItems = await st.getOrderItems(req.params.id);

    const subtotal = orderItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );
    const taxSettings = await getTaxSettings(st);
    const effectiveTaxRate = result.data.taxRate ?? taxSettings.taxRate;
    const effectiveServiceCharge =
      result.data.serviceCharge ?? taxSettings.serviceCharge;
    const { tax, cgst, sgst, serviceCharge, total } = computeBillTotals(
      subtotal,
      effectiveTaxRate,
      effectiveServiceCharge,
    );

    let tableInfo = null;
    if (order.tableId) {
      tableInfo = await st.getTable(order.tableId);
    }

    // Reuse the number already assigned to this order/table instead of
    // recalculating it from the current daily order sequence.
    const { invoiceNumber } = await ensureDailyKotInvoiceNumber(st, order);

    const invoiceItemsData = orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      isVeg: item.isVeg,
      notes: item.notes || undefined,
    }));

    const invoice = await upsertInvoice(st, order.id, {
      invoiceNumber,
      orderId: order.id,
      tableNumber: tableInfo?.tableNumber || null,
      floorName: tableInfo?.floorId
        ? (await st.getFloor(tableInfo.floorId))?.name || null
        : null,
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
      notes: null,
    });

    broadcastUpdate("order_updated", order);
    broadcastUpdate("invoice_created", invoice);
    if (result.data.print && result.data.printVia !== "qz") {
      await queueBillPrintJobs({
        invoice,
        orderType: order.orderType,
        taxSettings: await getTaxSettings(st),
      });
    }
    res.json({ order, invoice, shouldPrint: result.data.print });
  });

  app.post("/api/orders/:id/checkout", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = checkoutSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const order = await st.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // A table can hold several active orders at once (each person's Digital
    // Menu order becomes its own POS order so they keep separate KOTs). On
    // checkout the whole cart must be settled together in one bill, so gather
    // every active order on the same table and check them all out at once.
    const ACTIVE_STATUSES = ["sent_to_kitchen", "ready_to_bill", "billed"];
    let ordersToSettle = [order];
    if (order.tableId) {
      const allOrders = await st.getOrders();
      ordersToSettle = allOrders.filter(
        (o) =>
          o.tableId === order.tableId &&
          (ACTIVE_STATUSES.includes(o.status) || o.id === order.id),
      );
      // Keep deterministic ordering so the invoice/primary order is predictable.
      ordersToSettle.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    // Aggregate items across every order being settled in this checkout.
    const orderItems: OrderItem[] = [];
    for (const ord of ordersToSettle) {
      const ordItems = await st.getOrderItems(ord.id);
      orderItems.push(...ordItems);
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );
    const taxSettings = await getTaxSettings(st);
    const effectiveTaxRate = result.data.taxRate ?? taxSettings.taxRate;
    const effectiveServiceCharge =
      result.data.serviceCharge ?? taxSettings.serviceCharge;
    const { tax, cgst, sgst, serviceCharge, total } = computeBillTotals(
      subtotal,
      effectiveTaxRate,
      effectiveServiceCharge,
    );

    if (result.data.splitPayments && result.data.splitPayments.length > 0) {
      const splitSum = result.data.splitPayments.reduce(
        (sum, split) => sum + split.amount,
        0,
      );
      const tolerance = 0.01;
      if (Math.abs(splitSum - total) > tolerance) {
        return res.status(400).json({
          error: "Split payment amounts must equal the total bill",
          splitSum,
          total,
        });
      }
      for (const split of result.data.splitPayments) {
        if (split.amount <= 0) {
          return res
            .status(400)
            .json({ error: "Split payment amounts must be positive" });
        }
      }
    }

    const primaryOrder = order;

    // Resolve this before checkout changes the orders to "completed".  The
    // stable lookup can then still see an existing invoice on an active
    // sibling order at the same table.
    const { invoiceNumber } = await ensureDailyKotInvoiceNumber(st, primaryOrder);

    // Check out every order settled in this bill. The primary order is the
    // first (earliest) of the set; it carries the combined invoice while all
    // sibling orders are marked completed at the same time.
    const checkedOutOrders = [];
    for (const ord of ordersToSettle) {
      const settled = await st.checkoutOrder(
        ord.id,
        result.data.paymentMode,
      );
      if (settled) checkedOutOrders.push(settled);
    }
    if (checkedOutOrders.length === 0) {
      return res.status(500).json({ error: "Failed to checkout order" });
    }

    let tableInfo = null;
    if (primaryOrder.tableId) {
      tableInfo = await st.getTable(primaryOrder.tableId);
      await st.updateTableOrder(primaryOrder.tableId, null);
      await st.updateTableStatus(primaryOrder.tableId, "free");
    }

    // Update customer's table status to "free" for digital menu orders
    for (const settled of checkedOutOrders) {
      if (settled.customerPhone) {
        await digitalMenuSync.updateCustomerTableStatus(
          settled.customerPhone,
          "free",
        );
      }
    }

    const invoiceItemsData = orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      isVeg: item.isVeg,
      notes: item.notes || undefined,
    }));

    const consolidatedCustomerName = checkedOutOrders
      .map((o) => o.customerName)
      .find(Boolean)
      === undefined
      ? null
      : checkedOutOrders.map((o) => o.customerName).find(Boolean);
    const customerName = consolidatedCustomerName ?? primaryOrder.customerName;
    const customerPhone =
      checkedOutOrders.map((o) => o.customerPhone).find(Boolean) ??
      primaryOrder.customerPhone;

    const invoice = await upsertInvoice(st, primaryOrder.id, {
      invoiceNumber,
      orderId: primaryOrder.id,
      tableNumber: tableInfo?.tableNumber || null,
      floorName: tableInfo?.floorId
        ? (await st.getFloor(tableInfo.floorId))?.name || null
        : null,
      customerName,
      customerPhone,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      serviceCharge: serviceCharge.toFixed(2),
      discount: "0",
      total: total.toFixed(2),
      paymentMode: result.data.paymentMode || "cash",
      splitPayments: result.data.splitPayments
        ? JSON.stringify(result.data.splitPayments)
        : null,
      status: "Paid",
      items: JSON.stringify(invoiceItemsData),
      notes: null,
    });

    // Auto-deduct inventory for every order settled in this checkout
    for (const settled of checkedOutOrders) {
      try {
        await st.deductInventoryForOrder(settled.id);
        broadcastUpdate("inventory_updated", { orderId: settled.id });
      } catch (error) {
        console.error("Error deducting inventory for order:", error);
      }
    }

    for (const settled of checkedOutOrders) {
      broadcastUpdate("order_paid", settled);
      // Give the shared Orders mirror a short chance to receive the terminal
      // state before replying, while keeping external MongoDB from blocking
      // payment completion if it is unavailable.
      await Promise.race([
        externalOrdersSync.mirrorPOSOrder(settled.id),
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      ]).catch(() => {});
    }
    broadcastUpdate("invoice_created", invoice);
    if (result.data.print) {
      await queueBillPrintJobs({
        invoice,
        orderType: primaryOrder.orderType,
        taxSettings: await getTaxSettings(st),
      });
    }
    res.json({
      order: checkedOutOrders[0],
      orders: checkedOutOrders,
      invoice,
      shouldPrint: result.data.print,
    });
  });

  app.get("/api/invoices/:id/pdf", requireAuth, async (req, res) => {
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
        restaurantGSTIN: taxSettings.gstEnabled ? taxSettings.gstNumber : "",
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      res.status(500).json({ error: "Failed to generate invoice PDF" });
    }
  });

  // Reprint an existing customer bill to the thermal printer(s), after an
  // edit or whenever an extra copy is needed.
  app.post("/api/invoices/:id/reprint", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const invoice = await st.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const order = await st.getOrder(invoice.orderId);
      if (order && order.tableId) {
        const tbl = await st.getTable(order.tableId);
        if (tbl?.floorId) {
          const floor = await st.getFloor(tbl.floorId);
          if (floor) invoice.floorName = floor.name;
        }
      }

      await queueBillPrintJobs({
        invoice,
        orderType: order?.orderType,
        taxSettings: await getTaxSettings(st),
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error reprinting invoice:", error);
      res.status(500).json({ error: "Failed to reprint invoice" });
    }
  });

  app.patch("/api/order-items/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { quantity, notes, name } = req.body;
    const data: Partial<{
      quantity: number;
      notes: string | null;
      name: string;
    }> = {};
    if (quantity !== undefined) data.quantity = quantity;
    if (notes !== undefined) data.notes = notes;
    if (name !== undefined) data.name = name;
    const item = await st.updateOrderItem(req.params.id, data);
    if (!item) return res.status(404).json({ error: "Order item not found" });
    const orderItems = await st.getOrderItems(item.orderId);
    const total = orderItems.reduce(
      (s, i) => s + parseFloat(i.price) * i.quantity,
      0,
    );
    await st.updateOrderTotal(item.orderId, total.toFixed(2));
    broadcastUpdate("order_item_updated", item);
    // Backward-sync: reflect quantity/notes change in external DB if applicable
    externalOrdersSync
      .syncItemUpdate(item.orderId, item.name, data)
      .catch(() => {});
    res.json(item);
  });

  app.delete("/api/orders/:id", requireAuth, async (req, res) => {
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
    // Backward-sync: remove from external DB if this order came from there
    externalOrdersSync.deleteExternalOrder(req.params.id).catch(() => {});
    res.json({ success: true });
  });

  app.patch("/api/order-items/:id/status", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { status } = req.body;
    const item = await st.updateOrderItemStatus(req.params.id, status);
    if (!item) {
      return res.status(404).json({ error: "Order item not found" });
    }

    const order = await st.getOrder(item.orderId);
    if (order && order.tableId) {
      const allItems = await st.getOrderItems(item.orderId);
      // Table is always just "occupied" while it has an active order
      await st.updateTableStatus(order.tableId, "occupied");
      const updatedTable = await st.getTable(order.tableId);
      if (updatedTable) {
        broadcastUpdate("table_updated", updatedTable);
      }
    }

    // Sync table status to digital menu customer if this is a digital menu order
    if (order && order.customerPhone) {
      await digitalMenuSync.syncTableStatusFromPOSOrder(item.orderId);
    }

    broadcastUpdate("order_item_updated", item);
    res.json(item);
  });

  app.delete("/api/order-items/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const item = await st.getOrderItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Order item not found" });
    }
    const itemsBeforeDelete = await st.getOrderItems(item.orderId);
    const deletingLastItem = itemsBeforeDelete.length === 1;

    // Remove the external source before removing the last local item. This
    // prevents the external poller from seeing the old item list and
    // resurrecting the just-deleted order/item as a new KOT.
    if (deletingLastItem) {
      await externalOrdersSync.deleteExternalOrder(item.orderId);
    }
    // For non-final items, update the external source before reducing the
    // local item count. Otherwise the external poller can briefly observe
    // more items than POS and recreate the item as a fresh KOT.
    if (!deletingLastItem) {
      await externalOrdersSync.syncItemDelete(item.orderId, item.name);
    }

    // Prevent a queued or leased QZ job from printing after its KOT is deleted.
    // New jobs include the batch in their dedupe key; for legacy jobs without
    // that key, cancelPrintJobsForOrderBatch safely falls back to the order.
    await mongoStorage.cancelPrintJobsForOrderBatch(
      item.orderId,
      typeof (item as any).kotBatch === "number" ? (item as any).kotBatch : null,
    );

    const success = await st.deleteOrderItem(req.params.id);
    if (!success) {
      return res.status(500).json({ error: "Failed to delete order item" });
    }

    const orderItems = await st.getOrderItems(item.orderId);
    const total = orderItems.reduce((sum, orderItem) => {
      return sum + parseFloat(orderItem.price) * orderItem.quantity;
    }, 0);

    await st.updateOrderTotal(item.orderId, total.toFixed(2));

    // Removing the last item removes the active order from the table as well.
    // This is important when a KOT batch is deleted from the KOT screen:
    // otherwise the table remains occupied with an empty order.
    if (orderItems.length === 0) {
      const emptyOrder = await st.getOrder(item.orderId);
      if (emptyOrder?.tableId) {
        await st.updateTableOrder(emptyOrder.tableId, null);
        await st.updateTableStatus(emptyOrder.tableId, "free");
        const updatedTable = await st.getTable(emptyOrder.tableId);
        if (updatedTable) broadcastUpdate("table_updated", updatedTable);
      }
      await st.deleteOrder(item.orderId);
      broadcastUpdate("order_updated", { id: item.orderId, deleted: true });
    }

    broadcastUpdate("order_item_deleted", {
      id: req.params.id,
      orderId: item.orderId,
    });
    res.json({ success: true });
  });

  app.get("/api/inventory", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const items = await st.getInventoryItems();
    res.json(items);
  });

  app.post("/api/inventory", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertInventoryItemSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const item = await st.createInventoryItem(result.data);
    res.json(item);
  });

  app.patch("/api/inventory/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { quantity } = req.body;
    const item = await st.updateInventoryQuantity(req.params.id, quantity);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.json(item);
  });

  app.get("/api/invoices", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const invoices = await st.getInvoices();
    res.json(invoices);
  });

  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const invoice = await st.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(invoice);
  });

  app.get(
    "/api/invoices/number/:invoiceNumber",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      const invoice = await st.getInvoiceByNumber(req.params.invoiceNumber);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    },
  );

  app.post("/api/invoices", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertInvoiceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const invoice = await st.createInvoice(result.data);
    broadcastUpdate("invoice_created", invoice);
    res.json(invoice);
  });

  app.patch("/api/invoices/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const invoice = await st.updateInvoice(req.params.id, req.body);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    broadcastUpdate("invoice_updated", invoice);
    res.json(invoice);
  });

  app.delete("/api/invoices/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteInvoice(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    broadcastUpdate("invoice_deleted", { id: req.params.id });
    res.json({ success: true });
  });

  app.get("/api/reservations", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const reservations = await st.getReservations();
    res.json(reservations);
  });

  app.get("/api/reservations/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const reservation = await st.getReservation(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    res.json(reservation);
  });

  app.get("/api/reservations/table/:tableId", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const reservations = await st.getReservationsByTable(req.params.tableId);
    res.json(reservations);
  });

  app.post("/api/reservations", requireAuth, async (req, res) => {
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
        JSON.stringify(result.error, null, 2),
      );
      return res.status(400).json({ error: result.error });
    }

    console.log("Validated data:", result.data);

    const existingReservations = await st.getReservationsByTable(
      result.data.tableId,
    );
    if (existingReservations.length > 0) {
      return res
        .status(409)
        .json({ error: "This table already has an active reservation" });
    }

    const reservation = await st.createReservation(result.data);
    console.log("Created reservation:", reservation);

    const table = await st.getTable(reservation.tableId);
    if (table && table.status === "free") {
      const updatedTable = await st.updateTableStatus(
        reservation.tableId,
        "reserved",
      );
      if (updatedTable) {
        broadcastUpdate("table_updated", updatedTable);
      }
    }
    broadcastUpdate("reservation_created", reservation);
    res.json(reservation);
  });

  app.patch("/api/reservations/:id", requireAuth, async (req, res) => {
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
        return res
          .status(409)
          .json({
            error: "The destination table already has an active reservation",
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
        if (
          oldTable &&
          oldTable.status === "reserved" &&
          !oldTable.currentOrderId
        ) {
          const updatedOldTable = await st.updateTableStatus(
            oldTableId,
            "free",
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
          "reserved",
        );
        if (updatedNewTable) {
          broadcastUpdate("table_updated", updatedNewTable);
        }
      }
    }

    if (req.body.status === "cancelled") {
      const tableReservations = await st.getReservationsByTable(
        reservation.tableId,
      );
      if (tableReservations.length === 0) {
        const table = await st.getTable(reservation.tableId);
        if (table && table.status === "reserved" && !table.currentOrderId) {
          const updatedTable = await st.updateTableStatus(
            reservation.tableId,
            "free",
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

  app.delete("/api/reservations/:id", requireAuth, async (req, res) => {
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
      reservation.tableId,
    );
    if (tableReservations.length === 0) {
      const table = await st.getTable(reservation.tableId);
      if (table && table.status === "reserved" && !table.currentOrderId) {
        const updatedTable = await st.updateTableStatus(
          reservation.tableId,
          "free",
        );
        if (updatedTable) {
          broadcastUpdate("table_updated", updatedTable);
        }
      }
    }
    broadcastUpdate("reservation_deleted", { id: req.params.id });
    res.json({ success: true });
  });

  app.post("/api/admin/clear-data", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const { types = ["all"] } = req.body;
      const cleared: string[] = [];

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

  app.get("/api/customers", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customers = await st.getCustomers();
    res.json(customers);
  });

  app.get("/api/customers/:id/stats", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customer = await st.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const invoices = await st.getInvoices();
    const normalisePhone = (value: string | null | undefined) =>
      (value || "").replace(/\D/g, "");
    const customerPhone = normalisePhone(customer.phone);
    const customerName = customer.name.trim().toLowerCase();

    // Invoice customer details are captured at checkout and are the source
    // of truth for customer spending. Do not require the linked order to
    // repeat the phone number; external and older orders may not contain it.
    const customerInvoices = invoices.filter((inv) => {
      const invoicePhone = normalisePhone(inv.customerPhone);
      const invoiceName = (inv.customerName || "").trim().toLowerCase();
      return (customerPhone && invoicePhone === customerPhone) ||
        (!invoicePhone && invoiceName === customerName);
    });
    const totalOrders = customerInvoices.length;
    const actualTotalSpent = customerInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total || "0"),
      0,
    );

    const lastInvoice = customerInvoices.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

    res.json({
      totalOrders,
      totalSpent: actualTotalSpent,
      lastVisit: lastInvoice ? lastInvoice.createdAt : customer.createdAt,
    });
  });

  app.get("/api/customers/phone/:phone", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customer = await st.getCustomerByPhone(req.params.phone);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  });

  app.get("/api/customers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customer = await st.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  });

  app.post("/api/customers", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertCustomerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const existingCustomer = await st.getCustomerByPhone(result.data.phone);
    if (existingCustomer) {
      return res
        .status(409)
        .json({
          error: "Customer with this phone number already exists",
          customer: existingCustomer,
        });
    }
    const customer = await st.createCustomer(result.data);
    broadcastUpdate("customer_created", customer);
    res.json(customer);
  });

  app.patch("/api/customers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const customer = await st.updateCustomer(req.params.id, req.body);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    broadcastUpdate("customer_updated", customer);
    res.json(customer);
  });

  app.delete("/api/customers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteCustomer(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Customer not found" });
    }
    broadcastUpdate("customer_deleted", { id: req.params.id });
    res.json({ success: true });
  });

  app.get("/api/feedbacks", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const feedbacks = await st.getFeedbacks();
    res.json(feedbacks);
  });

  app.get("/api/feedbacks/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const feedback = await st.getFeedback(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    res.json(feedback);
  });

  app.post("/api/feedbacks", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const result = insertFeedbackSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const feedback = await st.createFeedback(result.data);
    broadcastUpdate("feedback_created", feedback);
    res.json(feedback);
  });

  app.delete("/api/feedbacks/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const success = await st.deleteFeedback(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    broadcastUpdate("feedback_deleted", { id: req.params.id });
    res.json({ success: true });
  });

  app.get("/api/settings/mongodb-uri", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const uri = await st.getSetting("mongodb_uri");
    res.json({ uri: uri || null, hasUri: !!uri });
  });

  app.post("/api/settings/mongodb-uri", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const { uri } = req.body;
    if (!uri || typeof uri !== "string") {
      return res.status(400).json({ error: "MongoDB URI is required" });
    }
    await st.setSetting("mongodb_uri", uri);
    res.json({ success: true });
  });

  app.get("/api/settings/tax", requireAuth, async (req, res) => {
    const st = getStorage(req);
    const settings = await getTaxSettings(st);
    res.json(settings);
  });

  const taxSettingsSchema = z.object({
    taxRate: z.number().min(0).max(100),
    serviceCharge: z.number().min(0).max(100),
    gstEnabled: z.boolean(),
    gstNumber: z.string().optional().default(""),
  });

  app.post("/api/settings/tax", requireAuth, async (req, res) => {
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
      st.setSetting("gst_number", gstNumber),
    ]);
    res.json({ taxRate, serviceCharge, gstEnabled, gstNumber });
  });

  app.post("/api/menu/sync-from-mongodb", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const mongoUri = await st.getSetting("mongodb_uri");
      if (!mongoUri) {
        return res
          .status(400)
          .json({ error: "MongoDB URI not configured. Please set it first." });
      }

      const { databaseName } = req.body;
      const { items, categories } = await fetchMenuItemsFromMongoDB(
        mongoUri,
        databaseName,
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
        items: createdItems,
      });
    } catch (error) {
      console.error("Error syncing from MongoDB:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync from MongoDB",
      });
    }
  });

  // ==================== INVENTORY MANAGEMENT API ROUTES ====================

  // Inventory Items
  app.get("/api/inventory", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      let items = await st.getInventoryItems();

      // Apply search filter
      if (req.query.search) {
        const search = req.query.search.toString().toLowerCase();
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search),
        );
      }

      // Apply category filter
      if (req.query.category) {
        const category = req.query.category.toString();
        items = items.filter((item) => item.category === category);
      }

      // Apply sorting
      if (req.query.sortBy) {
        const sortBy = req.query.sortBy.toString();
        if (sortBy === "name") {
          items.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "stock") {
          items.sort(
            (a, b) => parseFloat(a.currentStock) - parseFloat(b.currentStock),
          );
        } else if (sortBy === "lowStock") {
          items = items.filter(
            (item) =>
              parseFloat(item.currentStock) <= parseFloat(item.minStock),
          );
        }
      }

      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch inventory",
        });
    }
  });

  app.get("/api/inventory/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const item = await st.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch inventory item",
        });
    }
  });

  app.post("/api/inventory", requireAuth, async (req, res) => {
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
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to create inventory item",
        });
    }
  });

  app.patch("/api/inventory/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const item = await st.updateInventoryItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      broadcastUpdate("inventory_updated", item);
      res.json(item);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to update inventory item",
        });
    }
  });

  app.delete("/api/inventory/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deleteInventoryItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      broadcastUpdate("inventory_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete inventory item",
        });
    }
  });

  // Recipes & Ingredients
  app.get(
    "/api/recipes/menu-item/:menuItemId",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const recipe = await st.getRecipeByMenuItemId(req.params.menuItemId);
        if (!recipe) {
          return res
            .status(404)
            .json({ error: "Recipe not found for this menu item" });
        }

        const ingredients = await st.getRecipeIngredients(recipe.id);
        const ingredientsWithDetails = await Promise.all(
          ingredients.map(async (ingredient) => {
            const inventoryItem = await st.getInventoryItem(
              ingredient.inventoryItemId,
            );
            return {
              ...ingredient,
              inventoryItem,
            };
          }),
        );

        res.json({
          recipe,
          ingredients: ingredientsWithDetails,
        });
      } catch (error) {
        res
          .status(500)
          .json({
            error:
              error instanceof Error ? error.message : "Failed to fetch recipe",
          });
      }
    },
  );

  app.post("/api/recipes", requireAuth, async (req, res) => {
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
      res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to create recipe",
        });
    }
  });

  app.post(
    "/api/recipes/:recipeId/ingredients",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const bodySchema = insertRecipeIngredientSchema.omit({
          recipeId: true,
        });
        const result = bodySchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }
        const ingredient = await st.createRecipeIngredient({
          ...result.data,
          recipeId: req.params.recipeId,
        });
        broadcastUpdate("recipe_ingredient_added", ingredient);
        res.json(ingredient);
      } catch (error) {
        res
          .status(500)
          .json({
            error:
              error instanceof Error
                ? error.message
                : "Failed to add recipe ingredient",
          });
      }
    },
  );

  app.patch(
    "/api/recipes/:recipeId/ingredients/:id",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const ingredient = await st.updateRecipeIngredient(
          req.params.id,
          req.body,
        );
        if (!ingredient) {
          return res.status(404).json({ error: "Recipe ingredient not found" });
        }
        broadcastUpdate("recipe_ingredient_updated", ingredient);
        res.json(ingredient);
      } catch (error) {
        res
          .status(500)
          .json({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update recipe ingredient",
          });
      }
    },
  );

  app.delete(
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
        res
          .status(500)
          .json({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete recipe ingredient",
          });
      }
    },
  );

  app.delete("/api/recipes/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deleteRecipe(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      broadcastUpdate("recipe_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to delete recipe",
        });
    }
  });

  // Suppliers
  app.get("/api/suppliers", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const suppliers = await st.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch suppliers",
        });
    }
  });

  app.post("/api/suppliers", requireAuth, async (req, res) => {
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
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to create supplier",
        });
    }
  });

  app.patch("/api/suppliers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const supplier = await st.updateSupplier(req.params.id, req.body);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      broadcastUpdate("supplier_updated", supplier);
      res.json(supplier);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to update supplier",
        });
    }
  });

  app.delete("/api/suppliers/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deleteSupplier(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      broadcastUpdate("supplier_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete supplier",
        });
    }
  });

  // Purchase Orders
  app.get("/api/purchase-orders", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const orders = await st.getPurchaseOrders();
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await st.getPurchaseOrderItems(order.id);
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              const inventoryItem = await st.getInventoryItem(
                item.inventoryItemId,
              );
              return {
                ...item,
                inventoryItem,
              };
            }),
          );
          const supplier = await st.getSupplier(order.supplierId);
          return {
            ...order,
            items: itemsWithDetails,
            supplier,
          };
        }),
      );
      res.json(ordersWithItems);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch purchase orders",
        });
    }
  });

  app.get("/api/purchase-orders/:id", requireAuth, async (req, res) => {
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
            inventoryItem,
          };
        }),
      );
      const supplier = await st.getSupplier(order.supplierId);

      res.json({
        ...order,
        items: itemsWithDetails,
        supplier,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch purchase order",
        });
    }
  });

  app.post("/api/purchase-orders", requireAuth, async (req, res) => {
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
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to create purchase order",
        });
    }
  });

  app.post("/api/purchase-orders/:id/items", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const result = insertPurchaseOrderItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const item = await st.createPurchaseOrderItem({
        ...result.data,
        purchaseOrderId: req.params.id,
      });
      broadcastUpdate("purchase_order_item_added", item);
      res.json(item);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to add purchase order item",
        });
    }
  });

  app.patch("/api/purchase-orders/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const order = await st.updatePurchaseOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      broadcastUpdate("purchase_order_updated", order);
      res.json(order);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to update purchase order",
        });
    }
  });

  app.post(
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
          purchaseOrderId: req.params.id,
        });
        res.json(order);
      } catch (error) {
        res
          .status(500)
          .json({
            error:
              error instanceof Error
                ? error.message
                : "Failed to receive purchase order",
          });
      }
    },
  );

  app.delete("/api/purchase-orders/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deletePurchaseOrder(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      broadcastUpdate("purchase_order_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete purchase order",
        });
    }
  });

  // Wastage
  app.get("/api/wastage", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const wastages = await st.getWastages();
      const wastagesWithDetails = await Promise.all(
        wastages.map(async (wastage) => {
          const inventoryItem = await st.getInventoryItem(
            wastage.inventoryItemId,
          );
          return {
            ...wastage,
            inventoryItem,
          };
        }),
      );
      res.json(wastagesWithDetails);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch wastage records",
        });
    }
  });

  app.post("/api/wastage", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const result = insertWastageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      // Auto-deduct from inventory
      const inventoryItem = await st.getInventoryItem(
        result.data.inventoryItemId,
      );
      if (!inventoryItem) {
        return res.status(404).json({ error: "Inventory item not found" });
      }

      const newStock =
        parseFloat(inventoryItem.currentStock) -
        parseFloat(result.data.quantity);
      if (newStock < 0) {
        return res
          .status(400)
          .json({ error: "Insufficient stock for wastage entry" });
      }

      await st.updateInventoryQuantity(
        result.data.inventoryItemId,
        newStock.toString(),
      );

      const wastage = await st.createWastage(result.data);
      broadcastUpdate("wastage_created", wastage);
      broadcastUpdate("inventory_updated", { wastageId: wastage.id });
      res.json(wastage);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to create wastage record",
        });
    }
  });

  app.delete("/api/wastage/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const success = await st.deleteWastage(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Wastage record not found" });
      }
      broadcastUpdate("wastage_deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete wastage record",
        });
    }
  });

  // Inventory Usage Tracking
  app.get("/api/inventory-usage", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const usages = await st.getInventoryUsages();
      res.json(usages);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch inventory usage",
        });
    }
  });

  app.get(
    "/api/inventory-usage/item/:itemId",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const usages = await st.getInventoryUsagesByItem(req.params.itemId);
        res.json(usages);
      } catch (error) {
        res
          .status(500)
          .json({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch item usage",
          });
      }
    },
  );

  app.get("/api/inventory-usage/most-used", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const mostUsed = await st.getMostUsedItems(limit);
      res.json(mostUsed);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch most used items",
        });
    }
  });

  app.post("/api/inventory-usage", requireAuth, async (req, res) => {
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
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to create inventory usage record",
        });
    }
  });

  // Seed Inventory and Recipes (admin endpoint)
  app.post("/api/inventory/seed", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      if (typeof storage.seedInventoryAndRecipes !== "function") {
        return res
          .status(400)
          .json({ error: "Seeding is only available with MongoDB storage" });
      }

      const result = await st.seedInventoryAndRecipes();
      broadcastUpdate("inventory_seeded", result);
      res.json({
        success: true,
        message: "Inventory and recipes seeded successfully",
        ...result,
      });
    } catch (error) {
      console.error("Error seeding inventory:", error);
      res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to seed inventory",
        });
    }
  });

  // ==================== END INVENTORY MANAGEMENT API ROUTES ====================

  const digitalMenuSync = new DigitalMenuSyncService(storage);
  digitalMenuSync.setBroadcastFunction(broadcastUpdate);

  app.post("/api/digital-menu/sync-start", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const intervalMs = req.body.intervalMs || 5000;
      await digitalMenuSync.start(intervalMs);
      res.json({ success: true, message: "Digital menu sync service started" });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to start sync service",
        });
    }
  });

  app.post("/api/digital-menu/sync-stop", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      digitalMenuSync.stop();
      res.json({ success: true, message: "Digital menu sync service stopped" });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to stop sync service",
        });
    }
  });

  app.post("/api/digital-menu/sync-now", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const synced = await digitalMenuSync.syncOrders();
      broadcastUpdate("digital_menu_synced", { count: synced });
      res.json({ success: true, syncedOrders: synced });
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to sync orders",
        });
    }
  });

  app.get("/api/digital-menu/status", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const status = digitalMenuSync.getSyncStatus();
      res.json(status);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to get sync status",
        });
    }
  });

  app.get("/api/digital-menu/orders", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const orders = await digitalMenuSync.getDigitalMenuOrders();
      res.json(orders);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch digital menu orders",
        });
    }
  });

  app.get("/api/digital-menu/customers", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const customers = await digitalMenuSync.getDigitalMenuCustomers();
      res.json(customers);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch digital menu customers",
        });
    }
  });

  digitalMenuSync.start(5000);

  // ── External Orders Sync (Orders DB → orders collection) ──────────────────
  externalOrdersSync.setBroadcastFunction(broadcastUpdate);

  app.get("/api/external-orders/status", requireAuth, async (_req, res) => {
    res.json(externalOrdersSync.getStatus());
  });

  app.post("/api/external-orders/sync-now", requireAuth, async (_req, res) => {
    try {
      const synced = await externalOrdersSync.sync();
      res.json({ success: true, syncedOrders: synced });
    } catch (error) {
      res
        .status(500)
        .json({
          error: error instanceof Error ? error.message : "Sync failed",
        });
    }
  });

  // ── Printer CRUD & print endpoints ───────────────────────────────────────

  app.get("/api/printers", requireAuth, async (req, res) => {
    try {
      const printers = await mongoStorage.getPrinters();
      res.json(printers);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch printers" });
    }
  });

  app.post("/api/printers", requireAuth, async (req, res) => {
    try {
      const { insertPrinterSchema } = await import("@shared/schema");
      const result = insertPrinterSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      const printer = await mongoStorage.createPrinter(result.data);
      res.json(printer);
    } catch (e) {
      res.status(500).json({ error: "Failed to create printer" });
    }
  });

  app.patch("/api/printers/:id", requireAuth, async (req, res) => {
    try {
      const printer = await mongoStorage.updatePrinter(req.params.id, req.body);
      if (!printer) return res.status(404).json({ error: "Printer not found" });
      res.json(printer);
    } catch (e) {
      res.status(500).json({ error: "Failed to update printer" });
    }
  });

  app.delete("/api/printers/:id", requireAuth, async (req, res) => {
    try {
      const ok = await mongoStorage.deletePrinter(req.params.id);
      if (!ok) return res.status(404).json({ error: "Printer not found" });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete printer" });
    }
  });

  // Check a single printer's online status
  app.get("/api/printers/:id/status", requireAuth, async (req, res) => {
    try {
      const { checkPrinterOnline } = await import("./utils/escpos");
      const printer = await mongoStorage.getPrinter(req.params.id);
      if (!printer) return res.status(404).json({ error: "Printer not found" });
      const online = await checkPrinterOnline(printer.ip, printer.port);
      res.json({ id: printer.id, online });
    } catch (e) {
      res.json({ id: req.params.id, online: false });
    }
  });

  // QZ Tray receives ESC/POS bytes in the browser and sends them to the
  // printer installed on the operator's computer. The server never receives
  // or exposes the private signing key.
  app.get("/api/qz-certificate", requireAuth, (_req, res) => {
    const certificate = process.env.QZ_CERTIFICATE;
    if (!certificate) {
      return res.status(503).type("text/plain").send("QZ certificate is not configured");
    }
    try {
      res.type("text/plain").send(normalizeQzPem(certificate));
    } catch {
      res.status(503).type("text/plain").send("QZ certificate is invalid");
    }
  });

  app.post("/api/sign-message", requireAuth, (req, res) => {
    const privateKey = process.env.QZ_PRIVATE_KEY;
    if (!privateKey) {
      return res.status(503).type("text/plain").send("QZ private key is not configured");
    }
    const message = typeof req.body === "string" ? req.body : "";
    if (!message) return res.status(400).type("text/plain").send("Message is required");
    try {
      const signer = crypto.createSign("SHA512");
      signer.update(message);
      const signature = signer.sign(
        { key: normalizeQzPem(privateKey), dsaEncoding: "der" },
        "base64",
      );
      res.type("text/plain").send(signature);
    } catch {
      res.status(500).type("text/plain").send("QZ signing failed");
    }
  });

  app.get("/api/printers/qz/kot/:orderId", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const order = await st.getOrder(req.params.orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      const allItems = await st.getOrderItems(order.id);
      const latestBatch = order.kotCount ?? 0;
      const items = allItems.filter((item) =>
        latestBatch > 0
          ? item.kotBatch === latestBatch && item.status !== "non_kot"
          : item.status === "new",
      );
      if (items.length === 0) return res.status(400).json({ error: "No KOT items found" });

      let tableNumber: string | undefined;
      let floorName: string | undefined;
      if (order.tableId) {
        const table = await st.getTable(order.tableId);
        tableNumber = table?.tableNumber;
        if (table?.floorId) floorName = (await st.getFloor(table.floorId))?.name;
      }
      const { buildKOTEscPos } = await import("./utils/escpos");
      const sequence = await getDailyKotSequence(st, order);
       const kotNumber = (await ensureDailyKotInvoiceNumber(st, order)).invoiceNumber;
      const data = buildKOTEscPos({
        order,
        items,
        tableNumber,
        floorName,
        kotNumber,
        sequence: String(sequence),
        isUpdated: (order.kotCount ?? 0) > 1,
      });
      const printers = (await mongoStorage.getPrinters())
        .filter((printer) => printer.type === "KOT")
        .map((printer) => printer.name);
      res.json({ data: data.toString("base64"), printers, kotNumber });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to prepare KOT" });
    }
  });

  app.get("/api/printers/qz/test/:id", requireAuth, async (req, res) => {
    try {
      const printer = await mongoStorage.getPrinter(req.params.id);
      if (!printer) return res.status(404).json({ error: "Printer not found" });
      const ESC = 0x1b;
      const GS = 0x1d;
      const LF = 0x0a;
      const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const data = Buffer.concat([
        Buffer.from([ESC, 0x40]),
        Buffer.from([ESC, 0x61, 0x01]),
        Buffer.from([ESC, 0x21, 0x30]),
        Buffer.from("TEST PRINT\n", "utf8"),
        Buffer.from([ESC, 0x21, 0x00]),
        Buffer.from(`${printer.name}\nIP: ${printer.ip}:${printer.port}\n`, "utf8"),
        Buffer.from(`Type: ${printer.type}\nTime: ${now}\n`, "utf8"),
        Buffer.from("--------------------------------\n", "utf8"),
        Buffer.from([ESC, 0x45, 0x01]),
        Buffer.from("QZ Tray is working!\n", "utf8"),
        Buffer.from([ESC, 0x45, 0x00, LF, LF, LF, LF]),
        Buffer.from([GS, 0x56, 0x42, 0x03]),
      ]);
      res.json({ data: data.toString("base64"), printers: [printer.name] });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to prepare test print" });
    }
  });

  app.get("/api/printers/qz/invoice/:id", requireAuth, async (req, res) => {
    const st = getStorage(req);
    try {
      const invoice = await st.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });
      const order = await st.getOrder(invoice.orderId);
      const taxSettings = await getTaxSettings(st);
      const { buildBillEscPos } = await import("./utils/escpos");
      const data = buildBillEscPos({
        invoiceNumber: invoice.invoiceNumber,
        date: new Date(),
        tableNumber: invoice.tableNumber,
        floorName: invoice.floorName,
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        orderType: order?.orderType,
        items: JSON.parse(invoice.items || "[]"),
        subtotal: parseFloat(invoice.subtotal),
        cgst: parseFloat(invoice.cgst),
        sgst: parseFloat(invoice.sgst),
        serviceCharge: parseFloat(invoice.serviceCharge),
        total: parseFloat(invoice.total),
        paymentMode: invoice.paymentMode || "cash",
        splitPayments: invoice.splitPayments
          ? JSON.parse(invoice.splitPayments)
          : [],
        gstEnabled: taxSettings.gstEnabled,
        gstNumber: taxSettings.gstNumber,
      });
      const printers = (await mongoStorage.getPrinters())
        .filter((printer) => printer.type === "Bill" || printer.type === "KOT")
        .map((printer) => printer.name);
      res.json({ data: data.toString("base64"), printers, invoiceNumber: invoice.invoiceNumber });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to prepare invoice" });
    }
  });

  // Print a KOT to one or more printers by ID
  // Returns per-printer results so the frontend knows which ones failed
  app.post(
    "/api/printers/print-kot/:orderId",
    requireAuth,
    async (req, res) => {
      const st = getStorage(req);
      try {
        const { buildKOTEscPos, printToThermal } = await import(
          "./utils/escpos"
        );
        const { printerIds } = req.body as { printerIds?: string[] };

        const order = await st.getOrder(req.params.orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        const orderItems = await st.getOrderItems(req.params.orderId);
        let tableNumber: string | undefined;
        let floorName: string | undefined;
        if (order.tableId) {
          const tbl = await st.getTable(order.tableId);
          tableNumber = tbl?.tableNumber;
          if (tbl?.floorId) floorName = (await st.getFloor(tbl.floorId))?.name;
        }

        const allPrinters = await mongoStorage.getPrinters();
        const targets = printerIds?.length
          ? allPrinters.filter((p) => printerIds.includes(p.id))
          : allPrinters.filter((p) => p.type === "KOT");

        if (targets.length === 0) {
          return res.json({ results: [], allFailed: true });
        }

        const kotSequence = await getDailyKotSequence(st, order);
         const kotNumber = (await ensureDailyKotInvoiceNumber(st, order)).invoiceNumber;
        const escData = buildKOTEscPos({
          order,
          items: orderItems.filter((item) => item.status === "new"),
          tableNumber,
          floorName,
          kotNumber,
          sequence: String(kotSequence),
          isUpdated: (order.kotCount ?? 0) > 1,
        });

        const results = await Promise.all(
          targets.map(async (p) => {
            const result = await printToThermal(p.ip, p.port, escData);
            return { id: p.id, name: p.name, ...result };
          }),
        );

        const allFailed = results.every((r) => !r.success);
        res.json({ results, allFailed });
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    },
  );

  // Test print to a specific printer — queues a job for the local print agent
  app.post("/api/printers/:id/test", requireAuth, async (req, res) => {
    try {
      const printer = await mongoStorage.getPrinter(req.params.id);
      if (!printer) return res.status(404).json({ error: "Printer not found" });

      const ESC = 0x1b,
        GS = 0x1d,
        LF = 0x0a;
      const now = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      const parts = [
        Buffer.from([ESC, 0x40]), // init
        Buffer.from([ESC, 0x61, 0x01]), // center
        Buffer.from([ESC, 0x21, 0x30]), // double size
        Buffer.from("TEST PRINT\n", "utf8"),
        Buffer.from([ESC, 0x21, 0x00]), // normal
        Buffer.from(`${printer.name}\n`, "utf8"),
        Buffer.from(`IP: ${printer.ip}:${printer.port}\n`, "utf8"),
        Buffer.from(`Type: ${printer.type}\n`, "utf8"),
        Buffer.from(`Time: ${now}\n`, "utf8"),
        Buffer.from("--------------------------------\n", "utf8"),
        Buffer.from([ESC, 0x45, 0x01]), // bold
        Buffer.from("Printer is Online!\n", "utf8"),
        Buffer.from([ESC, 0x45, 0x00]),
        Buffer.from([LF, LF, LF, LF]),
        Buffer.from([GS, 0x56, 0x42, 0x03]), // cut
      ];
      const data = Buffer.concat(parts);

      // Queue via print agent (cloud server cannot reach local-network printers directly)
      await mongoStorage.createPrintJob({
        orderId: "test",
        kotNumber: "TEST",
        printerIp: printer.ip,
        printerPort: printer.port,
        printerName: printer.name,
        escposData: data.toString("base64"),
        status: "pending",
      });
      res.json({ success: true, queued: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ── Shared local print-worker endpoints ─────────────────────────────────────

  // Agent polls this every few seconds to get pending print jobs
  app.get("/api/print-jobs/pending", requireAuth, async (_req, res) => {
    try {
      const jobs = await mongoStorage.getPendingPrintJobs();
      res.json(jobs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/print-jobs/claim", requireAuth, async (req, res) => {
    try {
      const workerId = typeof req.body?.workerId === "string" ? req.body.workerId : "";
      const printerNames = Array.isArray(req.body?.printerNames)
        ? req.body.printerNames.filter((name: unknown): name is string => typeof name === "string")
        : [];
      if (!workerId) return res.status(400).json({ error: "workerId is required" });
      const job = await mongoStorage.claimNextPrintJob(workerId, printerNames);
      res.json(job ?? null);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Called when a local printer/QZ Tray transitions from unavailable to
  // available. Pending jobs were created while the printer was offline and
  // must not be printed after recovery.
  app.post("/api/print-jobs/discard-on-reconnect", requireAuth, async (req, res) => {
    try {
      const printerNames = Array.isArray(req.body?.printerNames)
        ? req.body.printerNames.filter((name: unknown): name is string => typeof name === "string")
        : [];
      const recoveryAt = typeof req.body?.recoveryAt === "string"
        ? new Date(req.body.recoveryAt)
        : undefined;
      const discarded = await mongoStorage.discardPendingPrintJobsForPrinters(
        printerNames,
        recoveryAt,
      );
      res.json({ ok: true, discarded });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Agent calls this after successfully printing a job
  app.post("/api/print-jobs/:id/done", requireAuth, async (req, res) => {
    try {
      const workerId = typeof req.body?.workerId === "string" ? req.body.workerId : undefined;
      await mongoStorage.markPrintJobDone(req.params.id, workerId);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Agent calls this if printing failed
  app.post("/api/print-jobs/:id/failed", requireAuth, async (req, res) => {
    try {
      const workerId = typeof req.body?.workerId === "string" ? req.body.workerId : undefined;
      const error = typeof req.body?.error === "string" ? req.body.error : undefined;
      await mongoStorage.markPrintJobFailed(req.params.id, workerId, error);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // The worker checks this immediately after claiming and before sending
  // bytes. A delete can cancel a processing job while it is between those
  // two operations.
  app.get("/api/print-jobs/:id/active", requireAuth, async (req, res) => {
    try {
      const workerId = typeof req.query.workerId === "string" ? req.query.workerId : undefined;
      res.json({ active: await mongoStorage.isPrintJobActive(req.params.id, workerId) });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Check if a printer is reachable without printing anything
  app.post("/api/printers/:id/check", requireAuth, async (req, res) => {
    try {
      const { checkPrinterOnline } = await import("./utils/escpos");
      const printer = await mongoStorage.getPrinter(req.params.id);
      if (!printer) return res.status(404).json({ error: "Printer not found" });
      const online = await checkPrinterOnline(printer.ip, printer.port);
      res.json({ online });
    } catch (e: any) {
      res.status(500).json({ online: false, error: e.message });
    }
  });

  externalOrdersSync.start(1000);

  const httpServer = createServer(app);

  wss = new WebSocketServer({ server: httpServer, path: "/api/ws" });

  wss.on("connection", (ws) => {
    ws.on("error", console.error);
  });

  return httpServer;
}
