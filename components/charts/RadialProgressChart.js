'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  defaults
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

ChartJS.register(ArcElement, Tooltip);

export default function RadialProgressChart({ 
  percentage = 75, 
  color = '#3B82F6',
  size = 80,
  title = '',
  subtitle = ''
}) {
  const remaining = 100 - percentage;

  const data = {
    datasets: [
      {
        data: [percentage, remaining],
        backgroundColor: [
          color,
          '#F3F4F6',
        ],
        borderWidth: 0,
        cutout: '70%',
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
            return `Progress: ${context.parsed}%`;
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{percentage}%</div>
          </div>
        </div>
      </div>
      {(title || subtitle) && (
        <div>
          {title && <div className="font-semibold text-gray-900">{title}</div>}
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
      )}
    </div>
  );
}
