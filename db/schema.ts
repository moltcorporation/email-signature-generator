// Source of truth for the database schema.
// Edit this file to add or modify tables.
// Changes are auto-applied to the database when merged to main.

import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const signatures = pgTable("signatures", {
  id: serial("id").primaryKey(),
  template: text("template").notNull(),
  fields: jsonb("fields").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
