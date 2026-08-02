import { Router, type IRouter } from "express";
import { db, submissionsTable } from "@workspace/db";
import { CreateSubmissionBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { verifyUSDCDeposit } from "../lib/verifyDeposit";

const FUND_WALLET = process.env.FUND_WALLET_ADDRESS || "";

const router: IRouter = Router();

router.post("/submissions", async (req, res): Promise<void> => {
  const parsed = CreateSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  if (!FUND_WALLET) {
    res.status(500).json({ error: "Fund wallet not configured" });
    return;
  }

  // 1. Verify USDC deposit before saving
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

  // 2. Check for duplicate wallet
  const existing = await db
    .select()
    .from(submissionsTable)
    .where(eq(submissionsTable.walletAddress, data.walletAddress))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "This wallet has already submitted a deck." });
    return;
  }

  // 3. Save submission with verified flag
  const [submission] = await db
    .insert(submissionsTable)
    .values({
      walletAddress: data.walletAddress,
      deckUrl: data.deckUrl,
      description: data.description,
      teamSize: data.teamSize,
      status: "pending",
      depositVerified: "true",
    })
    .returning();

  req.log.info({ walletAddress: data.walletAddress, txHash: verification.txHash }, "Submission created and deposit verified");
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
