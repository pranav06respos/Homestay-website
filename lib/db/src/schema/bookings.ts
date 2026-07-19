import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  guests: integer("guests").notNull().default(1),
  roomId: integer("room_id"),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  specialRequest: text("special_request"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
