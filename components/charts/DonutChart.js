'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  defaults
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart({ 
  completedProjects = 89, 
  totalProjects = 120, 
  size = 120 
}) {
  const completionPercentage = Math.round((completedProjects / totalProjects) * 100);
  const remaining = 100 - completionPercentage;

  const data = {
    datasets: [
      {
        data: [completionPercentage, remaining],
        backgroundColor: [
          '#3B82F6', // Blue for completed
          '#F3F4F6', // Light gray for remaining
        ],
        borderWidth: 0,
        cutout: '75%',
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
        callbacks: {
          label: function(context) {
            const label = context.dataIndex === 0 ? 'Completed' : 'Remaining';
            return `${label}: ${context.parsed}%`;
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      duration: 1200,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{completionPercentage}%</div>
          <div className="text-xs text-gray-500 mt-1">Complete</div>
        </div>
      </div>
    </div>
  );
}
