import { db, bannedUsersTable, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export type VotingMode = "auto" | "open" | "closed";

export async function isBanned(userId: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(bannedUsersTable)
    .where(eq(bannedUsersTable.userId, userId))
    .limit(1);
  return !!row;
}

export async function getVotingMode(): Promise<VotingMode> {
  const [row] = await db.select().from(appSettingsTable).limit(1);
  const mode = row?.votingOverride;
  return mode === "open" || mode === "closed" ? mode : "auto";
}

export async function setVotingMode(mode: VotingMode): Promise<void> {
  const [existing] = await db.select().from(appSettingsTable).limit(1);
  if (existing) {
    await db
      .update(appSettingsTable)
      .set({ votingOverride: mode })
      .where(eq(appSettingsTable.id, existing.id));
  } else {
    await db.insert(appSettingsTable).values({ votingOverride: mode });
  }
}

// Voting is open if the admin forced it, otherwise when the fund hits target.
export async function computeVotingOpen(
  balanceUsd: number,
  targetUsd: number,
): Promise<boolean> {
  const mode = await getVotingMode();
  if (mode === "open") return true;
  if (mode === "closed") return false;
  return balanceUsd >= targetUsd;
}
