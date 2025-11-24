"use client";
import { useState, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

export const useAI = () => {
  const { user } = useAuth();

  // QuickAsk state
  const [quickAskQuery, setQuickAskQuery] = useState("");
  const [quickAskSuggestions, setQuickAskSuggestions] = useState([]);
  const [quickAskLoading, setQuickAskLoading] = useState(false);
  const [quickAskError, setQuickAskError] = useState(null);
  const [showQuickAskSuggestions, setShowQuickAskSuggestions] = useState(false);

  // QuickAsk (uses extract-skills proxy)
  const handleQuickAskSearch = useCallback(async () => {
    if (!quickAskQuery.trim() || !user?.email) return;
    setQuickAskLoading(true);
    setQuickAskError(null);
    setQuickAskSuggestions([]);

    try {
      // PROXY CALL
      const response = await fetch("/api/ai/extract-skills", {
        method: "POST",
        body: JSON.stringify({
          description: quickAskQuery,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed");

      setQuickAskSuggestions(result.extractedSkills || []);
      setShowQuickAskSuggestions(true);
    } catch (err) {
      setQuickAskError(err.message);
      setQuickAskSuggestions([]);
    } finally {
      setQuickAskLoading(false);
    }
  }, [quickAskQuery, user?.email]);

  const handleQuickAskClear = useCallback(() => {
    setQuickAskQuery("");
    setQuickAskSuggestions([]);
    setShowQuickAskSuggestions(false);
    setQuickAskError(null);
  }, []);

  // Project description analysis (uses extract-skills proxy)
  const handleExtractSkills = useCallback(
    async (projectId, description) => {
      if (!user?.email || !description) return [];
      try {
        // PROXY CALL
        const response = await fetch("/api/ai/extract-skills", {
          method: "POST",
          body: JSON.stringify({
            description,
            projectId,
          }),
        });
        const result = await response.json();
        return result.extractedSkills || [];
      } catch (err) {
        toast.error("Failed to extract skills.");
        return [];
      }
    },
    [user?.email]
  );

  // Recommendations (uses get-recommendations proxy)
  const handleGetRecommendations = useCallback(
    async (projectId, limit = 10) => {
      if (!user?.email) return [];
      try {
        // PROXY CALL
        const response = await fetch("/api/ai/get-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, limit }),
        });

        const result = await response.json();
        if (!response.ok || result.error) {
          throw new Error(result.error || "Failed to fetch recommendations");
        }

        return result.users || [];
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch recommendations.");
        return [];
      }
    },
    [user?.email]
  );

  return {
    quickAskQuery,
    setQuickAskQuery,
    quickAskSuggestions,
    quickAskLoading,
    quickAskError,
    showQuickAskSuggestions,
    handleQuickAskSearch,
    handleQuickAskClear,
    handleExtractSkills,
    handleGetRecommendations,
  };
};
