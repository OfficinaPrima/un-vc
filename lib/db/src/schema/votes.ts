import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const votesTable = pgTable("votes", {
  id: serial("id").primaryKey(),
  voterUserId: text("voter_user_id"),
  voterWallet: text("voter_wallet").notNull(),
  submissionId: integer("submission_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVoteSchema = createInsertSchema(votesTable).omit({ id: true, createdAt: true });
export type InsertVote = typeof insertVoteSchema.type;
export type Vote = typeof votesTable.$inferSelect;
