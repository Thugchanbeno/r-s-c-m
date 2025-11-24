"use client";
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

const RecommendationFeedback = ({ projectId, userId, onFeedbackSubmit }) => {
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (isPositive) => {
    if (isSubmitting || status) return;
    setIsSubmitting(true);

    try {
      if (!projectId || !userId) {
        console.error("Missing IDs for feedback", { projectId, userId });
        return;
      }
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          projectId,
          recommendationType: "user",
          rating: isPositive,
          comments: isPositive
            ? "User accepted via UI"
            : "User rejected via UI",
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      setStatus(isPositive ? "up" : "down");
      toast.success("Feedback received. The AI will learn from this.");

      if (onFeedbackSubmit) onFeedbackSubmit(isPositive);
    } catch (error) {
      console.error(error);
      toast.error("Could not save feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleFeedback(false)}
        disabled={isSubmitting || status === "up"}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          status === "down"
            ? "bg-red-100 text-red-600 scale-110 ring-2 ring-red-200"
            : "text-gray-300 hover:bg-red-50 hover:text-red-500"
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
        disabled={isSubmitting || status === "down"}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          status === "up"
            ? "bg-green-100 text-green-600 scale-110 ring-2 ring-green-200"
            : "text-gray-300 hover:bg-green-50 hover:text-green-500"
        }`}
        title="Good match"
      >
        <ThumbsUp size={14} className={status === "up" ? "fill-current" : ""} />
      </button>
    </div>
  );
};

export default RecommendationFeedback;
