import { Router, type IRouter } from "express";
import { getFundBalanceUsd } from "../lib/fundBalance";

const FUND_WALLET = process.env.FUND_WALLET_ADDRESS || "";
const TARGET_USD = 5000; // Fund 1 target

const router: IRouter = Router();

// Live fund balance + whether voting has unlocked.
router.get("/fund-status", async (req, res): Promise<void> => {
  if (!FUND_WALLET) {
    res.status(500).json({ error: "Fund wallet not configured" });
    return;
  }
  try {
    const balanceUsd = await getFundBalanceUsd(FUND_WALLET);
    res.json({
      balanceUsd,
      targetUsd: TARGET_USD,
      votingOpen: balanceUsd >= TARGET_USD,
    });
  } catch (err: any) {
    req.log.error({ error: err.message }, "Fund status fetch failed");
    res.status(503).json({ error: "Could not read the fund balance right now." });
  }
});

export default router;
