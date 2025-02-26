// components/VisxCharts.tsx
import React from 'react';
import { scaleLinear, scaleOrdinal } from '@visx/scale';
import { LinePath, Bar as VisxBar, Pie } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { LegendOrdinal } from '@visx/legend';
import { XYChart, GlyphSeries } from '@visx/xychart';

export interface DataPoint {
  x: number;
  y: number;
}

interface VisxLineChartProps {
  data: DataPoint[];
  width: number;
  height: number;
}

export const VisxLineChart: React.FC<VisxLineChartProps> = ({ data, width, height }) => {
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleLinear({
    domain: [Math.min(...data.map(d => d.x)), Math.max(...data.map(d => d.x))],
    range: [0, xMax],
  });
  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d.y))],
    range: [yMax, 0],
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <LinePath
          data={data}
          x={d => xScale(d.x) ?? 0}
          y={d => yScale(d.y) ?? 0}
          stroke="blue"
          strokeWidth={2}
          curve={curveMonotoneX}
        />
        <AxisLeft scale={yScale} />
        <AxisBottom scale={xScale} top={yMax} />
      </Group>
    </svg>
  );
};

interface VisxBarChartProps {
  data: DataPoint[];
  width: number;
  height: number;
}

export const VisxBarChart: React.FC<VisxBarChartProps> = ({ data, width, height }) => {
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const barWidth = xMax / data.length;

  const xScale = scaleLinear({
    domain: [0, data.length],
    range: [0, xMax],
  });
  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d.y))],
    range: [yMax, 0],
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {data.map((d, i) => {
          const barHeight = yMax - (yScale(d.y) ?? 0);
          return (
            <VisxBar
              key={`bar-${i}`}
              x={xScale(i)}
              y={yMax - barHeight}
              width={barWidth - 1}
              height={barHeight}
              fill="orange"
            />
          );
        })}
        <AxisLeft scale={yScale} />
        <AxisBottom scale={xScale} top={yMax} />
      </Group>
    </svg>
  );
};

interface VisxPieChartProps {
  data: DataPoint[];
  width: number;
  height: number;
}

export const VisxPieChart: React.FC<VisxPieChartProps> = ({ data, width, height }) => {
  const radius = Math.min(width, height) / 2;
  const colorScale = scaleOrdinal({
    domain: data.map((d) => d.x.toString()),
    range: ['#f6c431', '#f6a431', '#f63131', '#31f6a4', '#31a4f6'],
  });

  return (
    <svg width={width} height={height}>
      <Group top={height / 2} left={width / 2}>
        <Pie
          data={data}
          pieValue={(d) => d.y}
          outerRadius={radius}
          innerRadius={radius - 50}
          padAngle={0.01}
        >
          {(pie) =>
            pie.arcs.map((arc, index) => (
              <g key={`arc-${index}`}>
                <path d={pie.path(arc) ?? ''} fill={colorScale(arc.data.x.toString())} />
              </g>
            ))
          }
        </Pie>
      </Group>
      <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 15px 0 0" />
    </svg>
  );
};

interface VisxScatterPlotProps {
  data: DataPoint[];
  width: number;
  height: number;
}

export const VisxScatterPlot: React.FC<VisxScatterPlotProps> = ({ data, width, height }) => {
  return (
    <XYChart
      width={width}
      height={height}
      xScale={{ type: 'linear' }}
      yScale={{ type: 'linear' }}
    >
      <GlyphSeries
        dataKey="scatter"
        data={data}
        xAccessor={(d) => d.x}
        yAccessor={(d) => d.y}
      />
    </XYChart>
  );
};
