import { Router, type Request, type Response } from "express";
import {
  getActivePlans,
  getBillingProfile,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  previewPlanChange,
  changePlan,
  getInvoices,
  retryInvoicePayment,
  getTransactions,
  issueRefund,
  getRefunds,
  getActivityTimeline,
  getAdminBillingOverview,
  getAdminSalonBilling,
  applyCoupon,
  stripeAvailable,
  getAccountStatus,
  adminUnlockAccount,
} from "../services/billing-service";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { stripeCustomers } from "@shared/schema/billing";

const router = Router();

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  const role = req.session?.role;
  if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
  if (role !== "platform_admin" && role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
}

function getSalonId(req: any): number | null {
  const id = req.params.salonId ?? req.query.salonId ?? req.session?.storeId;
  return id ? Number(id) : null;
}

// ─── Plans ───────────────────────────────────────────────────────────────────

// GET /api/billing/plans
router.get("/plans", async (_req: Request, res: Response): Promise<void> => {
  try {
    const plans = await getActivePlans();
    res.json({ plans });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Stripe Status ────────────────────────────────────────────────────────────

// GET /api/billing/status
router.get("/status", (_req: Request, res: Response) => {
  res.json({ configured: stripeAvailable() });
});

// ─── Billing Profile ──────────────────────────────────────────────────────────

// GET /api/billing/profile/:salonId
router.get("/profile/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    const salonId = Number(req.params.salonId);
    const data = await getBillingProfile(salonId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Checkout ─────────────────────────────────────────────────────────────────

// POST /api/billing/checkout
router.post("/checkout", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const { salonId, planCode, interval, trialDays, couponId } = req.body;
    if (!salonId || !planCode) {
      res.status(400).json({ error: "salonId and planCode are required" });
      return;
    }

    const origin = req.headers.origin || `https://${req.hostname}`;
    const result = await createCheckoutSession({
      salonId: Number(salonId),
      planCode,
      interval: interval ?? "month",
      successUrl: `${origin}/manage/billing?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancelUrl: `${origin}/manage/billing?status=canceled`,
      trialDays: trialDays ? Number(trialDays) : undefined,
      couponId,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Customer Portal ──────────────────────────────────────────────────────────

// POST /api/billing/portal
router.post("/portal", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const { salonId } = req.body;
    if (!salonId) {
      res.status(400).json({ error: "salonId is required" });
      return;
    }

    const origin = req.headers.origin || `https://${req.hostname}`;
    const result = await createPortalSession({
      salonId: Number(salonId),
      returnUrl: `${origin}/manage/billing`,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Subscription ─────────────────────────────────────────────────────────────

// GET /api/billing/subscription/:salonId
router.get("/subscription/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    const data = await getSubscription(Number(req.params.salonId));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/cancel/:salonId
router.post("/cancel/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const { stripeSubscriptionId, atPeriodEnd, reason } = req.body;
    if (!stripeSubscriptionId) {
      res.status(400).json({ error: "stripeSubscriptionId is required" });
      return;
    }

    const result = await cancelSubscription({
      salonId: Number(req.params.salonId),
      stripeSubscriptionId,
      atPeriodEnd: atPeriodEnd !== false,
      reason,
      userId: req.session.userId,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/resume/:salonId
router.post("/resume/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const { stripeSubscriptionId } = req.body;
    if (!stripeSubscriptionId) {
      res.status(400).json({ error: "stripeSubscriptionId is required" });
      return;
    }

    const result = await resumeSubscription({
      salonId: Number(req.params.salonId),
      stripeSubscriptionId,
      userId: req.session.userId,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Plan Changes ─────────────────────────────────────────────────────────────

// GET /api/billing/plan-preview/:salonId?newPlanCode=...&interval=...
router.get("/plan-preview/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const { newPlanCode, interval } = req.query;
    if (!newPlanCode) {
      res.status(400).json({ error: "newPlanCode is required" });
      return;
    }

    const preview = await previewPlanChange({
      salonId: Number(req.params.salonId),
      newPlanCode: newPlanCode as string,
      interval: (interval as "month" | "year") ?? "month",
    });

    res.json(preview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/change-plan/:salonId
router.post("/change-plan/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const { newPlanCode, interval, immediate } = req.body;
    if (!newPlanCode) {
      res.status(400).json({ error: "newPlanCode is required" });
      return;
    }

    const result = await changePlan({
      salonId: Number(req.params.salonId),
      newPlanCode,
      interval: interval ?? "month",
      immediate: immediate !== false,
      userId: req.session.userId,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Invoices ─────────────────────────────────────────────────────────────────

// GET /api/billing/invoices/:salonId
router.get("/invoices/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit ?? 20);
    const data = await getInvoices(Number(req.params.salonId), limit);
    res.json({ invoices: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/invoices/:invoiceId/retry
router.post("/invoices/:invoiceId/retry", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const { salonId } = req.body;
    const result = await retryInvoicePayment({
      stripeInvoiceId: req.params.invoiceId,
      salonId: Number(salonId),
      userId: req.session.userId,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Transactions ─────────────────────────────────────────────────────────────

// GET /api/billing/transactions/:salonId
router.get("/transactions/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit ?? 30);
    const data = await getTransactions(Number(req.params.salonId), limit);
    res.json({ transactions: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Refunds ─────────────────────────────────────────────────────────────────

// GET /api/billing/refunds/:salonId
router.get("/refunds/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    const data = await getRefunds(Number(req.params.salonId));
    res.json({ refunds: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/refund
router.post("/refund", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const {
      stripeChargeId,
      stripePaymentIntentId,
      stripeInvoiceId,
      amountCents,
      reason,
      internalNotes,
      salonId,
      userId,
    } = req.body;

    if (!salonId) {
      res.status(400).json({ error: "salonId is required" });
      return;
    }

    const refund = await issueRefund({
      stripeChargeId,
      stripePaymentIntentId,
      stripeInvoiceId,
      amountCents: amountCents ? Number(amountCents) : undefined,
      reason,
      internalNotes,
      salonId: Number(salonId),
      userId: userId ?? req.session.userId,
      initiatedByUserId: req.session.userId,
    });

    res.json({ refund });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Coupon ───────────────────────────────────────────────────────────────────

// POST /api/billing/coupon
router.post("/coupon", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const { salonId, couponId } = req.body;
    if (!salonId || !couponId) {
      res.status(400).json({ error: "salonId and couponId are required" });
      return;
    }

    const result = await applyCoupon({ salonId: Number(salonId), couponId, userId: req.session.userId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Activity Timeline ────────────────────────────────────────────────────────

// GET /api/billing/activity/:salonId
router.get("/activity/:salonId", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const data = await getActivityTimeline(Number(req.params.salonId), limit);
    res.json({ activity: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/billing/admin/overview
router.get("/admin/overview", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getAdminBillingOverview();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/billing/admin/salon/:salonId
router.get("/admin/salon/:salonId", requireAdmin, async (req: any, res: Response): Promise<void> => {
  try {
    const data = await getAdminSalonBilling(Number(req.params.salonId));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/admin/refund — admin issues refund
router.post("/admin/refund", requireAdmin, async (req: any, res: Response): Promise<void> => {
  try {
    if (!stripeAvailable()) {
      res.status(503).json({ error: "Stripe is not configured on this server." });
      return;
    }

    const {
      stripeChargeId,
      stripePaymentIntentId,
      stripeInvoiceId,
      amountCents,
      reason,
      internalNotes,
      salonId,
      userId,
    } = req.body;

    if (!salonId) {
      res.status(400).json({ error: "salonId is required" });
      return;
    }

    const refund = await issueRefund({
      stripeChargeId,
      stripePaymentIntentId,
      stripeInvoiceId,
      amountCents: amountCents ? Number(amountCents) : undefined,
      reason,
      internalNotes,
      salonId: Number(salonId),
      userId,
      initiatedByUserId: req.session.userId,
    });

    res.json({ refund });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy route compatibility — keep existing endpoints working
// GET /api/billing/invoices/all (was mock data, now real)
router.get("/invoices/all", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const { db } = await import("../db");
    const { invoiceRecords } = await import("@shared/schema/billing");
    const { desc } = await import("drizzle-orm");
    const all = await db.select().from(invoiceRecords).orderBy(desc(invoiceRecords.createdAt)).limit(200);
    res.json({ data: all });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Account Status ────────────────────────────────────────────────────────────
// GET /api/billing/account-status
// Resolves the salonId from the session, returns the current account status.
// The AccountStatusGate component polls this to decide whether to block the UI.
router.get("/account-status", requireAuth, async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.session.userId;

    // Resolve the salonId for this user via the stripe_customers table
    // (falls back to session.storeId if available)
    let salonId: number | null = req.session.storeId ?? null;

    if (!salonId) {
      const [row] = await db
        .select({ storeNumber: stripeCustomers.storeNumber })
        .from(stripeCustomers)
        .where(eq(stripeCustomers.userId, userId))
        .limit(1);
      salonId = row?.storeNumber ?? null;
    }

    if (!salonId) {
      // No salon yet (new user, mid-onboarding) — allow through
      res.json({ accountStatus: "active", salonId: null, suspendedAt: null, lockedAt: null, suspendedReason: null });
      return;
    }

    const status = await getAccountStatus(salonId);
    if (!status) {
      // No billing profile yet — allow through
      res.json({ accountStatus: "active", salonId, suspendedAt: null, lockedAt: null, suspendedReason: null });
      return;
    }

    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/admin/unlock/:salonId — admin manually unlocks a locked account
router.post("/admin/unlock/:salonId", requireAdmin, async (req: any, res: Response): Promise<void> => {
  try {
    await adminUnlockAccount(Number(req.params.salonId), req.session.userId);
    res.json({ unlocked: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/billing/invoices/unpaid/count
router.get("/invoices/unpaid/count", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const { db } = await import("../db");
    const { invoiceRecords } = await import("@shared/schema/billing");
    const { eq, and, sql } = await import("drizzle-orm");
    const [row] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(invoiceRecords)
      .where(and(eq(invoiceRecords.paid, false), eq(invoiceRecords.attempted, true)));
    res.json({ count: Number(row?.count ?? 0) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
