"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  defaults,
} from "chart.js";
import { Bar } from "react-chartjs-2";

defaults.font.family =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
defaults.color = "#6B7280";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PoolTypesChart({ pools = [], height = 200 }) {
  // Count pool types
  const typeCounts = pools.reduce((acc, pool) => {
    const type = pool.type || "general";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const colors = {
    trip: "#7a73ff",
    business: "#10b981",
    education: "#f59e0b",
    event: "#ef4444",
    general: "#6b7280",
    other: "#8b5cf6",
  };

  const chartData = {
    labels: Object.keys(typeCounts).map(
      (type) => type.charAt(0).toUpperCase() + type.slice(1)
    ),
    datasets: [
      {
        label: "Number of Pools",
        data: Object.values(typeCounts),
        backgroundColor: Object.keys(typeCounts).map(
          (type) => colors[type] || colors.general
        ),
        borderColor: Object.keys(typeCounts).map(
          (type) => colors[type] || colors.general
        ),
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 12,
        titleFont: {
          size: 14,
          weight: "600",
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed.y} pools`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 12,
            weight: "500",
          },
          padding: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#F3F4F6",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
          padding: 8,
          stepSize: 1,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="h-40">
      <Bar data={chartData} options={options} />
    </div>
  );
}
