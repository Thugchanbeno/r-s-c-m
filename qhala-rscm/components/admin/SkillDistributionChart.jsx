"use client";
import React, { useMemo } from "react";
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
  CardDescription,
} from "@/components/common/Card";
import { AlertCircle, BarChart3, ChevronDown } from "lucide-react";
import { useSkillDistribution } from "@/lib/hooks/useSkillDistribution";
import { cn } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

const getChartOptions = (selectedCategory, isAggregated) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: `rgb(var(--muted-foreground))`,
        boxWidth: 12,
        padding: 15,
      },
    },
    title: {
      display: true,
      text: `Skill Distribution ${
        selectedCategory !== "All"
          ? `in ${selectedCategory}`
          : isAggregated
          ? "(Overview by Category)"
          : "(All Skills)"
      }`,
      color: `rgb(var(--foreground))`,
      font: { size: 16, weight: "600" },
      padding: { top: 10, bottom: 20 },
    },
    colors: {
      enabled: true,
      forceOverride: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: `rgb(var(--popover))`,
      titleColor: `rgb(var(--popover-foreground))`,
      bodyColor: `rgb(var(--popover-foreground))`,
      borderColor: `rgb(var(--border))`,
      borderWidth: 1,
      padding: 10,
      boxPadding: 3,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Number of Users",
        color: `rgb(var(--muted-foreground))`,
        font: { size: 12 },
      },
      ticks: {
        color: `rgb(var(--muted-foreground))`,
        precision: 0,
      },
      grid: {
        color: `rgba(var(--border-rgb), 0.2)`,
        drawBorder: false,
      },
    },
    x: {
      ticks: {
        color: `rgb(var(--muted-foreground))`,
      },
      grid: {
        display: false,
      },
    },
  },
  elements: {
    bar: {
      borderRadius: { topLeft: 4, topRight: 4 },
    },
  },
});

const SkillDistributionChart = () => {
  const {
    chartData,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    isAggregated,
    categories,
  } = useSkillDistribution();

  const options = useMemo(
    () => getChartOptions(selectedCategory, isAggregated),
    [selectedCategory, isAggregated]
  );

  if (loading) {
    return (
      <Card className="h-[400px] md:h-[450px] flex items-center justify-center shadow-md bg-[rgb(var(--card))] rounded-[var(--radius)]">
        <div className="text-center">
          <LoadingSpinner size={24} />
          <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
            Loading Skill Data...
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md bg-[rgb(var(--card))] rounded-[var(--radius)]">
        <CardHeader
          className={cn(
            "bg-[rgb(var(--destructive))]/10 text-[rgb(var(--destructive))]",
            "border-b border-[rgb(var(--destructive))]/20"
          )}
        >
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle size={18} />
            Skill Data Error
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center h-[350px] flex flex-col justify-center items-center">
          <p className="font-semibold text-lg text-[rgb(var(--destructive))]">
            Could not load skill distribution
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md bg-[rgb(var(--card))] rounded-[var(--radius)]">
      <CardHeader
        className={cn(
          "border-b border-[rgb(var(--border))]"
          // To use peach header: "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]"
        )}
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex-grow">
            <CardTitle className="flex items-center gap-2 text-[rgb(var(--foreground))] text-lg">
              <BarChart3 size={20} className="text-[rgb(var(--primary))]" />
              Company Skill Landscape
            </CardTitle>
            <CardDescription className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              Distribution of skills across users and categories.
            </CardDescription>
          </div>
          {categories && categories.length > 1 && (
            <div className="relative min-w-[220px] sm:min-w-[240px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={cn(
                  "w-full appearance-none cursor-pointer",
                  "p-2.5 pr-10",
                  "border border-[rgb(var(--border))]",
                  "rounded-[var(--radius)]",
                  "bg-[rgb(var(--background))]",
                  "text-[rgb(var(--foreground))] text-sm",
                  "focus:ring-2 focus:ring-offset-1 focus:ring-[rgb(var(--ring))] focus:ring-offset-[rgb(var(--background))]",
                  "focus:border-[rgb(var(--primary))] focus:outline-none",
                  "shadow-sm transition-colors duration-150"
                )}
                aria-label="Filter by skill category"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories / Overview" : cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--muted-foreground))] pointer-events-none"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[400px] md:h-[450px] p-3 md:p-4">
        {chartData && chartData.labels && chartData.labels.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-[rgb(var(--muted-foreground))]">
              No skill data available to display for the selected filter.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillDistributionChart;
