'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  defaults
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Configure Chart.js defaults for beautiful styling
defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
defaults.color = '#6B7280';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart({ data, categories }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Project Done',
        data: data.data.map(val => val * 0.6), // Simulate different category values
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 20,
      },
      {
        label: 'Project Task',
        data: data.data.map(val => val * 0.3),
        backgroundColor: '#60A5FA',
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 20,
      },
      {
        label: 'Project Goal',
        data: data.data.map(val => val * 0.1),
        backgroundColor: '#BFDBFE',
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll use our custom legend
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 12,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
            weight: '500',
          },
          padding: 8,
        },
      },
      y: {
        stacked: true,
        display: false,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className="h-40">
      <Bar data={chartData} options={options} />
    </div>
  );
}
