import { Router, type IRouter } from "express";
import { db, waitlistTable } from "@workspace/db";
import { CreateWaitlistEntryBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const adminKey = process.env["ADMIN_SECRET"];

router.post("/waitlist", async (req, res): Promise<void> => {
  const parsed = CreateWaitlistEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email } = parsed.data;

  const existing = await db
    .select()
    .from(waitlistTable)
    .where(eq(waitlistTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "This email is already on the waitlist." });
    return;
  }

  const [entry] = await db.insert(waitlistTable).values({ email }).returning();

  req.log.info({ email }, "Waitlist entry created");
  res.status(201).json(entry);
});

router.get("/waitlist", async (req, res): Promise<void> => {
  const key = req.query["key"];

  if (!adminKey) {
    res.status(401).json({ error: "Admin key not configured." });
    return;
  }

  if (key !== adminKey) {
    res.status(403).json({ error: "Invalid admin key." });
    return;
  }

  const entries = await db
    .select()
    .from(waitlistTable)
    .orderBy(waitlistTable.createdAt);

  res.json(entries);
});

export default router;
