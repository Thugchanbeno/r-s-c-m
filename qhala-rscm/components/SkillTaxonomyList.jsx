"use client";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Trash2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Button from "@/components/common/Button";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { motion, AnimatePresence } from "framer-motion";

const SkillTaxonomyList = () => {
  const { data: session } = useSession();
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const isAdmin = session?.user?.role === "admin";

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/skills");
      if (!response.ok) {
        let errorMsg = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg || errorData.message;
        } catch (_) {
          /*ignore*/
        }
        throw new Error(errorMsg);
      }
      const result = await response.json();
      const isSuccess = result?.success === true;
      const dataIsArray = Array.isArray(result?.data);

      if (isSuccess && dataIsArray) {
        const grouped = result.data.reduce((acc, skill) => {
          const category = skill.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(skill);
          return acc;
        }, {});
        setSkills(grouped);
        const initialExpanded = {};
        Object.keys(grouped).forEach((cat) => {
          initialExpanded[cat] = false;
        });
        setExpandedCategories(initialExpanded);
      } else {
        let failureReason = "Invalid data format received from API.";
        if (!isSuccess)
          failureReason = "API response did not indicate success.";
        if (!dataIsArray)
          failureReason =
            "API response 'data' field is missing or not an array.";
        if (result?.error) failureReason = result.error;
        throw new Error(failureReason);
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleDeleteSkill = async (skillId) => {
    if (confirmDelete !== skillId) {
      setConfirmDelete(skillId);
      setDeleteError(null);
      return;
    }

    setDeletingSkill(skillId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to delete skill (${response.status})`
        );
      }
      await fetchSkills();
    } catch (err) {
      console.error("Error deleting skill:", err);
      setDeleteError(err.message);
    } finally {
      setDeletingSkill(null);
      setConfirmDelete(null);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
    setConfirmDelete(null);
  };
  if (loading) {
    return (
      <Card className="min-h-[300px]">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center h-full">
          <LoadingSpinner size={30} />
          <span className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">
            Loading Skill Taxonomy...
          </span>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[rgb(var(--card-foreground))]">
            Skill Taxonomy
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-[var(--radius)] shadow-sm flex items-start">
            <AlertCircle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading skills:</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.keys(skills).sort();
  if (categories.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[rgb(var(--card-foreground))]">
            Skill Taxonomy
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-[rgb(var(--muted-foreground))] italic py-6 text-center">
            No skills found in the taxonomy.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="border-b border-[rgb(var(--border))]">
        <h2 className="text-lg font-semibold text-[rgb(var(--card-foreground))]">
          Skill Taxonomy
        </h2>
      </CardHeader>
      <CardContent className="pt-4 pb-6 px-4 md:px-6">
        {deleteError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-[var(--radius)] flex items-center mb-4 shadow-md"
          >
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span>{deleteError}</span>
          </motion.div>
        )}

        <div className="space-y-1">
          {categories.map((category) => (
            <div
              key={category}
              className="border border-[rgb(var(--border))] rounded-[var(--radius)] overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full p-3 text-left bg-[rgb(var(--muted))] hover:bg-[rgba(var(--muted-rgb),0.7)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))]"
                aria-expanded={expandedCategories[category]}
                aria-controls={`category-skills-${category}`}
              >
                <h3 className="text-lg font-bold text-[rgb(var(--primary))]">
                  {category}
                </h3>
                {expandedCategories[category] ? (
                  <ChevronDown
                    size={20}
                    className="text-[rgb(var(--muted-foreground))]"
                  />
                ) : (
                  <ChevronRight
                    size={20}
                    className="text-[rgb(var(--muted-foreground))]"
                  />
                )}
              </button>
              <AnimatePresence>
                {expandedCategories[category] && (
                  <motion.ul
                    id={`category-skills-${category}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="divide-y divide-[rgb(var(--border))] bg-[rgb(var(--card))]"
                  >
                    {skills[category]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((skill) => (
                        <li
                          key={skill._id}
                          className="flex items-center justify-between py-2.5 px-4 text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors duration-100" // Skill text uses default foreground, smaller size
                          onMouseLeave={() => {
                            if (
                              confirmDelete === skill._id &&
                              deletingSkill !== skill._id
                            ) {
                              setConfirmDelete(null);
                            }
                          }}
                        >
                          <span className="flex-grow pr-2">{skill.name}</span>
                          {isAdmin && (
                            <div className="flex-shrink-0">
                              <Button
                                variant={
                                  confirmDelete === skill._id
                                    ? "danger"
                                    : "ghost"
                                }
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSkill(skill._id);
                                }}
                                disabled={deletingSkill === skill._id}
                                className={`transition-all duration-150 ease-in-out ${
                                  confirmDelete === skill._id
                                    ? "w-24"
                                    : "w-auto"
                                }`}
                                aria-label={
                                  confirmDelete === skill._id
                                    ? `Confirm delete ${skill.name}`
                                    : `Delete ${skill.name}`
                                }
                              >
                                {deletingSkill === skill._id ? (
                                  <LoadingSpinner
                                    size={14}
                                    className="text-current mx-auto"
                                  />
                                ) : (
                                  <>
                                    <Trash2
                                      size={14}
                                      className={
                                        confirmDelete === skill._id
                                          ? ""
                                          : "mr-1"
                                      }
                                    />
                                    {confirmDelete === skill._id
                                      ? "Confirm"
                                      : ""}
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </li>
                      ))}
                    {skills[category].length === 0 && (
                      <li className="px-4 py-3 text-sm text-center text-[rgb(var(--muted-foreground))] italic">
                        No skills in this category.
                      </li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillTaxonomyList;
