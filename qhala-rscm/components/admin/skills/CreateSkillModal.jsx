"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function CreateSkillModal({ onClose }) {
  const [skillForm, setSkillForm] = useState({
    name: "",
    category: "",
    description: "",
    aliases: [],
  });
  const [aliasInput, setAliasInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WIRED: Calls Convex Action -> Python -> DB
  const createSkill = useAction(api.api.createSkill);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.name.trim()) {
      toast.error("Skill name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSkill({
        name: skillForm.name.trim(),
        category: skillForm.category.trim() || "Uncategorized",
        description: skillForm.description.trim() || undefined,
        // Note: Ensure your Python backend accepts aliases if you want to save them
        aliases: skillForm.aliases,
      });

      toast.success(`Skill "${skillForm.name}" created successfully`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to create skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAlias = () => {
    if (
      aliasInput.trim() &&
      !skillForm.aliases.includes(aliasInput.trim().toLowerCase())
    ) {
      setSkillForm((prev) => ({
        ...prev,
        aliases: [...prev.aliases, aliasInput.trim().toLowerCase()],
      }));
      setAliasInput("");
    }
  };

  const removeAlias = (alias) => {
    setSkillForm((prev) => ({
      ...prev,
      aliases: prev.aliases.filter((a) => a !== alias),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-rscm-dark-purple">
              Add New Skill
            </h3>
            <button
              onClick={onClose}
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
                onChange={(e) =>
                  setSkillForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., JavaScript, Project Management"
                className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rscm-dark-purple mb-1">
                Category
              </label>
              <input
                type="text"
                value={skillForm.category}
                onChange={(e) =>
                  setSkillForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
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
                onChange={(e) =>
                  setSkillForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addAlias())
                  }
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
                        border: `1px solid ${RSCM_COLORS.lilac}30`,
                      }}
                    >
                      {alias}
                      <button
                        type="button"
                        onClick={() => removeAlias(alias)}
                        className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                        style={{ color: RSCM_COLORS.plum }}
                        onMouseEnter={(e) => (e.target.style.color = "#ef4444")}
                        onMouseLeave={(e) =>
                          (e.target.style.color = RSCM_COLORS.plum)
                        }
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
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-rscm-violet text-white rounded-lg hover:bg-rscm-plum transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <LoadingSpinner size={16} color="white" />
                ) : (
                  <Plus size={18} />
                )}
                {isSubmitting ? "Creating..." : "Create Skill"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
