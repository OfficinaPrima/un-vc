import { Router, type IRouter, type Request } from "express";
import { db, submissionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getUser } from "../lib/auth";

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

export default router;
