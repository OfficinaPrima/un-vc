import { Router, type IRouter } from "express";
import { db, submissionsTable } from "@workspace/db";
import { CreateSubmissionBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { verifyUSDCDeposit } from "../lib/verifyDeposit";
import { getUser } from "../lib/auth";

const FUND_WALLET = process.env.FUND_WALLET_ADDRESS || "";

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

  // Must be logged in to submit — this ties the deck to an account.
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "You must be logged in to submit a deck." });
    return;
  }

  // Development test accounts may submit without a deposit. Everyone else must
  // have a verified $50 USDC deposit. (Remove this allowlist before launch.)
  const TEST_USER_IDS = ["722b6e63-9d77-4d52-980a-56c75fe2478e"];
  const skipDeposit = TEST_USER_IDS.includes(user.id);

  let verification: { verified: boolean; amount: number; txHash: string | null } = {
    verified: true,
    amount: 0,
    txHash: null,
  };

  if (!skipDeposit) {
    if (!FUND_WALLET) {
      res.status(500).json({ error: "Fund wallet not configured" });
      return;
    }
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
      description: data.description,
      teamSize: data.teamSize,
      status: "pending",
      depositVerified: skipDeposit ? "test" : "true",
    })
    .returning();

  req.log.info({ userId: user.id, walletAddress: data.walletAddress, skipDeposit }, "Submission created");
  res.status(201).json({
    ...submission,
    depositAmount: verification.amount,
    txHash: verification.txHash,
  });
});

router.get("/submissions", async (req, res): Promise<void> => {
  const status = req.query["status"];

  let query = db.select().from(submissionsTable);

  if (status) {
    query = query.where(eq(submissionsTable.status, String(status))) as typeof query;
  }

  const submissions = await query.orderBy(submissionsTable.createdAt);
  res.json(submissions);
});

router.post("/submissions/verify", async (req, res): Promise<void> => {
  const walletAddress = req.body?.walletAddress as string;
  if (!walletAddress || !walletAddress.startsWith("0x")) {
    res.status(400).json({ error: "Valid walletAddress is required" });
    return;
  }

  if (!FUND_WALLET) {
    res.status(500).json({ error: "Fund wallet not configured" });
    return;
  }

  try {
    const result = await verifyUSDCDeposit(walletAddress, FUND_WALLET);

    // Update submission in DB if verified
    if (result.verified) {
      await db
        .update(submissionsTable)
        .set({ depositVerified: "true" })
        .where(eq(submissionsTable.walletAddress, walletAddress));
    }

    res.json({
      ...result,
      status: result.verified ? "verified" : "unverified",
    });
  } catch (error: any) {
    req.log.error({ error: error.message, walletAddress }, "Deposit verification failed");
    res.status(500).json({ error: "Failed to verify deposit. Please try again." });
  }
});

export default router;
