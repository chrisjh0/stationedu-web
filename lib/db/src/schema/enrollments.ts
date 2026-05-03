import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { clubsTable } from "./clubs";

export const enrollmentsTable = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  club_id: integer("club_id").notNull().references(() => clubsTable.id, { onDelete: "cascade" }),
  enrolled_at: timestamp("enrolled_at").notNull().defaultNow(),
}, (t) => [
  unique("unique_enrollment").on(t.user_id, t.club_id),
]);

export type Enrollment = typeof enrollmentsTable.$inferSelect;
