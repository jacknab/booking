import { AppLayout } from "@/components/layout/AppLayout";
import { useSelectedStore } from "@/hooks/use-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign,
  Calendar, Zap, RefreshCw, Send, ChevronRight, BarChart3,
  Clock, Target, Activity, CheckCircle2, XCircle, ArrowUpRight,
  ArrowDownRight, Minus, Brain, LineChart, Download, Sparkles,
  Trophy, AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
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

function BookingHeatmapGrid({ data }: { data: any }) {
  const { matrix, maxCount, dayLabels } = data;

  // Build lookup: dow -> hour -> count
  const lookup = new Map<string, number>();
  for (const cell of matrix) {
    lookup.set(`${cell.dow}-${cell.hour}`, cell.count);
  }

  // Show hours 7am–9pm
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);
  const days = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun

  function intensity(count: number): string {
    if (!count || maxCount === 0) return "bg-muted/30";
    const ratio = count / maxCount;
    if (ratio >= 0.8) return "bg-violet-600";
    if (ratio >= 0.6) return "bg-violet-500";
    if (ratio >= 0.4) return "bg-violet-400";
    if (ratio >= 0.2) return "bg-violet-300";
    return "bg-violet-200";
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">
        {/* Hour labels */}
        <div className="flex mb-1 ml-10">
          {hours.map(h => (
            <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground">
              {h % 2 === 0 ? `${h}` : ""}
            </div>
          ))}
        </div>
        {/* Rows */}
        {days.map(dow => (
          <div key={dow} className="flex items-center gap-1 mb-1">
            <div className="w-9 text-xs text-muted-foreground text-right flex-shrink-0">
              {dayLabels[dow]}
            </div>
            {hours.map(hour => {
              const count = lookup.get(`${dow}-${hour}`) || 0;
              return (
                <TooltipProvider key={hour}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex-1 h-6 rounded-sm cursor-default transition-colors ${intensity(count)}`} />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {dayLabels[dow]} {hour}:00 — {count} booking{count !== 1 ? "s" : ""}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-xs text-muted-foreground">Less</span>
          {["bg-muted/30", "bg-violet-200", "bg-violet-300", "bg-violet-400", "bg-violet-500", "bg-violet-600"].map((cls, i) => (
            <div key={i} className={`w-4 h-4 rounded-sm ${cls}`} />
          ))}
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
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

  const { data: staffPerfData, isLoading: staffPerfLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/staff-performance", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/staff-performance?storeId=${storeId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "staff",
    staleTime: 10 * 60 * 1000,
  });

  const { data: forecastData, isLoading: forecastLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/forecast", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/forecast?storeId=${storeId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "forecast",
    staleTime: 15 * 60 * 1000,
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

  const [campaignSegment, setCampaignSegment] = useState<string | null>(null);
  const [campaignMessage, setCampaignMessage] = useState("");
  const [campaignSent, setCampaignSent] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const { data: servicePerfData, isLoading: servicePerfLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/service-performance", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/service-performance?storeId=${storeId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "services",
    staleTime: 10 * 60 * 1000,
  });

  const { data: priceOptData, isLoading: priceOptLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/price-optimization", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/price-optimization?storeId=${storeId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "services",
    staleTime: 15 * 60 * 1000,
  });

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/booking-heatmap", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/booking-heatmap?storeId=${storeId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "forecast",
    staleTime: 15 * 60 * 1000,
  });

  const { data: segmentsData, isLoading: segmentsLoading } = useQuery<any>({
    queryKey: ["/api/intelligence/campaigns/segments", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/intelligence/campaigns/segments?storeId=${storeId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!storeId && activeTab === "campaigns",
    staleTime: 5 * 60 * 1000,
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async ({ segment, message }: { segment: string; message: string }) => {
      const res = await fetch("/api/intelligence/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, segment, message }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setCampaignSent(data);
      setCampaignMessage("");
      setCampaignSegment(null);
      toast({ title: `Campaign sent!`, description: `${data.sent} messages delivered` });
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Retention Rate</p>
              {summary?.totalClients > 0 ? (
                <>
                  <p className={`text-2xl font-bold ${
                    summary.totalClients > 0
                      ? Math.round(((summary.totalClients - (summary.atRiskClients || 0)) / summary.totalClients) * 100) >= 80
                        ? "text-emerald-600"
                        : Math.round(((summary.totalClients - (summary.atRiskClients || 0)) / summary.totalClients) * 100) >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                      : ""
                  }`}>
                    {Math.round(((summary.totalClients - (summary.atRiskClients || 0)) / summary.totalClients) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Clients not at risk</p>
                </>
              ) : (
                <p className="text-2xl font-bold">—</p>
              )}
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
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="forecast" className="gap-1.5">
              <LineChart className="h-3.5 w-3.5" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Services
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW TAB ── */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Wins Summary */}
            {(dashboard || score) && (() => {
              const wins: { icon: React.ReactNode; color: string; action: string; value: string; tab: string }[] = [];
              if (dashboard?.atRiskClients?.length > 0) {
                wins.push({
                  icon: <Users className="h-4 w-4 text-orange-500" />,
                  color: "border-orange-200 bg-orange-50/50 dark:bg-orange-950/10",
                  action: `${dashboard.atRiskClients.length} clients need re-engagement`,
                  value: `~$${Math.round(dashboard.atRiskClients.reduce((s: number, c: any) => s + parseFloat(c.ltv12Month || "0"), 0) * 0.4).toLocaleString()} recoverable`,
                  tab: "clients",
                });
              }
              if (leakageData?.totalLeakage > 500) {
                wins.push({
                  icon: <DollarSign className="h-4 w-4 text-red-500" />,
                  color: "border-red-200 bg-red-50/50 dark:bg-red-950/10",
                  action: `$${leakageData.totalLeakage.toLocaleString()} in revenue leakage (90d)`,
                  value: `$${leakageData.recoveryPotential.toLocaleString()} recoverable`,
                  tab: "leakage",
                });
              }
              if (noShowData?.upcomingRisks?.length > 0) {
                wins.push({
                  icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
                  color: "border-amber-200 bg-amber-50/50 dark:bg-amber-950/10",
                  action: `${noShowData.upcomingRisks.length} high-risk no-shows upcoming`,
                  value: "Confirm appointments to reduce losses",
                  tab: "noshow",
                });
              }
              if (wins.length === 0) return null;
              return (
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Quick Wins
                    </CardTitle>
                    <CardDescription>Highest-impact actions available right now</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {wins.map((win, i) => (
                        <button
                          key={i}
                          className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left hover:opacity-80 transition-opacity ${win.color}`}
                          onClick={() => setActiveTab(win.tab)}
                        >
                          <div className="flex-shrink-0 mt-0.5">{win.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{win.action}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{win.value}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

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

            {/* Client Segment Breakdown */}
            {summary && summary.totalClients > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Client Segment Breakdown
                  </CardTitle>
                  <CardDescription>Health distribution across your {summary.totalClients} tracked clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const total = summary.totalClients || 1;
                      const atRisk = summary.atRiskClients || 0;
                      const drifting = summary.driftingClients || 0;
                      const healthy = Math.max(0, total - atRisk - drifting);
                      const segments = [
                        { label: "Healthy", count: healthy, color: "bg-emerald-500", textColor: "text-emerald-700", bg: "bg-emerald-50" },
                        { label: "Drifting", count: drifting, color: "bg-amber-400", textColor: "text-amber-700", bg: "bg-amber-50" },
                        { label: "At Risk", count: atRisk, color: "bg-red-500", textColor: "text-red-700", bg: "bg-red-50" },
                      ];
                      return (
                        <>
                          {/* Stacked bar */}
                          <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
                            {segments.map(seg => seg.count > 0 && (
                              <div
                                key={seg.label}
                                className={`${seg.color} transition-all`}
                                style={{ width: `${(seg.count / total) * 100}%` }}
                              />
                            ))}
                          </div>
                          {/* Legend */}
                          <div className="grid grid-cols-3 gap-3">
                            {segments.map(seg => (
                              <div key={seg.label} className={`rounded-lg p-3 ${seg.bg}`}>
                                <p className={`text-lg font-bold ${seg.textColor}`}>{seg.count}</p>
                                <p className={`text-xs ${seg.textColor} opacity-80`}>{seg.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {total > 0 ? Math.round((seg.count / total) * 100) : 0}%
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

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
              <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-2">
                <div>
                  <CardTitle>At-Risk Clients</CardTitle>
                  <CardDescription>Ranked by LTV × churn risk — highest value first</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(`/api/intelligence/campaigns/export?storeId=${storeId}&segment=at_risk`, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => winbackCampaignMutation.mutate()}
                    disabled={winbackCampaignMutation.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {winbackCampaignMutation.isPending ? "Sending..." : "Win-Back Campaign"}
                  </Button>
                </div>
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

                {/* Annual leakage projection */}
                {leakageData.totalLeakage > 0 && (
                  <Card className="border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Annualized Revenue Leakage</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                          ${Math.round(leakageData.totalLeakage * (365 / 90)).toLocaleString()}
                          <span className="text-sm font-normal text-muted-foreground ml-1">/ year</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on your 90-day rate of ${leakageData.totalLeakage.toLocaleString()}.{" "}
                          Recovering even 40% adds{" "}
                          <span className="font-semibold text-emerald-600">
                            ${Math.round(leakageData.recoveryPotential * (365 / 90)).toLocaleString()}/year
                          </span>{" "}back to your revenue.
                        </p>
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

          {/* ── FORECAST TAB ── */}
          <TabsContent value="forecast" className="mt-6 space-y-4">
            {forecastLoading ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : forecastData ? (
              <>
                {/* KPI row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Next 30 Days</p>
                      <p className="text-2xl font-bold">${forecastData.baselineForecast30.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Baseline forecast</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Next 90 Days</p>
                      <p className="text-2xl font-bold">${forecastData.baselineForecast90.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Baseline forecast</p>
                    </CardContent>
                  </Card>
                  <Card className="border-emerald-200 dark:border-emerald-900/50">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Optimistic 30d</p>
                      <p className="text-2xl font-bold text-emerald-600">${forecastData.optimisticForecast30.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">With client recovery</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Projected Annual</p>
                      <p className="text-2xl font-bold">${forecastData.projectedAnnual.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {forecastData.trend === "growing" ? (
                          <><TrendingUp className="h-3 w-3 text-emerald-500" /><span className="text-emerald-600">+{forecastData.trendPct}% trend</span></>
                        ) : forecastData.trend === "declining" ? (
                          <><TrendingDown className="h-3 w-3 text-red-500" /><span className="text-red-600">{forecastData.trendPct}% trend</span></>
                        ) : (
                          <><Minus className="h-3 w-3" />Stable trend</>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue chart — last 12 weeks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Weekly Revenue — Last 12 Weeks
                    </CardTitle>
                    <CardDescription>Actual revenue by week with trend baseline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {forecastData.weeklyData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart
                          data={forecastData.weeklyData}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="weekLabel"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`}
                          />
                          <RechartsTooltip
                            formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                            contentStyle={{
                              background: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          {forecastData.weeklyAvgRevenue > 0 && (
                            <ReferenceLine
                              y={forecastData.weeklyAvgRevenue}
                              stroke="#f59e0b"
                              strokeDasharray="4 4"
                              label={{ value: "Avg", position: "right", fontSize: 10, fill: "#f59e0b" }}
                            />
                          )}
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#7c3aed"
                            strokeWidth={2}
                            fill="url(#revenueGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No revenue data available yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Uplift from recovery */}
                {forecastData.recoveryAddon > 0 && (
                  <Card className="border-emerald-200 dark:border-emerald-900/50">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Win-back revenue opportunity</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Running a win-back campaign for your drifting clients could add{" "}
                          <span className="font-bold text-emerald-600">${forecastData.recoveryAddon.toLocaleString()}/month</span>{" "}
                          by recovering 40% of lapsed clients.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                          onClick={() => setActiveTab("clients")}
                        >
                          <Users className="h-3.5 w-3.5" />
                          View At-Risk Clients
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Insights */}
                {forecastData.insights?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Forecast Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {forecastData.insights.map((insight: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Booking Heatmap */}
                {!heatmapLoading && heatmapData?.matrix?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Booking Demand Heatmap
                      </CardTitle>
                      <CardDescription>
                        When clients book — last 90 days
                        {heatmapData.peakSlot && (
                          <span className="ml-2 text-primary font-medium">
                            · Peak: {heatmapData.peakSlot.day} at {heatmapData.peakSlot.hour}:00
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BookingHeatmapGrid data={heatmapData} />
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Click Refresh to compute revenue forecast</p>
              </div>
            )}
          </TabsContent>

          {/* ── STAFF PERFORMANCE TAB ── */}
          <TabsContent value="staff" className="mt-6 space-y-4">
            {staffPerfLoading ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : staffPerfData?.length > 0 ? (
              <>
                {/* Smart insights for staff */}
                {(() => {
                  const topEarner = staffPerfData[0];
                  const lowRebook = staffPerfData.filter((m: any) => m.rebookingRatePct < 30);
                  const highNoShow = staffPerfData.filter((m: any) => m.noShowRate > 15);
                  const insights: { icon: React.ReactNode; color: string; text: string }[] = [];
                  if (topEarner) insights.push({ icon: <Trophy className="h-4 w-4 text-amber-500" />, color: "bg-amber-50 border-amber-200", text: `${topEarner.staffName} is your top earner — $${topEarner.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} in 90 days.` });
                  if (lowRebook.length > 0) insights.push({ icon: <AlertCircle className="h-4 w-4 text-orange-500" />, color: "bg-orange-50 border-orange-200", text: `${lowRebook.map((m: any) => m.staffName.split(" ")[0]).join(", ")} ${lowRebook.length === 1 ? "has" : "have"} a rebooking rate below 30% — consider a coaching conversation.` });
                  if (highNoShow.length > 0) insights.push({ icon: <AlertCircle className="h-4 w-4 text-red-500" />, color: "bg-red-50 border-red-200", text: `${highNoShow.map((m: any) => m.staffName.split(" ")[0]).join(", ")} ${highNoShow.length === 1 ? "has" : "have"} above-average no-show rates. Consider requiring deposits for their bookings.` });
                  if (insights.length === 0) return null;
                  return (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Performance Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {insights.map((ins, i) => (
                            <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${ins.color}`}>
                              <div className="flex-shrink-0 mt-0.5">{ins.icon}</div>
                              <p className="text-sm">{ins.text}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Revenue summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Team Size</p>
                      <p className="text-2xl font-bold">{staffPerfData.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Active staff members</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Revenue (90d)</p>
                      <p className="text-2xl font-bold">
                        ${staffPerfData.reduce((s: number, m: any) => s + m.totalRevenue, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Across all staff</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Avg Rebooking Rate</p>
                      <p className="text-2xl font-bold">
                        {staffPerfData.length > 0
                          ? Math.round(staffPerfData.reduce((s: number, m: any) => s + (m.rebookingRatePct || 0), 0) / staffPerfData.length)
                          : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Team average</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Appointments</p>
                      <p className="text-2xl font-bold">
                        {staffPerfData.reduce((s: number, m: any) => s + m.completedCount, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Completed (90d)</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Staff leaderboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Staff Performance Leaderboard — Last 90 Days
                    </CardTitle>
                    <CardDescription>Ranked by total revenue generated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {staffPerfData.map((member: any, i: number) => (
                        <div key={member.staffId} className="p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                              i === 0 ? "bg-amber-100 text-amber-700" :
                              i === 1 ? "bg-slate-100 text-slate-600" :
                              i === 2 ? "bg-orange-100 text-orange-700" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">{member.staffName}</p>
                                <p className="font-bold text-sm text-emerald-600">${member.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                              </div>
                              <p className="text-xs text-muted-foreground capitalize">{member.staffRole || "Staff"}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-0.5">Completed</p>
                              <p className="font-semibold">{member.completedCount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">Avg Ticket</p>
                              <p className="font-semibold">${member.avgTicket.toFixed(0)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">Unique Clients</p>
                              <p className="font-semibold">{member.uniqueClients}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">Rebooking</p>
                              <p className={`font-semibold ${
                                member.rebookingRatePct >= 50 ? "text-emerald-600" :
                                member.rebookingRatePct >= 30 ? "text-amber-600" :
                                "text-red-600"
                              }`}>
                                {member.rebookingRatePct}%
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">No-Shows</p>
                              <p className={`font-semibold ${member.noShowRate > 15 ? "text-red-600" : "text-foreground"}`}>
                                {member.noShowCount} ({member.noShowRate}%)
                              </p>
                            </div>
                          </div>
                          {/* Rebooking bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Rebooking rate</span>
                              <span className="flex items-center gap-1">
                                <TrendIcon trend={member.trend} />
                                {member.rebookingRatePct}%
                              </span>
                            </div>
                            <Progress
                              value={member.rebookingRatePct}
                              className={`h-1.5 ${member.rebookingRatePct >= 50 ? "[&>div]:bg-emerald-500" : member.rebookingRatePct >= 30 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No staff data available</p>
                <p className="text-sm mt-1">Data will appear once appointments are completed</p>
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
          {/* ── CAMPAIGNS TAB ── */}
          <TabsContent value="campaigns" className="mt-6 space-y-6">
            {/* Success banner */}
            {campaignSent && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-800">Campaign sent!</p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    {campaignSent.sent} of {campaignSent.total} messages delivered
                    {campaignSent.failed > 0 && `, ${campaignSent.failed} failed`}
                  </p>
                </div>
                <button onClick={() => setCampaignSent(null)} className="ml-auto text-emerald-400 hover:text-emerald-600">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  SMS Campaigns
                </CardTitle>
                <CardDescription>
                  Send targeted messages to specific client segments. Only clients with phone numbers who haven't opted out are included.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 — Choose segment */}
                <div>
                  <p className="text-sm font-semibold mb-3">1. Choose your audience</p>
                  {segmentsLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading segments…</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(segmentsData?.segments || []).map((seg: any) => {
                        const colorMap: Record<string, string> = {
                          red: "border-red-200 bg-red-50 data-[selected=true]:border-red-500 data-[selected=true]:bg-red-100",
                          amber: "border-amber-200 bg-amber-50 data-[selected=true]:border-amber-500 data-[selected=true]:bg-amber-100",
                          violet: "border-violet-200 bg-violet-50 data-[selected=true]:border-violet-500 data-[selected=true]:bg-violet-100",
                          pink: "border-pink-200 bg-pink-50 data-[selected=true]:border-pink-500 data-[selected=true]:bg-pink-100",
                        };
                        const badgeMap: Record<string, string> = {
                          red: "bg-red-100 text-red-700",
                          amber: "bg-amber-100 text-amber-700",
                          violet: "bg-violet-100 text-violet-700",
                          pink: "bg-pink-100 text-pink-700",
                        };
                        return (
                          <button
                            key={seg.id}
                            data-selected={campaignSegment === seg.id}
                            onClick={() => setCampaignSegment(seg.id === campaignSegment ? null : seg.id)}
                            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${colorMap[seg.color] || "border-muted bg-muted/30"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-sm">{seg.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{seg.description}</p>
                              </div>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeMap[seg.color] || "bg-muted text-muted-foreground"}`}>
                                {seg.count}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step 2 — Write message */}
                {campaignSegment && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-1">2. Write your message</p>
                      <p className="text-xs text-muted-foreground mb-2">Use <code className="bg-muted px-1 rounded">{"{name}"}</code> to personalise with the client's first name.</p>
                    </div>
                    <div className="space-y-2">
                      {/* Quick templates */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Win-back offer", text: "Hey {name}! We miss you — book this week and get 10% off. Reply STOP to opt out." },
                          { label: "Check-in", text: "Hi {name}, it's been a while! We'd love to see you again. Book at certxa.com. Reply STOP to opt out." },
                          { label: "VIP offer", text: "Hi {name}! As one of our valued clients, you get early access to our next open slots. Book now! Reply STOP to opt out." },
                          { label: "Birthday", text: "🎂 Happy birthday {name}! Treat yourself — enjoy a complimentary add-on on your next visit. Reply STOP to opt out." },
                        ].map((tpl) => (
                          <button
                            key={tpl.label}
                            onClick={() => setCampaignMessage(tpl.text)}
                            className="text-xs border rounded-full px-3 py-1 hover:bg-muted transition-colors"
                          >
                            {tpl.label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={4}
                        value={campaignMessage}
                        onChange={(e) => setCampaignMessage(e.target.value)}
                        placeholder="Type your message here…"
                        className="w-full rounded-xl border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{campaignMessage.length} / 160 characters</p>
                        <p className="text-xs text-muted-foreground">
                          Sending to: <span className="font-semibold text-foreground">
                            {segmentsData?.segments?.find((s: any) => s.id === campaignSegment)?.count || 0} recipients
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Send + Export buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => sendCampaignMutation.mutate({ segment: campaignSegment, message: campaignMessage })}
                        disabled={!campaignMessage.trim() || sendCampaignMutation.isPending}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {sendCampaignMutation.isPending ? "Sending…" : "Send Campaign"}
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open(`/api/intelligence/campaigns/export?storeId=${storeId}&segment=${campaignSegment}`, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campaign Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Always include an opt-out instruction (e.g. "Reply STOP to opt out")</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Keep messages under 160 characters to avoid split SMS charges</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Personalise with {"{"} name {"}"} for higher open rates</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Best sending window: Tuesday–Thursday, 10am–2pm local time</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SERVICES PERFORMANCE TAB ── */}
          <TabsContent value="services" className="mt-6 space-y-4">
            {/* Price Optimization Card */}
            {!priceOptLoading && priceOptData?.suggestions?.length > 0 && (
              <Card className="border-violet-200 dark:border-violet-900/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-violet-600" />
                    Price Optimization Suggestions
                  </CardTitle>
                  <CardDescription>AI-powered pricing recommendations based on demand and no-show patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {priceOptData.suggestions.map((sug: any) => (
                      <div key={sug.serviceId} className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
                        sug.priority === "high" ? "border-red-200 bg-red-50/50 dark:bg-red-950/10" :
                        sug.priority === "medium" ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/10" :
                        "border-border bg-muted/20"
                      }`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{sug.serviceName}</span>
                            <Badge variant="outline" className={`text-xs ${
                              sug.priority === "high" ? "border-red-400 text-red-700" :
                              sug.priority === "medium" ? "border-amber-400 text-amber-700" :
                              "border-muted-foreground text-muted-foreground"
                            }`}>
                              {sug.priority} priority
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{sug.reasoning}</p>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Current</p>
                            <p className="font-semibold">${sug.currentPrice.toFixed(0)}</p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">{sug.recommendation === "Require deposit" ? "Deposit" : "Suggested"}</p>
                            <p className={`font-bold ${
                              sug.recommendation === "Promotional pricing" ? "text-emerald-600" : "text-violet-600"
                            }`}>
                              ${sug.recommendedPrice?.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {servicePerfLoading ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : servicePerfData?.services?.length > 0 ? (
              <>
                {/* Insights */}
                {servicePerfData.insights?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Service Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {servicePerfData.insights.map((ins: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{ins}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Service table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Service Performance — Last 90 Days</CardTitle>
                    <CardDescription>Ranked by total revenue generated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {servicePerfData.services.map((svc: any, i: number) => (
                        <div key={svc.serviceId} className="rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                                #{i + 1}
                              </span>
                              <span className="font-semibold text-sm">{svc.serviceName}</span>
                            </div>
                            <span className="font-bold text-sm text-emerald-600">${svc.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-0.5">Bookings</p>
                              <p className="font-semibold">{svc.totalBookings}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">Avg Ticket</p>
                              <p className="font-semibold">${svc.avgTicket.toFixed(0)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">Completion</p>
                              <p className={`font-semibold ${svc.completionRate >= 80 ? "text-emerald-600" : svc.completionRate >= 60 ? "text-amber-600" : "text-red-600"}`}>
                                {svc.completionRate}%
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">No-Shows</p>
                              <p className={`font-semibold ${svc.noShowRate > 20 ? "text-red-600" : svc.noShowRate > 10 ? "text-amber-600" : "text-foreground"}`}>
                                {svc.noShowCount} ({svc.noShowRate}%)
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5">$/min</p>
                              <p className="font-semibold">${svc.revenuePerMin.toFixed(2)}</p>
                            </div>
                          </div>
                          {svc.noShowRate > 20 && svc.totalBookings >= 5 && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5">
                              <AlertCircle className="h-3 w-3 flex-shrink-0" />
                              High no-show rate — deposit recommended
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No service data yet</p>
                <p className="text-sm mt-1">Complete some appointments to see service analytics</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
