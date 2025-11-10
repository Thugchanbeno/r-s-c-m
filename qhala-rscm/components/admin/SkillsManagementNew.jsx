"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Users,
  Trash2,
  Edit3,
  Tag,
  BarChart3,
  TrendingUp,
  X,
  Save,
  AlertCircle,
  Grid3X3,
  List,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";
import { cn } from "@/lib/utils";

const SkillsManagementNew = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [errorSkills, setErrorSkills] = useState(null);
  const [skillsAwaitingDelete, setSkillsAwaitingDelete] = useState(new Set());

  // Form state
  const [skillForm, setSkillForm] = useState({
    name: "",
    category: "",
    description: "",
    aliases: []
  });
  const [aliasInput, setAliasInput] = useState("");

  // Debounce search term (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

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

  // Mutations
  const createSkill = useMutation(api.skills.create);
  const deleteSkill = useMutation(api.skills.deleteSkill);

  const loading = !skills || !skillsDistribution;

  // Get unique categories
  const categories = skillsDistribution?.map(cat => cat.category) || [];
  
  // Get skills with usage stats and apply search/category filtering
  const enrichedSkills = skills?.map(skill => {
    const distributionData = skillsDistribution
      ?.flatMap(cat => cat.skills)
      .find(s => s.skillId === skill._id);
    
    return {
      ...skill,
      currentUsers: distributionData?.currentUserCount || 0,
      desiredUsers: distributionData?.desiredUserCount || 0,
      totalUsage: (distributionData?.currentUserCount || 0) + (distributionData?.desiredUserCount || 0)
    };
  }) || [];

  // Apply additional filtering (since Convex query may not catch all cases)
  const filteredSkills = enrichedSkills.filter(skill => {
    // Search filter (using debounced term for client-side filtering)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesName = skill.name.toLowerCase().includes(searchLower);
      const matchesCategory = skill.category?.toLowerCase().includes(searchLower);
      const matchesDescription = skill.description?.toLowerCase().includes(searchLower);
      const matchesAlias = skill.aliases?.some(alias => 
        alias.toLowerCase().includes(searchLower)
      );
      
      if (!matchesName && !matchesCategory && !matchesDescription && !matchesAlias) {
        return false;
      }
    }
    
    // Category filter
    if (selectedCategory && skill.category !== selectedCategory) {
      return false;
    }
    
    return true;
  });

  // Sort skills by usage for better insights
  const sortedSkills = filteredSkills.sort((a, b) => b.totalUsage - a.totalUsage);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.name.trim()) {
      toast.error("Skill name is required");
      return;
    }

    try {
      await createSkill({
        email: user.email,
        name: skillForm.name.trim(),
        category: skillForm.category.trim() || undefined,
        description: skillForm.description.trim() || undefined,
        aliases: skillForm.aliases.length > 0 ? skillForm.aliases : undefined
      });
      
      toast.success(`Skill "${skillForm.name}" created successfully`);
      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to create skill");
    }
  };

  const handleDeleteSkill = async (skillId, skillName, isConfirming = false) => {
    if (!isConfirming) {
      // First click - mark for deletion
      setSkillsAwaitingDelete(prev => new Set([...prev, skillId]));
      
      // Show informative toast
      toast.info(`Click "Confirm" to permanently delete "${skillName}"`, {
        description: "This will remove it from all user profiles and cannot be undone. Cancels automatically in 5 seconds.",
        duration: 4000
      });
      
      // Auto-cancel after 5 seconds if not confirmed
      setTimeout(() => {
        setSkillsAwaitingDelete(prev => {
          const newSet = new Set(prev);
          newSet.delete(skillId);
          return newSet;
        });
      }, 5000);
      return;
    }

    // Second click - actually delete
    try {
      const result = await deleteSkill({
        email: user.email,
        skillId
      });
      toast.success(result.message);
      
      // Remove from pending delete set
      setSkillsAwaitingDelete(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillId);
        return newSet;
      });
    } catch (error) {
      toast.error(error.message || "Failed to delete skill");
      
      // Remove from pending delete set on error too
      setSkillsAwaitingDelete(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillId);
        return newSet;
      });
    }
  };

  const handleCancelDelete = (skillId) => {
    setSkillsAwaitingDelete(prev => {
      const newSet = new Set(prev);
      newSet.delete(skillId);
      return newSet;
    });
  };

  const resetForm = () => {
    setSkillForm({ name: "", category: "", description: "", aliases: [] });
    setAliasInput("");
    setEditingSkill(null);
  };

  const addAlias = () => {
    if (aliasInput.trim() && !skillForm.aliases.includes(aliasInput.trim().toLowerCase())) {
      setSkillForm(prev => ({
        ...prev,
        aliases: [...prev.aliases, aliasInput.trim().toLowerCase()]
      }));
      setAliasInput("");
    }
  };

  const removeAlias = (alias) => {
    setSkillForm(prev => ({
      ...prev,
      aliases: prev.aliases.filter(a => a !== alias)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingSpinner size={32} />
              <p className="mt-2 text-sm text-gray-600">Loading skills management...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorSkills) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Skills</h3>
              <p className="text-sm text-gray-600">{errorSkills}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-rscm-dark-purple mb-2">
              Skills Management
            </h1>
            <p className="text-gray-600">
              Manage skill taxonomy, categories, and organization
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-rscm-violet text-white px-4 py-2 rounded-lg hover:bg-rscm-plum transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add Skill
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-64 relative">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search skills, categories, aliases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 pr-8 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-rscm-violet border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={cn(
                "appearance-none px-3 py-2 pr-8 bg-gray-50 rounded-md text-sm",
                "focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none",
                "border border-gray-200 hover:border-gray-300 transition-colors"
              )}
            >
              <option value="">All Categories ({enrichedSkills.length})</option>
              {categories.map(cat => {
                const categoryCount = enrichedSkills.filter(skill => skill.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({categoryCount})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                viewMode === "grid"
                  ? "bg-rscm-violet text-white"
                  : "text-gray-600 hover:text-rscm-violet"
              }`}
            >
              <Grid3X3 size={16} />
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-rscm-violet text-white"
                  : "text-gray-600 hover:text-rscm-violet"
              }`}
            >
              <List size={16} />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rscm-violet/10">
              <Award size={20} className="text-rscm-violet" />
            </div>
            <div>
              <div className="text-2xl font-bold text-rscm-dark-purple">
                {sortedSkills.length}
              </div>
              <div className="text-sm text-gray-600">Total Skills</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rscm-plum/10">
              <Tag size={20} className="text-rscm-plum" />
            </div>
            <div>
              <div className="text-2xl font-bold text-rscm-dark-purple">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${RSCM_COLORS.violet}10` }}>
              <Users size={20} style={{ color: RSCM_COLORS.violet }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-rscm-dark-purple">
                {sortedSkills.reduce((sum, skill) => sum + skill.currentUsers, 0)}
              </div>
              <div className="text-sm text-gray-600">Current Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${RSCM_COLORS.plum}10` }}>
              <TrendingUp size={20} style={{ color: RSCM_COLORS.plum }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-rscm-dark-purple">
                {sortedSkills.reduce((sum, skill) => sum + skill.desiredUsers, 0)}
              </div>
              <div className="text-sm text-gray-600">Skill Requests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Display */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSkills.map((skill) => (
              <div 
                key={skill._id} 
                className={cn(
                  "border rounded-lg p-4 transition-all duration-200",
                  skillsAwaitingDelete.has(skill._id)
                    ? "border-red-200 bg-red-50 shadow-md"
                    : "border-gray-100 hover:bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-rscm-dark-purple mb-1">
                      {skill.name}
                    </h3>
                    {skill.category && (
                      <span 
                        className="inline-block px-2 py-1 text-xs rounded-full text-white mb-2"
                        style={{ backgroundColor: RSCM_COLORS.plum }}
                      >
                        {skill.category}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
                
                {skill.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {skill.description}
                  </p>
                )}
                
                {skill.aliases && skill.aliases.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skill.aliases.slice(0, 3).map((alias, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          backgroundColor: `${RSCM_COLORS.lilac}15`, 
                          color: RSCM_COLORS.plum,
                          border: `1px solid ${RSCM_COLORS.lilac}30`
                        }}
                      >
                        {alias}
                      </span>
                    ))}
                    {skill.aliases.length > 3 && (
                      <span className="text-xs text-gray-500 font-medium">+{skill.aliases.length - 3} more</span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1" style={{ color: RSCM_COLORS.violet }}>
                      <Users size={14} />
                      <span>{skill.currentUsers}</span>
                    </div>
                    <div className="flex items-center gap-1" style={{ color: RSCM_COLORS.plum }}>
                      <TrendingUp size={14} />
                      <span>{skill.desiredUsers}</span>
                    </div>
                  </div>
                  
                  {skillsAwaitingDelete.has(skill._id) ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteSkill(skill._id, skill.name, true)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Confirm delete"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleCancelDelete(skill._id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                        title="Cancel delete"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteSkill(skill._id, skill.name)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete skill"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {sortedSkills.map((skill) => (
              <div 
                key={skill._id} 
                className={cn(
                  "border rounded-lg p-4 transition-all duration-200",
                  skillsAwaitingDelete.has(skill._id)
                    ? "border-red-200 bg-red-50 shadow-md"
                    : "border-gray-100 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-rscm-dark-purple">
                        {skill.name}
                      </h3>
                      {skill.category && (
                        <span 
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: RSCM_COLORS.plum }}
                        >
                          {skill.category}
                        </span>
                      )}
                    </div>
                    
                    {skill.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {skill.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1" style={{ color: RSCM_COLORS.violet }}>
                        <Users size={14} />
                        <span>{skill.currentUsers} have it</span>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: RSCM_COLORS.plum }}>
                        <TrendingUp size={14} />
                        <span>{skill.desiredUsers} want it</span>
                      </div>
                      {skill.aliases && skill.aliases.length > 0 && (
                        <span>{skill.aliases.length} aliases</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {skillsAwaitingDelete.has(skill._id) ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteSkill(skill._id, skill.name, true)}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Confirm delete"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => handleCancelDelete(skill._id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                          title="Cancel delete"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteSkill(skill._id, skill.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete skill"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {sortedSkills.length === 0 && (
          <div className="text-center py-12">
            <Award size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-500 mb-4">
              {debouncedSearchTerm || selectedCategory 
                ? "No skills match your current search criteria. Try different keywords or check all categories."
                : "Get started by creating your first skill to begin building your organization's skill taxonomy."
              }
            </p>
            {(!debouncedSearchTerm && !selectedCategory) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-rscm-violet text-white px-4 py-2 rounded-lg hover:bg-rscm-plum transition-colors"
              >
                Create First Skill
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Skill Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-rscm-dark-purple">
                  Add New Skill
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleCreateSkill} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-rscm-dark-purple mb-1">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    value={skillForm.name}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., JavaScript, Project Management"
                    className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-rscm-dark-purple mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={skillForm.category}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Programming, Management, Design"
                    className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-rscm-dark-purple mb-1">
                    Description
                  </label>
                  <textarea
                    value={skillForm.description}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this skill"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-rscm-dark-purple mb-1">
                    Aliases & Alternative Names
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      placeholder="Add an alias"
                      className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAlias())}
                    />
                    <button
                      type="button"
                      onClick={addAlias}
                      className="px-3 py-2 bg-rscm-violet/10 text-rscm-violet rounded-md hover:bg-rscm-violet/20 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {skillForm.aliases.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skillForm.aliases.map((alias) => (
                        <span
                          key={alias}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                          style={{ 
                            backgroundColor: `${RSCM_COLORS.lilac}15`, 
                            color: RSCM_COLORS.plum,
                            border: `1px solid ${RSCM_COLORS.lilac}30`
                          }}
                        >
                          {alias}
                          <button
                            type="button"
                            onClick={() => removeAlias(alias)}
                            className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                            style={{ color: RSCM_COLORS.plum }}
                            onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.target.style.color = RSCM_COLORS.plum}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-rscm-violet text-white rounded-lg hover:bg-rscm-plum transition-colors"
                  >
                    Create Skill
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsManagementNew;