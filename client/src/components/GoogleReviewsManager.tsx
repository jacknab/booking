import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  BarChart2,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { GoogleReview } from "@shared/schema";
import { ReviewResponseDialog } from "@/components/ReviewResponseDialog";

interface ReviewStats {
  totalReviews: number;
  averageRating: number | string;
  respondedReviews: number;
  notRespondedReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface GoogleReviewsManagerProps {
  storeId?: number | null;
}

export function GoogleReviewsManager({ storeId: propStoreId }: GoogleReviewsManagerProps = {}) {
  const params = useParams();
  const storeId = propStoreId ?? (params?.storeId ? Number(params.storeId) : null);

  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<GoogleReview | null>(null);

  useEffect(() => {
    if (storeId) {
      loadReviews();
      loadStats();
    }
  }, [storeId, filterRating, filterStatus]);

  const loadReviews = async () => {
    if (!storeId) return;
    try {
      setLoading(true);
      const params: Record<string, any> = { limit: 50 };
      if (filterRating) params.rating = filterRating;
      if (filterStatus) params.status = filterStatus;

      const response = await axios.get(
        `/api/google-business/reviews/${storeId}`,
        { params }
      );
      setReviews(response.data.reviews);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(
        `/api/google-business/reviews-stats/${storeId}`
      );
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSyncReviews = async () => {
    if (!storeId) return;
    try {
      setSyncing(true);
      await axios.post(`/api/google-business/sync-reviews/${storeId}`);
      await loadReviews();
      await loadStats();
    } catch (error) {
      console.error("Failed to sync reviews:", error);
    } finally {
      setSyncing(false);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  const renderStarLabel = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
          />
        ))}
      </div>
    );
  };

  const responseRate =
    stats && stats.totalReviews > 0
      ? Math.round((stats.respondedReviews / stats.totalReviews) * 100)
      : 0;

  if (!storeId) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Invalid Store</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Summary stat cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total Reviews</p>
              <p className="text-3xl font-bold">{stats.totalReviews}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Average Rating</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold">{stats.averageRating}</p>
                <Star size={18} className="fill-yellow-400 text-yellow-400 mb-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Response Rate</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold">{responseRate}%</p>
                <TrendingUp size={16} className="text-emerald-500 mb-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.respondedReviews} of {stats.totalReviews} responded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Awaiting Response</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-amber-500">{stats.notRespondedReviews}</p>
                <MessageSquare size={16} className="text-amber-500 mb-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating distribution + compliance panel */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Rating Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">Rating Distribution</CardTitle>
              </div>
              <CardDescription className="text-xs">All reviews shown — no filtering or suppression</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = stats.ratingDistribution[star] ?? 0;
                const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    {renderStarLabel(star)}
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Google Policy Compliance */}
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <CardTitle className="text-sm font-semibold text-emerald-800">Google Policy Compliance</CardTitle>
              </div>
              <CardDescription className="text-xs text-emerald-700">
                This integration follows Google's Business Profile API policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "All reviews displayed as-is — no suppression or hiding",
                "Ratings are read-only — never modified or manipulated",
                "Reviews are never automatically deleted",
                "Responses require manual review and publishing by you",
                "Sync pulls all reviews regardless of rating",
                "You can disconnect and remove all data at any time",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs text-emerald-800">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          onClick={handleSyncReviews}
          disabled={syncing}
          className="gap-2"
        >
          {syncing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Syncing from Google...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Sync Reviews from Google
            </>
          )}
        </Button>

        <div className="flex gap-2 ml-auto">
          <select
            value={filterStatus || ""}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            <option value="responded">Responded</option>
            <option value="not_responded">Not Responded</option>
          </select>

          <select
            value={filterRating || ""}
            onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {filterRating !== null && (
        <p className="text-xs text-muted-foreground">
          Filtering by {filterRating}-star reviews. This filter only changes your view — all reviews remain
          on Google and are never hidden or suppressed.
        </p>
      )}

      {/* Reviews List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin" />
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <Star size={32} className="text-gray-300" />
            <p className="font-medium text-gray-600">No reviews found</p>
            <p className="text-sm text-muted-foreground">
              {filterRating || filterStatus
                ? "Try adjusting your filters to see more reviews."
                : "Sync with Google to pull in your latest reviews."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setSelectedReview(review)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStarRating(review.rating)}
                      <Badge
                        variant={review.responseStatus === "responded" ? "default" : "outline"}
                        className="ml-auto"
                      >
                        {review.responseStatus === "responded" ? (
                          <>
                            <CheckCircle2 size={14} className="mr-1" />
                            Responded
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} className="mr-1" />
                            No Response
                          </>
                        )}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{review.customerName}</CardTitle>
                    <CardDescription className="text-sm">
                      {review.reviewCreateTime
                        ? new Date(review.reviewCreateTime).toLocaleDateString()
                        : "Date unknown"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700">{review.reviewText || <span className="text-muted-foreground italic">No written review</span>}</p>
                {review.reviewImageUrls && (
                  <div className="flex gap-2 flex-wrap">
                    {(() => {
                      try {
                        const urls = JSON.parse(review.reviewImageUrls);
                        return urls.map((url: string, i: number) => (
                          <img
                            key={i}
                            src={url}
                            alt="Review"
                            className="w-20 h-20 object-cover rounded"
                          />
                        ));
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Click to view details and manage your response</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedReview && storeId && (
        <ReviewResponseDialog
          review={selectedReview}
          storeId={storeId}
          onClose={() => setSelectedReview(null)}
          onRefresh={() => { loadReviews(); loadStats(); }}
        />
      )}
    </div>
  );
}
