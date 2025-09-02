// components/projects/quick-ask.jsx
"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Sparkles,
  Search,
  X,
  Zap,
  TrendingUp,
  Target,
  Plus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QuickAsk = ({
  query,
  onQueryChange,
  onSearch,
  onClear,
  suggestions = [],
  loading = false,
  error = null,
  showSuggestions = false,
  onSkillSelected,
  className,
}) => {
  const exampleQueries = [
    "frontend React development",
    "data analysis and visualization",
    "cloud infrastructure deployment",
    "mobile app testing",
  ];

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Search Input */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Describe the skills you need... e.g., 'machine learning for image recognition'"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {query && (
              <button
                onClick={onClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <Button
            onClick={onSearch}
            disabled={!query.trim() || loading}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={16} />
                Discover Skills
              </>
            )}
          </Button>

          {/* Examples */}
          {!query && !loading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Target size={12} />
                Try these examples:
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => onQueryChange(example)}
                    className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <X size={16} className="text-destructive" />
              <div>
                <h4 className="font-medium text-destructive">Search Error</h4>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <LoadingSpinner loading={true} size={24} />
            <div className="mt-4 space-y-1">
              <h3 className="font-medium">Analyzing your request</h3>
              <p className="text-sm text-muted-foreground">
                Finding skill matches for "{query}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} />
              AI Skill Recommendations
              <Badge variant="secondary">{suggestions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((skill, index) => (
              <Card
                key={skill.id || index}
                className="group cursor-pointer hover:shadow-sm transition-all duration-200"
                onClick={() => onSkillSelected(skill)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {skill.name}
                        </h4>
                        {skill.category && (
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                        )}
                      </div>
                      {skill.confidence && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${skill.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(skill.confidence * 100)}% match
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        <Plus size={12} />
                      </Button>
                      <ArrowRight
                        size={14}
                        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add All */}
            {suggestions.length > 1 && (
              <Button
                variant="outline"
                onClick={() =>
                  suggestions.forEach((skill) => onSkillSelected(skill))
                }
                className="w-full gap-2 border-dashed"
              >
                <Plus size={14} />
                Add All {suggestions.length} Skills
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showSuggestions && suggestions.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Search
              size={32}
              className="mx-auto text-muted-foreground/30 mb-3"
            />
            <h3 className="font-medium mb-1">No skills found</h3>
            <p className="text-sm text-muted-foreground mb-3">
              No matches for <span className="font-medium">"{query}"</span>
            </p>
            <Button variant="outline" onClick={onClear} size="sm">
              Try Different Search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickAsk;
