import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { clubsTable } from "./clubs";

export const clubLeadersTable = pgTable("club_leaders", {
  id: serial("id").primaryKey(),
  club_id: integer("club_id").notNull().references(() => clubsTable.id, { onDelete: "cascade" }),
  user_id: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type ClubLeader = typeof clubLeadersTable.$inferSelect;
