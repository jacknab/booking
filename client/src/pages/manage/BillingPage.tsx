import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard, FileText, RefreshCw, ArrowUpCircle, ArrowDownCircle,
  XCircle, CheckCircle, Clock, AlertTriangle, ChevronRight,
  Download, ExternalLink, ArrowLeft, Loader2, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: number;
  code: string;
  name: string;
  priceCents: string;
  interval: string;
  description: string | null;
  featuresJson: any;
  active: boolean;
}

interface BillingData {
  profile: any;
  subscription: any;
  stripeSub: any;
  plan: Plan | null;
  paymentMethod: { brand: string; last4: string } | null;
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
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

function statusConfig(status: string | null | undefined): { label: string; cls: string; icon: any } {
  switch (status) {
    case "active":
      return { label: "Active", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle };
    case "trialing":
      return { label: "Trial", cls: "bg-violet-500/15 text-violet-300 border-violet-500/30", icon: Zap };
    case "past_due":
      return { label: "Past Due", cls: "bg-red-500/15 text-red-400 border-red-500/30", icon: AlertTriangle };
    case "canceled":
      return { label: "Canceled", cls: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30", icon: XCircle };
    case "unpaid":
      return { label: "Unpaid", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30", icon: AlertTriangle };
    case "paused":
      return { label: "Paused", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30", icon: Clock };
    default:
      return { label: "No Plan", cls: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30", icon: Clock };
  }
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(path, { credentials: "include", ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillingPage({ salonId }: { salonId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const sessionStatus = searchParams.get("status");

  const { data: billing, isLoading } = useQuery<BillingData>({
    queryKey: ["billing-profile", salonId],
    queryFn: () => apiFetch(`/api/billing/profile/${salonId}`),
  });

  const { data: invoicesData } = useQuery<{ invoices: Invoice[] }>({
    queryKey: ["billing-invoices", salonId],
    queryFn: () => apiFetch(`/api/billing/invoices/${salonId}`),
  });

  const { data: plansData } = useQuery<{ plans: Plan[] }>({
    queryKey: ["billing-plans"],
    queryFn: () => apiFetch("/api/billing/plans"),
    enabled: showChangePlan,
  });

  const { data: stripeStatus } = useQuery<{ configured: boolean }>({
    queryKey: ["stripe-status"],
    queryFn: () => apiFetch("/api/billing/status"),
  });

  const portalMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId }),
      }),
    onSuccess: ({ url }) => { window.location.href = url; },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const checkoutMutation = useMutation({
    mutationFn: (planCode: string) =>
      apiFetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId, planCode }),
      }),
    onSuccess: ({ url }) => { window.location.href = url; },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const changePlanMutation = useMutation({
    mutationFn: (newPlanCode: string) =>
      apiFetch(`/api/billing/change-plan/${salonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPlanCode }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-profile", salonId] });
      setShowChangePlan(false);
      toast({ title: "Plan updated", description: "Your plan has been changed." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/billing/cancel/${salonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeSubscriptionId: billing?.subscription?.stripeSubscriptionId, atPeriodEnd: true }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-profile", salonId] });
      setCancelConfirm(false);
      toast({ title: "Cancellation scheduled", description: "Your subscription will end at the current period end." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
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
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
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
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  const sub = billing?.subscription;
  const plan = billing?.plan;
  const profile = billing?.profile;
  const pm = billing?.paymentMethod;
  const subStatus = sub?.status ?? profile?.currentSubscriptionStatus;
  const { label: statusLabel, cls: statusCls, icon: StatusIcon } = statusConfig(subStatus);
  const stripeConfigured = stripeStatus?.configured ?? false;

  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).getFullYear() > 2000
      ? new Date(sub.currentPeriodEnd)
      : new Date(Number(sub.currentPeriodEnd) * 1000)
    : profile?.currentPeriodEnd
    ? new Date(profile.currentPeriodEnd)
    : null;

  const isScheduledToCancel = sub?.cancelAtPeriodEnd === 1 || sub?.cancelAtPeriodEnd === true;
  const isActive = subStatus === "active" || subStatus === "trialing";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/manage")} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Billing & Subscription</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{billing?.store?.name}</p>
        </div>
      </div>

      {/* Session status banners */}
      {sessionStatus === "success" && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-300">Your subscription has been activated. Welcome!</span>
        </div>
      )}
      {sessionStatus === "canceled" && (
        <div className="bg-zinc-700/30 border border-zinc-600/40 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-zinc-400 flex-shrink-0" />
          <span className="text-zinc-300">Checkout was canceled. No charge was made.</span>
        </div>
      )}

      {/* Stripe not configured notice */}
      {!stripeConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 text-sm">
            Payment processing is not yet configured. Contact support to activate billing.
          </span>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="bg-zinc-800/60 border border-zinc-700/40">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Current plan card */}
          <Card className="bg-zinc-900/70 border-zinc-700/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-white text-lg">Current Plan</CardTitle>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCls}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusLabel}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan ? (
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">{formatCents(plan.priceCents)}</span>
                  <span className="text-zinc-400 mb-1">/ {plan.interval ?? "month"}</span>
                  <span className="text-zinc-300 text-lg font-medium mb-0.5 ml-1">{plan.name}</span>
                </div>
              ) : (
                <p className="text-zinc-400">No active subscription</p>
              )}

              {periodEnd && (
                <p className="text-zinc-400 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {isScheduledToCancel
                    ? `Access ends on ${format(periodEnd, "MMMM d, yyyy")}`
                    : `Renews on ${format(periodEnd, "MMMM d, yyyy")}`}
                </p>
              )}

              {profile?.delinquent && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm">
                    Your account has a past-due balance. Please update your payment method.
                  </span>
                </div>
              )}

              {isScheduledToCancel && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-amber-300 text-sm">
                    Your subscription will cancel at the end of this billing period.
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {!isActive && stripeConfigured && (
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white"
                    onClick={() => plan ? checkoutMutation.mutate(plan.code) : setShowChangePlan(true)}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Subscribe Now
                  </Button>
                )}

                {isActive && isScheduledToCancel && stripeConfigured && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => resumeMutation.mutate()}
                    disabled={resumeMutation.isPending}
                  >
                    {resumeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
                    Resume Subscription
                  </Button>
                )}

                {isActive && !isScheduledToCancel && stripeConfigured && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-600/50 text-zinc-300 hover:bg-zinc-800"
                      onClick={() => setShowChangePlan(true)}
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-1.5" />
                      Change Plan
                    </Button>
                    {!cancelConfirm ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/5"
                        onClick={() => setCancelConfirm(true)}
                      >
                        Cancel Subscription
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">Are you sure?</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelMutation.mutate()}
                          disabled={cancelMutation.isPending}
                        >
                          {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Yes, cancel
                        </Button>
                        <Button size="sm" variant="ghost" className="text-zinc-400" onClick={() => setCancelConfirm(false)}>
                          Keep
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {stripeConfigured && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-600/50 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => portalMutation.mutate()}
                    disabled={portalMutation.isPending}
                  >
                    {portalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 mr-1.5" />}
                    Manage Billing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment method */}
          {pm && (
            <Card className="bg-zinc-900/70 border-zinc-700/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-zinc-700 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium capitalize">{pm.brand} •••• {pm.last4}</p>
                    <p className="text-zinc-500 text-xs">Default payment method</p>
                  </div>
                </div>
                {stripeConfigured && (
                  <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => portalMutation.mutate()}>
                    Update
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lifetime stats */}
          {profile && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Lifetime Spend", value: formatCents(profile.lifetimeValueCents) },
                { label: "Payments", value: profile.totalSuccessfulPayments ?? 0 },
                { label: "Failed Payments", value: profile.totalFailedPayments ?? 0 },
              ].map((stat) => (
                <Card key={stat.label} className="bg-zinc-900/60 border-zinc-700/40">
                  <CardContent className="p-4">
                    <p className="text-zinc-500 text-xs">{stat.label}</p>
                    <p className="text-white text-xl font-semibold mt-1">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Invoices ── */}
        <TabsContent value="invoices" className="mt-4">
          <Card className="bg-zinc-900/70 border-zinc-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!invoicesData?.invoices?.length ? (
                <p className="text-zinc-500 text-sm p-6">No invoices found.</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {invoicesData.invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${inv.paid ? "bg-emerald-400" : "bg-red-400"}`} />
                        <div>
                          <p className="text-white text-sm font-medium">
                            {inv.invoiceNumber ?? inv.stripeInvoiceId.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            {format(new Date(inv.createdAt), "MMM d, yyyy")}
                            {inv.billingReason ? ` · ${inv.billingReason.replace(/_/g, " ")}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-white text-sm font-medium">{formatCents(inv.totalCents)}</p>
                          <span className={`text-xs ${inv.paid ? "text-emerald-400" : "text-red-400"}`}>
                            {inv.paid ? "Paid" : inv.status ?? "Unpaid"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {!inv.paid && stripeConfigured && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 h-8 px-2"
                              onClick={() => retryMutation.mutate(inv.stripeInvoiceId)}
                              disabled={retryMutation.isPending}
                              title="Retry payment"
                            >
                              {retryMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </Button>
                          )}
                          {inv.invoicePdfUrl && (
                            <a href={inv.invoicePdfUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white h-8 px-2" title="Download PDF">
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          )}
                          {inv.hostedInvoiceUrl && (
                            <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white h-8 px-2" title="View invoice">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
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
        </TabsContent>

        {/* ── Plans ── */}
        <TabsContent value="plans" className="mt-4">
          <div className="space-y-3">
            {(!showChangePlan && !isActive) && (
              <p className="text-zinc-400 text-sm">Choose a plan to get started.</p>
            )}
            {plansData?.plans?.map((p) => {
              const isCurrent = p.code === plan?.code;
              const isHigher = Number(p.priceCents) > Number(plan?.priceCents ?? 0);
              return (
                <Card
                  key={p.id}
                  className={`border transition-colors ${isCurrent
                    ? "bg-violet-900/20 border-violet-500/40"
                    : "bg-zinc-900/60 border-zinc-700/40 hover:border-zinc-600/60"
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{p.name}</p>
                        {isCurrent && (
                          <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm mt-0.5">{p.description}</p>
                      <p className="text-white font-bold text-lg mt-1">
                        {formatCents(p.priceCents)}
                        <span className="text-zinc-400 font-normal text-sm"> / {p.interval}</span>
                      </p>
                    </div>
                    {!isCurrent && stripeConfigured && (
                      <Button
                        size="sm"
                        className={isHigher
                          ? "bg-violet-600 hover:bg-violet-500 text-white"
                          : "bg-zinc-700 hover:bg-zinc-600 text-white"
                        }
                        onClick={() =>
                          isActive
                            ? changePlanMutation.mutate(p.code)
                            : checkoutMutation.mutate(p.code)
                        }
                        disabled={changePlanMutation.isPending || checkoutMutation.isPending}
                      >
                        {changePlanMutation.isPending || checkoutMutation.isPending
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : isHigher
                          ? <><ArrowUpCircle className="w-4 h-4 mr-1.5" />Upgrade</>
                          : <><ArrowDownCircle className="w-4 h-4 mr-1.5" />Downgrade</>
                        }
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {!plansData && (
              <Button
                variant="outline"
                className="border-zinc-600/50 text-zinc-300"
                onClick={() => setShowChangePlan(true)}
              >
                View All Plans
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
