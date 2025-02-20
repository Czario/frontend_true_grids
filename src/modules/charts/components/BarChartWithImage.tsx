"use client";
import React, { useMemo } from "react";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Tooltip, useTooltip, defaultStyles } from "@visx/tooltip";

const mockData = [
  {
    label: "Stock Market",
    value: 100,
    image:
      "https://ik.imagekit.io/kkbzr2uz4cp//ceos/warren-buffett.png?tr=w-200",
    quote:
      "The stock market is a device for transferring money from the impatient to the patient. - Warren Buffett",
  },
  {
    label: "Bonds",
    value: 75,
    image:
      "https://ik.imagekit.io/kkbzr2uz4cp//ceos/warren-buffett.png?tr=w-200",
    quote:
      "Bonds can be a safer investment, but they often yield lower returns.",
  },
  {
    label: "Cryptocurrency",
    value: 150,
    image:
      "https://ik.imagekit.io/kkbzr2uz4cp//ceos/warren-buffett.png?tr=w-200",
    quote: "Cryptocurrency is a digital asset that uses blockchain technology.",
  },
  {
    label: "Real Estate",
    value: 90,
    image:
      "https://ik.imagekit.io/kkbzr2uz4cp//ceos/warren-buffett.png?tr=w-200",
    quote:
      "Real estate investing can provide steady income and long-term appreciation.",
  },
];

export default function ImageBarChart({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  if (width < 10) return null;

  const margin = { top: 60, right: 30, bottom: 50, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: mockData.map((d) => d.label),
        padding: 0.5,
      }).range([0, xMax]),
    [xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...mockData.map((d) => d.value))],
        nice: true,
      }).range([yMax, 0]),
    [yMax]
  );

  const yTicks = yScale.ticks(4);

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } =
    useTooltip();

  const handleTooltip = (
    x: number,
    y: number,
    d: { quote: string },
    barWidth: number
  ) => {
    showTooltip({
      tooltipData: d.quote,
      tooltipLeft: x + barWidth / 4 + margin.left,
      tooltipTop: y - 70 + margin.top,
    });
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-around",
      }}
    >
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          {/* Grid Lines */}
          <GridRows
            scale={yScale}
            tickValues={yTicks}
            width={xMax}
            strokeWidth={0.5}
            stroke="#e6e6e6"
          />

          {/* Bars + Images */}
          {mockData.map((d) => {
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - yScale(d.value);
            const x = xScale(d.label) ?? 0;
            const y = yScale(d.value);

            return (
              <Group key={d.label}>
                {/* Bar */}
                <Bar
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#4682b4"
                />

                {/* Image on top of bar */}
                <Group>
                  <foreignObject
                    x={x + barWidth / 4}
                    y={y - 40}
                    width="2.5em"
                    height="auto"
                    style={{ overflow: "visible" }}
                  >
                    <img
                      src={d.image}
                      width="30"
                      height="30"
                      style={{ borderRadius: "50%", display: "block" }}
                      onMouseEnter={(e) => {
                        handleTooltip(x, y, d, barWidth);
                      }}
                      onMouseMove={(e) => handleTooltip(x, y, d, barWidth)}
                      onMouseLeave={hideTooltip}
                    />
                  </foreignObject>
                </Group>
              </Group>
            );
          })}

          {/* Axes */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            stroke="transparent"
            tickStroke="0"
            tickLabelProps={() => ({
              fill: "#333",
              fontSize: 12,
              textAnchor: "middle",
            })}
          />
          <AxisLeft
            scale={yScale}
            tickValues={yTicks}
            stroke="transparent"
            tickStroke="0"
          />
        </Group>
      </svg>

      {tooltipData && (
        <div
          style={{
            position: "absolute",
            top: 0,
            transform: `translate(${tooltipLeft ?? 0}px, ${tooltipTop}px)`,
          }}
        >
          <Tooltip
            style={{
              ...defaultStyles,
              backgroundColor: "black",
              color: "white",
              padding: "6px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              left: "-50%",
              position: "relative",
            }}
          >
            {tooltipData}
          </Tooltip>
        </div>
      )}
    </div>
  );
}
