import { Router, type IRouter } from "express";
import { getNetworkStatus } from "../lib/etherscan";

const router: IRouter = Router();

router.get("/network-status", async (req, res): Promise<void> => {
  try {
    const status = await getNetworkStatus();
    res.json(status);
  } catch (error: any) {
    req.log.error({ error: error.message }, "Network status fetch failed");
    res.status(503).json({
      error: "Network data temporarily unavailable. Check Etherscan directly.",
      fallback: "https://etherscan.io/gastracker",
    });
  }
});

export default router;
