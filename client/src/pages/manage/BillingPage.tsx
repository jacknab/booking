import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard, FileText, RefreshCw, XCircle, CheckCircle, Clock,
  AlertTriangle, Download, ExternalLink, ArrowLeft, Loader2, Zap,
  Users, Minus, Plus, TrendingUp, TrendingDown, Shield, LifeBuoy,
  ChevronRight, DollarSign, Calendar, BarChart3, Pause, PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeatInfo {
  purchasedSeats: number;
  activeStaffCount: number;
  pricePerSeatCents: number;
  monthlyTotalCents: number;
  atSeatLimit: boolean;
  hasSubscription: boolean;
  subscription: any;
  profile: any;
  stripeSeatData: {
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    upcomingInvoiceCents: number | null;
    nextPaymentAttempt: string | null;
  } | null;
}

interface SeatPreview {
  currentQuantity: number;
  newQuantity: number;
  currentMonthlyCents: number;
  newMonthlyCents: number;
  proratedChargeCents: number;
  immediateChargeCents: number;
  nextInvoiceCents: number;
  currency: string;
}

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

// ─── Seat Stepper ─────────────────────────────────────────────────────────────

function SeatStepper({
  value,
  min,
  max = 999,
  onChange,
}: {
  value: number;
  min: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-0">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 rounded-l-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-16 h-10 bg-zinc-800/80 border-y border-zinc-700 flex items-center justify-center text-white font-bold text-lg">
        {value}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 rounded-r-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BillingPage({ salonId }: { salonId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [draftSeats, setDraftSeats] = useState<number | null>(null);
  const [showSeatEditor, setShowSeatEditor] = useState(false);
  const [cancelStep, setCancelStep] = useState<"idle" | "reason" | "confirm">("idle");
  const [cancelReason, setCancelReason] = useState("");
  const [showSupportForm, setShowSupportForm] = useState(false);

  const sessionStatus = searchParams.get("status");

  // ── Data fetching ────────────────────────────────────────────────────────────

  const { data: billing, isLoading: billingLoading } = useQuery<BillingData>({
    queryKey: ["billing-profile", salonId],
    queryFn: () => apiFetch(`/api/billing/profile/${salonId}`),
  });

  const { data: seatInfo, isLoading: seatsLoading } = useQuery<SeatInfo>({
    queryKey: ["billing-seats", salonId],
    queryFn: () => apiFetch(`/api/billing/seats/${salonId}`),
    refetchInterval: 30_000,
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
  const activeSeat = draftSeats ?? seatInfo?.purchasedSeats ?? 1;
  const minSeats = Math.max(1, seatInfo?.activeStaffCount ?? 1);

  const { data: seatPreview, isFetching: previewLoading } = useQuery<SeatPreview>({
    queryKey: ["seat-preview", salonId, draftSeats],
    queryFn: () => apiFetch(`/api/billing/seats/${salonId}/preview?quantity=${draftSeats}`),
    enabled: draftSeats !== null && draftSeats !== seatInfo?.purchasedSeats && stripeConfigured,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!showSeatEditor) {
      setDraftSeats(null);
    }
  }, [showSeatEditor]);

  // ── Mutations ────────────────────────────────────────────────────────────────

  const updateSeatsMutation = useMutation({
    mutationFn: (quantity: number) =>
      apiFetch(`/api/billing/seats/${salonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["billing-seats", salonId] });
      queryClient.invalidateQueries({ queryKey: ["billing-profile", salonId] });
      setShowSeatEditor(false);
      setDraftSeats(null);
      toast({
        title: "Seats updated",
        description: `Now ${data.newQuantity} seats — ${formatCents(data.newMonthlyCents)}/month`,
      });
    },
    onError: (err: any) =>
      toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

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
      queryClient.invalidateQueries({ queryKey: ["billing-seats", salonId] });
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
      queryClient.invalidateQueries({ queryKey: ["billing-seats", salonId] });
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
      queryClient.invalidateQueries({ queryKey: ["billing-seats", salonId] });
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
  const subStatus = seatInfo?.stripeSeatData?.status ?? sub?.status ?? profile?.currentSubscriptionStatus;
  const statusCfg = getStatusConfig(subStatus);
  const StatusIcon = statusCfg.icon;

  const isScheduledToCancel =
    seatInfo?.stripeSeatData?.cancelAtPeriodEnd ??
    sub?.cancelAtPeriodEnd === 1 ??
    sub?.cancelAtPeriodEnd === true;

  const isActive = subStatus === "active" || subStatus === "trialing";
  const isTrialing = subStatus === "trialing";
  const isPastDue = subStatus === "past_due";

  const periodEnd = seatInfo?.stripeSeatData?.currentPeriodEnd
    ? new Date(seatInfo.stripeSeatData.currentPeriodEnd)
    : sub?.currentPeriodEnd
    ? new Date(Number(sub.currentPeriodEnd) > 1e10 ? sub.currentPeriodEnd : Number(sub.currentPeriodEnd) * 1000)
    : null;

  const periodStart = seatInfo?.stripeSeatData?.currentPeriodStart
    ? new Date(seatInfo.stripeSeatData.currentPeriodStart)
    : null;

  const seats = seatInfo?.purchasedSeats ?? 1;
  const activeStaff = seatInfo?.activeStaffCount ?? 0;
  const monthlyTotal = seatInfo?.monthlyTotalCents ?? seats * 800;
  const pricePerSeat = seatInfo?.pricePerSeatCents ?? 800;

  const seatsDraftChanged = draftSeats !== null && draftSeats !== seats;
  const seatsIncreasing = draftSeats !== null && draftSeats > seats;
  const seatsFillPct = Math.min(100, Math.round((activeStaff / seats) * 100));

  if (billingLoading || seatsLoading) {
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
                <span className="text-zinc-400 text-sm font-medium">SalonOS Professional</span>
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
                  {formatCents(monthlyTotal)}
                </span>
                <span className="text-zinc-400 text-sm mb-1.5">/ month</span>
              </div>
              <p className="text-zinc-400 text-sm">
                {seats} active seat{seats !== 1 ? "s" : ""} × {formatCentsExact(pricePerSeat)} per seat
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
              {seatInfo?.profile?.subscriptionStartedAt && (
                <div className="text-right">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Member since</p>
                  <p className="text-zinc-300 text-sm mt-0.5">
                    {format(new Date(seatInfo.profile.subscriptionStartedAt), "MMMM yyyy")}
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
              <Zap className="w-4 h-4 text-violet-400 flex-shrink-0" />
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

          {/* ── Staff Seat Management ─────────────────────────────────────────── */}
          <Card className="bg-zinc-900/70 border-zinc-700/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-400" />
                    Staff Seats
                  </CardTitle>
                  <p className="text-zinc-500 text-xs mt-1">
                    Each active staff member uses one seat · {formatCentsExact(pricePerSeat)}/seat/month
                  </p>
                </div>
                {!showSeatEditor && isActive && stripeConfigured && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-600/50 text-zinc-300 hover:bg-zinc-800 text-xs"
                    onClick={() => { setShowSeatEditor(true); setDraftSeats(seats); }}
                  >
                    Manage Seats
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Seat usage bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">
                    <span className="text-white font-semibold">{activeStaff}</span>
                    {" "}of{" "}
                    <span className="text-white font-semibold">{seats}</span>
                    {" "}seats used
                  </span>
                  <span className={`text-xs font-medium ${seatsFillPct >= 90 ? "text-amber-400" : "text-zinc-500"}`}>
                    {seatsFillPct}% full
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      seatsFillPct >= 100 ? "bg-red-500" :
                      seatsFillPct >= 80 ? "bg-amber-400" :
                      "bg-violet-500"
                    }`}
                    style={{ width: `${seatsFillPct}%` }}
                  />
                </div>
                {seatInfo?.atSeatLimit && (
                  <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-lg p-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-amber-300 text-xs">
                      You've reached your seat limit. Add more seats before inviting new staff.
                    </span>
                  </div>
                )}
              </div>

              {/* Seat editor */}
              {showSeatEditor && (
                <div className="border border-zinc-700/60 rounded-xl p-4 space-y-4 bg-zinc-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">Adjust seat count</p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        Minimum {minSeats} (your active staff count)
                      </p>
                    </div>
                    <SeatStepper
                      value={draftSeats ?? seats}
                      min={minSeats}
                      onChange={(n) => setDraftSeats(n)}
                    />
                  </div>

                  {/* Pricing preview */}
                  {seatsDraftChanged && (
                    <div className="bg-zinc-800/60 rounded-lg p-3 space-y-2">
                      {previewLoading ? (
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Calculating…
                        </div>
                      ) : seatPreview ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Current</span>
                            <span className="text-zinc-300">{formatCents(seatPreview.currentMonthlyCents)}/month</span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-semibold">
                            <span className="text-white flex items-center gap-1.5">
                              {seatsIncreasing
                                ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                                : <TrendingDown className="w-4 h-4 text-blue-400" />}
                              New monthly total
                            </span>
                            <span className={seatsIncreasing ? "text-emerald-400" : "text-blue-400"}>
                              {formatCents(seatPreview.newMonthlyCents)}/month
                            </span>
                          </div>
                          {seatPreview.immediateChargeCents > 0 && (
                            <>
                              <Separator className="bg-zinc-700/50" />
                              <div className="flex items-center justify-between text-xs text-zinc-500">
                                <span>Prorated charge today</span>
                                <span className="text-amber-300 font-medium">
                                  {formatCentsExact(seatPreview.immediateChargeCents)}
                                </span>
                              </div>
                            </>
                          )}
                          {seatPreview.immediateChargeCents <= 0 && (
                            <p className="text-zinc-500 text-xs">
                              Changes will be reflected on your next invoice.
                            </p>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* No change state */}
                  {!seatsDraftChanged && (
                    <p className="text-zinc-500 text-sm text-center py-1">
                      Adjust the seat count above to see pricing
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-violet-600 hover:bg-violet-500 text-white flex-1"
                      onClick={() => updateSeatsMutation.mutate(draftSeats!)}
                      disabled={!seatsDraftChanged || updateSeatsMutation.isPending || previewLoading}
                    >
                      {updateSeatsMutation.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : `Confirm ${draftSeats! > seats ? `+${draftSeats! - seats}` : draftSeats! < seats ? `${draftSeats! - seats}` : "0"} seat${Math.abs((draftSeats ?? seats) - seats) !== 1 ? "s" : ""}`
                      }
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-zinc-400 hover:text-white"
                      onClick={() => { setShowSeatEditor(false); setDraftSeats(null); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Static seat breakdown */}
              {!showSeatEditor && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Purchased Seats", value: seats, sub: `${formatCentsExact(pricePerSeat)} each` },
                    { label: "Active Staff", value: activeStaff, sub: "using seats" },
                    { label: "Available Seats", value: Math.max(0, seats - activeStaff), sub: "open slots" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-zinc-800/40 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{stat.label}</p>
                      <p className="text-zinc-600 text-xs">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Billing History ────────────────────────────────────────────────── */}
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
              {periodStart && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs">Cycle start</span>
                  <span className="text-zinc-200 text-xs font-medium">{format(periodStart, "MMM d, yyyy")}</span>
                </div>
              )}
              {periodEnd && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs">{isScheduledToCancel ? "Access ends" : "Renews on"}</span>
                  <span className="text-zinc-200 text-xs font-medium">{format(periodEnd, "MMM d, yyyy")}</span>
                </div>
              )}
              {seatInfo?.stripeSeatData?.upcomingInvoiceCents != null && !isScheduledToCancel && (
                <>
                  <Separator className="bg-zinc-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">Upcoming invoice</span>
                    <span className="text-white text-xs font-bold">
                      {formatCentsExact(seatInfo.stripeSeatData.upcomingInvoiceCents)}
                    </span>
                  </div>
                  {seatInfo.stripeSeatData.nextPaymentAttempt && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-xs">Auto-charge date</span>
                      <span className="text-zinc-200 text-xs font-medium">
                        {format(new Date(seatInfo.stripeSeatData.nextPaymentAttempt), "MMM d")}
                      </span>
                    </div>
                  )}
                </>
              )}
              {!periodStart && !periodEnd && (
                <p className="text-zinc-600 text-xs text-center py-2">No active billing cycle</p>
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
                    Questions about your bill? We're here to help.
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
                  <p>• Reduce seats to {minSeats} to lower your bill to {formatCents(minSeats * 800)}/month</p>
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
                  {minSeats < seats && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => {
                        setCancelStep("idle");
                        setCancelReason("");
                        setShowSeatEditor(true);
                        setDraftSeats(minSeats);
                      }}
                    >
                      <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
                      Reduce to {minSeats} seat{minSeats !== 1 ? "s" : ""} instead
                    </Button>
                  )}
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
