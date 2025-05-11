"use client";
import { useState, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import { AlertCircle } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

const SkillDistributionChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

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
        // Process data for the chart
        let labels = [];
        let currentUserData = [];
        let desiredUserData = [];
        let categories = ["All"];

        result.data.forEach((categoryObj) => {
          if (!categories.includes(categoryObj.category)) {
            categories.push(categoryObj.category);
          }
          if (
            selectedCategory === "All" ||
            selectedCategory === categoryObj.category
          ) {
            categoryObj.skills.forEach((skill) => {
              labels.push(
                `${skill.name} (${categoryObj.category.substring(0, 3)})`
              ); // Add category abbreviation for clarity if "All"
              currentUserData.push(skill.currentUserCount);
              desiredUserData.push(skill.desiredUserCount);
            });
          }
        });
        if (selectedCategory === "All" && labels.length > 20) {
          labels = [];
          currentUserData = [];
          desiredUserData = [];
          result.data.forEach((categoryObj) => {
            labels.push(categoryObj.category);
            let catCurrent = 0;
            let catDesired = 0;
            categoryObj.skills.forEach((skill) => {
              catCurrent += skill.currentUserCount;
              catDesired += skill.desiredUserCount;
            });
            currentUserData.push(catCurrent);
            desiredUserData.push(catDesired);
          });
        }

        setChartData({
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
          categories: [
            ...new Set(result.data.map((c) => c.category).filter(Boolean)),
            "All",
          ].sort(), // Unique categories for filter
        });
      } else {
        throw new Error(
          result.error || "Invalid data format for skill distribution."
        );
      }
    } catch (err) {
      console.error("Error fetching skill distribution:", err);
      setError(err.message || "Could not load skill distribution data.");
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchSkillDistribution();
  }, [fetchSkillDistribution]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "rgb(var(--muted-foreground))",
        },
      },
      title: {
        display: true,
        text: `Skill Distribution ${
          selectedCategory !== "All"
            ? `in ${selectedCategory}`
            : "(Overview by Category if too many skills)"
        }`,
        color: "rgb(var(--foreground))",
        font: { size: 16 },
      },
      colors: {
        enabled: true,
      },
      tooltip: {
        bodyColor: "rgb(var(--tooltip-foreground))",
        titleColor: "rgb(var(--tooltip-foreground))",
        backgroundColor: "rgb(var(--tooltip))",
        borderColor: "rgb(var(--border))",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Users",
          color: "rgb(var(--muted-foreground))",
        },
        ticks: {
          color: "rgb(var(--muted-foreground))",
          stepSize: 1,
        },
        grid: {
          color: "rgba(var(--border-rgb), 0.5)",
        },
      },
      x: {
        ticks: { color: "rgb(var(--muted-foreground))" },
        grid: {
          display: false,
        },
      },
    },
  };

  // Define CSS variables for chart colors in your globals.css if not already present
  // :root {
  //   --primary-rgb: 59, 130, 246; /* Example for blue-500 */
  //   --secondary-rgb: 168, 85, 247; /* Example for purple-500 */
  //   --tooltip-foreground: 255, 255, 255; /* Example for white text on dark tooltip */
  //   --tooltip: 30, 41, 59; /* Example for slate-800 tooltip background */
  //   --border-rgb: 229, 231, 235; /* Example for gray-200 */
  // }
  // .dark { /* Define dark mode versions if needed */ }

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <LoadingSpinner size={24} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-red-600">
          <AlertCircle className="mx-auto mb-2 h-8 w-8" />
          Error loading skill distribution: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <CardTitle>Company Skill Landscape</CardTitle>
          {chartData?.categories && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-[rgb(var(--border))] rounded-[var(--radius)] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] text-sm focus:ring-1 focus:ring-[rgb(var(--primary))]"
            >
              {chartData.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories / Overview" : cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[400px] md:h-[450px] p-4">
        {chartData && chartData.labels.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <p className="text-center text-[rgb(var(--muted-foreground))] pt-10">
            No skill data available to display for the selected filter.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillDistributionChart;
