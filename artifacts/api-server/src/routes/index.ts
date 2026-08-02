import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submissionsRouter from "./submissions";
import votingRouter from "./voting";
import networkRouter from "./network";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submissionsRouter);
router.use(votingRouter);
router.use(networkRouter);

export default router;
