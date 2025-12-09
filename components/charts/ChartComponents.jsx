// components/charts/ChartComponents.jsx
"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Extended RSCM Color Palette
export const RSCM_COLORS = {
  violet: '#4a2545',
  plum: '#824c71', 
  lilac: '#c398b5',
  englishViolet: '#694261',
  chineseViolet: '#875f7d',
  pinkLavender: '#ceacbd',
  teaRose: '#d9bfc4',
  darkPurple: '#251323',
  dutchWhite: '#eee6d3',
  black: '#000001'
};

export const RSCM_PALETTE = Object.values(RSCM_COLORS);

// RSCM Chart styling configuration
const rscmChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#251323", // rscm-dark-purple
        font: {
          family: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
          size: 12,
          weight: 500
        },
        boxWidth: 12,
        boxHeight: 12,
        padding: 15,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#251323",
      bodyColor: "#6b7280",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      displayColors: true,
      boxPadding: 6
    }
  },
  scales: {
    x: {
      ticks: {
        color: "#6b7280",
        font: {
          size: 11
        }
      },
      grid: {
        color: "rgba(229, 231, 235, 0.5)",
        drawBorder: false
      }
    },
    y: {
      ticks: {
        color: "#6b7280",
        font: {
          size: 11
        }
      },
      grid: {
        color: "rgba(229, 231, 235, 0.5)",
        drawBorder: false
      },
      beginAtZero: true
    }
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6
    },
    line: {
      tension: 0.4
    },
    bar: {
      borderRadius: 4,
      borderSkipped: false
    }
  }
};

// Line Chart Component
export const AnalyticsLineChart = ({ data, title, height = 300, showLegend = true }) => {
  const options = {
    ...rscmChartOptions,
    plugins: {
      ...rscmChartOptions.plugins,
      title: {
        display: !!title,
        text: title,
        color: "#251323",
        font: {
          size: 16,
          weight: 600,
          family: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
        },
        padding: { bottom: 20 }
      },
      legend: {
        ...rscmChartOptions.plugins.legend,
        display: showLegend
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={data} options={options} />
    </div>
  );
};

// Bar Chart Component
export const AnalyticsBarChart = ({ data, title, height = 300, horizontal = false, showLegend = true }) => {
  const options = {
    ...rscmChartOptions,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      ...rscmChartOptions.plugins,
      title: {
        display: !!title,
        text: title,
        color: "#251323",
        font: {
          size: 16,
          weight: 600,
          family: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
        },
        padding: { bottom: 20 }
      },
      legend: {
        ...rscmChartOptions.plugins.legend,
        display: showLegend
      }
    },
    scales: horizontal ? {
      x: rscmChartOptions.scales.y,
      y: rscmChartOptions.scales.x
    } : rscmChartOptions.scales
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={data} options={options} />
    </div>
  );
};

// Pie Chart Component
export const AnalyticsPieChart = ({ data, title, height = 300, showLegend = true, doughnut = false }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: !!title,
        text: title,
        color: "#251323",
        font: {
          size: 16,
          weight: 600,
          family: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
        },
        padding: { bottom: 20 }
      },
      legend: {
        position: "right",
        labels: {
          color: "#251323",
          font: {
            family: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
            size: 12,
            weight: 500
          },
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = Math.round((value / total) * 100);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.backgroundColor[i],
                  lineWidth: 0,
                  hidden: isNaN(value) || value === 0,
                  index: i
                };
              });
            }
            return [];
          }
        },
        display: showLegend
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#251323",
        bodyColor: "#6b7280",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  const ChartComponent = doughnut ? Doughnut : Pie;
  
  return (
    <div style={{ height: `${height}px` }}>
      <ChartComponent data={data} options={options} />
    </div>
  );
};

// Multi-line Chart for System Activity
export const ActivityTimelineChart = ({ data, title, height = 300 }) => {
  const options = {
    ...rscmChartOptions,
    plugins: {
      ...rscmChartOptions.plugins,
      title: {
        display: !!title,
        text: title,
        color: "#251323",
        font: {
          size: 16,
          weight: 600,
          family: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
        },
        padding: { bottom: 20 }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={data} options={options} />
    </div>
  );
};

// Chart Container Component
export const ChartContainer = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};

// Chart Header Component
export const ChartHeader = ({ title, subtitle, actions = null }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-rscm-dark-purple">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

// Empty State Component
export const ChartEmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      {Icon && <Icon size={48} className="mb-4 text-gray-300" />}
      <p className="text-lg font-medium text-gray-400 mb-2">{title}</p>
      {description && (
        <p className="text-sm text-gray-400 text-center max-w-md">
          {description}
        </p>
      )}
    </div>
  );
};

// Loading State Component
export const ChartLoadingState = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-rscm-violet border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">Loading chart data...</p>
      </div>
    </div>
  );
};