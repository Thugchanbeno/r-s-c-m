// lib/hooks/useAI.js
"use client";
import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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

  // Convex mutations
  const extractSkills = useMutation(api.projects.extractSkillsFromDescription);

  // QuickAsk (reuses extractSkills)
  const handleQuickAskSearch = useCallback(async () => {
    if (!quickAskQuery.trim() || !user?.email) return;
    setQuickAskLoading(true);
    setQuickAskError(null);
    setQuickAskSuggestions([]);

    try {
      const result = await extractSkills({
        email: user.email,
        projectId: undefined,
        description: quickAskQuery,
      });

      setQuickAskSuggestions(result.extractedSkills || []);
      setShowQuickAskSuggestions(true);
    } catch (err) {
      setQuickAskError(err.message);
      setQuickAskSuggestions([]);
    } finally {
      setQuickAskLoading(false);
    }
  }, [quickAskQuery, user?.email, extractSkills]);

  const handleQuickAskClear = useCallback(() => {
    setQuickAskQuery("");
    setQuickAskSuggestions([]);
    setShowQuickAskSuggestions(false);
    setQuickAskError(null);
  }, []);

  // Project description analysis
  const handleExtractSkills = useCallback(
    async (projectId, description) => {
      if (!user?.email || !description) return [];
      try {
        const result = await extractSkills({
          email: user.email,
          projectId,
          description,
        });
        return result.extractedSkills || [];
      } catch (err) {
        toast.error("Failed to extract skills.");
        return [];
      }
    },
    [user?.email, extractSkills]
  );

  // Recommendations (on-demand fetch via proxy route)
  const handleGetRecommendations = useCallback(
    async (projectId, limit = 10) => {
      if (!user?.email) return [];
      try {
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
