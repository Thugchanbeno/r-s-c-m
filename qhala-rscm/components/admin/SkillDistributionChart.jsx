"use client";
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
import { useSkillDistribution } from "@/lib/hooks/useSkillDistribution";

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
      labels: { color: "rgb(var(--muted-foreground))" },
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
      color: "rgb(var(--foreground))",
      font: { size: 16 },
    },
    colors: { enabled: true },
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
        precision: 0,
      },
      grid: { color: "rgba(var(--border-rgb), 0.5)" },
    },
    x: {
      ticks: { color: "rgb(var(--muted-foreground))" },
      grid: { display: false },
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

  const options = getChartOptions(selectedCategory, isAggregated);

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
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
      <Card>
        <CardHeader>
          <CardTitle>Company Skill Landscape</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center text-red-600 h-[350px] flex flex-col justify-center items-center">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="font-semibold">Error loading skill distribution</p>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <CardTitle>Company Skill Landscape</CardTitle>
          {categories && categories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-[rgb(var(--border))] rounded-[var(--radius)] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] text-sm focus:ring-1 focus:ring-[rgb(var(--primary))] focus:outline-none"
              aria-label="Filter by skill category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories / Overview" : cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[400px] md:h-[450px] p-4">
        {chartData && chartData.labels && chartData.labels.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-[rgb(var(--muted-foreground))]">
              No skill data available to display for the selected filter.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillDistributionChart;
