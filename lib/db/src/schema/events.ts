import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clubsTable } from "./clubs";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  club_id: integer("club_id").notNull().references(() => clubsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  event_date: text("event_date").notNull(),
  event_time: text("event_time").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull().default(""),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, created_at: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
