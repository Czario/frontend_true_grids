import React from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';

interface LineChartProps {
  data: Record<string, number>;
  width: number;
  height: number;
  backgroundColor?: string;
  barColor?: string;
  labelColor?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  backgroundColor = 'white',
  barColor = '#4caf50',
  labelColor = '#000000',
}) => {
  const margin = { top: 40, right: 30, bottom: 50, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const chartData = Object.entries(data).map(([key, value]) => ({
    label: key,
    value: Number(value),
  }));

  const xScale = scaleTime<number>({
    domain: [new Date(chartData[0].label), new Date(chartData[chartData.length - 1].label)],
    range: [0, xMax],
  });

  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...chartData.map(d => d.value))],
    range: [yMax, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height} style={{ backgroundColor }}>
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
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
        <LinePath
          data={chartData}
          x={d => xScale(new Date(d.label)) ?? 0}
          y={d => yScale(d.value) ?? 0}
          stroke="url(#lineGradient)"
          strokeWidth={2}
          curve={curveMonotoneX}
        />
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

export default LineChart;