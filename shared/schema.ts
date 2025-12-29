import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  neighborhood: text("neighborhood").notNull(),
  description: text("description").notNull(),
  address: text("address"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export const newsletterSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
});

export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>;

// News Ticker Items
export const tickerItems = pgTable("ticker_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: text("category").notNull(),
  linkUrl: text("link_url"),
  priority: text("priority").notNull().default("50"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const baseTickerItemSchema = createInsertSchema(tickerItems).omit({
  id: true,
  createdAt: true,
});

export const insertTickerItemSchema = baseTickerItemSchema.extend({
  priority: z.string().refine(
    (val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0 && num <= 100;
    },
    { message: "Priority must be a number between 0 and 100" }
  ).default("50"),
  linkUrl: z.string().url("Invalid URL format").nullable().optional().or(z.literal("")),
  endDate: z.union([
    z.date(),
    z.string().refine(
      (val) => val === "" || !isNaN(Date.parse(val)),
      { message: "Invalid date format" }
    ).transform((val) => val === "" ? null : new Date(val)),
    z.null(),
  ]).nullable().optional(),
});

export type InsertTickerItem = z.infer<typeof insertTickerItemSchema>;
export type TickerItem = typeof tickerItems.$inferSelect;

export const tickerCategories = [
  { value: "new-spots", label: "New Spots", color: "bg-emerald-600" },
  { value: "featured", label: "Featured", color: "bg-amber-600" },
  { value: "events", label: "Events", color: "bg-purple-600" },
  { value: "tips", label: "Tips", color: "bg-blue-600" },
  { value: "offers", label: "Offers", color: "bg-rose-600" },
  { value: "updates", label: "Updates", color: "bg-sky-700" },
  { value: "seasonal", label: "Seasonal", color: "bg-orange-600" },
] as const;

// Insider Tips - Quick-Fire FAQs for location pages
export const insiderTips = pgTable("insider_tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  icon: text("icon").default("info"),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  sortOrder: text("sort_order").notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInsiderTipSchema = createInsertSchema(insiderTips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInsiderTip = z.infer<typeof insertInsiderTipSchema>;
export type InsiderTip = typeof insiderTips.$inferSelect;

// Predefined icons for insider tips
export const insiderTipIcons = [
  { value: "wifi", label: "WiFi/Signal" },
  { value: "dog", label: "Pet Friendly" },
  { value: "camera", label: "Photo Spot" },
  { value: "clock", label: "Timing" },
  { value: "utensils", label: "Food & Drink" },
  { value: "car", label: "Parking/Access" },
  { value: "wallet", label: "Price/Payment" },
  { value: "users", label: "Crowd Level" },
  { value: "sun", label: "Weather" },
  { value: "map-pin", label: "Navigation" },
  { value: "info", label: "General Info" },
  { value: "star", label: "Must Know" },
  { value: "image", label: "Menu/Photos" },
] as const;
