"use client";
import { Award, Plus, Search, Grid3X3, List, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSkillsManagement } from "@/lib/hooks/useSkillsManagement";
import CreateSkillModal from "./CreateSkillModal";
import SkillsStats from "./SkillsStats";
import SkillsGrid from "./SkillsGrid";

const SkillsManagementNew = () => {
  const {
    skills,
    categories,
    loading,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    showCreateModal,
    setShowCreateModal,
    skillsAwaitingDelete,
    handleDeleteSkill,
    handleCancelDelete,
  } = useSkillsManagement();

  if (loading)
    return (
      <div className="flex justify-center h-64 items-center">
        <LoadingSpinner size={32} />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-rscm-dark-purple">
              Skills Management
            </h1>
            <p className="text-gray-600">Manage skill taxonomy & categories</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-rscm-violet text-white px-4 py-2 rounded-lg hover:bg-rscm-plum flex items-center gap-2"
          >
            <Plus size={18} /> Add Skill
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-50 rounded-md text-sm outline-none border-transparent focus:border-rscm-violet"
          >
            <option value="">All Categories ({skills.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow" : ""}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow" : ""}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <SkillsStats skills={skills} categories={categories} />

      {/* Grid */}
      <SkillsGrid
        skills={skills}
        viewMode={viewMode}
        skillsAwaitingDelete={skillsAwaitingDelete}
        onDelete={handleDeleteSkill}
        onCancelDelete={handleCancelDelete}
        hasActiveFilter={!!(debouncedSearchTerm || selectedCategory)}
        onOpenCreate={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreateSkillModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default SkillsManagementNew;
