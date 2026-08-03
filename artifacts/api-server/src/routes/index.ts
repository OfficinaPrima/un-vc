import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submissionsRouter from "./submissions";
import votingRouter from "./voting";
import networkRouter from "./network";
import fundRouter from "./fund";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submissionsRouter);
router.use(votingRouter);
router.use(networkRouter);
router.use(fundRouter);

export default router;
