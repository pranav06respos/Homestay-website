import { pgTable, integer, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roomImagesTable = pgTable("room_images", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  mediaId: integer("media_id").notNull(),
  isCover: boolean("is_cover").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertRoomImageSchema = createInsertSchema(roomImagesTable).omit({ id: true });
export type InsertRoomImage = z.infer<typeof insertRoomImageSchema>;
export type RoomImage = typeof roomImagesTable.$inferSelect;
