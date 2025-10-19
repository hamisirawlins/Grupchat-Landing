"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  defaults,
} from "chart.js";
import { Chart } from "react-chartjs-2";

defaults.font.family =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CombinedChart({ data, height = 200 }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        type: "bar",
        label: "Total Pooled (KSh)",
        data: data.totalPooled,
        backgroundColor: "rgba(122, 115, 255, 0.5)",
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 10,
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Transactions",
        data: data.transactionCount,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#10b981",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#10b981",
        pointHoverBorderColor: "#FFFFFF",
        pointHoverBorderWidth: 3,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: "500",
          },
          color: "#6B7280",
        },
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
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (context.dataset.type === "bar") {
                label += "KSh " + context.parsed.y.toLocaleString();
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: "500",
          },
          color: "#9CA3AF",
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        grid: {
          color: "#F3F4F6",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#9CA3AF",
          padding: 8,
          callback: function (value) {
            return "KSh " + (value / 1000).toFixed(0) + "K";
          },
        },
        title: {
          display: true,
          text: "Total Pooled (KSh)",
          color: "#6B7280",
          font: {
            size: 11,
            weight: "600",
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#9CA3AF",
          padding: 8,
        },
        title: {
          display: true,
          text: "Transactions",
          color: "#6B7280",
          font: {
            size: 11,
            weight: "600",
          },
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px`, width: "100%" }}>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
