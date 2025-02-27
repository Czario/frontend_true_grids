import React from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';

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
  backgroundColor?: string;
  barColor?: string;
  labelColor?: string;
}

const colors = ["#3f51b5", "#f50057", "#4caf50", "#ff9800"];

const MultiSeriesLineChart: React.FC<MultiSeriesLineChartProps> = ({
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
  const xScale = scaleTime<number>({
    domain: [new Date(labels[0]), new Date(labels[labels.length - 1])],
    range: [0, xMax],
  });

  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...allData.map(d => d.value))],
    range: [yMax, 0],
    nice: true,
  });

  return (
    <svg width="100%" height="100%" style={{ backgroundColor }}>
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
        {series.map((s, seriesIndex) => (
          <LinePath
            key={`line-${seriesIndex}`}
            data={s.data}
            x={d => xScale(new Date(d.label)) ?? 0}
            y={d => yScale(d.value) ?? 0}
            stroke="url(#lineGradient)"
            strokeWidth={2}
            curve={curveMonotoneX}
          />
        ))}
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

export default MultiSeriesLineChart;
