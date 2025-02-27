import React from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';

interface BarChartProps {
  data: Record<string, number>;
  width: number;
  height: number;
  backgroundColor?: string;
  barColor?: string;
  labelColor?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, width, height, backgroundColor = 'white', barColor = '#4caf50', labelColor = '#000000' }) => {
  const margin = { top: 40, right: 30, bottom: 50, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const chartData = Object.entries(data).map(([key, value]) => ({
    label: key,
    value: Number(value),
  }));

  const xScale = scaleBand<string>({
    domain: chartData.map(d => d.label),
    padding: 0.1, // Decreased padding to increase bar size
    range: [0, xMax],
  });

  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...chartData.map(d => d.value))],
    range: [yMax, 0],
    nice: true,
  });

  return (
    <svg width="100%" height="100%" style={{ backgroundColor }}>
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={barColor} stopOpacity={0.8} />
          <stop offset="100%" stopColor={barColor} stopOpacity={0.8} />
        </linearGradient>
      </defs>
      <Group top={margin.top} left={margin.left}>
        {/* Grid lines */}
        {yScale.ticks(5).map((tickValue, i) => {
          const y = yScale(tickValue);
          return (
            <line
              key={`grid-${i}`}
              x1={0}
              x2={xMax}
              y1={y}
              y2={y}
              stroke="#e0e0e0"
              strokeWidth={1}
            />
          );
        })}
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
              fill="url(#barGradient)"
              stroke="#388e3c"
              strokeWidth={1}
              aria-label={`Label: ${d.label}, Value: ${d.value}`}
            />
          );
        })}
        <AxisLeft
          scale={yScale}
          stroke="#333"
          tickStroke="#333"
          tickLabelProps={() => ({
            fill: labelColor,
            fontSize: 11,
            textAnchor: 'end',
            dy: '0.33em',
          })}
        />
        <AxisBottom
          top={yMax}
          scale={xScale}
          stroke="#333"
          tickStroke="#333"
          tickLabelProps={() => ({
            fill: labelColor,
            fontSize: 11,
            textAnchor: 'middle',
          })}
        />
      </Group>
    </svg>
  );
};

export default BarChart;