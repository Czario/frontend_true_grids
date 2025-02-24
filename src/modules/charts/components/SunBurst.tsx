"use client";
import React, { useMemo, useState } from "react";
import { Arc } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleBand, scaleRadial } from "@visx/scale";
import { Text } from "@visx/text";
import data from "./../../../../public/temp_data/SunBurstMock.json";

const margin = { top: 20, bottom: 20, left: 20, right: 20 };

export type RadialBarsProps = {
  width: number;
  height: number;
  startAngle?: number;
  endAngle?: number;
};

export default function SunBurst({
  width,
  height,
  // startAngle = Math.PI / 2,
  // endAngle = (Math.PI * 4.95) / 2,
  startAngle = Math.PI / 2.05,
  endAngle = -Math.PI,
}: RadialBarsProps) {
  const [rotation, setRotation] = useState(0);
  // X Scale with angle control
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [startAngle + rotation, endAngle + rotation],
        domain: data.map((d) => `${d.year}-${d.month}`),
        padding: 0.3,
      }),
    [rotation, startAngle, endAngle]
  );

  if (width < 10) return null;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const radiusMax = Math.min(xMax, yMax) / 2;
  const innerRadius = radiusMax / 1.75;

  const uniqueYears = [...new Set(data.map((d) => d.year))];

  const yScale = scaleRadial<number>({
    range: [innerRadius, radiusMax],
    domain: [0, Math.max(...data.map((d) => d.value))],
    nice: true,
  });

  const tickValues = yScale.ticks(4);

  return (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill="white" rx={14} />
      <Group top={yMax / 2 + margin.top} left={xMax / 2 + margin.left}>
        {/* Circular Grid Lines */}
        {tickValues.map((tick) => {
          const r = yScale(tick);
          return (
            <Arc
              key={`grid-${tick}`}
              innerRadius={r}
              outerRadius={r}
              startAngle={startAngle + rotation}
              endAngle={endAngle + rotation}
              stroke="#6f7288"
              strokeWidth={0.15}
              fill="none"
              opacity={0.5}
            />
          );
        })}

        {/* Y-Axis Tick Labels at 90 Degrees */}
        {tickValues.map((tick) => {
          const r = yScale(tick);
          const tickX = r;
          const tickY = -5;

          return (
            <Text
              key={`tick-${tick}`}
              x={tickX}
              y={tickY}
              dominantBaseline="middle"
              textAnchor="start"
              fontSize={10}
              fill="black"
            >
              {tick}
            </Text>
          );
        })}

        {/* Bars & Year Labels */}
        {uniqueYears.map((year) => {
          const yearData = data.filter((d) => d.year === year);
          const yearAngles = yearData.map((d) =>
            xScale(`${d.year}-${d.month}`)
          );
          const yearCenterAngle =
            (Math.min(...yearAngles) + Math.max(...yearAngles)) / 2;

          const textRadius = innerRadius - 10;
          const textX = textRadius * Math.cos(yearCenterAngle - Math.PI / 2);
          const textY = textRadius * Math.sin(yearCenterAngle - Math.PI / 2);

          return (
            <g key={`year-${year}`}>
              {yearData.map((d) => {
                const start = xScale(`${d.year}-${d.month}`);
                if (start === undefined) return null;

                const end = start + xScale.bandwidth();
                const outerRadius = yScale(d.value) ?? 0;

                return (
                  <Arc
                    key={`bar-${d.year}-${d.month}`}
                    startAngle={start}
                    endAngle={end}
                    outerRadius={outerRadius}
                    innerRadius={innerRadius}
                    fill={d.color}
                  />
                );
              })}

              {/* Year Label */}
              <Text
                x={textX}
                y={textY}
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize={12}
                fontWeight="bold"
                fill="black"
                transform={`rotate(${
                  (yearCenterAngle * 180) / Math.PI
                }, ${textX}, ${textY})`}
              >
                {year}
              </Text>
            </g>
          );
        })}

        <Text
          x={innerRadius}
          y={innerRadius}
          textAnchor="start"
          dominantBaseline="left"
          fontSize={14}
          fontWeight="bold"
          fill="black"
        >
          {"Your Text Here"}
        </Text>
      </Group>
    </svg>
  );
}
