"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const SkillTaxonomyList = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchSkills();
  }, []);

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

  // Optional: Check authentication status if viewing the list should be restricted
  // if (sessionStatus === 'unauthenticated') {
  //    return (
  //      <div className="p-4 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-md">
  //        Please sign in to view the skill taxonomy.
  //      </div>
  //    );
  // }

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
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  {skill.name}
                  {/* {skill.description && <p className="text-xs text-gray-500 pl-2">{skill.description}</p>} */}
                </li>
              ))}
          </ul>
        </div>
      ))}
      {/* TODO: Add button/link here later for Admins/HR to manage skills */}
      {/* <button className="mt-4 ...">Manage Skills</button> */}
    </div>
  );
};

export default SkillTaxonomyList;
