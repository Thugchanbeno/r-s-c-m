import { useState, useEffect, useCallback } from "react";

const processSkillDataForChart = (rawData, selectedCategory) => {
  if (!rawData || !Array.isArray(rawData)) {
    return { labels: [], datasets: [], categories: ["All"] };
  }

  let labels = [];
  let currentUserData = [];
  let desiredUserData = [];
  const allCategories = [
    ...new Set(rawData.map((c) => c.category).filter(Boolean)),
  ].sort();
  const categoriesForFilter = ["All", ...allCategories];

  const filteredData =
    selectedCategory === "All"
      ? rawData
      : rawData.filter((c) => c.category === selectedCategory);

  // Aggregate by skill if category is selected or if total skills are manageable
  let aggregateByCategory = false;
  if (selectedCategory === "All") {
    const totalSkills = rawData.reduce(
      (acc, cat) => acc + (cat.skills?.length || 0),
      0
    );
    // Aggregate if showing all categories and too many skills
    if (totalSkills > 25) {
      aggregateByCategory = true;
    }
  }

  if (aggregateByCategory) {
    // Aggregate counts per category
    rawData.forEach((categoryObj) => {
      if (!categoryObj.category) return; // Skip items without category if aggregating
      labels.push(categoryObj.category);
      let catCurrent = 0;
      let catDesired = 0;
      categoryObj.skills?.forEach((skill) => {
        catCurrent += skill.currentUserCount || 0;
        catDesired += skill.desiredUserCount || 0;
      });
      currentUserData.push(catCurrent);
      desiredUserData.push(catDesired);
    });
  } else {
    // Show individual skills (either for 'All' with few skills or a specific category)
    filteredData.forEach((categoryObj) => {
      categoryObj.skills?.forEach((skill) => {
        // Add category abbreviation only if viewing 'All' categories
        const labelSuffix =
          selectedCategory === "All" && categoryObj.category
            ? ` (${categoryObj.category.substring(0, 3)})`
            : "";
        labels.push(`${skill.name}${labelSuffix}`);
        currentUserData.push(skill.currentUserCount || 0);
        desiredUserData.push(skill.desiredUserCount || 0);
      });
    });
  }

  return {
    labels,
    datasets: [
      {
        label: "Users with Skill",
        data: currentUserData,
        backgroundColor: "rgba(var(--primary-rgb), 0.6)",
        borderColor: "rgb(var(--primary-rgb))",
        borderWidth: 1,
      },
      {
        label: "Users Desiring Skill",
        data: desiredUserData,
        backgroundColor: "rgba(var(--secondary-rgb), 0.6)",
        borderColor: "rgb(var(--secondary-rgb))",
        borderWidth: 1,
      },
    ],
    categories: categoriesForFilter, // Categories for the dropdown filter
    aggregated: aggregateByCategory, // Indicate if data was aggregated
  };
};

export function useSkillDistribution() {
  const [rawData, setRawData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAggregated, setIsAggregated] = useState(false);

  const fetchSkillDistribution = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/skills/distribution");
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            `Failed to fetch skill distribution: ${response.statusText}`
        );
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setRawData(result.data);
        const processedData = processSkillDataForChart(
          result.data,
          selectedCategory
        );
        setChartData(processedData);
        setIsAggregated(processedData.aggregated);
      } else {
        throw new Error(
          result.error || "Invalid data format for skill distribution."
        );
      }
    } catch (err) {
      console.error("Error fetching skill distribution:", err);
      setError(err.message || "Could not load skill distribution data.");
      setRawData(null);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchSkillDistribution();
  }, []);

  useEffect(() => {
    if (rawData) {
      const processedData = processSkillDataForChart(rawData, selectedCategory);
      setChartData(processedData);
      setIsAggregated(processedData.aggregated);
    }
  }, [selectedCategory, rawData]);

  return {
    chartData,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    isAggregated,
    categories: chartData?.categories || ["All"],
  };
}
