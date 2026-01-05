import {
  users,
  locations,
  categories,
  tickerItems,
  insiderTips,
  type User,
  type Location,
  type InsertLocation,
  type Category,
  type InsertCategory,
  type TickerItem,
  type InsertTickerItem,
  type InsiderTip,
  type InsertInsiderTip,
} from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike, sql, desc, and, gt, isNull, inArray } from "drizzle-orm";

export interface UpsertUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  getAllLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  getLocationBySlug(slug: string): Promise<Location | undefined>;
  getLocationsByIds(ids: string[]): Promise<Location[]>;
  searchLocations(query: string, tag?: string): Promise<Location[]>;
  getPopularTags(limit?: number): Promise<{ tag: string; count: number }[]>;
  getLocationsByTag(tag: string): Promise<Location[]>;
  getFeaturedLocations(limit: number, offset: number): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;
  // Ticker items
  getAllTickerItems(): Promise<TickerItem[]>;
  getActiveTickerItems(): Promise<TickerItem[]>;
  getTickerItem(id: string): Promise<TickerItem | undefined>;
  createTickerItem(item: InsertTickerItem): Promise<TickerItem>;
  updateTickerItem(id: string, item: Partial<InsertTickerItem>): Promise<TickerItem>;
  deleteTickerItem(id: string): Promise<void>;
  // Insider tips
  getInsiderTipsByLocationId(locationId: string): Promise<InsiderTip[]>;
  getInsiderTip(id: string): Promise<InsiderTip | undefined>;
  createInsiderTip(tip: InsertInsiderTip): Promise<InsiderTip>;
  updateInsiderTip(id: string, tip: Partial<InsertInsiderTip>): Promise<InsiderTip>;
  deleteInsiderTip(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async getLocationBySlug(slug: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.slug, slug));
    return location;
  }

  async getLocationsByIds(ids: string[]): Promise<Location[]> {
    if (ids.length === 0) return [];
    return await db
      .select()
      .from(locations)
      .where(inArray(locations.id, ids));
  }

  async searchLocations(query: string, tag?: string): Promise<Location[]> {
    const searchPattern = `%${query}%`;
    
    let whereClause = or(
      ilike(locations.name, searchPattern),
      ilike(locations.description, searchPattern),
      ilike(locations.category, searchPattern),
      ilike(locations.neighborhood, searchPattern),
      ilike(locations.address, searchPattern),
      sql`EXISTS (
        SELECT 1 FROM unnest(${locations.tags}) AS tag
        WHERE tag ILIKE ${searchPattern}
      )`
    );

    if (tag) {
      const tagClause = sql`EXISTS (
        SELECT 1 FROM unnest(${locations.tags}) AS t
        WHERE LOWER(t) = LOWER(${tag})
      )`;
      whereClause = sql`(${whereClause}) AND (${tagClause})`;
    }
    
    const results = await db
      .select()
      .from(locations)
      .where(whereClause);

    return results;
  }

  async getPopularTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
    const result = await db.execute<{ tag: string; count: string }>(sql`
      SELECT tag, COUNT(*) as count
      FROM ${locations}, unnest(tags) AS tag
      GROUP BY tag
      ORDER BY count DESC, tag ASC
      LIMIT ${limit}
    `);
    
    return result.rows.map(row => ({
      tag: row.tag,
      count: parseInt(row.count, 10)
    }));
  }

  async getLocationsByTag(tag: string): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(
        sql`EXISTS (
          SELECT 1 FROM unnest(${locations.tags}) AS t
          WHERE LOWER(t) = LOWER(${tag})
        )`
      );
  }

  async getFeaturedLocations(limit: number, offset: number): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(eq(locations.featured, true))
      .limit(limit)
      .offset(offset);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async updateLocation(id: string, locationData: Partial<InsertLocation>): Promise<Location> {
    const [updated] = await db
      .update(locations)
      .set({ ...locationData, updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();
    return updated;
  }

  async deleteLocation(id: string): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  async getAllTickerItems(): Promise<TickerItem[]> {
    return await db
      .select()
      .from(tickerItems)
      .orderBy(sql`CAST(${tickerItems.priority} AS INTEGER) DESC`, desc(tickerItems.createdAt));
  }

  async getActiveTickerItems(): Promise<TickerItem[]> {
    const now = new Date();
    return await db
      .select()
      .from(tickerItems)
      .where(
        and(
          eq(tickerItems.isActive, true),
          or(
            isNull(tickerItems.endDate),
            gt(tickerItems.endDate, now)
          )
        )
      )
      .orderBy(sql`CAST(${tickerItems.priority} AS INTEGER) DESC`, desc(tickerItems.createdAt));
  }

  async getTickerItem(id: string): Promise<TickerItem | undefined> {
    const [item] = await db.select().from(tickerItems).where(eq(tickerItems.id, id));
    return item;
  }

  async createTickerItem(item: InsertTickerItem): Promise<TickerItem> {
    const [newItem] = await db.insert(tickerItems).values(item).returning();
    return newItem;
  }

  async updateTickerItem(id: string, itemData: Partial<InsertTickerItem>): Promise<TickerItem> {
    const [updated] = await db
      .update(tickerItems)
      .set(itemData)
      .where(eq(tickerItems.id, id))
      .returning();
    return updated;
  }

  async deleteTickerItem(id: string): Promise<void> {
    await db.delete(tickerItems).where(eq(tickerItems.id, id));
  }

  async getInsiderTipsByLocationId(locationId: string): Promise<InsiderTip[]> {
    return await db
      .select()
      .from(insiderTips)
      .where(eq(insiderTips.locationId, locationId))
      .orderBy(sql`CAST(${insiderTips.sortOrder} AS INTEGER) ASC`);
  }

  async getInsiderTip(id: string): Promise<InsiderTip | undefined> {
    const [tip] = await db.select().from(insiderTips).where(eq(insiderTips.id, id));
    return tip;
  }

  async createInsiderTip(tip: InsertInsiderTip): Promise<InsiderTip> {
    const [newTip] = await db.insert(insiderTips).values(tip).returning();
    return newTip;
  }

  async updateInsiderTip(id: string, tipData: Partial<InsertInsiderTip>): Promise<InsiderTip> {
    const [updated] = await db
      .update(insiderTips)
      .set({ ...tipData, updatedAt: new Date() })
      .where(eq(insiderTips.id, id))
      .returning();
    return updated;
  }

  async deleteInsiderTip(id: string): Promise<void> {
    await db.delete(insiderTips).where(eq(insiderTips.id, id));
  }
}

export const storage = new DatabaseStorage();
