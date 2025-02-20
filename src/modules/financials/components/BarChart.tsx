import React from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';

interface BarChartProps {
  data: Record<string, number>;
  width: number;
  height: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, width, height }) => {
  const margin = { top: 40, right: 30, bottom: 50, left: 50 };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Prepare data for rendering
  const chartData = Object.entries(data).map(([key, value]) => ({
    label: key,
    value: Number(value),
  }));

  // Scales
  const xScale = scaleBand<string>({
    domain: chartData.map(d => d.label),
    padding: 0.2,
    range: [0, xMax],
  });

  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...chartData.map(d => d.value))],
    range: [yMax, 0],
    nice: true, // Adds rounded ticks
  });

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        {/* Render bars */}
        {chartData.map((d, i) => {
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(d.value) ?? 0);
          const barX = xScale(d.label);
          const barY = yScale(d.value);

          return (
            <Bar
              key={`bar-${i}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="rgba(75, 192, 192, 0.6)"
              aria-label={`Label: ${d.label}, Value: ${d.value}`}
            />
          );
        })}

        {/* Axes */}
        <AxisLeft scale={yScale} />
        <AxisBottom top={yMax} scale={xScale} />
      </Group>
    </svg>
  );
};

export default BarChart;