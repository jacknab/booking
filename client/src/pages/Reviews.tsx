import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelectedStore } from "@/hooks/use-store";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Star,
  Trash2,
  Eye,
  EyeOff,
  StarIcon,
  Search,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@shared/schema";
import { GoogleConnectGate } from "@/components/GoogleConnectGate";
import { YelpConnectGate } from "@/components/YelpConnectGate";
import { YelpAliasForm } from "@/components/YelpAliasForm";

type ReviewStats = {
  total: number;
  avg: number;
  distribution: Record<number, number>;
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(sz, s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { selectedStore } = useSelectedStore();
  const storeId = selectedStore?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  // gateStep controls which screen is shown before the reviews table
  // "google" → Google connect gate
  // "yelp"   → Yelp connect gate
  // "yelp-form" → Yelp alias input form
  // "done"   → show reviews normally
  const [gateStep, setGateStep] = useState<"google" | "yelp" | "yelp-form" | "done">("google");
  const [googleConnecting, setGoogleConnecting] = useState(false);

  const { data: googleProfile, isLoading: googleLoading } = useQuery({
    queryKey: ["/api/google-business/profile", storeId],
    queryFn: async () => {
      if (!storeId) return null;
      const res = await fetch(`/api/google-business/profile/${storeId}`, { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.profile ?? null;
    },
    enabled: !!storeId,
  });

  const isGoogleConnected = !!googleProfile?.isConnected;
  // If Google is already connected, skip straight to reviews
  const effectiveStep = !googleLoading && isGoogleConnected ? "done" : gateStep;

  async function handleGoogleConnect() {
    setGoogleConnecting(true);
    try {
      const res = await fetch("/api/google-business/auth-url", { credentials: "include" });
      const data = await res.json();
      window.location.href = data.authUrl;
    } catch {
      setGoogleConnecting(false);
    }
  }

  const { data: reviewsData = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?storeId=${storeId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!storeId,
  });

  const { data: stats } = useQuery<ReviewStats>({
    queryKey: ["/api/reviews/stats", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/stats?storeId=${storeId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!storeId,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: "isPublic" | "isFeatured"; value: boolean }) => {
      const res = await apiRequest("PUT", `/api/reviews/${id}`, { [field]: value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", storeId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", storeId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/stats", storeId] });
      toast({ title: "Review deleted" });
    },
  });

  const reviewLink = (appointmentId: number) =>
    `${window.location.origin}/review/${appointmentId}`;

  const copyLink = (appointmentId: number | null) => {
    if (!appointmentId) return;
    navigator.clipboard.writeText(reviewLink(appointmentId));
    toast({ title: "Review link copied!" });
  };

  const filtered = reviewsData.filter((r) => {
    if (filterRating && r.rating !== filterRating) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.customerName?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        r.serviceName?.toLowerCase().includes(q) ||
        r.staffName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const ratingPercent = (star: number) => {
    if (!stats || stats.total === 0) return 0;
    return Math.round(((stats.distribution[star] || 0) / stats.total) * 100);
  };

  if (effectiveStep === "google") {
    return (
      <AppLayout>
        <GoogleConnectGate
          onConnect={handleGoogleConnect}
          onSkip={() => setGateStep("yelp")}
          loading={googleConnecting}
        />
      </AppLayout>
    );
  }

  if (effectiveStep === "yelp") {
    return (
      <AppLayout>
        <YelpConnectGate
          onConnect={() => setGateStep("yelp-form")}
          onSkip={() => setGateStep("done")}
        />
      </AppLayout>
    );
  }

  if (effectiveStep === "yelp-form") {
    return (
      <AppLayout>
        <YelpAliasForm
          storeId={storeId}
          onSave={() => setGateStep("done")}
          onSkip={() => setGateStep("done")}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Client Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Collect and manage feedback from your clients
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col items-center gap-1">
          <p className="text-4xl font-bold text-primary">{stats?.avg?.toFixed(1) ?? "—"}</p>
          <StarRating rating={Math.round(stats?.avg ?? 0)} size="lg" />
          <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center gap-1">
          <p className="text-4xl font-bold">{stats?.total ?? 0}</p>
          <p className="text-sm text-muted-foreground">Total Reviews</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium mb-3">Rating Distribution</p>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-2 text-right text-muted-foreground">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${ratingPercent(star)}%` }}
                  />
                </div>
                <span className="w-6 text-muted-foreground">{stats?.distribution[star] ?? 0}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* How to collect reviews callout */}
      <Card className="p-4 bg-muted/40 border-dashed">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">How to collect reviews</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              After completing an appointment, copy its review link and send it to your client via SMS or email.
              The link takes them to a simple star-rating form — no account needed.
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client, service, or comment..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {[null, 5, 4, 3, 2, 1].map((star) => (
            <Button
              key={star ?? "all"}
              size="sm"
              variant={filterRating === star ? "default" : "outline"}
              onClick={() => setFilterRating(star)}
              className="gap-1"
            >
              {star ? (
                <>
                  {star}
                  <Star className="h-3 w-3 fill-current" />
                </>
              ) : (
                "All"
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <StarIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">
            {reviewsData.length === 0 ? "No reviews yet" : "No reviews match your filters"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {reviewsData.length === 0
              ? "Send review links to clients after their appointments"
              : "Try adjusting your search or rating filter"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <Card key={review.id} className={cn("p-4", !review.isPublic && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StarRating rating={review.rating} />
                    {review.isFeatured && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Featured
                      </Badge>
                    )}
                    {!review.isPublic && (
                      <Badge variant="secondary" className="text-xs">Hidden</Badge>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span className="font-medium text-foreground">{review.customerName || "Anonymous"}</span>
                    {review.serviceName && <span>· {review.serviceName}</span>}
                    {review.staffName && <span>· with {review.staffName}</span>}
                    <span>·{" "}{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {review.appointmentId && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title="Copy review link"
                      onClick={() => copyLink(review.appointmentId)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title={review.isFeatured ? "Unfeature" : "Feature"}
                    onClick={() => toggleMutation.mutate({ id: review.id, field: "isFeatured", value: !review.isFeatured })}
                  >
                    <Star className={cn("h-4 w-4", review.isFeatured ? "fill-yellow-400 text-yellow-400" : "")} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title={review.isPublic ? "Hide review" : "Show review"}
                    onClick={() => toggleMutation.mutate({ id: review.id, field: "isPublic", value: !review.isPublic })}
                  >
                    {review.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </AppLayout>
  );
}
