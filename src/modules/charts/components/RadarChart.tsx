"use client";
import React, { useState } from "react";
import { Group } from "@visx/group";
import letterFrequency, {
  LetterFrequency,
} from "@visx/mock-data/lib/mocks/letterFrequency";
import { scaleLinear } from "@visx/scale";
import { Line } from "@visx/shape";

const orange = "#ff9933";
export const pumpkin = "#f5810c";
const highlightColor = "#ff6600"; // Color for hovered sector
const silver = "#d9d9d9";
export const background = "#FAF7E9";

const data = letterFrequency.slice(5, 10);
const y = (d: LetterFrequency) => d.frequency;

const defaultMargin = { top: 40, left: 80, right: 80, bottom: 80 };

export type RadarProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  levels?: number;
};

export default function Example({
  width,
  height,
  levels = 5,
  margin = defaultMargin,
}: RadarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const radius = Math.min(xMax, yMax) / 2;

  const yScale = scaleLinear<number>({
    range: [0, radius],
    domain: [0, Math.max(...data.map(y))],
  });

  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => ({
    x: yScale(y(d)) * Math.cos(i * angleStep - Math.PI / 2),
    y: yScale(y(d)) * Math.sin(i * angleStep - Math.PI / 2),
  }));

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect fill={background} width={width} height={height} rx={14} />
      <Group top={height / 2 - margin.top} left={width / 2}>
        {/* Concentric Circles */}
        {[...new Array(levels)].map((_, i) => (
          <circle
            key={`circle-grid-${i}`}
            cx={0}
            cy={0}
            r={((i + 1) * radius) / levels}
            stroke={silver}
            strokeWidth={2}
            fill="none"
          />
        ))}

        {/* Radial Lines */}
        {points.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          return (
            <Line
              key={`radar-line-${i}`}
              from={{ x: 0, y: 0 }}
              to={{ x, y }}
              stroke={silver}
              strokeWidth={1}
            />
          );
        })}

        {/* Radar Sectors */}
        {points.map((point, i) => {
          const nextPoint = points[(i + 1) % points.length]; // Connect back to first
          return (
            <polygon
              key={`sector-${i}`}
              points={`0,0 ${point.x},${point.y} ${nextPoint.x},${nextPoint.y}`}
              fill={hoveredIndex === i ? highlightColor : orange}
              fillOpacity={hoveredIndex === i ? 0.6 : 0.3}
              stroke={orange}
              strokeWidth={2}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}

        {/* Points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={hoveredIndex === i ? 7 : 5} // Highlight hovered point
            fill={pumpkin}
            stroke={hoveredIndex === i ? "black" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </Group>
    </svg>
  );
}
