import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const submissionsTable = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  walletAddress: text("wallet_address").notNull(),
  deckUrl: text("deck_url").notNull(),
  description: text("description").notNull(),
  teamSize: integer("team_size").notNull(),
  status: text("status").notNull().default("pending"),
  depositVerified: text("deposit_verified").notNull().default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const createSubmissionSchema = insertSubmissionSchema.pick({ walletAddress: true, deckUrl: true, description: true, teamSize: true });
export const submissionStatusSchema = z.enum(["pending", "reviewing", "approved", "rejected", "lottery"]).default("pending");
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type CreateSubmission = z.infer<typeof createSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;
