import { AppLayout } from "@/components/layout/AppLayout";
import { useSelectedStore } from "@/hooks/use-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign,
  Calendar, Zap, RefreshCw, Send, ChevronRight, BarChart3,
  Clock, Target, Activity, CheckCircle2, XCircle, ArrowUpRight,
  ArrowDownRight, Minus, Brain
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

function GradeColor(grade: string) {
  if (grade === "A") return "text-emerald-600";
  if (grade === "B") return "text-blue-600";
  if (grade === "C") return "text-amber-600";
  if (grade === "D") return "text-orange-600";
  return "text-red-600";
}

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const size = 140;
  const r = 56;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  const strokeColor =
    score >= 85 ? "#10b981" :
    score >= 70 ? "#3b82f6" :
    score >= 55 ? "#f59e0b" :
    score >= 40 ? "#f97316" :
    "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={10}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${GradeColor(grade)}`}>{grade}</span>
        <span className="text-sm text-muted-foreground">{score}/100</span>
      </div>
    </div>
  );
}

function ChurnBadge({ label }: { label: string }) {
  if (label === "critical") return <Badge variant="destructive" className="text-xs">Critical</Badge>;
  if (label === "high") return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">High Risk</Badge>;
  if (label === "medium") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Medium</Badge>;
  return <Badge variant="secondary" className="text-xs">Low</Badge>;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
  if (trend === "down") return <ArrowDownRight className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export default function Intelligence() {
  const { selectedStore } = useSelectedStore();
  const storeId = selectedStore?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboard, isLoading: dashLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/dashboard", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/dashboard?storeId=${storeId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: growthData, isLoading: growthLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/growth-score", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/growth-score?storeId=${storeId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: leakageData, isLoading: leakageLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/revenue-leakage", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/revenue-leakage?storeId=${storeId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "leakage",
    staleTime: 10 * 60 * 1000,
  });

  const { data: deadSeatsData, isLoading: deadSeatsLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/dead-seats", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/dead-seats?storeId=${storeId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "seats",
    staleTime: 10 * 60 * 1000,
  });

  const { data: noShowData, isLoading: noShowLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/no-show-risks", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/no-show-risks?storeId=${storeId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "noshow",
    staleTime: 5 * 60 * 1000,
  });

  const { data: rebookingData, isLoading: rebookingLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/rebooking-rates", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/rebooking-rates?storeId=${storeId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "rebooking",
    staleTime: 10 * 60 * 1000,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/intelligence/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      if (!res.ok) throw new Error("Failed to refresh");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Intelligence refresh started", description: "Data will update in about 30 seconds" });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/intelligence"] });
      }, 35000);
    },
    onError: () => toast({ title: "Refresh failed", variant: "destructive" }),
  });

  const winbackMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const res = await fetch("/api/intelligence/winback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, customerId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Win-back message sent!", description: "Client has been messaged" });
        queryClient.invalidateQueries({ queryKey: ["/api/intelligence/dashboard", storeId] });
      } else {
        toast({ title: "Could not send message", description: data.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Failed to send message", variant: "destructive" }),
  });

  const winbackCampaignMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/intelligence/winback-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: `Win-back campaign complete`,
        description: `${data.sent} messages sent, ${data.skipped} skipped`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/intelligence/dashboard", storeId] });
    },
    onError: () => toast({ title: "Campaign failed", variant: "destructive" }),
  });

  const score = growthData?.live;
  const summary = dashboard?.summary;

  if (!storeId) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Select a store to view intelligence data</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Revenue Intelligence</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              AI-powered insights to grow your business and recover lost revenue
            </p>
          </div>
          <div className="flex items-center gap-2">
            {summary?.lastComputedAt && (
              <span className="text-xs text-muted-foreground hidden md:block">
                Updated {formatDistanceToNow(new Date(summary.lastComputedAt), { addSuffix: true })}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Top KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Clients</p>
              <p className="text-2xl font-bold">{summary?.totalClients ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-amber-600 font-medium">{summary?.driftingClients ?? 0}</span> drifting
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">At Risk</p>
              <p className="text-2xl font-bold text-orange-600">{summary?.atRiskClients ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">High churn probability</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Avg 12-Mo LTV</p>
              <p className="text-2xl font-bold">
                ${summary?.avgLtv12Month ? summary.avgLtv12Month.toFixed(0) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Per active client</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Growth Score</p>
              <p className={`text-2xl font-bold ${score ? GradeColor(score.grade) : ""}`}>
                {score ? `${score.overallScore}/100` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Grade: <span className={`font-bold ${score ? GradeColor(score.grade) : ""}`}>{score?.grade ?? "—"}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">At-Risk Clients</TabsTrigger>
            <TabsTrigger value="leakage">Revenue Leakage</TabsTrigger>
            <TabsTrigger value="seats">Dead Seats</TabsTrigger>
            <TabsTrigger value="noshow">No-Show Risks</TabsTrigger>
            <TabsTrigger value="rebooking">Rebooking Rates</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW TAB ── */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Growth Score Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Business Growth Score
                  </CardTitle>
                  <CardDescription>Composite health score across 5 dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  {growthLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : score ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-6">
                        <ScoreRing score={score.overallScore} grade={score.grade} />
                        <div className="flex-1 space-y-3">
                          {Object.entries(score.components).map(([key, comp]: [string, any]) => (
                            <div key={key}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs capitalize text-muted-foreground">{key}</span>
                                <span className="text-xs font-medium">{comp.score}/100</span>
                              </div>
                              <Progress value={comp.score} className="h-1.5" />
                            </div>
                          ))}
                        </div>
                      </div>
                      {score.insights.length > 0 && (
                        <div className="border rounded-lg p-3 bg-amber-50 dark:bg-amber-950/20 space-y-1.5">
                          {score.insights.map((insight: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-amber-800 dark:text-amber-200">{insight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No data yet — click Refresh to run intelligence engine
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Interventions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Recent Actions
                  </CardTitle>
                  <CardDescription>Automated and manual outreach log</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : dashboard?.recentInterventions?.length > 0 ? (
                    <div className="space-y-2">
                      {dashboard.recentInterventions.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === "sent" ? "bg-emerald-500" : "bg-red-500"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.customerName || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.type.replace(/_/g, " ")} · {item.channel}</p>
                          </div>
                          <div className="text-xs text-muted-foreground flex-shrink-0">
                            {item.sentAt ? formatDistanceToNow(new Date(item.sentAt), { addSuffix: true }) : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No outreach actions yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick drifting clients strip */}
            {dashboard?.atRiskClients?.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      Clients Needing Attention
                    </CardTitle>
                    <CardDescription>{dashboard.atRiskClients.length} clients with elevated churn risk</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => winbackCampaignMutation.mutate()}
                    disabled={winbackCampaignMutation.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {winbackCampaignMutation.isPending ? "Sending..." : "Win-Back All"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboard.atRiskClients.slice(0, 5).map((client: any) => (
                      <div key={client.customerId} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/40 transition-colors">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm flex-shrink-0">
                          {(client.customerName || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{client.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {client.daysSinceLast ? `${client.daysSinceLast}d since last visit` : "No visits yet"}
                            {client.ltv12Month && parseFloat(client.ltv12Month) > 0
                              ? ` · $${parseFloat(client.ltv12Month).toFixed(0)} LTV`
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChurnBadge label={client.churnRiskLabel} />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => winbackMutation.mutate(client.customerId)}
                                  disabled={winbackMutation.isPending || !client.marketingOptIn}
                                >
                                  <Send className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {client.marketingOptIn ? "Send win-back message" : "Client opted out of marketing"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                    {dashboard.atRiskClients.length > 5 && (
                      <Button variant="ghost" size="sm" className="w-full gap-1 text-muted-foreground" onClick={() => setActiveTab("clients")}>
                        View all {dashboard.atRiskClients.length} at-risk clients
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── AT-RISK CLIENTS TAB ── */}
          <TabsContent value="clients" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>At-Risk Clients</CardTitle>
                  <CardDescription>Ranked by LTV × churn risk — highest value first</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => winbackCampaignMutation.mutate()}
                  disabled={winbackCampaignMutation.isPending}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {winbackCampaignMutation.isPending ? "Sending..." : "Win-Back Campaign"}
                </Button>
              </CardHeader>
              <CardContent>
                {dashLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : dashboard?.atRiskClients?.length > 0 ? (
                  <div className="space-y-2">
                    {dashboard.atRiskClients.map((client: any) => (
                      <div key={client.customerId} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/40 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary flex-shrink-0">
                          {(client.customerName || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-0.5">
                          <div>
                            <p className="text-sm font-medium truncate">{client.customerName}</p>
                            <p className="text-xs text-muted-foreground">{client.customerPhone || "No phone"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">LTV (12mo)</p>
                            <p className="text-sm font-medium">${parseFloat(client.ltv12Month || "0").toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Last Visit</p>
                            <p className="text-sm">{client.daysSinceLast ? `${client.daysSinceLast}d ago` : "Never"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChurnBadge label={client.churnRiskLabel} />
                            {client.isDrifting && (
                              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">Drifting</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 flex-shrink-0"
                          onClick={() => winbackMutation.mutate(client.customerId)}
                          disabled={winbackMutation.isPending || !client.marketingOptIn}
                        >
                          <Send className="h-3.5 w-3.5" />
                          Win-Back
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500 opacity-60" />
                    <p className="font-medium">All clients are healthy!</p>
                    <p className="text-sm mt-1">No clients at risk of churning right now</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── REVENUE LEAKAGE TAB ── */}
          <TabsContent value="leakage" className="mt-6 space-y-4">
            {leakageLoading ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : leakageData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-red-200 dark:border-red-900/50">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Leakage (90d)</p>
                      <p className="text-3xl font-bold text-red-600">${leakageData.totalLeakage.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Revenue lost to no-shows, cancellations & discounts</p>
                    </CardContent>
                  </Card>
                  <Card className="border-emerald-200 dark:border-emerald-900/50">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Recovery Potential</p>
                      <p className="text-3xl font-bold text-emerald-600">${leakageData.recoveryPotential.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Estimated 40% realistic recovery</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Breakdown</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">No-shows ({leakageData.breakdown.noShowCount})</span>
                          <span className="font-medium text-red-600">${leakageData.breakdown.noShowLoss.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cancellations ({leakageData.breakdown.cancellationCount})</span>
                          <span className="font-medium text-orange-600">${leakageData.breakdown.cancellationLoss.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discounts given</span>
                          <span className="font-medium text-amber-600">${leakageData.breakdown.discountLoss.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dead seats (est.)</span>
                          <span className="font-medium text-slate-600">${leakageData.breakdown.deadSeatLoss.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {leakageData.topLeakageServices?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">No-Shows by Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {leakageData.topLeakageServices.map((s: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">{s.serviceName}</span>
                                <span className="text-sm font-medium text-red-600">${s.estimatedLoss}</span>
                              </div>
                              <Progress value={Math.min(100, (s.noShowCount / (leakageData.breakdown.noShowCount || 1)) * 100)} className="h-1.5 bg-red-100" />
                            </div>
                            <span className="text-xs text-muted-foreground w-16 text-right">{s.noShowCount} no-shows</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {leakageData.recommendations?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {leakageData.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Click Refresh to compute revenue leakage</p>
              </div>
            )}
          </TabsContent>

          {/* ── DEAD SEATS TAB ── */}
          <TabsContent value="seats" className="mt-6 space-y-4">
            {deadSeatsLoading ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : deadSeatsData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Overall Utilization</p>
                      <p className={`text-3xl font-bold ${deadSeatsData.overallUtilization >= 70 ? "text-emerald-600" : deadSeatsData.overallUtilization >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {deadSeatsData.overallUtilization}%
                      </p>
                      <Progress value={deadSeatsData.overallUtilization} className="mt-2 h-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Monthly Revenue Potential</p>
                      <p className="text-3xl font-bold text-amber-600">
                        ${(deadSeatsData.totalLostRevenuePotential || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">In underfilled time slots</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Worst Slot</p>
                      <p className="text-xl font-bold">{deadSeatsData.worstDay || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{deadSeatsData.worstHour || "No data"}</p>
                    </CardContent>
                  </Card>
                </div>

                {deadSeatsData.deadSlots?.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Underutilized Time Slots</CardTitle>
                      <CardDescription>Slots below 50% fill rate, sorted by lost revenue potential</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {deadSeatsData.deadSlots.slice(0, 15).map((slot: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border">
                            <div className={`w-2 h-8 rounded-full flex-shrink-0 ${slot.severity === "high" ? "bg-red-400" : slot.severity === "medium" ? "bg-amber-400" : "bg-slate-300"}`} />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{slot.dayName} {slot.hourLabel}</span>
                                <span className="text-sm font-medium text-amber-600">+${slot.estimatedLostRevenue}/mo potential</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={slot.utilizationPct} className="h-1.5 flex-1" />
                                <span className="text-xs text-muted-foreground w-10 text-right">{slot.utilizationPct}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500 opacity-60" />
                      <p className="font-medium">Great utilization!</p>
                      <p className="text-sm mt-1">No significantly dead time slots detected</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Click Refresh to analyze seat utilization</p>
              </div>
            )}
          </TabsContent>

          {/* ── NO-SHOW RISKS TAB ── */}
          <TabsContent value="noshow" className="mt-6 space-y-4">
            {noShowLoading ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : noShowData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">No-Show Rate (30d)</p>
                      <p className={`text-3xl font-bold ${noShowData.stats?.noShowRate30d > 0.15 ? "text-red-600" : "text-emerald-600"}`}>
                        {(noShowData.stats?.noShowRate30d * 100 || 0).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">No-Shows (30d)</p>
                      <p className="text-3xl font-bold">{noShowData.stats?.noShowCount30d || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Est. Lost Revenue</p>
                      <p className="text-3xl font-bold text-red-600">${(noShowData.stats?.lostRevenue30d || 0).toFixed(0)}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Tomorrow's High-Risk Appointments
                    </CardTitle>
                    <CardDescription>Clients most likely not to show — consider sending a reminder</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {noShowData.risks?.length > 0 ? (
                      <div className="space-y-2">
                        {noShowData.risks.filter((r: any) => r.noShowRiskLabel !== "low").map((risk: any) => (
                          <div key={risk.appointmentId} className="flex items-center gap-3 p-3 rounded-xl border">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${risk.noShowRiskLabel === "high" ? "bg-red-500" : "bg-amber-400"}`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-sm font-medium">{risk.customerName}</p>
                                <Badge className={risk.noShowRiskLabel === "high" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"} variant="outline">
                                  {risk.noShowRiskLabel === "high" ? "High Risk" : "Medium Risk"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {risk.serviceName} · {risk.staffName}
                                {" · "}{new Date(risk.appointmentDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </p>
                              {risk.riskFactors.length > 0 && (
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{risk.riskFactors[0]}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500 opacity-60" />
                        <p>No high-risk appointments tomorrow</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Click Refresh to analyze no-show risks</p>
              </div>
            )}
          </TabsContent>

          {/* ── REBOOKING RATES TAB ── */}
          <TabsContent value="rebooking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rebooking Rate by Team Member</CardTitle>
                <CardDescription>% of clients who re-booked within 30 days of an appointment (last 6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                {rebookingLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : rebookingData?.live?.length > 0 ? (
                  <div className="space-y-3">
                    {rebookingData.live.map((s: any) => (
                      <div key={s.staffId} className="flex items-center gap-4 p-3 rounded-xl border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary flex-shrink-0">
                          {s.staffName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{s.staffName}</span>
                            <div className="flex items-center gap-1.5">
                              <TrendIcon trend={s.trend} />
                              <span className={`text-sm font-bold ${s.rebookingRatePct >= 50 ? "text-emerald-600" : s.rebookingRatePct >= 30 ? "text-amber-600" : "text-red-600"}`}>
                                {s.rebookingRatePct}%
                              </span>
                            </div>
                          </div>
                          <Progress value={s.rebookingRatePct} className="h-2 mb-1" />
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>{s.totalCompleted} completed</span>
                            <span>{s.uniqueClients} clients</span>
                            <span>${s.avgTicket.toFixed(0)} avg ticket</span>
                            {s.noShowCount > 0 && <span className="text-red-500">{s.noShowCount} no-shows</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No staff data available yet</p>
                    <p className="text-sm mt-1">Data populates once appointments are completed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
