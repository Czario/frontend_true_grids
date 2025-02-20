"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { Group } from "@visx/group";

const margin = { left: 10, right: 10 };

interface DataPoint {
  year: number;
  value: number;
}

export default function SankeyWithVisx({
  data,
  year,
  handleYearChange,
}: {
  data: DataPoint[];
  year: number;
  handleYearChange: (value: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number | null>(null);
  const chartHeight = 40;
  const minYear = 2014;
  const maxYear = 2025;

  const updateWidth = () => {
    if (containerRef.current) {
      setChartWidth(
        containerRef.current.offsetWidth - margin.left - margin.right
      );
    }
  };

  // Generate year labels dynamically
  const yearLabels = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i),
    [minYear, maxYear]
  );

  useEffect(() => {
    updateWidth();

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (chartWidth === null) {
    return (
      <div ref={containerRef} style={{ width: "100%", height: chartHeight }} />
    ); // Prevents rendering until width is known
  }

  const xScale = scaleLinear({
    domain: [minYear, maxYear],
    range: [0, chartWidth],
  });

  const yScale = scaleLinear({
    domain: [0, 100],
    range: [chartHeight - 20, 10],
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: chartHeight,
        background: "rgb(38, 46, 58)",
        borderRadius: "0.5rem",
        padding: "0 0.625rem",
        boxSizing: "border-box",
      }}
      className="flex"
    >
      <svg width={chartWidth} height={chartHeight}>
        <Group>
          <LinePath
            data={data}
            x={(d) => xScale(d.year)}
            y={(d) => yScale(d.value)}
            stroke="#2394DF"
            strokeWidth={0.5}
          />
        </Group>
      </svg>
      <div
        style={{
          position: "absolute",
          top: "-0.438rem",
          display: "flex",
          width: chartWidth,
          overflowX: "auto",
          whiteSpace: "nowrap",
          justifyContent: "space-between",
          color: "white",
          fontSize: "0.75rem",
        }}
      >
        <style>{`
        .highlighted-label {
            background-color: rgba(35, 148, 223, 0.2);
        }
        `}</style>
        {yearLabels.map((labelYear) => (
          <div
            className={labelYear === year ? "highlighted-label" : ""}
            style={{
              padding: "0.125rem 0.75rem",
              borderRadius: "0.375rem",
              height: "3.125rem",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            key={labelYear}
            onClick={() => handleYearChange(labelYear)}
          >
            {labelYear}
          </div>
        ))}
      </div>
    </div>
  );
}
