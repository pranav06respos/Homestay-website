import { pgTable, text, integer, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const attractionsTable = pgTable("attractions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  distance: text("distance"),
  duration: text("duration"),
  description: text("description"),
  icon: text("icon"),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertAttractionSchema = createInsertSchema(attractionsTable).omit({ id: true });
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;
export type Attraction = typeof attractionsTable.$inferSelect;
