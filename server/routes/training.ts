import { Router } from "express";
import { db } from "../db";
import {
  trainingActionCategories,
  trainingUserState,
  trainingUserProfile,
  trainingEvents,
  type InsertTrainingEvent,
  type TrainingActionCategory,
  type TrainingUserState,
} from "../../shared/schema";
import { isAuthenticated } from "../auth";
import { eq, and } from "drizzle-orm";
import { reduce, type CategoryState, type TrainingEventType } from "../training/reducer";

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

// Auto-enroll any signed-in user who doesn't yet have a training profile.
// Owners may opt out via training_settings.auto_enroll_new_staff (Phase 7).
async function ensureProfile(userId: string) {
  const [existing] = await db
    .select()
    .from(trainingUserProfile)
    .where(eq(trainingUserProfile.userId, userId));
  if (existing) return existing;
  const [created] = await db
    .insert(trainingUserProfile)
    .values({ userId })
    .onConflictDoNothing()
    .returning();
  if (created) return created;
  // Lost the race — re-read.
  const [reread] = await db
    .select()
    .from(trainingUserProfile)
    .where(eq(trainingUserProfile.userId, userId));
  return reread;
}

router.get("/state", isAuthenticated, async (req, res) => {
  try {
    const userId = uid(req);
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const profile = await ensureProfile(userId);
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

    await ensureProfile(userId);

    // Persist the raw event first — the reducer below is best-effort.
    const eventRow: InsertTrainingEvent = {
      userId,
      categoryId: category.id,
      type,
      helpLevelAtTime: helpLevel,
      metadata: metadata ?? null,
    };
    await db.insert(trainingEvents).values(eventRow);

    // Load (or initialize) per-category state, run the reducer, write back.
    const [existing] = await db
      .select()
      .from(trainingUserState)
      .where(
        and(
          eq(trainingUserState.userId, userId),
          eq(trainingUserState.categoryId, category.id),
        ),
      );

    const now = new Date();
    const current: CategoryState = existing
      ? {
          helpLevel: existing.helpLevel,
          successStreak: existing.successStreak,
          failures: existing.failures,
          totalAttempts: existing.totalAttempts,
          lastSeenAt: existing.lastSeenAt,
          graduatedAt: existing.graduatedAt,
          pinnedLevel: existing.pinnedLevel,
          enrolledAt: existing.lastSeenAt ?? now,
        }
      : {
          helpLevel: category.defaultHelpLevel,
          successStreak: 0,
          failures: 0,
          totalAttempts: 0,
          lastSeenAt: null,
          graduatedAt: null,
          pinnedLevel: null,
          enrolledAt: now,
        };

    const nextState = reduce({
      state: current,
      event: { type: type as TrainingEventType, at: now },
      highRisk: category.highRisk,
    });

    if (existing) {
      await db
        .update(trainingUserState)
        .set({
          helpLevel: nextState.helpLevel,
          successStreak: nextState.successStreak,
          failures: nextState.failures,
          totalAttempts: nextState.totalAttempts,
          lastSeenAt: nextState.lastSeenAt,
          graduatedAt: nextState.graduatedAt,
        })
        .where(eq(trainingUserState.id, existing.id));
    } else {
      await db.insert(trainingUserState).values({
        userId,
        categoryId: category.id,
        helpLevel: nextState.helpLevel,
        successStreak: nextState.successStreak,
        failures: nextState.failures,
        totalAttempts: nextState.totalAttempts,
        lastSeenAt: nextState.lastSeenAt,
        graduatedAt: nextState.graduatedAt,
      });
    }

    res.json({
      ok: true,
      state: {
        categorySlug: category.slug,
        helpLevel: nextState.helpLevel,
        successStreak: nextState.successStreak,
        failures: nextState.failures,
        totalAttempts: nextState.totalAttempts,
        graduatedAt: nextState.graduatedAt,
      },
    });
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
