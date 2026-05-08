import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard, FileText, RefreshCw, XCircle, CheckCircle, Clock,
  AlertTriangle, Download, ExternalLink, ArrowLeft, Loader2, Zap,
  Shield, LifeBuoy, ChevronRight, Calendar, BarChart3, Pause, PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BillingData {
  profile: any;
  subscription: any;
  stripeSub: any;
  plan: any;
  paymentMethod: { brand: string; last4: string; expMonth?: number; expYear?: number } | null;
  store: { id: number; name: string; email: string };
}

interface Invoice {
  id: number;
  stripeInvoiceId: string;
  invoiceNumber: string | null;
  status: string | null;
  paid: boolean;
  totalCents: number;
  amountPaidCents: number;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  billingReason: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCents(cents: number | string | null | undefined): string {
  if (cents == null) return "$0.00";
  const n = Number(cents);
  if (n % 100 === 0) return `$${(n / 100).toFixed(0)}`;
  return `$${(n / 100).toFixed(2)}`;
}

function formatCentsExact(cents: number | string | null | undefined): string {
  if (cents == null) return "$0.00";
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(path, { credentials: "include", ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string; icon: any }> = {
  active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400", icon: CheckCircle },
  trialing: { label: "Trial", cls: "bg-violet-500/15 text-violet-300 border-violet-500/30", dot: "bg-violet-400", icon: Zap },
  past_due: { label: "Past Due", cls: "bg-red-500/15 text-red-400 border-red-500/30", dot: "bg-red-400", icon: AlertTriangle },
  canceled: { label: "Canceled", cls: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30", dot: "bg-zinc-500", icon: XCircle },
  unpaid: { label: "Unpaid", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30", dot: "bg-orange-400", icon: AlertTriangle },
  paused: { label: "Paused", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30", dot: "bg-blue-400", icon: Pause },
  scheduled_for_cancellation: { label: "Canceling", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30", dot: "bg-amber-400", icon: Clock },
  none: { label: "No Plan", cls: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30", dot: "bg-zinc-600", icon: Clock },
};

function getStatusConfig(status: string | null | undefined) {
  return STATUS_CONFIG[status ?? "none"] ?? STATUS_CONFIG["none"];
}

const CANCEL_REASONS = [
  "Too expensive for my business",
  "Switching to a different software",
  "Not using it enough",
  "Missing features I need",
  "Technical issues or bugs",
  "Just taking a break",
  "Other",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BillingPage({ salonId }: { salonId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cancelStep, setCancelStep] = useState<"idle" | "reason" | "confirm">("idle");
  const [cancelReason, setCancelReason] = useState("");

  const sessionStatus = searchParams.get("status");

  // ── Data fetching ────────────────────────────────────────────────────────────

  const { data: billing, isLoading: billingLoading } = useQuery<BillingData>({
    queryKey: ["billing-profile", salonId],
    queryFn: () => apiFetch(`/api/billing/profile/${salonId}`),
  });

  const { data: invoicesData } = useQuery<{ invoices: Invoice[] }>({
    queryKey: ["billing-invoices", salonId],
    queryFn: () => apiFetch(`/api/billing/invoices/${salonId}`),
  });

  const { data: stripeStatus } = useQuery<{ configured: boolean }>({
    queryKey: ["stripe-status"],
    queryFn: () => apiFetch("/api/billing/status"),
  });

  const stripeConfigured = stripeStatus?.configured ?? false;

  // ── Mutations ────────────────────────────────────────────────────────────────

  const portalMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId }),
      }),
    onSuccess: ({ url }) => { window.location.href = url; },
    onError: (err: any) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/billing/cancel/${salonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeSubscriptionId: billing?.subscription?.stripeSubscriptionId,
          atPeriodEnd: true,
          reason: cancelReason,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-profile", salonId] });
      setCancelStep("idle");
      toast({
        title: "Cancellation scheduled",
        description: "Your subscription will end at the current billing period.",
      });
    },
    onError: (err: any) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const resumeMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/billing/resume/${salonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeSubscriptionId: billing?.subscription?.stripeSubscriptionId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-profile", salonId] });
      toast({ title: "Subscription resumed", description: "Your cancellation has been reversed." });
    },
    onError: (err: any) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const retryMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      apiFetch(`/api/billing/invoices/${invoiceId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId }),
      }),
    onSuccess: ({ paid }) => {
      queryClient.invalidateQueries({ queryKey: ["billing-invoices", salonId] });
      queryClient.invalidateQueries({ queryKey: ["billing-profile", salonId] });
      if (paid) toast({ title: "Payment successful", description: "Your invoice has been paid." });
      else toast({ title: "Payment failed", description: "The payment could not be processed.", variant: "destructive" });
    },
    onError: (err: any) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // ── Derived state ─────────────────────────────────────────────────────────────

  const sub = billing?.subscription;
  const profile = billing?.profile;
  const pm = billing?.paymentMethod;
  const plan = billing?.plan;

  const subStatus = sub?.status ?? profile?.currentSubscriptionStatus;
  const statusCfg = getStatusConfig(subStatus);

  const isScheduledToCancel =
    sub?.cancelAtPeriodEnd === 1 || sub?.cancelAtPeriodEnd === true;

  const isActive = subStatus === "active" || subStatus === "trialing";
  const isTrialing = subStatus === "trialing";
  const isPastDue = subStatus === "past_due";

  const periodEnd = sub?.currentPeriodEnd
    ? new Date(Number(sub.currentPeriodEnd) > 1e10 ? sub.currentPeriodEnd : Number(sub.currentPeriodEnd) * 1000)
    : null;

  const planFeatures: string[] = plan?.featuresJson?.features ?? [];

  if (billingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto" />
          <p className="text-zinc-500 text-sm">Loading billing information…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pb-16">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/manage")}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Billing & Subscription</h1>
          <p className="text-zinc-500 text-xs mt-0.5">{billing?.store?.name}</p>
        </div>
      </div>

      {/* ── Session banners ───────────────────────────────────────────────────── */}
      {sessionStatus === "success" && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-300 text-sm font-medium">Subscription activated — welcome aboard!</span>
        </div>
      )}
      {sessionStatus === "canceled" && (
        <div className="bg-zinc-800/50 border border-zinc-700/40 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-zinc-400 flex-shrink-0" />
          <span className="text-zinc-400 text-sm">Checkout was canceled. No charge was made.</span>
        </div>
      )}
      {!stripeConfigured && (
        <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 text-sm">Payment processing is not yet configured on this server. Contact support to activate billing.</span>
        </div>
      )}

      {/* ── Subscription Overview Card (Hero) ────────────────────────────────── */}
      <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800/60 border-zinc-700/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-400 text-sm font-medium capitalize">
                  {plan?.name ?? "No Plan"} Plan
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
                {isScheduledToCancel && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-300 border-amber-500/30">
                    <Clock className="w-3 h-3" />
                    Canceling
                  </span>
                )}
              </div>
              <div className="flex items-end gap-2 pt-1">
                <span className="text-4xl font-bold text-white tracking-tight">
                  {formatCents(plan?.priceCents ?? 0)}
                </span>
                <span className="text-zinc-400 text-sm mb-1.5">/ month</span>
              </div>
              <p className="text-zinc-400 text-sm">
                {plan?.description ?? "Flat-rate tier plan"}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              {periodEnd && (
                <div className="text-right">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">
                    {isScheduledToCancel ? "Access ends" : "Next billing"}
                  </p>
                  <p className="text-white font-semibold text-sm mt-0.5">
                    {format(periodEnd, "MMMM d, yyyy")}
                  </p>
                </div>
              )}
              {profile?.subscriptionStartedAt && (
                <div className="text-right">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Member since</p>
                  <p className="text-zinc-300 text-sm mt-0.5">
                    {format(new Date(profile.subscriptionStartedAt), "MMMM yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          {isPastDue && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">
                Your account has a past-due balance. Please update your payment method to restore full access.
              </span>
            </div>
          )}
          {isScheduledToCancel && periodEnd && (
            <div className="mt-4 bg-amber-500/8 border border-amber-500/20 rounded-lg p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-amber-300 text-sm">
                  Subscription will end on {format(periodEnd, "MMMM d, yyyy")}. Your data will be retained for 30 days.
                </span>
              </div>
              {stripeConfigured && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex-shrink-0"
                  onClick={() => resumeMutation.mutate()}
                  disabled={resumeMutation.isPending}
                >
                  {resumeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Keep subscription"}
                </Button>
              )}
            </div>
          )}
          {isTrialing && (
            <div className="mt-4 bg-violet-500/8 border border-violet-500/20 rounded-lg p-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300 text-sm">
                You're on a free trial.
                {periodEnd && ` Your trial ends on ${format(periodEnd, "MMMM d, yyyy")}.`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Two-column grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Current Plan Tier ─────────────────────────────────────────────── */}
          <Card className="bg-zinc-900/70 border-zinc-700/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" />
                  Your Plan
                </CardTitle>
                {stripeConfigured && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-600/50 text-zinc-300 hover:bg-zinc-800 text-xs"
                    onClick={() => portalMutation.mutate()}
                    disabled={portalMutation.isPending}
                  >
                    {portalMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Upgrade / Change
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan ? (
                <>
                  <div className="bg-zinc-800/40 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-bold text-lg capitalize">{plan.name}</p>
                      {plan.description && (
                        <p className="text-zinc-500 text-xs mt-0.5">{plan.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-violet-400 font-bold text-xl">{formatCents(plan.priceCents)}</p>
                      <p className="text-zinc-500 text-xs">/ month</p>
                    </div>
                  </div>
                  {planFeatures.length > 0 && (
                    <div>
                      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Included features</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {planFeatures.map((feat: string) => (
                          <li key={feat} className="flex items-center gap-2 text-xs text-zinc-300">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <Zap className="w-8 h-8 text-zinc-700 mx-auto" />
                  <p className="text-zinc-500 text-sm">No active plan</p>
                  <p className="text-zinc-600 text-xs">Start a subscription to unlock full access.</p>
                  {stripeConfigured && (
                    <Button
                      size="sm"
                      className="bg-violet-600 hover:bg-violet-500 text-white"
                      onClick={() => portalMutation.mutate()}
                      disabled={portalMutation.isPending}
                    >
                      Choose a plan
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Invoice History ────────────────────────────────────────────────── */}
          <Card className="bg-zinc-900/70 border-zinc-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!invoicesData?.invoices?.length ? (
                <div className="px-6 py-10 text-center">
                  <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">No invoices yet</p>
                  <p className="text-zinc-600 text-xs mt-1">Invoices will appear here after your first billing cycle</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/60">
                  {invoicesData.invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-zinc-800/20 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${inv.paid ? "bg-emerald-400" : "bg-red-400"}`} />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {inv.invoiceNumber ?? inv.stripeInvoiceId.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            {format(new Date(inv.createdAt), "MMM d, yyyy")}
                            {inv.billingReason ? ` · ${inv.billingReason.replace(/_/g, " ")}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-white text-sm font-semibold">{formatCentsExact(inv.totalCents)}</p>
                          <span className={`text-xs ${inv.paid ? "text-emerald-400" : "text-red-400"}`}>
                            {inv.paid ? "Paid" : inv.status ?? "Unpaid"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!inv.paid && stripeConfigured && (
                            <button
                              onClick={() => retryMutation.mutate(inv.stripeInvoiceId)}
                              disabled={retryMutation.isPending}
                              title="Retry payment"
                              className="w-7 h-7 rounded flex items-center justify-center text-violet-400 hover:bg-violet-500/10 transition-colors"
                            >
                              {retryMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          {inv.invoicePdfUrl && (
                            <a href={inv.invoicePdfUrl} target="_blank" rel="noopener noreferrer">
                              <button title="Download PDF" className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors">
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </a>
                          )}
                          {inv.hostedInvoiceUrl && (
                            <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                              <button title="View invoice" className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right column ────────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Billing Cycle */}
          <Card className="bg-zinc-900/70 border-zinc-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                Billing Cycle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {periodEnd ? (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs">{isScheduledToCancel ? "Access ends" : "Renews on"}</span>
                  <span className="text-zinc-200 text-xs font-medium">{format(periodEnd, "MMM d, yyyy")}</span>
                </div>
              ) : (
                <p className="text-zinc-600 text-xs text-center py-2">No active billing cycle</p>
              )}
              {plan?.interval && (
                <>
                  <Separator className="bg-zinc-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Billing frequency</span>
                    <span className="text-zinc-200 text-xs font-medium capitalize">{plan.interval}ly</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="bg-zinc-900/70 border-zinc-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-violet-400" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {pm ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-md flex items-center justify-center border border-zinc-600/40">
                      <CreditCard className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium capitalize">
                        {pm.brand} ···· {pm.last4}
                      </p>
                      {pm.expMonth && pm.expYear && (
                        <p className="text-zinc-500 text-xs">Expires {pm.expMonth}/{pm.expYear}</p>
                      )}
                    </div>
                  </div>
                  {billing?.store?.email && (
                    <div>
                      <p className="text-zinc-500 text-xs">Billing email</p>
                      <p className="text-zinc-300 text-xs mt-0.5">{billing.store.email}</p>
                    </div>
                  )}
                  {stripeConfigured && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 text-xs mt-2"
                      onClick={() => portalMutation.mutate()}
                      disabled={portalMutation.isPending}
                    >
                      {portalMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                      Update payment method
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 space-y-2">
                  <CreditCard className="w-7 h-7 text-zinc-700 mx-auto" />
                  <p className="text-zinc-500 text-xs">No card on file</p>
                  {stripeConfigured && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 text-xs"
                      onClick={() => portalMutation.mutate()}
                      disabled={portalMutation.isPending}
                    >
                      Add payment method
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lifetime Stats */}
          {profile && (
            <Card className="bg-zinc-900/70 border-zinc-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  Account Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {[
                  { label: "Lifetime spend", value: formatCentsExact(profile.lifetimeValueCents) },
                  { label: "Successful payments", value: profile.totalSuccessfulPayments ?? 0 },
                  { label: "Failed payments", value: profile.totalFailedPayments ?? 0 },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-zinc-500 text-xs">{s.label}</span>
                    <span className={`text-xs font-semibold ${s.label === "Failed payments" && Number(s.value) > 0 ? "text-red-400" : "text-white"}`}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Subscription Actions */}
          <Card className="bg-zinc-900/70 border-zinc-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" />
                Subscription Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {stripeConfigured && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 justify-start text-xs"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                >
                  {portalMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <CreditCard className="w-3.5 h-3.5 mr-2" />}
                  Manage billing portal
                </Button>
              )}
              {isActive && isScheduledToCancel && stripeConfigured && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 justify-start text-xs"
                  onClick={() => resumeMutation.mutate()}
                  disabled={resumeMutation.isPending}
                >
                  {resumeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <PlayCircle className="w-3.5 h-3.5 mr-2" />}
                  Resume subscription
                </Button>
              )}
              {isActive && !isScheduledToCancel && cancelStep === "idle" && stripeConfigured && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-zinc-500 hover:text-red-400 hover:bg-red-500/5 justify-start text-xs"
                  onClick={() => setCancelStep("reason")}
                >
                  <XCircle className="w-3.5 h-3.5 mr-2" />
                  Cancel subscription
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="bg-zinc-900/70 border-zinc-700/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <LifeBuoy className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold">Billing support</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    Questions about your plan? We're here to help.
                  </p>
                  <a
                    href="mailto:support@certxa.com"
                    className="text-violet-400 hover:text-violet-300 text-xs mt-1.5 inline-flex items-center gap-1"
                  >
                    Contact support <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Cancellation Flow ────────────────────────────────────────────────── */}
      {cancelStep !== "idle" && (
        <Card className="bg-zinc-900/80 border-red-500/20 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              {cancelStep === "reason" ? "Cancel Subscription" : "Confirm Cancellation"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cancelStep === "reason" && (
              <>
                <p className="text-zinc-400 text-sm">
                  Before you go — what's the main reason you're canceling? This helps us improve.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CANCEL_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setCancelReason(reason)}
                      className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                        cancelReason === reason
                          ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                          : "border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/40 rounded-lg p-3 space-y-1.5 text-xs text-zinc-500">
                  <p className="text-zinc-400 font-medium text-sm">Before you cancel, consider:</p>
                  <p>• You can switch to a lower-tier plan to reduce your bill</p>
                  <p>• Your data stays safe for 30 days after cancellation</p>
                  <p>• You can reactivate anytime with no setup fees</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-600/50 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => { setCancelStep("idle"); setCancelReason(""); }}
                  >
                    Keep my subscription
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600/80 hover:bg-red-500 text-white ml-auto"
                    disabled={!cancelReason}
                    onClick={() => setCancelStep("confirm")}
                  >
                    Continue to cancel
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </>
            )}

            {cancelStep === "confirm" && (
              <>
                <div className="bg-red-500/8 border border-red-500/20 rounded-lg p-4 space-y-2">
                  <p className="text-red-300 text-sm font-semibold">What happens when you cancel:</p>
                  <ul className="text-zinc-400 text-sm space-y-1.5">
                    {periodEnd && (
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        Your subscription ends on <strong className="text-zinc-300">{format(periodEnd, "MMMM d, yyyy")}</strong>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      Staff accounts will lose access to the platform
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      Your data is retained for 30 days — reactivate anytime
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      No further charges will be made
                    </li>
                  </ul>
                </div>
                <p className="text-zinc-500 text-xs">Reason: <span className="text-zinc-300">{cancelReason}</span></p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-600/50 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => setCancelStep("reason")}
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="ml-auto"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      : <XCircle className="w-4 h-4 mr-1.5" />}
                    Yes, cancel my subscription
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
