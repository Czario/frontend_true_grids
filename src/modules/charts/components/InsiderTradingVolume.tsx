import React, { useMemo } from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Text } from "@visx/text";
import data from "./../../../../public/temp_data/InsiderTradingVolume.json";

export type HorizontalBarChartProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 100 };

// Map categories to y-axis labels
const yAxisLabels: Record<string, string> = {
  q1: "0-3 months",
  q2: "3-6 months",
  q3: "6-9 months",
  q4: "9-12 months",
};

const leftData = data.leftData;
const rightData = data.rightData;

export default function HorizontalBarChart({
  width,
  height,
  margin = defaultMargin,
}: HorizontalBarChartProps) {
  if (width < 10) return null;

  const xMax = (width - margin.left - margin.right) / 2;
  const yMax = height - margin.top - margin.bottom;
  const centerX = xMax; // Centerline of the chart
  const gap = 10;

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        domain: rightData.map((d) => d.category),
        padding: 0.5,
      }).rangeRound([0, yMax]),
    [yMax]
  );

  const maxValue = useMemo(
    () =>
      Math.max(...[...rightData, ...leftData].map((d) => d.value1 + d.value2)),
    []
  );

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue],
      }).rangeRound([0, xMax]),
    [maxValue, xMax]
  );
  yScale.rangeRound([0, yMax]);
  xScale.rangeRound([0, xMax]);

  // Colors for dynamic keys
  const leftColors: Record<string, string> = {
    value1: "#FF6B6B",
    value2: "#C44D58",
  };

  const rightColors: Record<string, string> = {
    value1: "#4C9F70",
    value2: "#2C6E49",
  };

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        <AxisLeft
          scale={yScale}
          stroke="black"
          tickStroke="transparent"
          hideAxisLine
          tickFormat={(value) => yAxisLabels[value] || value}
          tickLabelProps={{
            fill: "black",
            fontSize: 12,
            textAnchor: "end",
            dy: "0.33em",
            dx: -15,
          }}
        />

        {/* Left-Side */}
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
          {leftData.map((d) => {
            const barHeight = yScale.bandwidth();
            const yPos = yScale(d.category);
            let xOffset = centerX - gap;

            // Reverse the key order so the first key ends up nearest the center
            const stackKeys = Object.entries(d)
              .filter(([key]) => key !== "category")
              .reverse();

            return (
              <Group key={`left-${d.category}`}>
                {stackKeys.map(([key, value]) => {
                  const barWidth = xScale(value as number);
                  xOffset -= barWidth;
                  return (
                    <Bar
                      key={`${d.category}-${key}`}
                      x={xOffset}
                      y={yPos}
                      width={barWidth}
                      height={barHeight}
                      fill={leftColors[key] || "#FF6B6B"}
                    />
                  );
                })}
              </Group>
            );
          })}
        </Group>

        {/* Right-Side */}
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
          {rightData.map((d) => {
            const barHeight = yScale.bandwidth();
            const yPos = yScale(d.category);
            let xOffset = centerX + gap; // Start stacking from the center

            return (
              <Group key={`right-${d.category}`}>
                {Object.entries(d)
                  .filter(([key]) => key !== "category")
                  .map(([key, value]) => {
                    const barWidth = xScale(value as number);
                    const bar = (
                      <Bar
                        key={`${d.category}-${key}`}
                        x={xOffset}
                        y={yPos}
                        width={barWidth}
                        height={barHeight}
                        fill={rightColors[key] || "#4C9F70"}
                      />
                    );
                    xOffset += barWidth;
                    return bar;
                  })}
              </Group>
            );
          })}
        </Group>
      </Group>
    </svg>
  );
}
