import React from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Text } from "@visx/text";

export type HorizontalBarChartProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
};

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 100 };

// Updated dataset with stacked values
const data = [
  { category: "q1", value1: 20, value2: 10 },
  { category: "q2", value1: 30, value2: 20 },
  { category: "q3", value1: 50, value2: 30 },
  { category: "q4", value1: 25, value2: 15 },
];

const data1 = [
  { category: "q1", value1: 15, value2: 15 },
  { category: "q2", value1: 25, value2: 25 },
  { category: "q3", value1: 40, value2: 40 },
  { category: "q4", value1: 20, value2: 20 },
];

// Map categories to y-axis labels
const yAxisLabels: Record<string, string> = {
  q1: "0-3 months",
  q2: "3-6 months",
  q3: "6-9 months",
  q4: "9-12 months",
};

// Scales
const yScale = scaleBand({
  domain: data.map((d) => d.category),
  padding: 0.5,
});

const xScale = scaleLinear<number>({
  domain: [
    0,
    Math.max(...[...data, ...data1].flatMap((d) => [d.value1 + d.value2])),
  ],
});

export default function HorizontalBarChart({
  width,
  height,
  margin = defaultMargin,
  events = false,
}: HorizontalBarChartProps) {
  // Bounds
  const xMax = (width - margin.left - margin.right) / 2; // Half width
  const yMax = height - margin.top - margin.bottom;
  const centerX = xMax; // Centerline of the chart
  const gap = 10;

  // Update scale output dimensions
  yScale.rangeRound([0, yMax]);
  xScale.rangeRound([0, xMax]);

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        {/* Y-Axis with custom labels */}
        <AxisLeft
          scale={yScale}
          stroke="black"
          tickStroke="transparent"
          hideAxisLine
          tickFormat={(value) => yAxisLabels[value] || value} // Use custom labels
          tickLabelProps={{
            fill: "black",
            fontSize: 12,
            textAnchor: "end",
            dy: "0.33em",
            dx: -15,
          }}
        />
        {/* Labels */}
        <Group>
          <rect
            x={-2 * gap}
            y={-20}
            width={centerX + 2 * gap}
            height={height}
            fill="lightgray"
          />
          <Text
            x={centerX - gap}
            y={0}
            dominantBaseline="middle"
            textAnchor="end"
            fontSize={16}
            fontWeight={600}
            fill="orange"
          >
            Shares Sold
          </Text>
          {/* Left-Side Stacked Bars (Shares Bought) */}
          {data1.map((d) => {
            const barHeight = yScale.bandwidth();
            const value1Width = xScale(d.value1);
            const value2Width = xScale(d.value2);
            const yPos = yScale(d.category);

            return (
              <Group key={`left-${d.category}`}>
                {/* Bottom Stack (First value) */}
                <Bar
                  x={centerX - gap - value1Width} // Move to the left side
                  y={yPos}
                  width={value1Width}
                  height={barHeight}
                  fill="#FF6B6B"
                  onClick={() => {
                    if (events)
                      alert(`Left Bottom: ${d.category}: ${d.value1}`);
                  }}
                />
                {/* Top Stack (Second value) */}
                <Bar
                  x={centerX - gap - value1Width - value2Width} // Stack it further left
                  y={yPos}
                  width={value2Width}
                  height={barHeight}
                  fill="#C44D58"
                  onClick={() => {
                    if (events) alert(`Left Top: ${d.category}: ${d.value2}`);
                  }}
                />
              </Group>
            );
          })}
        </Group>
        <Group>
          <rect
            x={centerX}
            y={-20}
            width={centerX + 2 * gap}
            height={height}
            fill="pink"
          />
          <Text
            x={centerX + gap}
            y={0}
            dominantBaseline="middle"
            textAnchor="start"
            fontSize={16}
            fontWeight={600}
            fill="green"
          >
            Shares Bought
          </Text>

          {/* Right-Side Stacked Bars (Shares Sold) */}
          {data.map((d) => {
            const barHeight = yScale.bandwidth();
            const value1Width = xScale(d.value1);
            const value2Width = xScale(d.value2);
            const yPos = yScale(d.category);

            return (
              <Group key={`right-${d.category}`}>
                {/* Bottom Stack (First value) */}
                <Bar
                  x={centerX + gap}
                  y={yPos}
                  width={value1Width}
                  height={barHeight}
                  fill="#4C9F70"
                  onClick={() => {
                    if (events)
                      alert(`Right Bottom: ${d.category}: ${d.value1}`);
                  }}
                />
                {/* Top Stack (Second value) */}
                <Bar
                  x={centerX + gap + value1Width} // Stack it on the right
                  y={yPos}
                  width={value2Width}
                  height={barHeight}
                  fill="#2C6E49"
                  onClick={() => {
                    if (events) alert(`Right Top: ${d.category}: ${d.value2}`);
                  }}
                />
              </Group>
            );
          })}
        </Group>
      </Group>
    </svg>
  );
}
