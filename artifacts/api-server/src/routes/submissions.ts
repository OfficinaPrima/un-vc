import { Router, type IRouter } from "express";
import { db, submissionsTable } from "@workspace/db";
import { CreateSubmissionBody } from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";
import { verifyUSDCDeposit } from "../lib/verifyDeposit";
import { getUser } from "../lib/auth";
import { isBanned } from "../lib/adminState";

const FUND_WALLET = process.env.FUND_WALLET_ADDRESS || "";

// Only allow real web links for decks, and thumbnails only from our own bucket.
const THUMBNAIL_PREFIX =
  "https://mnawrtomfagillerceer.supabase.co/storage/v1/object/public/thumbnails/";

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const router: IRouter = Router();

// Return the submissions belonging to the logged-in account.
router.get("/submissions/mine", async (req, res): Promise<void> => {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const mine = await db
    .select()
    .from(submissionsTable)
    .where(eq(submissionsTable.userId, user.id))
    .orderBy(submissionsTable.createdAt);
  res.json(mine);
});

router.post("/submissions", async (req, res): Promise<void> => {
  const parsed = CreateSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  if (!isHttpUrl(data.deckUrl)) {
    res.status(400).json({ error: "deckUrl must be a valid http(s) link." });
    return;
  }

  // Optional thumbnail URL — must point at our own storage bucket.
  const rawThumbnail =
    typeof req.body?.thumbnailUrl === "string" && req.body.thumbnailUrl
      ? req.body.thumbnailUrl
      : null;
  if (rawThumbnail && !rawThumbnail.startsWith(THUMBNAIL_PREFIX)) {
    res.status(400).json({ error: "thumbnailUrl must be an uploaded thumbnail." });
    return;
  }
  const thumbnailUrl = rawThumbnail;

  // Must be logged in to submit — this ties the deck to an account.
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "You must be logged in to submit a deck." });
    return;
  }

  if (await isBanned(user.id)) {
    res.status(403).json({ error: "Your account has been suspended." });
    return;
  }

  // Every submission requires a verified $50 USDC deposit.
  if (!FUND_WALLET) {
    res.status(500).json({ error: "Fund wallet not configured" });
    return;
  }

  let verification: Awaited<ReturnType<typeof verifyUSDCDeposit>>;
  try {
    verification = await verifyUSDCDeposit(data.walletAddress, FUND_WALLET);
  } catch (error: any) {
    req.log.error({ error: error.message, walletAddress: data.walletAddress }, "Deposit verification failed");
    res.status(503).json({
      error: "Deposit verification is temporarily unavailable. Please try again in a few minutes.",
      retry: true,
    });
    return;
  }
  if (!verification.verified) {
    res.status(402).json({
      error: "No verified $50 USDC deposit found from this wallet.",
      detail: "Send exactly $50 USDC to the fund address shown on the apply page, then retry.",
      amountFound: verification.amount,
      required: 50,
      retry: true,
    });
    return;
  }

  // Check for duplicate wallet
  const existing = await db
    .select()
    .from(submissionsTable)
    .where(eq(submissionsTable.walletAddress, data.walletAddress))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "This wallet has already submitted a deck." });
    return;
  }

  // Save submission, tied to the account
  const [submission] = await db
    .insert(submissionsTable)
    .values({
      userId: user.id,
      walletAddress: data.walletAddress,
      deckUrl: data.deckUrl,
      thumbnailUrl,
      description: data.description,
      teamSize: data.teamSize,
      status: "submitted",
      depositVerified: "true",
    })
    .returning();

  req.log.info({ userId: user.id, walletAddress: data.walletAddress }, "Submission created");
  res.status(201).json({
    ...submission,
    depositAmount: verification.amount,
    txHash: verification.txHash,
  });
});

router.get("/submissions", async (req, res): Promise<void> => {
  const status = req.query["status"];

  // Public gallery never shows booted submissions.
  const conditions = [eq(submissionsTable.removed, false)];
  if (status) {
    conditions.push(eq(submissionsTable.status, String(status)));
  }

  const submissions = await db
    .select()
    .from(submissionsTable)
    .where(and(...conditions))
    .orderBy(submissionsTable.createdAt);
  // Never expose account ids publicly.
  res.json(submissions.map(({ userId: _userId, ...pub }) => pub));
});

export default router;
