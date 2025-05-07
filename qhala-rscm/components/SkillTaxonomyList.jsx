"use client";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Trash2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Button from "@/components/common/Button";

const SkillTaxonomyList = () => {
  const { data: session } = useSession();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    fetchSkills();
  }, []);

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
      // Check if the result is an object and has the expected properties
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

        console.error(
          "Data validation failed:",
          failureReason,
          "Raw result:",
          result
        );
        throw new Error(failureReason);
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (confirmDelete !== skillId) {
      // First click - show confirmation
      setConfirmDelete(skillId);
      return;
    }

    // Second click - proceed with deletion
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

      // Success - refresh the skills list
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
      <div className="flex items-center justify-center p-6">
        <LoadingSpinner size={15} />
        <span className="ml-3 text-gray-600">Loading skill taxonomy...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
        <p>
          <strong>Error loading skills:</strong> {error}
        </p>
      </div>
    );
  }

  const categories = Object.keys(skills).sort(); // Get sorted category names

  if (categories.length === 0) {
    return (
      <p className="text-gray-500 italic">No skills found in the taxonomy.</p>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b p-4">
        Available Skills Taxonomy
      </h2>

      {deleteError && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center mb-4">
          <AlertCircle size={18} className="mr-2" />
          <span>{deleteError}</span>
        </div>
      )}

      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-lg font-medium mb-2 text-indigo-700 dark:text-indigo-400">
            {category}
          </h3>
          <ul className="list-disc list-inside space-y-1 pl-4">
            {skills[category]
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort skills within category
              .map((skill) => (
                <li
                  key={skill._id}
                  className="flex items-center justify-between py-1 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="flex-grow">{skill.name}</span>

                  {isAdmin && (
                    <Button
                      variant={confirmDelete === skill._id ? "danger" : "ghost"}
                      size="sm"
                      onClick={() => handleDeleteSkill(skill._id)}
                      disabled={deletingSkill === skill._id}
                      className="ml-2"
                    >
                      {deletingSkill === skill._id ? (
                        <LoadingSpinner size={14} />
                      ) : (
                        <>
                          <Trash2 size={14} className="mr-1" />
                          {confirmDelete === skill._id ? "Confirm" : "Delete"}
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
  );
};

export default SkillTaxonomyList;
