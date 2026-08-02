import { Router, type IRouter } from "express";
import { db, votesTable, submissionsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

// POST /vote - cast a vote
router.post("/vote", async (req, res): Promise<void> => {
  const voterWallet = req.body?.voterWallet as string;
  const submissionId = Number(req.body?.submissionId);

  if (!voterWallet || !voterWallet.startsWith("0x")) {
    res.status(400).json({ error: "Valid voterWallet is required" });
    return;
  }
  if (!submissionId || isNaN(submissionId)) {
    res.status(400).json({ error: "Valid submissionId is required" });
    return;
  }

  // Check if submission exists
  const [submission] = await db
    .select()
    .from(submissionsTable)
    .where(eq(submissionsTable.id, submissionId))
    .limit(1);

  if (!submission) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  // Check if already voted
  const existing = await db
    .select()
    .from(votesTable)
    .where(eq(votesTable.voterWallet, voterWallet))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "You have already voted" });
    return;
  }

  const [vote] = await db
    .insert(votesTable)
    .values({ voterWallet, submissionId })
    .returning();

  req.log.info({ voterWallet, submissionId }, "Vote cast");
  res.status(201).json(vote);
});

// GET /votes - get vote counts per submission
router.get("/votes", async (req, res): Promise<void> => {
  const results = await db
    .select({
      submissionId: votesTable.submissionId,
      voteCount: count(votesTable.id),
    })
    .from(votesTable)
    .groupBy(votesTable.submissionId);

  res.json(results);
});

export default router;
