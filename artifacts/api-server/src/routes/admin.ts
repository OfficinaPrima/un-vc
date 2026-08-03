import { Router, type IRouter, type Request } from "express";
import { db, submissionsTable, votesTable, bannedUsersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { getUser } from "../lib/auth";
import { getVotingMode, setVotingMode, type VotingMode } from "../lib/adminState";

// Accounts allowed to use the admin panel.
const ADMIN_USER_IDS = ["722b6e63-9d77-4d52-980a-56c75fe2478e"];

const router: IRouter = Router();

async function getAdmin(req: Request): Promise<{ id: string } | null> {
  const user = await getUser(req);
  if (!user || !ADMIN_USER_IDS.includes(user.id)) return null;
  return user;
}

// Is the logged-in user an admin? (used by the frontend to show the panel)
router.get("/admin/status", async (req, res): Promise<void> => {
  const user = await getUser(req);
  res.json({ isAdmin: !!user && ADMIN_USER_IDS.includes(user.id) });
});

// Admin sees ALL submissions, including booted ones.
router.get("/admin/submissions", async (req, res): Promise<void> => {
  const admin = await getAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const all = await db
    .select()
    .from(submissionsTable)
    .orderBy(submissionsTable.createdAt);
  res.json(all);
});

// Boot (soft-remove) or reinstate a submission.
router.post("/admin/remove", async (req, res): Promise<void> => {
  const admin = await getAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const submissionId = Number(req.body?.submissionId);
  const removed = Boolean(req.body?.removed);
  if (!submissionId || Number.isNaN(submissionId)) {
    res.status(400).json({ error: "Valid submissionId is required" });
    return;
  }
  const [updated] = await db
    .update(submissionsTable)
    .set({ removed })
    .where(eq(submissionsTable.id, submissionId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }
  req.log.info({ submissionId, removed }, "Submission boot state updated");
  res.json(updated);
});

// Mark or unmark a submission as a lottery winner.
router.post("/admin/winner", async (req, res): Promise<void> => {
  const admin = await getAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const submissionId = Number(req.body?.submissionId);
  const winner = Boolean(req.body?.winner);
  if (!submissionId || Number.isNaN(submissionId)) {
    res.status(400).json({ error: "Valid submissionId is required" });
    return;
  }
  const [updated] = await db
    .update(submissionsTable)
    .set({ winner })
    .where(eq(submissionsTable.id, submissionId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }
  req.log.info({ submissionId, winner }, "Lottery winner updated");
  res.json(updated);
});

// List banned user ids.
router.get("/admin/banned", async (req, res): Promise<void> => {
  const admin = await getAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const rows = await db.select().from(bannedUsersTable);
  res.json(rows.map((r) => r.userId));
});

// Ban or unban an account (blocks submitting and voting).
router.post("/admin/ban", async (req, res): Promise<void> => {
  const admin = await getAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const userId = String(req.body?.userId || "");
  const banned = Boolean(req.body?.banned);
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }
  if (banned) {
    const [existing] = await db
      .select()
      .from(bannedUsersTable)
      .where(eq(bannedUsersTable.userId, userId))
      .limit(1);
    if (!existing) await db.insert(bannedUsersTable).values({ userId });
  } else {
    await db.delete(bannedUsersTable).where(eq(bannedUsersTable.userId, userId));
  }
  req.log.info({ userId, banned }, "User ban state updated");
  res.json({ userId, banned });
});

// Set voting mode: "auto" | "open" | "closed".
router.post("/admin/voting", async (req, res): Promise<void> => {
  const admin = await getAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const mode = String(req.body?.mode) as VotingMode;
  if (mode !== "auto" && mode !== "open" && mode !== "closed") {
    res.status(400).json({ error: "mode must be auto, open, or closed" });
    return;
  }
  await setVotingMode(mode);
  req.log.info({ mode }, "Voting mode updated");
  res.json({ mode: await getVotingMode() });
});

// Export all submissions + vote counts as CSV.
router.get("/admin/export", async (req, res): Promise<void> => {
  const admin = await getAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const subs = await db
    .select()
    .from(submissionsTable)
    .orderBy(submissionsTable.createdAt);
  const voteRows = await db
    .select({
      submissionId: votesTable.submissionId,
      voteCount: count(votesTable.id),
    })
    .from(votesTable)
    .groupBy(votesTable.submissionId);
  const votesById = new Map(voteRows.map((v) => [v.submissionId, v.voteCount]));

  // Quote cells and defuse spreadsheet formula injection (=, +, -, @ prefixes).
  const esc = (v: unknown) => {
    let s = String(v ?? "").replace(/"/g, '""');
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s}"`;
  };
  const header = [
    "id",
    "createdAt",
    "userId",
    "walletAddress",
    "description",
    "deckUrl",
    "thumbnailUrl",
    "votes",
    "winner",
    "removed",
  ];
  const lines = [header.join(",")];
  for (const s of subs) {
    lines.push(
      [
        s.id,
        s.createdAt,
        s.userId,
        s.walletAddress,
        s.description,
        s.deckUrl,
        s.thumbnailUrl,
        votesById.get(s.id) ?? 0,
        s.winner,
        s.removed,
      ]
        .map(esc)
        .join(","),
    );
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="un-vc-submissions.csv"',
  );
  res.send(lines.join("\n"));
});

export default router;
