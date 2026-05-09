import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Send,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { GoogleReview, GoogleReviewResponse } from "@shared/schema";

interface ReviewDetailProps {
  review: GoogleReview;
  storeId: number;
  onClose: () => void;
  onRefresh: () => void;
}

export function ReviewResponseDialog({
  review,
  storeId,
  onClose,
  onRefresh,
}: ReviewDetailProps) {
  const [responses, setResponses] = useState<GoogleReviewResponse[]>([]);
  const [responseText, setResponseText] = useState("");
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // AI suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  useEffect(() => {
    loadResponses();
  }, [review.id]);

  const loadResponses = async () => {
    try {
      setLoadingResponses(true);
      const response = await axios.get(
        `/api/google-business/reviews/${storeId}/${review.id}`
      );
      setResponses(response.data.responses);
    } catch (error) {
      console.error("Failed to load responses:", error);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleSuggestReplies = async () => {
    if (loadingSuggestions) return;

    // Toggle closed if already open with results
    if (suggestionsOpen && suggestions.length > 0) {
      setSuggestionsOpen(false);
      return;
    }

    try {
      setLoadingSuggestions(true);
      setSuggestionsError(null);
      setSuggestionsOpen(true);
      setSuggestions([]);

      const response = await axios.post(
        `/api/google-business/suggest-reply/${storeId}`,
        {
          reviewText: review.reviewText,
          rating: review.rating,
          customerName: review.customerName,
        }
      );

      setSuggestions(response.data.suggestions ?? []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestionsError("Couldn't generate suggestions. Please try again.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUseSuggestion = (text: string) => {
    setResponseText(text);
    setSuggestionsOpen(false);
    // Scroll/focus textarea
    setTimeout(() => {
      document.getElementById("review-response-textarea")?.focus();
    }, 100);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;

    try {
      setSubmitting(true);
      await axios.post("/api/google-business/review-response", {
        googleReviewId: review.id,
        storeId,
        responseText,
      });

      setResponseText("");
      await loadResponses();
    } catch (error) {
      console.error("Failed to submit response:", error);
      alert("Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishResponse = async (responseId: number) => {
    if (!window.confirm("Publish this response to Google?")) return;

    try {
      setPublishing(true);
      await axios.post(
        `/api/google-business/review-response/${responseId}/publish`
      );
      await loadResponses();
      await onRefresh();
    } catch (error: any) {
      console.error("Failed to publish response:", error);
      alert(error.response?.data?.message || "Failed to publish response");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteResponse = async (responseId: number) => {
    if (!window.confirm("Delete this response?")) return;

    try {
      await axios.delete(
        `/api/google-business/review-response/${responseId}`
      );
      await loadResponses();
    } catch (error) {
      console.error("Failed to delete response:", error);
      alert("Failed to delete response");
    }
  };

  const renderStarRating = (rating: number) => (
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

  const showResponseForm =
    review.responseStatus === "not_responded" ||
    !responses.some((r) => r.responseStatus === "approved");

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>

        {/* Original Review */}
        <div className="space-y-4 border-b pb-6">
          <div>
            <div className="mb-2">{renderStarRating(review.rating)}</div>
            <h3 className="font-semibold text-lg">{review.customerName}</h3>
            <p className="text-sm text-gray-500">
              {review.reviewCreateTime
                ? new Date(review.reviewCreateTime).toLocaleDateString()
                : "Date unknown"}
            </p>
          </div>

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
        </div>

        {/* Responses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Responses</h4>
            <Badge
              variant={review.responseStatus === "responded" ? "default" : "outline"}
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

          {loadingResponses ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-gray-400" />
            </div>
          ) : responses.length === 0 ? (
            <p className="text-sm text-gray-500">No responses yet</p>
          ) : (
            <div className="space-y-3">
              {responses.map((response) => (
                <Card
                  key={response.id}
                  className={
                    response.responseStatus === "approved"
                      ? "border-green-200 bg-green-50"
                      : response.responseStatus === "rejected"
                      ? "border-red-200 bg-red-50"
                      : ""
                  }
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant={
                          response.responseStatus === "approved" ? "default" : "outline"
                        }
                      >
                        {response.responseStatus === "approved"
                          ? "Published"
                          : response.responseStatus === "rejected"
                          ? "Rejected"
                          : "Draft"}
                      </Badge>
                      <div className="flex gap-2">
                        {response.responseStatus === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handlePublishResponse(response.id)}
                            disabled={publishing}
                            className="gap-2"
                          >
                            {publishing ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                            Publish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteResponse(response.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-700">{response.responseText}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* New Response Form */}
          {showResponseForm && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Add a Response</h5>

                {/* AI Suggest Replies button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSuggestReplies}
                  disabled={loadingSuggestions}
                  className="gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                >
                  {loadingSuggestions ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Generating…
                    </>
                  ) : suggestionsOpen && suggestions.length > 0 ? (
                    <>
                      <ChevronUp size={13} />
                      Hide suggestions
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Suggest replies
                    </>
                  )}
                </Button>
              </div>

              {/* AI Suggestions Panel */}
              {suggestionsOpen && (
                <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 space-y-2">
                  <p className="text-xs font-medium text-violet-700 flex items-center gap-1">
                    <Sparkles size={12} />
                    AI-generated suggestions — review before using
                  </p>

                  {loadingSuggestions && suggestions.length === 0 && (
                    <div className="flex items-center gap-2 py-3 text-sm text-violet-600">
                      <Loader2 size={14} className="animate-spin" />
                      Writing suggestions based on this review…
                    </div>
                  )}

                  {suggestionsError && (
                    <p className="text-sm text-red-600">{suggestionsError}</p>
                  )}

                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleUseSuggestion(suggestion)}
                      className="w-full text-left rounded-md border border-violet-200 bg-white px-3 py-2.5 text-sm text-gray-700 hover:border-violet-400 hover:bg-violet-50 transition-colors group relative"
                    >
                      <p className="pr-16 leading-relaxed">{suggestion}</p>
                      <span className="absolute right-2.5 top-2.5 text-xs font-medium text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity bg-violet-100 rounded px-1.5 py-0.5">
                        Use this
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <Textarea
                id="review-response-textarea"
                placeholder="Write your response to this review…"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                maxLength={5000}
                rows={4}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {responseText.length}/5000
                </span>
                <Button
                  onClick={handleSubmitResponse}
                  disabled={!responseText.trim() || submitting}
                  className="gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save as Draft"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
