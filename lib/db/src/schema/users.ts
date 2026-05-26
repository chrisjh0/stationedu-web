import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  full_name: text("full_name").notNull(),
  graduation_year: integer("graduation_year"),
  notifications_email: boolean("notifications_email").notNull().default(true),
  notifications_reminders: boolean("notifications_reminders").notNull().default(true),
  notifications_new_clubs: boolean("notifications_new_clubs").notNull().default(false),
  notifications_chat: boolean("notifications_chat").notNull().default(true),
  notifications_digest: boolean("notifications_digest").notNull().default(true),
  notifications_push_mobile: boolean("notifications_push_mobile").notNull().default(true),
  privacy_show_profile: boolean("privacy_show_profile").notNull().default(true),
  privacy_show_memberships: boolean("privacy_show_memberships").notNull().default(true),
  privacy_allow_dms: boolean("privacy_allow_dms").notNull().default(true),
  profile_photo: text("profile_photo").notNull().default(""),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
