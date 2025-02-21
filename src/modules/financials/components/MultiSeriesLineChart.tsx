import React from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { curveMonotoneX } from 'd3-shape';

interface DataPoint {
  label: string;
  value: number;
}

interface Series {
  name: string;
  data: DataPoint[];
}

interface MultiSeriesLineChartProps {
  series: Series[];
  width: number;
  height: number;
}

const colors = ["#3f51b5", "#f50057", "#4caf50", "#ff9800"];

const MultiSeriesLineChart: React.FC<MultiSeriesLineChartProps> = ({ series, width, height }) => {
  const margin = { top: 40, right: 30, bottom: 50, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Assume all series share the same labels (use first series as reference)
  const labels = series.length > 0 ? series[0].data.map(d => d.label) : [];

  const xScale = scaleBand<string>({
    domain: labels,
    padding: 0.2,
    range: [0, xMax],
  });

  const maxY = Math.max(...series.flatMap(s => s.data.map(d => d.value)));
  const yScale = scaleLinear<number>({
    domain: [0, maxY],
    range: [yMax, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        {series.map((s, i) => (
          <LinePath
            key={s.name}
            data={s.data}
            x={d => (xScale(d.label) || 0) + (xScale.bandwidth() / 2)}
            y={d => yScale(d.value)}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            curve={curveMonotoneX}
          />
        ))}
        <AxisLeft scale={yScale} />
        <AxisBottom top={yMax} scale={xScale} />
      </Group>
    </svg>
  );
};

export default MultiSeriesLineChart;
