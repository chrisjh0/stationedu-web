import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const CLUB_TYPES = ["Committee", "Union", "Club", "Team", "Other"] as const;
export type ClubType = typeof CLUB_TYPES[number];

export const clubsTable = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  type: text("type").notNull(),
  initial: text("initial").notNull(),
  default_day: text("default_day").notNull(),
  default_location: text("default_location").notNull(),
  chat_link: text("chat_link").notNull().default(""),
  profile_photo: text("profile_photo").notNull().default(""),
  creator_user_id: integer("creator_user_id").references(() => usersTable.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
});

export const insertClubSchema = createInsertSchema(clubsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubsTable.$inferSelect;
