"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  defaults,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

defaults.font.family =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PoolProgressChart({
  completedPools = 0,
  totalPools = 0,
  size = 120,
}) {
  const percentage =
    totalPools > 0 ? Math.round((completedPools / totalPools) * 100) : 0;

  const chartData = {
    labels: ["Completed", "In Progress"],
    datasets: [
      {
        data: [completedPools, totalPools - completedPools],
        backgroundColor: [
          "#7a73ff", // Purple for completed
          "#e5e3ff", // Light purple for in progress
        ],
        borderColor: ["#7a73ff", "#e5e3ff"],
        borderWidth: 0,
        cutout: "70%",
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
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} pools (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div
      className="relative"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>
    </div>
  );
}
