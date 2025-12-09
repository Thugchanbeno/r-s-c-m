"use client";
import { Search, X, Zap, Target, Plus } from "lucide-react";

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
}) => {
  const exampleQueries = [
    "frontend React development",
    "data analysis and visualization",
    "cloud infrastructure deployment",
    "mobile app testing",
  ];

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Describe skills you need... e.g., 'machine learning for image recognition'"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && query.trim() && onSearch()}
            className="w-full pl-9 pr-9 py-2 text-sm bg-white rounded-lg focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onSearch}
          disabled={!query.trim() || loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rscm-violet text-white text-xs font-medium rounded-lg hover:bg-rscm-plum transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Discover Skills
            </>
          )}
        </button>

        {/* Examples */}
        {!query && !loading && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              Try these examples:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onQueryChange(example)}
                  className="px-2 py-1 text-xs bg-white hover:bg-gray-100 rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 rounded-lg px-3 py-2 flex items-start gap-2">
          <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-red-900">Search Error</h4>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="w-6 h-6 border-2 border-rscm-violet border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <h3 className="text-sm font-medium text-rscm-dark-purple">
            Analyzing your request
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Finding skill matches for &quot;{query}&quot;
          </p>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-rscm-violet" />
              <h3 className="text-sm font-semibold text-rscm-dark-purple">
                AI Skill Recommendations
              </h3>
              <span className="px-2 py-0.5 bg-rscm-lilac/20 text-rscm-violet text-xs font-medium rounded-full">
                {suggestions.length}
              </span>
            </div>
          </div>

          <div className="p-3 space-y-2">
            {suggestions.map((skill, index) => (
              <div
                key={skill.id || index}
                onClick={() => onSkillSelected(skill)}
                className="group bg-gray-50 hover:bg-rscm-lilac/10 rounded-lg p-3 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-rscm-dark-purple group-hover:text-rscm-violet transition-colors">
                        {skill.name}
                      </h4>
                      {skill.category && (
                        <span className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full">
                          {skill.category}
                        </span>
                      )}
                    </div>
                    {skill.confidence && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rscm-violet rounded-full transition-all duration-300"
                            style={{ width: `${skill.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(skill.confidence * 100)}% match
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="ml-3 w-6 h-6 rounded-full bg-rscm-violet text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add All */}
            {suggestions.length > 1 && (
              <button
                type="button"
                onClick={() => suggestions.forEach((skill) => onSkillSelected(skill))}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 hover:border-rscm-violet text-sm font-medium text-rscm-violet rounded-lg hover:bg-rscm-lilac/5 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add All {suggestions.length} Skills
              </button>
            )}
          </div>
        </div>
      )}

      {/* No Results */}
      {showSuggestions && suggestions.length === 0 && !loading && (
        <div className="bg-white rounded-lg p-6 text-center">
          <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <h3 className="text-sm font-medium text-rscm-dark-purple mb-1">
            No skills found
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            No matches for <span className="font-medium">&quot;{query}&quot;</span>
          </p>
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Different Search
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickAsk;
