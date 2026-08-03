import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

// Accounts blocked from submitting or voting.
export const bannedUsersTable = pgTable("banned_users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Single-row app settings. votingOverride: "auto" | "open" | "closed".
export const appSettingsTable = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  votingOverride: text("voting_override").notNull().default("auto"),
});
