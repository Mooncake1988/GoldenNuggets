import {
  users,
  locations,
  categories,
  type User,
  type Location,
  type InsertLocation,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike, sql } from "drizzle-orm";

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
  searchLocations(query: string, tag?: string): Promise<Location[]>;
  getPopularTags(limit?: number): Promise<{ tag: string; count: number }[]>;
  getLocationsByTag(tag: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;
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
}

export const storage = new DatabaseStorage();
