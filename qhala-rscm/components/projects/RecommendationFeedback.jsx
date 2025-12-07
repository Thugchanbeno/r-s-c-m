"use client";
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const RecommendationFeedback = ({ projectId, userId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const logFeedback = useMutation(api.projects.logFeedback);

  const handleFeedback = async (isPositive) => {
    const newStatus = isPositive ? "up" : "down";
    if (status === newStatus) return;

    setStatus(newStatus);
    setLoading(true);

    try {
      await logFeedback({
        projectId,
        userId,
        recommendationType: "user_recommendation",
        rating: isPositive ? 1 : 0,
        comments: isPositive ? "Good match" : "Poor match",
        timestamp: Date.now(),
      });

      toast.success(
        isPositive ? "Marked as good match" : "Marked as poor match"
      );
    } catch (error) {
      console.error("Feedback failed:", error);
      setStatus(null);
      toast.error("Failed to save feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleFeedback(false)}
        disabled={loading}
        className={`p-1.5 rounded-full transition-all duration-200 hover:bg-red-50 ${
          status === "down"
            ? "text-red-500 bg-red-50 scale-110"
            : "text-gray-300 hover:text-red-400"
        }`}
        title="Not a good match"
      >
        <ThumbsDown
          size={14}
          className={status === "down" ? "fill-current" : ""}
        />
      </button>

      <button
        onClick={() => handleFeedback(true)}
        disabled={loading}
        className={`p-1.5 rounded-full transition-all duration-200 hover:bg-green-50 ${
          status === "up"
            ? "text-green-600 bg-green-50 scale-110"
            : "text-gray-300 hover:text-green-500"
        }`}
        title="Good match"
      >
        {loading && status === "up" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ThumbsUp
            size={14}
            className={status === "up" ? "fill-current" : ""}
          />
        )}
      </button>
    </div>
  );
};

export default RecommendationFeedback;
