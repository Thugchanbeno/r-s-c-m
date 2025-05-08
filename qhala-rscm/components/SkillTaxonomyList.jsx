"use client";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Trash2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Button from "@/components/common/Button";
import { Card, CardHeader, CardContent } from "@/components/common/Card";

const SkillTaxonomyList = () => {
  const { data: session } = useSession();
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

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
      const isSuccess =
        result && result.hasOwnProperty("success") && result.success === true;
      const dataIsArray =
        result && result.hasOwnProperty("data") && Array.isArray(result.data);

      if (isSuccess && dataIsArray) {
        const grouped = result.data.reduce((acc, skill) => {
          const category = skill.category || "Uncategorized";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(skill);
          return acc;
        }, {});
        setSkills(grouped);
      } else {
        let failureReason = "Invalid data format received from API.";
        if (!isSuccess)
          failureReason = "API response did not indicate success.";
        if (!dataIsArray)
          failureReason =
            "API response 'data' field is missing or not an array.";
        if (result && result.error) failureReason = result.error;
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-[rgb(var(--background))] min-h-[200px]">
        <LoadingSpinner size={30} />
        <span className="ml-3 mt-2 text-[rgb(var(--muted-foreground))]">
          Loading skill taxonomy...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-[var(--radius)] shadow-sm">
        <p className="font-semibold">Error loading skills:</p>
        <p>{error}</p>
      </div>
    );
  }

  const categories = Object.keys(skills).sort();

  if (categories.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-[rgb(var(--card-foreground))]">
            Available Skills Taxonomy
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-[rgb(var(--muted-foreground))] italic py-4 text-center">
            No skills found in the taxonomy.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-[rgb(var(--border))]">
        <h2 className="text-xl font-semibold text-[rgb(var(--card-foreground))]">
          Available Skills Taxonomy
        </h2>
      </CardHeader>
      <CardContent className="pt-6">
        {deleteError && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-[var(--radius)] flex items-center mb-4 shadow-sm">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span>{deleteError}</span>
          </div>
        )}

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-lg font-medium mb-3 text-[rgb(var(--primary))]">
                {category}
              </h3>
              <ul className="space-y-2 pl-1">
                {skills[category]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((skill) => (
                    <li
                      key={skill._id}
                      className="flex items-center justify-between py-2 px-3 text-sm text-[rgb(var(--foreground))] border border-transparent rounded-[var(--radius)] hover:bg-[rgb(var(--muted))] hover:border-[rgb(var(--border))] transition-colors duration-150"
                    >
                      <span className="flex-grow">{skill.name}</span>
                      {isAdmin && (
                        <Button
                          variant={
                            confirmDelete === skill._id ? "danger" : "ghost"
                          }
                          size="xs"
                          onClick={() => handleDeleteSkill(skill._id)}
                          disabled={deletingSkill === skill._id}
                          className="ml-3"
                        >
                          {deletingSkill === skill._id ? (
                            <LoadingSpinner
                              size={14}
                              className="text-current"
                            />
                          ) : (
                            <>
                              <Trash2 size={14} className="mr-1" />
                              {confirmDelete === skill._id
                                ? "Confirm"
                                : "Delete"}
                            </>
                          )}
                        </Button>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillTaxonomyList;
