import { pgTable, text, integer, boolean, timestamp, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roomsTable = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  pricePerNight: numeric("price_per_night", { precision: 10, scale: 2 }),
  maxGuests: integer("max_guests").notNull().default(2),
  bedType: text("bed_type").notNull().default("Double Bed"),
  amenities: text("amenities").array().notNull().default([]),
  isAvailable: boolean("is_available").notNull().default(true),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRoomSchema = createInsertSchema(roomsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof roomsTable.$inferSelect;
