"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Award, 
  Plus, 
  Search, 
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Target,
  Star
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

const SkillSelectorNew = ({
  initialSelectedSkills = [],
  nlpSuggestedSkills = [],
  onChange,
  title = "Select Skills",
  description = "Choose the skills required for this role or project"
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkillsMap, setSelectedSkillsMap] = useState(new Map());
  const [expandedCategories, setExpandedCategories] = useState({});

  // Debounce search term (700ms delay for responsive feel)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Data queries
  const skills = useQuery(
    api.skills.getAll,
    { 
      search: debouncedSearchTerm || undefined, 
      category: selectedCategory || undefined 
    }
  );

  const skillsDistribution = useQuery(
    api.skills.getDistribution,
    user?.email ? { email: user.email } : "skip"
  );

  const loading = !skills || !skillsDistribution;

  // Initialize selected skills from props
  useEffect(() => {
    const newMap = new Map();
    initialSelectedSkills.forEach((skill) => {
      if (skill.skillId && skill.skillName && skill.proficiencyLevel !== undefined) {
        newMap.set(skill.skillId, { ...skill });
      }
    });
    setSelectedSkillsMap(newMap);
  }, [initialSelectedSkills]);

  // Get unique categories
  const categories = skillsDistribution?.map(cat => cat.category).filter(Boolean) || [];

  // Enrich skills with usage stats
  const enrichedSkills = skills?.map(skill => {
    const distributionData = skillsDistribution
      ?.flatMap(cat => cat.skills)
      .find(s => s.skillId === skill._id);
    
    return {
      ...skill,
      currentUsers: distributionData?.currentUserCount || 0,
      desiredUsers: distributionData?.desiredUserCount || 0,
      totalUsage: (distributionData?.currentUserCount || 0) + (distributionData?.desiredUserCount || 0),
      isSuggestedByNlp: nlpSuggestedSkills.some(nlpSkill => nlpSkill.id === skill._id)
    };
  }) || [];

  // Group skills by category
  const skillsByCategory = enrichedSkills.reduce((acc, skill) => {
    const category = skill.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  const sortedCategories = Object.keys(skillsByCategory).sort();

  // Initialize expanded categories
  useEffect(() => {
    if (skills && Array.isArray(skills)) {
      const initialExpanded = sortedCategories.reduce((acc, category) => {
        acc[category] = false; // Start collapsed
        return acc;
      }, {});
      setExpandedCategories(initialExpanded);
    }
  }, [skills]);

  // Handlers
  const handleToggleSkill = useCallback((skill) => {
    const newMap = new Map(selectedSkillsMap);
    if (newMap.has(skill._id)) {
      newMap.delete(skill._id);
    } else {
      newMap.set(skill._id, {
        skillId: skill._id,
        skillName: skill.name,
        category: skill.category,
        proficiencyLevel: 3, // Default to intermediate
        isRequired: true, // Default to required
      });
    }
    setSelectedSkillsMap(newMap);
    if (onChange) {
      onChange(Array.from(newMap.values()));
    }
  }, [selectedSkillsMap, onChange]);

  const handleProficiencyChange = useCallback((skillId, newProficiency) => {
    const newMap = new Map(selectedSkillsMap);
    const skill = newMap.get(skillId);
    if (skill) {
      skill.proficiencyLevel = parseInt(newProficiency, 10);
      setSelectedSkillsMap(newMap);
      if (onChange) {
        onChange(Array.from(newMap.values()));
      }
    }
  }, [selectedSkillsMap, onChange]);

  const handleIsRequiredChange = useCallback((skillId, newIsRequired) => {
    const newMap = new Map(selectedSkillsMap);
    const skill = newMap.get(skillId);
    if (skill) {
      skill.isRequired = newIsRequired;
      setSelectedSkillsMap(newMap);
      if (onChange) {
        onChange(Array.from(newMap.values()));
      }
    }
  }, [selectedSkillsMap, onChange]);

  const toggleCategory = useCallback((category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const getProficiencyName = (level) => {
    const names = {
      1: "Beginner",
      2: "Basic",
      3: "Intermediate", 
      4: "Advanced",
      5: "Expert"
    };
    return names[level] || "Intermediate";
  };

  const getProficiencyColor = (level) => {
    const colors = {
      1: "#94a3b8", // gray-400
      2: RSCM_COLORS.lilac,
      3: RSCM_COLORS.plum,
      4: RSCM_COLORS.violet,
      5: RSCM_COLORS.darkPurple
    };
    return colors[level] || RSCM_COLORS.plum;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner size={32} />
            <p className="mt-2 text-sm text-gray-600">Loading skills...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-rscm-dark-purple mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-600">
          {description}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 flex-1 relative">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-2.5 py-1.5 pr-6 bg-gray-50 rounded text-xs focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
          />
          {searchTerm !== debouncedSearchTerm && (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 border-2 border-rscm-violet border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {categories.length > 0 && (
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={cn(
                "appearance-none px-2.5 py-1.5 pr-6 bg-gray-50 rounded text-xs",
                "focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none",
                "border border-gray-200 hover:border-gray-300 transition-colors"
              )}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Selected Skills */}
      {selectedSkillsMap.size > 0 && (
        <div className="bg-rscm-violet/5 rounded p-3">
          <h4 className="text-xs font-medium text-rscm-dark-purple mb-2 flex items-center gap-1.5">
            <Target size={14} />
            Selected ({selectedSkillsMap.size})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(selectedSkillsMap.values())
              .sort((a, b) => a.skillName.localeCompare(b.skillName))
              .map((selectedSkill) => (
                <div
                  key={selectedSkill.skillId}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${getProficiencyColor(selectedSkill.proficiencyLevel)}15`,
                    color: getProficiencyColor(selectedSkill.proficiencyLevel),
                    border: `1px solid ${getProficiencyColor(selectedSkill.proficiencyLevel)}30`
                  }}
                >
                  <span className="flex items-center gap-1">
                    {selectedSkill.skillName}
                    <span className="text-xs opacity-75">
                      ({getProficiencyName(selectedSkill.proficiencyLevel)})
                    </span>
                    {selectedSkill.isRequired && (
                      <Star size={10} className="fill-current" />
                    )}
                  </span>
                  <button
                    onClick={() => handleToggleSkill({ 
                      _id: selectedSkill.skillId, 
                      name: selectedSkill.skillName, 
                      category: selectedSkill.category 
                    })}
                    className="hover:bg-white/50 rounded-full p-0.5 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Skills by Category */}
      <div className="max-h-80 overflow-y-auto space-y-2">
        {sortedCategories.length === 0 && (
          <div className="text-center py-6">
            <Award size={24} className="text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-500">No skills available</p>
          </div>
        )}
        
        {sortedCategories.map((category) => {
          const categorySkills = skillsByCategory[category];
          const selectedInCategory = categorySkills.filter(skill => selectedSkillsMap.has(skill._id)).length;
          
          return (
            <div key={category} className="border border-gray-100 rounded overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {expandedCategories[category] ? (
                      <ChevronDown size={14} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-500" />
                    )}
                    <h4 className="text-sm font-medium text-rscm-dark-purple">
                      {category}
                    </h4>
                  </div>
                  <span className="text-xs text-gray-500">
                    {categorySkills.length}
                  </span>
                  {selectedInCategory > 0 && (
                    <span 
                      className="px-1.5 py-0.5 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: RSCM_COLORS.violet, 
                        color: 'white' 
                      }}
                    >
                      {selectedInCategory}
                    </span>
                  )}
                </div>
              </button>
              
              {expandedCategories[category] && (
                <div className="p-2 space-y-2 bg-white">
                  {categorySkills
                    .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically for easier scanning
                    .map((skill) => {
                      const isSelected = selectedSkillsMap.has(skill._id);
                      const selectedData = selectedSkillsMap.get(skill._id);
                      
                      return (
                        <div
                          key={skill._id}
                          className={cn(
                            "border rounded p-2 transition-all duration-200",
                            isSelected 
                              ? "border-rscm-violet/30 bg-rscm-violet/5"
                              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2 flex-1">
                              <button
                                onClick={() => handleToggleSkill(skill)}
                                className={cn(
                                  "mt-0.5 p-1 rounded-full transition-colors",
                                  isSelected
                                    ? "bg-rscm-violet text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                              >
                                {isSelected ? <Check size={12} /> : <Plus size={12} />}
                              </button>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h5 className="text-sm font-medium text-rscm-dark-purple">
                                    {skill.name}
                                  </h5>
                                  {skill.isSuggestedByNlp && !isSelected && (
                                    <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                                      AI
                                    </span>
                                  )}
                                </div>
                                
                                {skill.description && (
                                  <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                                    {skill.description}
                                  </p>
                                )}
                                
                                {/* Show proficiency hint for unselected skills */}
                                {!isSelected && (
                                  <div className="text-xs text-gray-400">
                                    Click to add
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Skill Configuration (when selected) */}
                          {isSelected && selectedData && (
                            <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <label className="text-xs font-medium text-gray-700">
                                  Level:
                                </label>
                                <select
                                  value={selectedData.proficiencyLevel}
                                  onChange={(e) => handleProficiencyChange(skill._id, e.target.value)}
                                  className="px-2 py-1 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-rscm-violet/20 focus:border-rscm-violet outline-none"
                                  style={{ color: getProficiencyColor(selectedData.proficiencyLevel) }}
                                >
                                  {[1, 2, 3, 4, 5].map((level) => (
                                    <option key={level} value={level}>
                                      {getProficiencyName(level)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedData.isRequired}
                                    onChange={(e) => handleIsRequiredChange(skill._id, e.target.checked)}
                                    className="w-3 h-3 rounded border-gray-300 text-rscm-violet focus:ring-rscm-violet/20"
                                  />
                                  <span className="font-medium text-gray-700">Required</span>
                                  <Star 
                                    size={10} 
                                    className={cn(
                                      "transition-colors",
                                      selectedData.isRequired ? "fill-current text-rscm-violet" : "text-gray-300"
                                    )}
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillSelectorNew;