import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import axios from "axios";
import { GoogleReview } from "@shared/schema";

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

export function GoogleReviewsManager() {
  const params = useParams();
  const storeId = params?.storeId ? Number(params.storeId) : null;

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
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalReviews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageRating}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Responded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: "#10b981" }}>
                {stats.respondedReviews}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Not Responded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: "#ef4444" }}>
                {stats.notRespondedReviews}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                5-Star Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.ratingDistribution[5]}</div>
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
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Sync Reviews
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

      {/* Reviews List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin" />
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No Reviews Found</CardTitle>
          </CardHeader>
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
                <p className="text-gray-700">{review.reviewText}</p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
