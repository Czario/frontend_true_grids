import React from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';

interface DataPoint {
  label: string;
  value: number;
}

interface Series {
  name: string;
  data: DataPoint[];
}

interface MultiSeriesBarChartProps {
  series: Series[];
  width: number;
  height: number;
  backgroundColor?: string;
  barColor?: string;
  labelColor?: string;
}

const colors = ["#3f51b5", "#f50057", "#4caf50", "#ff9800"];

const MultiSeriesBarChart: React.FC<MultiSeriesBarChartProps> = ({
  series,
  width,
  height,
  backgroundColor = 'white',
  barColor = '#4caf50',
  labelColor = '#000000',
}) => {
  const margin = { top: 40, right: 30, bottom: 50, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const allData = series.flatMap(s => s.data);
  const labels = Array.from(new Set(allData.map(d => d.label)));
  const xScale = scaleBand<string>({
    domain: labels,
    padding: 0.2,
    range: [0, xMax],
  });

  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...allData.map(d => d.value))],
    range: [yMax, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height} style={{ backgroundColor }}>
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
        {series.map((s, seriesIndex) =>
          s.data.map((d, i) => {
            const barWidth = xScale.bandwidth() / series.length;
            const barHeight = yMax - (yScale(d.value) ?? 0);
            const barX = (xScale(d.label) ?? 0) + seriesIndex * barWidth;
            const barY = yScale(d.value);
            return (
              <Bar
                key={`bar-${seriesIndex}-${i}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="url(#barGradient)"
                stroke="#388e3c"
                strokeWidth={1}
                aria-label={`Series: ${s.name}, Label: ${d.label}, Value: ${d.value}`}
              />
            );
          })
        )}
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

export default MultiSeriesBarChart;