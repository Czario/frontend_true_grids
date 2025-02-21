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
}

const colors = ["#3f51b5", "#f50057", "#4caf50", "#ff9800"];

const MultiSeriesBarChart: React.FC<MultiSeriesBarChartProps> = ({ series, width, height }) => {
  const margin = { top: 40, right: 30, bottom: 50, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const labels = series.length > 0 ? series[0].data.map(d => d.label) : [];

  const x0 = scaleBand<string>({
    domain: labels,
    range: [0, xMax],
    padding: 0.2,
  });

  const x1 = scaleBand<string>({
    domain: series.map(s => s.name),
    range: [0, x0.bandwidth()],
    padding: 0.1,
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
        {labels.map(label => (
          <Group key={label} left={x0(label) || 0}>
            {series.map(s => {
              const d = s.data.find(d => d.label === label);
              return (
                <Bar
                  key={s.name}
                  x={x1(s.name)}
                  y={d ? yScale(d.value) : yScale(0)}
                  width={x1.bandwidth()}
                  height={d ? yMax - yScale(d.value) : 0}
                  fill={colors[series.findIndex(ss => ss.name === s.name) % colors.length]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              );
            })}
          </Group>
        ))}
        <AxisLeft
          scale={yScale}
          stroke="#333"
          tickStroke="#333"
          tickLabelProps={() => ({
            fill: '#333',
            fontSize: 11,
            textAnchor: 'end',
            dy: '0.33em',
          })}
        />
        <AxisBottom
          top={yMax}
          scale={x0}
          stroke="#333"
          tickStroke="#333"
          tickLabelProps={() => ({
            fill: '#333',
            fontSize: 11,
            textAnchor: 'middle',
          })}
        />
      </Group>
    </svg>
  );
};

export default MultiSeriesBarChart;