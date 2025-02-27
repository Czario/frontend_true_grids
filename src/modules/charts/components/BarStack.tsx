import React, { useState } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { timeParse, timeFormat } from "@visx/vendor/d3-time-format";
import { GridRows } from "@visx/grid";
import { Tooltip, defaultStyles } from "@visx/tooltip";

export interface KeyMetadata {
  key: string;
  color: string;
}

export interface StackedBarChartProps {
  width: number;
  height: number;
  data: Record<string, any>[];
  isQuarter: boolean;
  keys: KeyMetadata[];
  margin?: { top: number; right: number; bottom: number; left: number };
}

const defaultMargin = { top: 40, right: 20, bottom: 40, left: 50 };
const parseDate = timeParse("%Y-%m-%d");
const formatQuarter = timeFormat("%b %Y");
const formatYear = timeFormat("%Y");

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  width,
  height,
  data,
  keys,
  isQuarter = false,
  margin = defaultMargin,
}) => {
  if (width < 10 || !data || !Array.isArray(data) || data.length === 0) {
    console.error("Invalid data:", data);
    return null;
  }
  if (!keys || !Array.isArray(keys) || keys.length === 0) {
    console.error("Invalid keys:", keys);
    return null;
  }

  const [tooltipData, setTooltipData] = useState<{
    left: number;
    top: number;
    date: string;
    bars: { key: string; value: number; color: string }[];
  } | null>(null);

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const formatDate = (date: string) => {
    const parsedDate = parseDate(date);
    if (!parsedDate) return date;
    return isQuarter ? formatQuarter(parsedDate) : formatYear(parsedDate);
  };

  const xScale = scaleBand<string>({
    domain: data.map((d) => d.date),
    range: [0, xMax],
    padding: 0.2,
  });

  const yScale = scaleLinear<number>({
    domain: [
      0,
      Math.max(
        ...data.map((d) =>
          keys.reduce((sum, key) => sum + Number(d[key.key] || 0), 0)
        )
      ),
    ],
    range: [yMax, 0],
    nice: true,
  });

  const colorScale = scaleOrdinal<string, string>({
    domain: keys.map((k) => k.key),
    range: keys.map((k) => k.color),
  });

  const handleTooltip = (event: React.MouseEvent<SVGRectElement>, d) => {
    const { clientX, clientY } = event;
    setTooltipData({
      left: clientX,
      top: clientY - 10,
      date: d.date,
      bars: keys.map((k) => ({
        key: k.key,
        value: Number(d[k.key] || 0),
        color: colorScale(k.key) || "black",
      })),
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          <GridRows
            scale={yScale}
            width={xMax}
            stroke="#e2e8f0"
            strokeOpacity={0.6}
          />

          {/* Bars grouped by date */}
          {data.map((d) => {
            const xPos = xScale(d.date);
            if (xPos === undefined) return null;

            return (
              <g
                key={`group-${d.date}`}
                transform={`translate(${xPos},0)`}
                onMouseEnter={(e) => handleTooltip(e, d)}
                onMouseMove={(e) => handleTooltip(e, d)}
                onMouseLeave={() => setTooltipData(null)}
              >
                {keys.map((k, index) => {
                  const value = Number(d[k.key] || 0);
                  const barHeight = yMax - yScale(value);
                  const barYOffset = keys
                    .slice(0, index)
                    .reduce(
                      (acc, prevKey) =>
                        acc + (yMax - yScale(Number(d[prevKey.key] || 0))),
                      0
                    );

                  return (
                    <rect
                      key={`bar-${d.date}-${k.key}`}
                      x={0}
                      y={yScale(value) - barYOffset}
                      width={xScale.bandwidth()}
                      height={barHeight}
                      style={{
                        transformOrigin: "bottom",
                        animation: "growBar 0.5s ease-out forwards",
                      }}
                      fill={colorScale(k.key)}
                    />
                  );
                })}
              </g>
            );
          })}
        </Group>

        {/* X-Axis */}
        <AxisBottom
          top={yMax + margin.top}
          left={margin.left}
          scale={xScale}
          tickFormat={formatDate}
          stroke="black"
          hideAxisLine
          hideTicks
          tickStroke="black"
          tickLabelProps={{ fill: "black", fontSize: 11, textAnchor: "middle" }}
        />

        {/* Y-Axis */}
        <AxisLeft
          top={margin.top}
          left={margin.left}
          scale={yScale}
          stroke="black"
          hideAxisLine
          hideTicks
          tickStroke="black"
          tickLabelProps={{
            fill: "black",
            fontSize: 11,
            textAnchor: "end",
            dx: -5,
            dy: 3,
          }}
        />
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <div
          style={{
            position: "absolute",
            top: tooltipData.top,
            left: tooltipData.left,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "13px",
            fontFamily: "Arial, sans-serif",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: "bold" }}>{tooltipData.date}</div>
          {tooltipData.bars.map((bar) => (
            <div key={bar.key} style={{ color: bar.color }}>
              {bar.key}: <strong>{bar.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StackedBarChart;
