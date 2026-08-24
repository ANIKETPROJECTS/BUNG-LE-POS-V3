import { Db, ObjectId, Collection, Document } from "mongodb";
import type { InsertMenuItem, MenuItem } from "@shared/schema";

type LiveMenuDocument = Document & {
  _id?: ObjectId | string;
  id?: string;
  name?: string;
  description?: string | null;
  price?: number | string;
  category?: string;
  isVeg?: boolean;
  image?: string | null;
  isAvailable?: boolean;
  available?: boolean;
  quickCode?: string | null;
  variants?: string[] | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type LocatedItem = { collection: Collection<LiveMenuDocument>; document: LiveMenuDocument; category: string };
type MenuCache = { expiresAt: number; items: MenuItem[] };

const MENU_CACHE_TTL = 30_000;
const menuCache = new WeakMap<Db, MenuCache>();
const collectionCache = new WeakMap<Db, { expiresAt: number; collections: Collection<LiveMenuDocument>[] }>();

function isSystemCollection(name: string) {
  return name.startsWith("system.");
}

function itemId(document: LiveMenuDocument): string {
  return document.id || document._id?.toString() || "";
}

function isMenuDocument(document: LiveMenuDocument): boolean {
  return typeof document.name === "string" && document.name.trim().length > 0 &&
    document.price !== undefined;
}

function toMenuItem(document: LiveMenuDocument, collectionName: string): MenuItem {
  const price = Number(document.price ?? 0);
  return {
    id: itemId(document),
    name: document.name || "Unnamed item",
    category: document.category || collectionName,
    price: String(document.price ?? "0"),
    cost: document.price !== undefined ? (price * 0.4).toFixed(2) : "0",
    available: document.isAvailable ?? document.available ?? true,
    isVeg: document.isVeg ?? true,
    variants: document.variants ?? null,
    image: document.image ?? null,
    description: document.description ?? null,
    quickCode: document.quickCode ?? null,
  };
}

async function menuCollections(db: Db) {
  const cached = collectionCache.get(db);
  if (cached && cached.expiresAt > Date.now()) return cached.collections;

  const collections = await db.listCollections().toArray();
  const result = collections
    .map((info) => info.name)
    .filter((name) => !isSystemCollection(name))
    .map((name) => db.collection<LiveMenuDocument>(name));
  collectionCache.set(db, { expiresAt: Date.now() + MENU_CACHE_TTL, collections: result });
  return result;
}

async function locateItem(db: Db, id: string): Promise<LocatedItem | undefined> {
  for (const collection of await menuCollections(db)) {
    const byId = await collection.findOne({ id } as any);
    if (byId && isMenuDocument(byId)) {
      return { collection, document: byId, category: byId.category || collection.collectionName };
    }
    if (ObjectId.isValid(id)) {
      const byObjectId = await collection.findOne({ _id: new ObjectId(id) });
      if (byObjectId && isMenuDocument(byObjectId)) {
        return { collection, document: byObjectId, category: byObjectId.category || collection.collectionName };
      }
    }
  }
  return undefined;
}

function sourceUpdate(item: Partial<InsertMenuItem>) {
  const update: Record<string, unknown> = {};
  if (item.name !== undefined) update.name = item.name;
  if (item.description !== undefined) update.description = item.description;
  if (item.price !== undefined) update.price = Number(item.price) || 0;
  if (item.category !== undefined) update.category = item.category;
  if (item.isVeg !== undefined) update.isVeg = item.isVeg;
  if (item.image !== undefined) update.image = item.image;
  if (item.available !== undefined) update.isAvailable = item.available;
  if (item.quickCode !== undefined) update.quickCode = item.quickCode;
  if (item.variants !== undefined) update.variants = item.variants;
  update.updatedAt = new Date();
  return update;
}

async function assertQuickCodeAvailable(db: Db, quickCode: string | null | undefined, exceptId?: string) {
  const normalized = quickCode?.trim().toLowerCase();
  if (!normalized) return;
  for (const collection of await menuCollections(db)) {
    const items = await collection.find({ quickCode: { $regex: `^${normalized}$`, $options: "i" } } as any).toArray();
    if (items.some((item) => itemId(item) !== exceptId)) {
      throw new Error(`Quick code "${quickCode}" is already assigned to another item`);
    }
  }
}

export async function getLiveMenuItems(db: Db): Promise<MenuItem[]> {
  const cached = menuCache.get(db);
  if (cached && cached.expiresAt > Date.now()) return cached.items;

  const collections = await menuCollections(db);
  const batches = await Promise.all(collections.map(async (collection) => {
    const documents = await collection.find({}).toArray();
    return documents
      .filter(isMenuDocument)
      .map((document) => toMenuItem(document, collection.collectionName))
      .filter((item) => item.id);
  }));
  const items = batches.flat();
  menuCache.set(db, { expiresAt: Date.now() + MENU_CACHE_TTL, items });
  return items;
}

function invalidateMenuCache(db: Db) {
  menuCache.delete(db);
  collectionCache.delete(db);
}

export async function getLiveMenuItem(db: Db, id: string) {
  const located = await locateItem(db, id);
  return located ? toMenuItem(located.document, located.collection.collectionName) : undefined;
}

export async function createLiveMenuItem(db: Db, item: InsertMenuItem) {
  const quickCode = item.quickCode?.trim().toLowerCase() || null;
  await assertQuickCodeAvailable(db, quickCode);
  const collection = db.collection<LiveMenuDocument>(item.category);
  const now = new Date();
  const document: LiveMenuDocument = {
    name: item.name,
    description: item.description ?? null,
    price: Number(item.price) || 0,
    category: item.category,
    isVeg: item.isVeg ?? true,
    image: item.image ?? null,
    isAvailable: item.available ?? true,
    quickCode,
    variants: item.variants ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  document._id = result.insertedId;
  invalidateMenuCache(db);
  return toMenuItem(document, collection.collectionName);
}

export async function updateLiveMenuItem(db: Db, id: string, item: Partial<InsertMenuItem>) {
  const located = await locateItem(db, id);
  if (!located) return undefined;
  const quickCode = item.quickCode === undefined ? located.document.quickCode : item.quickCode?.trim().toLowerCase() || null;
  await assertQuickCodeAvailable(db, quickCode, id);
  const nextCategory = item.category || located.category;
  const update = sourceUpdate({ ...item, quickCode });
  if (nextCategory !== located.category) {
    const replacement = { ...located.document, ...update, category: nextCategory };
    delete replacement._id;
    const inserted = await db.collection<LiveMenuDocument>(nextCategory).insertOne(replacement);
    await located.collection.deleteOne({ _id: located.document._id });
    replacement._id = inserted.insertedId;
    invalidateMenuCache(db);
    return toMenuItem(replacement, nextCategory);
  }
  const updated = await located.collection.findOneAndUpdate(
    { _id: located.document._id },
    { $set: update },
    { returnDocument: "after" },
  );
  if (updated) invalidateMenuCache(db);
  return updated ? toMenuItem(updated, located.collection.collectionName) : undefined;
}

export async function deleteLiveMenuItem(db: Db, id: string) {
  const located = await locateItem(db, id);
  if (!located) return false;
  const result = await located.collection.deleteOne({ _id: located.document._id });
  if (result.deletedCount > 0) invalidateMenuCache(db);
  return result.deletedCount > 0;
}