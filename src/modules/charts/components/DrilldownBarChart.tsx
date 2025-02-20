"use client";
import React, { useMemo, useState } from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { scaleBand, scaleLinear } from "@visx/scale";
import { motion } from "framer-motion";
import mockData from "./../../../../public/temp_data/DrilldownData.json";

export type BarChartProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};
type DrilldownData = {
  label: string;
  value: number;
  children?: DrilldownData[];
};

const defaultMargin = { top: 20, right: 20, bottom: 50, left: 50 };

export default function DrilldownBarChart({
  width,
  height,
  margin = defaultMargin,
}: BarChartProps) {
  if (width < 10) return null;

  const [currentData, setCurrentData] = useState<DrilldownData[]>(mockData);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: currentData.map((d) => d.label),
        padding: 0.5,
      }).range([0, xMax]),
    [xMax, currentData]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...currentData.map((d) => d.value))],
        nice: true,
      }).range([yMax, 0]),
    [yMax, currentData]
  );

  const handleBarClick = (d: any) => {
    if (d.children) {
      setBreadcrumb((prev) => [...prev, d.label]);
      setCurrentData(d.children);
    }
  };

  const handleBack = () => {
    if (breadcrumb.length > 0) {
      setBreadcrumb([]);
      setCurrentData(mockData);
    }
  };

  const truncateLabel = (label: string) => {
    const barWidth = xScale.bandwidth() * 2;
    const len = barWidth / 7; // font-size is 12px; approx width of character is 7px
    return label.length > len ? label.substring(0, len) + "..." : label;
  };

  return (
    <div style={{ fontFamily: "Arial" }}>
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          <GridRows
            scale={yScale}
            width={xMax}
            strokeWidth={0.5}
            stroke="#e6e6e6"
            numTicks={5}
          />
          {currentData.map((d) => {
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - yScale(d.value);
            const x = xScale(d.label) ?? 0;
            const y = yScale(d.value);
            return (
              <motion.rect
                key={d.label}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#4682b4"
                whileHover={{ fill: "#1E90FF" }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.5 }}
                onClick={() => handleBarClick(d)}
                style={{ cursor: d.children ? "pointer" : "default" }}
              />
            );
          })}
          <AxisBottom
            top={yMax}
            scale={xScale}
            stroke="transparent"
            tickStroke="transparent"
            tickFormat={truncateLabel}
            tickLabelProps={() => ({
              fill: "#333",
              fontSize: 12,
              textAnchor: "middle",
            })}
          />
          <AxisLeft
            scale={yScale}
            numTicks={5}
            stroke="transparent"
            tickStroke="transparent"
            tickLabelProps={() => ({
              fill: "#333",
              fontSize: 12,
              textAnchor: "end",
            })}
          />
        </Group>
      </svg>
      {breadcrumb.length > 0 && (
        <button
          onClick={handleBack}
          style={{
            marginBottom: "15px",
            padding: "8px 16px",
            background: "#ff6347",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#e55347")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#ff6347")}
        >
          ← Back
        </button>
      )}
    </div>
  );
}
