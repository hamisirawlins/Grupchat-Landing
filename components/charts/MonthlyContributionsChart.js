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

export default function MonthlyContributionsChart({ data, height = 200 }) {
  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: "Monthly Contributions (KSh)",
        data: data.totalPooled || [],
        backgroundColor: "rgba(122, 115, 255, 0.8)",
        borderColor: "#7a73ff",
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
            return `Contributions: KSh ${context.parsed.y.toLocaleString()}`;
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
          callback: function (value) {
            return "KSh " + (value / 1000).toFixed(0) + "K";
          },
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
