import { Router } from "express";
import { db } from "../db";
import {
  trainingActionCategories,
  trainingUserState,
  trainingUserProfile,
  trainingEvents,
  staff,
  locations,
  type InsertTrainingEvent,
  type TrainingActionCategory,
  type TrainingUserState,
} from "../../shared/schema";
import { users } from "../../shared/models/auth";
import { isAuthenticated } from "../auth";
import { eq, and, inArray, desc } from "drizzle-orm";
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

    // Phase 6 — overall graduation detection.
    // If this category just graduated AND every category is now graduated,
    // stamp the user's profile.graduatedAt so the owner gets a notification.
    if (nextState.graduatedAt) {
      const [profile] = await db
        .select()
        .from(trainingUserProfile)
        .where(eq(trainingUserProfile.userId, userId));
      if (profile && !profile.graduatedAt) {
        const allCategories = await db.select({ id: trainingActionCategories.id }).from(trainingActionCategories);
        const userStates = await db
          .select({ categoryId: trainingUserState.categoryId, graduatedAt: trainingUserState.graduatedAt })
          .from(trainingUserState)
          .where(eq(trainingUserState.userId, userId));
        const gradSet = new Set(userStates.filter((s) => s.graduatedAt).map((s) => s.categoryId));
        const allDone = allCategories.length > 0 && allCategories.every((c) => gradSet.has(c.id));
        if (allDone) {
          await db
            .update(trainingUserProfile)
            .set({ graduatedAt: new Date(), graduationNotifiedOwner: false })
            .where(eq(trainingUserProfile.userId, userId));
        }
      }
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

// === Owner / manager dashboard endpoints ===

function isManagerRole(role: unknown): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

/**
 * Verify the requester is a manager who can administer staff at `storeId`.
 * Owners are gated by `locations.userId`; managers/admins are trusted globally
 * (they're already authenticated and the UI scopes them per-store).
 */
async function assertManagesStore(req: any, storeId: number): Promise<boolean> {
  const role = req.user?.role ?? req.user?.claims?.role;
  if (!isManagerRole(role)) return false;
  if (role === "owner") {
    const [loc] = await db
      .select({ userId: locations.userId })
      .from(locations)
      .where(eq(locations.id, storeId));
    if (!loc) return false;
    if (loc.userId && loc.userId !== uid(req)) return false;
  }
  return true;
}

router.get("/admin/staff", isAuthenticated, async (req, res) => {
  try {
    const userId = uid(req);
    if (!userId) return res.status(401).json({ error: "unauthorized" });
    const storeId = Number(req.query.storeId);
    if (!Number.isInteger(storeId)) {
      return res.status(400).json({ error: "storeId required" });
    }
    if (!(await assertManagesStore(req, storeId))) {
      return res.status(403).json({ error: "forbidden" });
    }

    // Staff records for the store, plus any user accounts linked to them.
    const storeStaff = await db
      .select({ id: staff.id, name: staff.name })
      .from(staff)
      .where(eq(staff.storeId, storeId));
    const staffIds = storeStaff.map((s) => s.id);
    const staffNameById = new Map(storeStaff.map((s) => [s.id, s.name]));

    const linkedUsers = staffIds.length
      ? await db
          .select()
          .from(users)
          .where(inArray(users.staffId, staffIds))
      : [];

    const categories = await db.select().from(trainingActionCategories);
    const userIds = linkedUsers.map((u) => u.id);
    const states = userIds.length
      ? await db
          .select()
          .from(trainingUserState)
          .where(inArray(trainingUserState.userId, userIds))
      : [];
    const profiles = userIds.length
      ? await db
          .select()
          .from(trainingUserProfile)
          .where(inArray(trainingUserProfile.userId, userIds))
      : [];
    const profileByUser = new Map(profiles.map((p) => [p.userId, p]));
    const statesByUser = new Map<string, typeof states>();
    for (const s of states) {
      if (!statesByUser.has(s.userId)) statesByUser.set(s.userId, [] as any);
      statesByUser.get(s.userId)!.push(s);
    }

    const rows = linkedUsers.map((u) => {
      const userStates = statesByUser.get(u.id) ?? [];
      const totalCats = categories.length || 1;
      const graduated = userStates.filter((s) => s.graduatedAt).length;
      const lastSeen = userStates.reduce<Date | null>((acc, s) => {
        const d = s.lastSeenAt ? new Date(s.lastSeenAt) : null;
        if (!d) return acc;
        if (!acc || d.getTime() > acc.getTime()) return d;
        return acc;
      }, null);
      const avgLevel = userStates.length
        ? userStates.reduce((a, s) => a + s.helpLevel, 0) / userStates.length
        : 3;
      return {
        userId: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        staffId: u.staffId,
        staffName: u.staffId ? staffNameById.get(u.staffId) ?? null : null,
        profile: profileByUser.get(u.id) ?? null,
        graduatedCategories: graduated,
        totalCategories: totalCats,
        avgHelpLevel: Number(avgLevel.toFixed(2)),
        lastActivityAt: lastSeen ? lastSeen.toISOString() : null,
      };
    });

    res.json({ categories, staff: rows });
  } catch (err) {
    console.error("[training] /admin/staff error:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

router.get("/admin/staff/:userId", isAuthenticated, async (req, res) => {
  try {
    const requester = uid(req);
    if (!requester) return res.status(401).json({ error: "unauthorized" });
    const storeId = Number(req.query.storeId);
    if (!Number.isInteger(storeId)) {
      return res.status(400).json({ error: "storeId required" });
    }
    if (!(await assertManagesStore(req, storeId))) {
      return res.status(403).json({ error: "forbidden" });
    }
    const targetUserId = String(req.params.userId);

    const [target] = await db.select().from(users).where(eq(users.id, targetUserId));
    if (!target) return res.status(404).json({ error: "user not found" });

    const categories = await db.select().from(trainingActionCategories);
    const states = await db
      .select()
      .from(trainingUserState)
      .where(eq(trainingUserState.userId, targetUserId));
    const [profile] = await db
      .select()
      .from(trainingUserProfile)
      .where(eq(trainingUserProfile.userId, targetUserId));

    const recentEvents = await db
      .select()
      .from(trainingEvents)
      .where(eq(trainingEvents.userId, targetUserId))
      .orderBy(desc(trainingEvents.occurredAt))
      .limit(50);

    res.json({
      user: {
        id: target.id,
        email: target.email,
        firstName: target.firstName,
        lastName: target.lastName,
        role: target.role,
      },
      profile,
      categories,
      state: states,
      recentEvents,
    });
  } catch (err) {
    console.error("[training] /admin/staff/:userId error:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * Phase 6 — Pending graduation notifications for the owner.
 * Returns staff (in stores the requester manages) whose profile has
 * graduatedAt set but graduationNotifiedOwner is still false.
 */
router.get("/notifications", isAuthenticated, async (req, res) => {
  try {
    const requester = uid(req);
    if (!requester) return res.status(401).json({ error: "unauthorized" });
    const role = (req as any).user?.role ?? (req as any).user?.claims?.role;
    if (!isManagerRole(role)) return res.json({ notifications: [] });

    // Find every store this user manages (owners) — managers/admins see all.
    let storeFilter: number[] | null = null;
    if (role === "owner") {
      const owned = await db
        .select({ id: locations.id })
        .from(locations)
        .where(eq(locations.userId, requester));
      storeFilter = owned.map((s) => s.id);
      if (storeFilter.length === 0) return res.json({ notifications: [] });
    }

    // Pull graduated, un-notified profiles.
    const pendingProfiles = await db
      .select()
      .from(trainingUserProfile);
    const candidates = pendingProfiles.filter(
      (p) => p.graduatedAt && !p.graduationNotifiedOwner,
    );
    if (candidates.length === 0) return res.json({ notifications: [] });

    const candidateUserIds = candidates.map((p) => p.userId);
    const candidateUsers = await db
      .select()
      .from(users)
      .where(inArray(users.id, candidateUserIds));

    // Filter by manager scope: their staffId must belong to a store in scope.
    const staffIds = candidateUsers.map((u) => u.staffId).filter((x): x is number => !!x);
    const staffRows = staffIds.length
      ? await db.select().from(staff).where(inArray(staff.id, staffIds))
      : [];
    const staffById = new Map(staffRows.map((s) => [s.id, s]));

    const notifications = candidateUsers
      .map((u) => {
        if (!u.staffId) return null;
        const sRow = staffById.get(u.staffId);
        if (!sRow) return null;
        if (storeFilter && (!sRow.storeId || !storeFilter.includes(sRow.storeId))) return null;
        const profile = candidates.find((p) => p.userId === u.id)!;
        return {
          userId: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          staffName: sRow.name,
          storeId: sRow.storeId,
          graduatedAt: profile.graduatedAt,
        };
      })
      .filter(Boolean);

    res.json({ notifications });
  } catch (err) {
    console.error("[training] /notifications error:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

router.post("/notifications/dismiss", isAuthenticated, async (req, res) => {
  try {
    const requester = uid(req);
    if (!requester) return res.status(401).json({ error: "unauthorized" });
    const role = (req as any).user?.role ?? (req as any).user?.claims?.role;
    if (!isManagerRole(role)) return res.status(403).json({ error: "forbidden" });
    const { userId } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: "userId required" });

    await db
      .update(trainingUserProfile)
      .set({ graduationNotifiedOwner: true })
      .where(eq(trainingUserProfile.userId, String(userId)));

    res.json({ ok: true });
  } catch (err) {
    console.error("[training] /notifications/dismiss error:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

router.post("/admin/pin", isAuthenticated, async (req, res) => {
  try {
    const requester = uid(req);
    if (!requester) return res.status(401).json({ error: "unauthorized" });
    const { userId, categoryId, pinnedLevel, storeId } = req.body ?? {};
    if (!userId || !Number.isInteger(categoryId) || !Number.isInteger(storeId)) {
      return res.status(400).json({ error: "userId, categoryId, storeId required" });
    }
    const pin: number | null =
      pinnedLevel === null || pinnedLevel === undefined ? null : Number(pinnedLevel);
    if (pin !== null && (!Number.isInteger(pin) || pin < 0 || pin > 3)) {
      return res.status(400).json({ error: "pinnedLevel must be 0..3 or null" });
    }
    if (!(await assertManagesStore(req, storeId))) {
      return res.status(403).json({ error: "forbidden" });
    }

    const [existing] = await db
      .select()
      .from(trainingUserState)
      .where(
        and(
          eq(trainingUserState.userId, String(userId)),
          eq(trainingUserState.categoryId, categoryId),
        ),
      );

    if (existing) {
      await db
        .update(trainingUserState)
        .set({
          pinnedLevel: pin,
          // When pinning, snap visible level to the pin so behavior is immediate.
          helpLevel: pin !== null ? pin : existing.helpLevel,
        })
        .where(eq(trainingUserState.id, existing.id));
    } else {
      const [cat] = await db
        .select()
        .from(trainingActionCategories)
        .where(eq(trainingActionCategories.id, categoryId));
      if (!cat) return res.status(404).json({ error: "category not found" });
      await db.insert(trainingUserState).values({
        userId: String(userId),
        categoryId,
        helpLevel: pin ?? cat.defaultHelpLevel,
        pinnedLevel: pin,
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[training] /admin/pin error:", err);
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
