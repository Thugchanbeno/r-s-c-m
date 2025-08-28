"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const QuickAsk = ({
  onSkillSelected,
  placeholder = "Type what you're thinking...",
  buttonLabel = "Ask AI",
  disabled = false,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getSuggestions = useMutation(api.skills.getSuggestions);

  const handleAsk = async () => {
    if (!query.trim()) {
      toast.error("Please type something first.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuggestions([]);

    try {
      const result = await getSuggestions({
        email: "placeholder@example.com", // TODO: replace with session email
        description: query,
      });

      if (!result.success) {
        throw new Error(result.error || "No suggestions found.");
      }

      setSuggestions(result.suggestions || []);
    } catch (err) {
      console.error("QuickAsk error:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-3 border rounded-md bg-card shadow-sm">
      <div className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || loading}
        />
        <Button
          type="button"
          onClick={handleAsk}
          disabled={disabled || loading}
          className="flex items-center gap-1"
        >
          {loading ? (
            <LoadingSpinner size={16} />
          ) : (
            <Sparkles size={16} className="text-primary" />
          )}
          {buttonLabel}
        </Button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      {loading && <p className="text-xs text-muted-foreground">Thinking…</p>}

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition"
              onClick={() => {
                onSkillSelected(s);
                toast.success(`Selected: ${s.name}`);
              }}
            >
              {s.name}
              {s.category ? ` (${s.category})` : ""}
              {s.confidence && (
                <span className="ml-1 text-xs opacity-70">
                  {Math.round(s.confidence * 100)}%
                </span>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickAsk;
