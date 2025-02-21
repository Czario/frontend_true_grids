import React from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { curveMonotoneX } from 'd3-shape';

interface LineChartProps {
  data: Record<string, number>;
  width: number;
  height: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, width, height }) => {
  const margin = { top: 40, right: 30, bottom: 50, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const chartData = Object.entries(data).map(([key, value]) => ({
    label: key,
    value: Number(value),
  }));

  const xScale = scaleBand<string>({
    domain: chartData.map(d => d.label),
    range: [0, xMax],
    padding: 0.1,
  });
  
  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...chartData.map(d => d.value))],
    range: [yMax, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        <LinePath
          data={chartData}
          x={d => (xScale(d.label) || 0) + (xScale.bandwidth() / 2)}
          y={d => yScale(d.value)}
          stroke="#3f51b5"
          strokeWidth={2}
          curve={curveMonotoneX}
        />
        <AxisLeft scale={yScale} />
        <AxisBottom top={yMax} scale={xScale} />
      </Group>
    </svg>
  );
};

export default LineChart;