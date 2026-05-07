import Stripe from "stripe";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../db";
import { locations, staff } from "@shared/schema";
import { users } from "@shared/models/auth";
import {
  billingPlans,
  stripeCustomers,
  stripeSubscriptions,
  subscriptions,
  stripeOrders,
  scheduledPlanChanges,
  customerBillingProfiles,
  invoiceRecords,
  paymentTransactions,
  billingActivityLogs,
  refunds,
  subscriptionPlanChanges,
} from "@shared/schema/billing";

// ─── Stripe Client ────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  return new Stripe(key, { apiVersion: "2025-04-30.basil" });
}

export function stripeAvailable(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY);
}

// ─── Activity Logging ─────────────────────────────────────────────────────────

export async function logBillingActivity(opts: {
  salonId?: number | null;
  userId?: string | null;
  eventType: string;
  severity?: "info" | "warn" | "error" | "success";
  message: string;
  metadata?: Record<string, any>;
  source?: string;
  ipAddress?: string;
}): Promise<void> {
  try {
    await db.insert(billingActivityLogs).values({
      salonId: opts.salonId ?? null,
      userId: opts.userId ?? null,
      eventType: opts.eventType,
      severity: opts.severity ?? "info",
      message: opts.message,
      metadataJson: opts.metadata ?? null,
      source: opts.source ?? "system",
      ipAddress: opts.ipAddress ?? null,
    });
  } catch (err) {
    console.error("[BillingService] Failed to write activity log:", err);
  }
}

// ─── Customer Management ──────────────────────────────────────────────────────

export async function getOrCreateStripeCustomer(salonId: number): Promise<string> {
  const stripe = getStripe();

  const [store] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, salonId))
    .limit(1);

  if (!store) throw new Error(`Store ${salonId} not found`);

  const [existing] = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.storeNumber, salonId))
    .limit(1);

  if (existing) {
    try {
      await stripe.customers.update(existing.customerId, {
        name: store.name,
        email: store.email ?? undefined,
        phone: store.phone ?? undefined,
        metadata: { store_id: String(salonId), booking_slug: store.bookingSlug ?? "" },
      });
    } catch {
      // Non-fatal — customer might have been deleted in Stripe
    }
    return existing.customerId;
  }

  const customer = await stripe.customers.create({
    name: store.name,
    email: store.email ?? undefined,
    phone: store.phone ?? undefined,
    address: store.address ? {
      line1: store.address,
      city: store.city ?? undefined,
      state: store.state ?? undefined,
      postal_code: store.postcode ?? undefined,
      country: "US",
    } : undefined,
    metadata: { store_id: String(salonId), booking_slug: store.bookingSlug ?? "" },
  });

  await db.insert(stripeCustomers).values({
    userId: store.userId!,
    customerId: customer.id,
    storeNumber: salonId,
  });

  await upsertBillingProfile(store.userId!, salonId, { stripeCustomerId: customer.id });

  await logBillingActivity({
    salonId,
    userId: store.userId ?? null,
    eventType: "customer.created",
    message: `Stripe customer created: ${customer.id}`,
    metadata: { customerId: customer.id },
  });

  return customer.id;
}

async function upsertBillingProfile(
  userId: string,
  salonId: number,
  patch: Partial<typeof customerBillingProfiles.$inferInsert>
): Promise<void> {
  const [existing] = await db
    .select({ id: customerBillingProfiles.id })
    .from(customerBillingProfiles)
    .where(eq(customerBillingProfiles.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(customerBillingProfiles)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(customerBillingProfiles.userId, userId));
  } else {
    const [store] = await db.select().from(locations).where(eq(locations.id, salonId)).limit(1);
    await db.insert(customerBillingProfiles).values({
      userId,
      salonId,
      customerEmail: store?.email ?? null,
      customerName: store?.name ?? null,
      ...patch,
    });
  }
}

// ─── Billing Profile ─────────────────────────────────────────────────────────

export async function getBillingProfile(salonId: number): Promise<any> {
  const [store] = await db.select().from(locations).where(eq(locations.id, salonId)).limit(1);
  if (!store) throw new Error("Store not found");

  const [profile] = await db
    .select()
    .from(customerBillingProfiles)
    .where(eq(customerBillingProfiles.salonId, salonId))
    .limit(1);

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.storeNumber, salonId))
    .limit(1);

  const [stripeSub] = sub?.stripeCustomerId
    ? await db
        .select()
        .from(stripeSubscriptions)
        .where(eq(stripeSubscriptions.customerId, sub.stripeCustomerId))
        .limit(1)
    : [null];

  const [plan] = sub?.planCode
    ? await db.select().from(billingPlans).where(eq(billingPlans.code, sub.planCode)).limit(1)
    : [null];

  let paymentMethod: any = null;
  if (stripeSub?.paymentMethodBrand && stripeSub?.paymentMethodLast4) {
    paymentMethod = {
      brand: stripeSub.paymentMethodBrand,
      last4: stripeSub.paymentMethodLast4,
    };
  }

  return {
    profile: profile ?? null,
    subscription: sub ?? null,
    stripeSub: stripeSub ?? null,
    plan: plan ?? null,
    paymentMethod,
    store: { id: store.id, name: store.name, email: store.email },
  };
}

// ─── Checkout Session ─────────────────────────────────────────────────────────

export async function createCheckoutSession(opts: {
  salonId: number;
  planCode: string;
  interval?: "month" | "year";
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
  couponId?: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();

  const [plan] = await db
    .select()
    .from(billingPlans)
    .where(eq(billingPlans.code, opts.planCode))
    .limit(1);

  if (!plan) throw new Error(`Plan "${opts.planCode}" not found`);
  if (!plan.active) throw new Error(`Plan "${opts.planCode}" is not active`);

  const customerId = await getOrCreateStripeCustomer(opts.salonId);

  // Ensure a Stripe price exists for this plan
  const priceId = await ensureStripePrice(stripe, plan, opts.interval ?? "month");

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: { salon_id: String(opts.salonId), plan_code: opts.planCode },
    subscription_data: {
      metadata: { salon_id: String(opts.salonId), plan_code: opts.planCode },
      ...(opts.trialDays ? { trial_period_days: opts.trialDays } : {}),
    },
  };

  if (opts.couponId) {
    sessionParams.discounts = [{ coupon: opts.couponId }];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  await logBillingActivity({
    salonId: opts.salonId,
    eventType: "checkout.session.created",
    message: `Checkout session created for plan "${opts.planCode}"`,
    metadata: { sessionId: session.id, planCode: opts.planCode },
  });

  return { url: session.url!, sessionId: session.id };
}

async function ensureStripePrice(
  stripe: Stripe,
  plan: typeof billingPlans.$inferSelect,
  interval: "month" | "year"
): Promise<string> {
  if (plan.stripePriceId) return plan.stripePriceId;

  // Create or find product
  let productId = plan.stripeProductId;
  if (!productId) {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description ?? undefined,
      metadata: { plan_code: plan.code },
    });
    productId = product.id;
    await db
      .update(billingPlans)
      .set({ stripeProductId: productId })
      .where(eq(billingPlans.code, plan.code));
  }

  const price = await stripe.prices.create({
    unit_amount: Number(plan.priceCents),
    currency: plan.currency ?? "usd",
    recurring: { interval },
    product: productId,
    metadata: { plan_code: plan.code },
  });

  await db
    .update(billingPlans)
    .set({ stripePriceId: price.id })
    .where(eq(billingPlans.code, plan.code));

  return price.id;
}

// ─── Customer Portal ─────────────────────────────────────────────────────────

export async function createPortalSession(opts: {
  salonId: number;
  returnUrl: string;
}): Promise<{ url: string }> {
  const stripe = getStripe();
  const customerId = await getOrCreateStripeCustomer(opts.salonId);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: opts.returnUrl,
  });

  await logBillingActivity({
    salonId: opts.salonId,
    eventType: "portal.session.created",
    message: "Customer portal session created",
  });

  return { url: session.url };
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export async function getSubscription(salonId: number): Promise<any> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.storeNumber, salonId))
    .limit(1);

  if (!sub) return { active: false, status: "none" };

  const [plan] = await db
    .select()
    .from(billingPlans)
    .where(eq(billingPlans.code, sub.planCode))
    .limit(1);

  return {
    active: sub.status === "active" || sub.status === "trialing",
    ...sub,
    plan: plan ?? null,
  };
}

export async function cancelSubscription(opts: {
  salonId: number;
  stripeSubscriptionId: string;
  atPeriodEnd?: boolean;
  reason?: string;
  userId?: string;
}): Promise<any> {
  const stripe = getStripe();

  const updatedSub = opts.atPeriodEnd
    ? await stripe.subscriptions.update(opts.stripeSubscriptionId, { cancel_at_period_end: true })
    : await stripe.subscriptions.cancel(opts.stripeSubscriptionId);

  await db
    .update(subscriptions)
    .set({ status: updatedSub.status, cancelAtPeriodEnd: updatedSub.cancel_at_period_end ? 1 : 0, updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, opts.stripeSubscriptionId));

  await db
    .update(stripeSubscriptions)
    .set({ status: updatedSub.status, cancelAtPeriodEnd: updatedSub.cancel_at_period_end, updatedAt: new Date() })
    .where(eq(stripeSubscriptions.subscriptionId, opts.stripeSubscriptionId));

  await upsertBillingProfileBySalon(opts.salonId, {
    currentSubscriptionStatus: updatedSub.status,
    cancelAtPeriodEnd: updatedSub.cancel_at_period_end,
    canceledAt: updatedSub.canceled_at ? new Date(updatedSub.canceled_at * 1000) : null,
  });

  await logBillingActivity({
    salonId: opts.salonId,
    userId: opts.userId ?? null,
    eventType: "subscription.canceled",
    severity: "warn",
    message: opts.atPeriodEnd
      ? `Subscription set to cancel at period end`
      : `Subscription canceled immediately`,
    metadata: { subscriptionId: opts.stripeSubscriptionId, reason: opts.reason },
    source: "api",
  });

  return { status: updatedSub.status, cancelAtPeriodEnd: updatedSub.cancel_at_period_end };
}

export async function resumeSubscription(opts: {
  salonId: number;
  stripeSubscriptionId: string;
  userId?: string;
}): Promise<any> {
  const stripe = getStripe();

  const updatedSub = await stripe.subscriptions.update(opts.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await db
    .update(subscriptions)
    .set({ status: updatedSub.status, cancelAtPeriodEnd: 0, updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, opts.stripeSubscriptionId));

  await db
    .update(stripeSubscriptions)
    .set({ status: updatedSub.status, cancelAtPeriodEnd: false, updatedAt: new Date() })
    .where(eq(stripeSubscriptions.subscriptionId, opts.stripeSubscriptionId));

  await upsertBillingProfileBySalon(opts.salonId, {
    currentSubscriptionStatus: updatedSub.status,
    cancelAtPeriodEnd: false,
    canceledAt: null,
  });

  await logBillingActivity({
    salonId: opts.salonId,
    userId: opts.userId ?? null,
    eventType: "subscription.resumed",
    severity: "success",
    message: "Subscription cancellation reversed",
    source: "api",
  });

  return { status: updatedSub.status };
}

// ─── Plan Change (Upgrade / Downgrade) ───────────────────────────────────────

export async function previewPlanChange(opts: {
  salonId: number;
  newPlanCode: string;
  interval?: "month" | "year";
}): Promise<any> {
  const stripe = getStripe();

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.storeNumber, opts.salonId))
    .limit(1);

  if (!sub?.stripeSubscriptionId) throw new Error("No active subscription found");

  const [newPlan] = await db
    .select()
    .from(billingPlans)
    .where(eq(billingPlans.code, opts.newPlanCode))
    .limit(1);

  if (!newPlan) throw new Error(`Plan "${opts.newPlanCode}" not found`);

  const newPriceId = await ensureStripePrice(stripe, newPlan, opts.interval ?? "month");

  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
  const currentItemId = stripeSub.items.data[0]?.id;
  if (!currentItemId) throw new Error("Could not find subscription item");

  const preview = await stripe.invoices.retrieveUpcoming({
    customer: sub.stripeCustomerId!,
    subscription: sub.stripeSubscriptionId,
    subscription_items: [{ id: currentItemId, price: newPriceId }],
    subscription_proration_behavior: "create_prorations",
  });

  return {
    immediateChargeCents: preview.amount_due,
    nextInvoiceCents: preview.total,
    currency: preview.currency,
    lines: preview.lines.data.map((l) => ({
      description: l.description,
      amountCents: l.amount,
    })),
    newPlan,
  };
}

export async function changePlan(opts: {
  salonId: number;
  newPlanCode: string;
  interval?: "month" | "year";
  immediate?: boolean;
  userId?: string;
}): Promise<any> {
  const stripe = getStripe();

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.storeNumber, opts.salonId))
    .limit(1);

  if (!sub?.stripeSubscriptionId) throw new Error("No active subscription found");

  const [oldPlan] = await db
    .select()
    .from(billingPlans)
    .where(eq(billingPlans.code, sub.planCode))
    .limit(1);

  const [newPlan] = await db
    .select()
    .from(billingPlans)
    .where(eq(billingPlans.code, opts.newPlanCode))
    .limit(1);

  if (!newPlan) throw new Error(`Plan "${opts.newPlanCode}" not found`);

  const newPriceId = await ensureStripePrice(stripe, newPlan, opts.interval ?? "month");

  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
  const currentItemId = stripeSub.items.data[0]?.id;
  if (!currentItemId) throw new Error("Could not find subscription item");

  const isUpgrade = Number(newPlan.priceCents) > Number(oldPlan?.priceCents ?? 0);
  const changeType = isUpgrade ? "upgrade" : "downgrade";

  // Determine proration behavior
  const prorationBehavior = isUpgrade ? "create_prorations" : "none";

  const updatedSub = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    items: [{ id: currentItemId, price: newPriceId }],
    proration_behavior: prorationBehavior,
  });

  // Update local records
  await db
    .update(subscriptions)
    .set({
      planCode: opts.newPlanCode,
      priceId: newPriceId,
      status: updatedSub.status,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.storeNumber, opts.salonId));

  // Record the plan change
  await db.insert(subscriptionPlanChanges).values({
    salonId: opts.salonId,
    userId: opts.userId ?? null,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    oldPlanId: oldPlan?.id ?? null,
    newPlanId: newPlan.id,
    oldPriceCents: BigInt(Number(oldPlan?.priceCents ?? 0)) as any,
    newPriceCents: BigInt(Number(newPlan.priceCents)) as any,
    changeType,
    proractionUsed: isUpgrade,
    effectiveDate: new Date(),
    initiatedBy: opts.userId ?? "system",
  });

  await upsertBillingProfileBySalon(opts.salonId, {
    currentPlanId: newPlan.id,
    currentSubscriptionStatus: updatedSub.status,
  });

  await logBillingActivity({
    salonId: opts.salonId,
    userId: opts.userId ?? null,
    eventType: `subscription.plan.${changeType}`,
    severity: "info",
    message: `Plan ${changeType}d from "${oldPlan?.name ?? "unknown"}" to "${newPlan.name}"`,
    metadata: {
      oldPlanCode: oldPlan?.code,
      newPlanCode: opts.newPlanCode,
      prorationUsed: isUpgrade,
    },
    source: "api",
  });

  return { status: updatedSub.status, plan: newPlan };
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices(salonId: number, limit = 20): Promise<any[]> {
  const dbInvoices = await db
    .select()
    .from(invoiceRecords)
    .where(eq(invoiceRecords.salonId, salonId))
    .orderBy(desc(invoiceRecords.createdAt))
    .limit(limit);

  if (dbInvoices.length > 0) return dbInvoices;

  // Fallback: fetch live from Stripe if nothing cached locally
  if (!stripeAvailable()) return [];

  const stripe = getStripe();
  const [sub] = await db
    .select({ customerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.storeNumber, salonId))
    .limit(1);

  if (!sub?.customerId) return [];

  const stripeInvoices = await stripe.invoices.list({
    customer: sub.customerId,
    limit,
  });

  const mapped = stripeInvoices.data.map((inv) => ({
    stripeInvoiceId: inv.id,
    stripeCustomerId: inv.customer as string,
    stripeSubscriptionId: (inv.subscription as string) ?? null,
    salonId,
    invoiceNumber: inv.number ?? null,
    status: inv.status ?? null,
    paid: inv.paid,
    attempted: inv.attempted,
    totalCents: inv.total,
    amountPaidCents: inv.amount_paid,
    amountRemainingCents: inv.amount_remaining,
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    invoicePdfUrl: inv.invoice_pdf ?? null,
    billingReason: inv.billing_reason ?? null,
    createdAt: new Date(inv.created * 1000),
  }));

  return mapped;
}

export async function retryInvoicePayment(opts: {
  stripeInvoiceId: string;
  salonId: number;
  userId?: string;
}): Promise<any> {
  const stripe = getStripe();

  const invoice = await stripe.invoices.pay(opts.stripeInvoiceId);

  await logBillingActivity({
    salonId: opts.salonId,
    userId: opts.userId ?? null,
    eventType: "invoice.payment.retried",
    severity: invoice.paid ? "success" : "error",
    message: invoice.paid
      ? `Invoice ${opts.stripeInvoiceId} payment succeeded on retry`
      : `Invoice ${opts.stripeInvoiceId} payment failed on retry`,
    metadata: { invoiceId: opts.stripeInvoiceId },
    source: "api",
  });

  return { paid: invoice.paid, status: invoice.status };
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getTransactions(salonId: number, limit = 30): Promise<any[]> {
  return db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.salonId, salonId))
    .orderBy(desc(paymentTransactions.createdAt))
    .limit(limit);
}

// ─── Refunds ─────────────────────────────────────────────────────────────────

export async function issueRefund(opts: {
  stripeChargeId?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  amountCents?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  internalNotes?: string;
  salonId: number;
  userId?: string;
  initiatedByUserId?: string;
}): Promise<any> {
  const stripe = getStripe();

  if (!opts.stripeChargeId && !opts.stripePaymentIntentId) {
    throw new Error("Must provide either stripeChargeId or stripePaymentIntentId");
  }

  const refundParams: Stripe.RefundCreateParams = {
    ...(opts.stripeChargeId ? { charge: opts.stripeChargeId } : { payment_intent: opts.stripePaymentIntentId }),
    ...(opts.amountCents ? { amount: opts.amountCents } : {}),
    ...(opts.reason ? { reason: opts.reason } : {}),
  };

  const stripeRefund = await stripe.refunds.create(refundParams);

  const [insertedRefund] = await db
    .insert(refunds)
    .values({
      stripeRefundId: stripeRefund.id,
      stripeChargeId: opts.stripeChargeId ?? null,
      stripePaymentIntentId: opts.stripePaymentIntentId ?? null,
      stripeInvoiceId: opts.stripeInvoiceId ?? null,
      salonId: opts.salonId,
      userId: opts.userId ?? null,
      initiatedByUserId: opts.initiatedByUserId ?? null,
      amountCents: BigInt(stripeRefund.amount) as any,
      currency: stripeRefund.currency,
      reason: opts.reason ?? null,
      internalReasonNotes: opts.internalNotes ?? null,
      refundType: "manual",
      status: stripeRefund.status ?? "succeeded",
    })
    .returning();

  // Update the payment transaction record if it exists
  if (opts.stripeChargeId) {
    await db
      .update(paymentTransactions)
      .set({
        refunded: true,
        refundAmountCents: BigInt(stripeRefund.amount) as any,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.stripeChargeId, opts.stripeChargeId));
  }

  // Update lifetime value in billing profile
  await db
    .update(customerBillingProfiles)
    .set({
      lifetimeValueCents: sql`GREATEST(0, lifetime_value_cents - ${stripeRefund.amount})`,
      updatedAt: new Date(),
    })
    .where(eq(customerBillingProfiles.salonId, opts.salonId));

  await logBillingActivity({
    salonId: opts.salonId,
    userId: opts.initiatedByUserId ?? null,
    eventType: "refund.issued",
    severity: "warn",
    message: `Refund of ${(stripeRefund.amount / 100).toFixed(2)} ${stripeRefund.currency.toUpperCase()} issued`,
    metadata: {
      refundId: stripeRefund.id,
      amountCents: stripeRefund.amount,
      reason: opts.reason,
      internalNotes: opts.internalNotes,
      chargeId: opts.stripeChargeId,
    },
    source: "admin",
  });

  return insertedRefund;
}

export async function getRefunds(salonId: number, limit = 30): Promise<any[]> {
  return db
    .select()
    .from(refunds)
    .where(eq(refunds.salonId, salonId))
    .orderBy(desc(refunds.createdAt))
    .limit(limit);
}

// ─── Activity Timeline ────────────────────────────────────────────────────────

export async function getActivityTimeline(salonId: number, limit = 50): Promise<any[]> {
  return db
    .select()
    .from(billingActivityLogs)
    .where(eq(billingActivityLogs.salonId, salonId))
    .orderBy(desc(billingActivityLogs.createdAt))
    .limit(limit);
}

// ─── Admin Overview ───────────────────────────────────────────────────────────

export async function getAdminBillingOverview(): Promise<any> {
  const profiles = await db
    .select({
      profile: customerBillingProfiles,
      plan: billingPlans,
    })
    .from(customerBillingProfiles)
    .leftJoin(billingPlans, eq(customerBillingProfiles.currentPlanId, billingPlans.id))
    .orderBy(desc(customerBillingProfiles.createdAt))
    .limit(200);

  const totalMrrCents = profiles.reduce((sum, row) => {
    if (
      row.profile.currentSubscriptionStatus === "active" &&
      row.plan?.priceCents
    ) {
      return sum + Number(row.plan.priceCents);
    }
    return sum;
  }, 0);

  const delinquentCount = profiles.filter((r) => r.profile.delinquent).length;
  const activeCount = profiles.filter(
    (r) => r.profile.currentSubscriptionStatus === "active"
  ).length;
  const trialCount = profiles.filter(
    (r) => r.profile.currentSubscriptionStatus === "trialing"
  ).length;

  return {
    totalMrrCents,
    activeCount,
    trialCount,
    delinquentCount,
    profiles,
  };
}

export async function getAdminSalonBilling(salonId: number): Promise<any> {
  const [billing, invoiceList, txList, refundList, timeline, planChanges] =
    await Promise.all([
      getBillingProfile(salonId),
      getInvoices(salonId, 30),
      getTransactions(salonId, 30),
      getRefunds(salonId, 20),
      getActivityTimeline(salonId, 100),
      db
        .select()
        .from(subscriptionPlanChanges)
        .where(eq(subscriptionPlanChanges.salonId, salonId))
        .orderBy(desc(subscriptionPlanChanges.createdAt))
        .limit(30),
    ]);

  return { billing, invoices: invoiceList, transactions: txList, refunds: refundList, timeline, planChanges };
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export async function applyCoupon(opts: {
  salonId: number;
  couponId: string;
  userId?: string;
}): Promise<any> {
  const stripe = getStripe();

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.storeNumber, opts.salonId))
    .limit(1);

  if (!sub?.stripeSubscriptionId) throw new Error("No active subscription found");

  const coupon = await stripe.coupons.retrieve(opts.couponId);
  if (!coupon) throw new Error("Coupon not found");

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    coupon: opts.couponId,
  });

  await logBillingActivity({
    salonId: opts.salonId,
    userId: opts.userId ?? null,
    eventType: "coupon.applied",
    severity: "info",
    message: `Coupon "${opts.couponId}" applied`,
    metadata: { couponId: opts.couponId, couponName: coupon.name },
    source: "admin",
  });

  return { applied: true, coupon };
}

// ─── Plan List ────────────────────────────────────────────────────────────────

export async function getActivePlans(): Promise<any[]> {
  return db
    .select()
    .from(billingPlans)
    .where(eq(billingPlans.active, true))
    .orderBy(billingPlans.priceCents);
}

// ─── Account Status ───────────────────────────────────────────────────────────
//
// Three states:
//   active     → normal access
//   suspended  → payment failed; Stripe sub kept alive; user sees gate page
//   locked     → 30 days past due; Stripe sub canceled; must re-subscribe

export async function getAccountStatus(salonId: number): Promise<{
  accountStatus: string;
  suspendedAt: Date | null;
  lockedAt: Date | null;
  suspendedReason: string | null;
  salonId: number;
} | null> {
  const [profile] = await db
    .select({
      accountStatus: customerBillingProfiles.accountStatus,
      suspendedAt:   customerBillingProfiles.suspendedAt,
      lockedAt:      customerBillingProfiles.lockedAt,
      suspendedReason: customerBillingProfiles.suspendedReason,
    })
    .from(customerBillingProfiles)
    .where(eq(customerBillingProfiles.salonId, salonId))
    .limit(1);

  if (!profile) return null;
  return { ...profile, salonId };
}

export async function suspendAccount(
  salonId: number,
  reason: string = "Payment failed"
): Promise<void> {
  const [existing] = await db
    .select({ accountStatus: customerBillingProfiles.accountStatus })
    .from(customerBillingProfiles)
    .where(eq(customerBillingProfiles.salonId, salonId))
    .limit(1);

  // Only suspend if currently active — don't re-stamp suspendedAt if already suspended
  if (!existing || existing.accountStatus === "suspended" || existing.accountStatus === "locked") return;

  await db
    .update(customerBillingProfiles)
    .set({
      accountStatus:   "suspended",
      suspendedAt:     new Date(),
      suspendedReason: reason,
      updatedAt:       new Date(),
    })
    .where(eq(customerBillingProfiles.salonId, salonId));

  await logBillingActivity({
    salonId,
    eventType: "account.suspended",
    severity:  "warn",
    message:   `Account suspended: ${reason}`,
    metadata:  { reason },
    source:    "system",
  });
}

export async function restoreAccount(salonId: number): Promise<void> {
  const [existing] = await db
    .select({ accountStatus: customerBillingProfiles.accountStatus })
    .from(customerBillingProfiles)
    .where(eq(customerBillingProfiles.salonId, salonId))
    .limit(1);

  if (!existing || existing.accountStatus === "active") return;
  // Don't restore a locked account via a simple payment — admin must manually unlock
  if (existing.accountStatus === "locked") return;

  await db
    .update(customerBillingProfiles)
    .set({
      accountStatus:   "active",
      suspendedAt:     null,
      suspendedReason: null,
      delinquent:      false,
      updatedAt:       new Date(),
    })
    .where(eq(customerBillingProfiles.salonId, salonId));

  await logBillingActivity({
    salonId,
    eventType: "account.restored",
    severity:  "success",
    message:   "Account restored — payment succeeded",
    source:    "system",
  });
}

export async function lockAccount(salonId: number, reason: string = "30 days past due"): Promise<void> {
  const [existing] = await db
    .select({
      accountStatus:        customerBillingProfiles.accountStatus,
      stripeCustomerId:     customerBillingProfiles.stripeCustomerId,
    })
    .from(customerBillingProfiles)
    .where(eq(customerBillingProfiles.salonId, salonId))
    .limit(1);

  if (!existing || existing.accountStatus === "locked") return;

  // Cancel the Stripe subscription (soft — don't throw if Stripe fails)
  if (stripeAvailable() && existing.stripeCustomerId) {
    try {
      const stripe = new (await import("stripe")).default(
        process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY || "",
        { apiVersion: "2025-04-30.basil" as any }
      );
      const subs = await stripe.subscriptions.list({
        customer: existing.stripeCustomerId,
        status:   "past_due",
        limit:    5,
      });
      for (const sub of subs.data) {
        await stripe.subscriptions.cancel(sub.id);
      }
    } catch (err: any) {
      console.error("[BillingService] Failed to cancel Stripe subscription during lockout:", err.message);
    }
  }

  await db
    .update(customerBillingProfiles)
    .set({
      accountStatus:            "locked",
      lockedAt:                 new Date(),
      suspendedReason:          reason,
      currentSubscriptionStatus: "canceled",
      updatedAt:                new Date(),
    })
    .where(eq(customerBillingProfiles.salonId, salonId));

  await db
    .update(subscriptions)
    .set({ status: "canceled", updatedAt: new Date() })
    .where(eq(subscriptions.storeNumber, salonId));

  await logBillingActivity({
    salonId,
    eventType: "account.locked",
    severity:  "error",
    message:   `Account locked and subscription canceled: ${reason}`,
    metadata:  { reason },
    source:    "system",
  });
}

// Admin-only: manually restore a locked account (e.g. after manual payment arrangement)
export async function adminUnlockAccount(salonId: number, adminUserId: string): Promise<void> {
  await db
    .update(customerBillingProfiles)
    .set({
      accountStatus:   "active",
      suspendedAt:     null,
      lockedAt:        null,
      suspendedReason: null,
      delinquent:      false,
      updatedAt:       new Date(),
    })
    .where(eq(customerBillingProfiles.salonId, salonId));

  await logBillingActivity({
    salonId,
    userId:    adminUserId,
    eventType: "account.admin_unlocked",
    severity:  "info",
    message:   "Account manually unlocked by admin",
    metadata:  { adminUserId },
    source:    "admin",
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function upsertBillingProfileBySalon(
  salonId: number,
  patch: Partial<typeof customerBillingProfiles.$inferInsert>
): Promise<void> {
  const [existing] = await db
    .select({ id: customerBillingProfiles.id })
    .from(customerBillingProfiles)
    .where(eq(customerBillingProfiles.salonId, salonId))
    .limit(1);

  if (existing) {
    await db
      .update(customerBillingProfiles)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(customerBillingProfiles.salonId, salonId));
  }
}

// ─── Seat-Based Billing ───────────────────────────────────────────────────────

export const PRICE_PER_SEAT_CENTS = 800; // $8/month per seat

export async function getActiveStaffCount(salonId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(staff)
    .where(eq(staff.storeId, salonId));
  return Number(row?.count ?? 0);
}

export async function getSeatInfo(salonId: number): Promise<any> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.storeNumber, salonId))
    .limit(1);

  const [profile] = await db
    .select()
    .from(customerBillingProfiles)
    .where(eq(customerBillingProfiles.salonId, salonId))
    .limit(1);

  let purchasedSeats = 1;
  let stripeQuantity: number | null = null;
  let stripeSeatData: any = null;

  if (sub?.stripeSubscriptionId && stripeAvailable()) {
    try {
      const stripe = getStripe();
      const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
      stripeQuantity = stripeSub.items.data[0]?.quantity ?? null;
      if (stripeQuantity) purchasedSeats = stripeQuantity;

      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: sub.stripeCustomerId!,
        subscription: sub.stripeSubscriptionId,
      }).catch(() => null);

      stripeSeatData = {
        status: stripeSub.status,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        upcomingInvoiceCents: upcomingInvoice?.amount_due ?? null,
        nextPaymentAttempt: upcomingInvoice?.next_payment_attempt
          ? new Date(upcomingInvoice.next_payment_attempt * 1000)
          : null,
      };
    } catch {}
  }

  const activeStaffCount = await getActiveStaffCount(salonId);

  return {
    purchasedSeats,
    activeStaffCount,
    pricePerSeatCents: PRICE_PER_SEAT_CENTS,
    monthlyTotalCents: purchasedSeats * PRICE_PER_SEAT_CENTS,
    atSeatLimit: activeStaffCount >= purchasedSeats,
    hasSubscription: !!sub?.stripeSubscriptionId,
    subscription: sub ?? null,
    profile: profile ?? null,
    stripeSeatData,
  };
}

export async function previewSeatChange(salonId: number, newQuantity: number): Promise<any> {
  if (newQuantity < 1) throw new Error("Seat count must be at least 1");

  const stripe = getStripe();
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.storeNumber, salonId))
    .limit(1);

  if (!sub?.stripeSubscriptionId) throw new Error("No active subscription found");

  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
  const currentItem = stripeSub.items.data[0];
  if (!currentItem) throw new Error("Could not find subscription item");

  const currentQuantity = currentItem.quantity ?? 1;

  const preview = await stripe.invoices.retrieveUpcoming({
    customer: sub.stripeCustomerId!,
    subscription: sub.stripeSubscriptionId,
    subscription_items: [{ id: currentItem.id, quantity: newQuantity }],
    subscription_proration_behavior: "create_prorations",
  });

  const proratedLineCents = preview.lines.data
    .filter((l) => l.proration)
    .reduce((sum, l) => sum + l.amount, 0);

  return {
    currentQuantity,
    newQuantity,
    currentMonthlyCents: currentQuantity * PRICE_PER_SEAT_CENTS,
    newMonthlyCents: newQuantity * PRICE_PER_SEAT_CENTS,
    proratedChargeCents: proratedLineCents,
    immediateChargeCents: preview.amount_due,
    nextInvoiceCents: newQuantity * PRICE_PER_SEAT_CENTS,
    currency: preview.currency,
  };
}

export async function updateSeatQuantity(opts: {
  salonId: number;
  newQuantity: number;
  userId?: string;
}): Promise<any> {
  if (opts.newQuantity < 1) throw new Error("Seat count must be at least 1");

  const stripe = getStripe();
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.storeNumber, opts.salonId))
    .limit(1);

  if (!sub?.stripeSubscriptionId) throw new Error("No active subscription found");

  const activeStaffCount = await getActiveStaffCount(opts.salonId);
  if (opts.newQuantity < activeStaffCount) {
    throw new Error(
      `Cannot reduce to ${opts.newQuantity} seats — you have ${activeStaffCount} active staff members. Remove staff first.`
    );
  }

  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
  const currentItem = stripeSub.items.data[0];
  if (!currentItem) throw new Error("Could not find subscription item");

  const previousQuantity = currentItem.quantity ?? 1;

  const updatedSub = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    items: [{ id: currentItem.id, quantity: opts.newQuantity }],
    proration_behavior: "create_prorations",
  });

  await logBillingActivity({
    salonId: opts.salonId,
    userId: opts.userId ?? null,
    eventType: "subscription.seats.updated",
    severity: "info",
    message: `Seat count changed from ${previousQuantity} to ${opts.newQuantity} ($${(opts.newQuantity * PRICE_PER_SEAT_CENTS / 100).toFixed(2)}/mo)`,
    metadata: { previousQuantity, newQuantity: opts.newQuantity, pricePerSeatCents: PRICE_PER_SEAT_CENTS },
    source: "api",
  });

  return {
    success: true,
    previousQuantity,
    newQuantity: opts.newQuantity,
    newMonthlyCents: opts.newQuantity * PRICE_PER_SEAT_CENTS,
    status: updatedSub.status,
  };
}
