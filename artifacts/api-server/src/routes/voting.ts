import { Router, type IRouter } from "express";
import { db, votesTable, submissionsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { getUser } from "../lib/auth";
import { getFundBalanceUsd } from "../lib/fundBalance";
import { isBanned, computeVotingOpen } from "../lib/adminState";

const FUND_WALLET = process.env.FUND_WALLET_ADDRESS || "";
const TARGET_USD = 5000;

const router: IRouter = Router();

// POST /vote — one vote per submitting founder, only once voting is open.
router.post("/vote", async (req, res): Promise<void> => {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "You must be logged in to vote." });
    return;
  }

  if (await isBanned(user.id)) {
    res.status(403).json({ error: "Your account has been suspended." });
    return;
  }

  // Voting must be open (fund reached its target, or admin override).
  try {
    const balance = await getFundBalanceUsd(FUND_WALLET);
    if (!(await computeVotingOpen(balance, TARGET_USD))) {
      res.status(403).json({ error: "Voting isn't open yet." });
      return;
    }
  } catch {
    res.status(503).json({ error: "Couldn't confirm voting status. Try again shortly." });
    return;
  }

  // Only founders who submitted a deck may vote.
  const [mySub] = await db
    .select()
    .from(submissionsTable)
    .where(eq(submissionsTable.userId, user.id))
    .limit(1);
  if (!mySub) {
    res.status(403).json({ error: "Only founders who've submitted a deck can vote." });
    return;
  }

  const submissionId = Number(req.body?.submissionId);
  if (!submissionId || Number.isNaN(submissionId)) {
    res.status(400).json({ error: "Valid submissionId is required" });
    return;
  }

  const [target] = await db
    .select()
    .from(submissionsTable)
    .where(eq(submissionsTable.id, submissionId))
    .limit(1);
  if (!target || target.removed) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  // One vote per account.
  const existing = await db
    .select()
    .from(votesTable)
    .where(eq(votesTable.voterUserId, user.id))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "You have already voted." });
    return;
  }

  const [vote] = await db
    .insert(votesTable)
    .values({
      voterUserId: user.id,
      voterWallet: mySub.walletAddress,
      submissionId,
    })
    .returning();

  req.log.info({ userId: user.id, submissionId }, "Vote cast");
  res.status(201).json(vote);
});

// GET /votes — vote counts per submission.
router.get("/votes", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      submissionId: votesTable.submissionId,
      voteCount: count(votesTable.id),
    })
    .from(votesTable)
    .groupBy(votesTable.submissionId);

  res.json(results);
});

// GET /votes/mine — which submission (if any) the logged-in user voted for.
router.get("/votes/mine", async (req, res): Promise<void> => {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [mine] = await db
    .select()
    .from(votesTable)
    .where(eq(votesTable.voterUserId, user.id))
    .limit(1);
  res.json({ submissionId: mine?.submissionId ?? null });
});

export default router;
