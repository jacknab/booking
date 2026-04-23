import { Router } from "express";
import { db } from "../db";
import {
  trainingActionCategories,
  trainingUserState,
  trainingUserProfile,
  trainingEvents,
  type InsertTrainingEvent,
} from "../../shared/schema";
import { isAuthenticated } from "../auth";
import { eq, and } from "drizzle-orm";

const router = Router();

const uid = (req: any): string | null => {
  const id = req.user?.id ?? req.user?.claims?.sub ?? null;
  return id ? String(id) : null;
};

const VALID_EVENT_TYPES = new Set([
  "view",
  "success",
  "hesitation",
  "wrong-click",
  "help-requested",
  "abandoned",
]);

router.get("/state", isAuthenticated, async (req, res) => {
  try {
    const userId = uid(req);
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const [profile] = await db
      .select()
      .from(trainingUserProfile)
      .where(eq(trainingUserProfile.userId, userId));

    if (!profile) {
      return res.json({ enrolled: false, profile: null, categories: [], state: [] });
    }

    const categories = await db.select().from(trainingActionCategories);
    const state = await db
      .select()
      .from(trainingUserState)
      .where(eq(trainingUserState.userId, userId));

    res.json({
      enrolled: true,
      profile,
      categories,
      state,
    });
  } catch (err) {
    console.error("[training] /state error:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

router.post("/event", isAuthenticated, async (req, res) => {
  try {
    const userId = uid(req);
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { categorySlug, type, helpLevelAtTime, metadata } = req.body ?? {};
    if (!categorySlug || typeof categorySlug !== "string") {
      return res.status(400).json({ error: "categorySlug required" });
    }
    if (!VALID_EVENT_TYPES.has(type)) {
      return res.status(400).json({ error: "invalid event type" });
    }
    const helpLevel = Number.isInteger(helpLevelAtTime) ? helpLevelAtTime : 3;
    if (helpLevel < 0 || helpLevel > 3) {
      return res.status(400).json({ error: "helpLevelAtTime must be 0..3" });
    }

    const [category] = await db
      .select()
      .from(trainingActionCategories)
      .where(eq(trainingActionCategories.slug, categorySlug));
    if (!category) return res.status(404).json({ error: "unknown category" });

    const event: InsertTrainingEvent = {
      userId,
      categoryId: category.id,
      type,
      helpLevelAtTime: helpLevel,
      metadata: metadata ?? null,
    };
    await db.insert(trainingEvents).values(event);

    // Reducer wiring lands in Phase 1.2; for now we just persist the event
    // so the engine can backfill state when it ships.

    res.json({ ok: true });
  } catch (err) {
    console.error("[training] /event error:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

router.post("/reset/:userId", isAuthenticated, async (req, res) => {
  try {
    const actor = uid(req);
    if (!actor) return res.status(401).json({ error: "unauthorized" });
    const role = (req as any).user?.role ?? (req as any).user?.claims?.role;
    if (role !== "owner" && role !== "admin" && role !== "manager") {
      return res.status(403).json({ error: "forbidden" });
    }

    const targetUserId = String(req.params.userId);

    await db.delete(trainingEvents).where(eq(trainingEvents.userId, targetUserId));
    await db.delete(trainingUserState).where(eq(trainingUserState.userId, targetUserId));
    await db
      .update(trainingUserProfile)
      .set({ graduatedAt: null, graduationNotifiedOwner: false, enrolledAt: new Date() })
      .where(eq(trainingUserProfile.userId, targetUserId));

    res.json({ ok: true });
  } catch (err) {
    console.error("[training] /reset error:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
