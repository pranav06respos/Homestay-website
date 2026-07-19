import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  isDraft: boolean("is_draft").notNull().default(false),
  siteName: text("site_name").notNull().default("Neel Kamal Homestay"),
  tagline: text("tagline").notNull().default("A mountain retreat in the heart of Kasauli"),
  heroHeading: text("hero_heading").notNull().default("Wake Up to the Mountains"),
  heroSubheading: text("hero_subheading").notNull().default("A premium boutique homestay nestled in the pine forests of Kasauli, Himachal Pradesh"),
  heroImageUrl: text("hero_image_url"),
  heroImageMediaId: integer("hero_image_media_id"),
  heroVisible: boolean("hero_visible").notNull().default(true),
  aboutHeading: text("about_heading").notNull().default("Our Story"),
  aboutText: text("about_text").notNull().default("Neel Kamal Homestay is a lovingly crafted mountain retreat in Village Mashobra, just minutes from the heart of Kasauli. Surrounded by ancient deodar and pine forests, our homestay offers an intimate escape from city life — where the mornings smell of pine resin and the evenings are lit by a million stars. Every room has been designed to bring the mountains inside, with valley views, handpicked furnishings, and the kind of quiet that city dwellers forget exists."),
  aboutImageUrl: text("about_image_url"),
  aboutImageMediaId: integer("about_image_media_id"),
  contactPhone: text("contact_phone").notNull().default("+91 98765 43210"),
  contactWhatsapp: text("contact_whatsapp").notNull().default("+91 98765 43210"),
  contactEmail: text("contact_email").notNull().default("stay@neelkamalhomestay.com"),
  contactAddress: text("contact_address").notNull().default("Village Mashobra, Old Parwanoo Road, Kasauli, District Solan, Himachal Pradesh 173204"),
  googleMapsUrl: text("google_maps_url").notNull().default("https://maps.google.com/?q=Kasauli+Himachal+Pradesh"),
  checkInTime: text("check_in_time").notNull().default("12:00 PM"),
  checkOutTime: text("check_out_time").notNull().default("11:00 AM"),
  cancellationPolicy: text("cancellation_policy").notNull().default("Free cancellation up to 48 hours before check-in. Cancellations within 48 hours are subject to one night's charge."),
  footerText: text("footer_text").notNull().default("Neel Kamal Homestay — Where the mountains meet you halfway."),
  logoUrl: text("logo_url"),
  logoMediaId: integer("logo_media_id"),
  primaryColor: text("primary_color").notNull().default("#2d5a3d"),
  accentColor: text("accent_color").notNull().default("#3d2d1a"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
