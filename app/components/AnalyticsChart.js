'use client';

import { useEffect, useRef } from 'react';

const AnalyticsChart = ({ data, type = 'bar', title, className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (type === 'bar') {
      drawBarChart(ctx, data, width, height);
    } else if (type === 'doughnut') {
      drawDoughnutChart(ctx, data, width, height);
    } else if (type === 'line') {
      drawLineChart(ctx, data, width, height);
    }
  }, [data, type]);

  const drawBarChart = (ctx, data, width, height) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    const maxValue = Math.max(...data.map(d => d.value));
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    // Draw bars
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = height - padding - barHeight;

      // Bar
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, barWidth, barHeight);

      // Value label
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);

      // Label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(item.label, x + barWidth / 2, height - padding + 15);
    });
  };

  const drawDoughnutChart = (ctx, data, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    let currentAngle = 0;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
      
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, labelX, labelY);

      currentAngle += sliceAngle;
    });
  };

  const drawLineChart = (ctx, data, width, height) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - ((item.value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - ((item.value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#3B82F6';
      ctx.fill();
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-64"
          style={{ maxHeight: '300px' }}
        />
      </div>
    </div>
  );
};

export default AnalyticsChart;
