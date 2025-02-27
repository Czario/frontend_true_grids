"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Group } from "@visx/group";
import { BarGroup } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { timeParse, timeFormat } from "@visx/vendor/d3-time-format";
import { GridRows } from "@visx/grid";
import { Tooltip, defaultStyles } from "@visx/tooltip";
import localPoint from "@visx/event/lib/localPointGeneric";

export interface KeyMetadata {
  key: string;
  color: string;
}

export interface GroupedBarChartProps {
  width: number;
  height: number;
  data: Record<string, any>[];
  keys: KeyMetadata[];
  isQuarter: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const defaultMargin = { top: 40, right: 20, bottom: 40, left: 50 };
const parseDate = timeParse("%Y-%m-%d");
const formatQuarter = timeFormat("%b %Y");
const formatYear = timeFormat("%Y");

const tooltipOffset = 10; // Small offset for visibility

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  width,
  height,
  data,
  isQuarter = false,
  keys,
  margin = defaultMargin,
}) => {
  if (width < 10) return null;

  const [tooltipData, setTooltipData] = useState<{
    left?: number;
    top?: number;
    key: string;
    date: string;
    isHoveredOnLeft: boolean;
    value: number | string;
  } | null>(null);

  const formatDate = (date: string) => {
    const parsedDate = parseDate(date);
    if (!parsedDate) return date;
    return isQuarter ? formatQuarter(parsedDate) : formatYear(parsedDate);
  };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleBand<string>({
    domain: data.map((d) => d.date),
    padding: 0.2,
  }).range([0, xMax]);

  const groupScale = scaleBand<string>({
    domain: keys.map((k) => k.key),
    padding: 0.1,
  }).range([0, xScale.bandwidth()]);

  const yScale = scaleLinear<number>({
    domain: [
      0,
      Math.max(
        ...data.map((d) => Math.max(...keys.map((k) => Number(d[k.key]))))
      ),
    ],
    range: [yMax, 0],
    nice: true,
  });

  const colorScale = scaleOrdinal<string, string>({
    domain: keys.map((k) => k.key),
    range: keys.map((k) => k.color),
  });

  const showText = useMemo(() => {
    return xScale.bandwidth() > 100;
  }, [data]);

  const handleMouseEvent = (
    event: React.MouseEvent<SVGRectElement>,
    bar,
    originalDate: string
  ) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const point = localPoint(svg, event);
    if (!point) return;
    const isLeftSide = point.x < width / 2;
    setTooltipData({
      left: isLeftSide ? point.x + tooltipOffset : point.x - tooltipOffset,
      top: point.y - tooltipOffset,
      key: bar.key,
      value: bar.value,
      date: originalDate,
      isHoveredOnLeft: isLeftSide,
    });
  };

  return (
    <div>
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          <GridRows
            scale={yScale}
            width={xMax}
            stroke="#e2e8f0"
            strokeOpacity={0.6}
          />
          <BarGroup
            data={data}
            keys={keys.map((k) => k.key)}
            height={yMax}
            x0={(d) => d.date}
            x0Scale={xScale}
            x1Scale={groupScale}
            yScale={yScale}
            color={colorScale}
          >
            {(barGroups) =>
              barGroups.map((barGroup) => (
                <Group key={`bar-group-${barGroup.index}`} left={barGroup.x0}>
                  {barGroup.bars.map((bar) => {
                    const originalDate = data[barGroup.index]?.date;
                    return (
                      <React.Fragment key={`bar-${bar.x}`}>
                        <rect
                          x={bar.x}
                          style={{
                            transformOrigin: "bottom",
                            animation: "growBar 0.5s ease-out forwards",
                          }}
                          y={bar.y}
                          width={bar.width}
                          height={bar.height}
                          fill={bar.color}
                          onMouseEnter={(e) =>
                            handleMouseEvent(e, bar, originalDate)
                          }
                          onMouseMove={(e) =>
                            handleMouseEvent(e, bar, originalDate)
                          }
                          onMouseLeave={() => {
                            setTooltipData(null);
                          }}
                        />
                        {showText && (
                          <text
                            x={bar.x + bar.width / 2}
                            y={bar.y - 5}
                            textAnchor="middle"
                            fontSize={12}
                            fill="black"
                            fontWeight="bold"
                            style={{
                              opacity: 0,
                              animation: "fadeIn 0.5s ease-in forwards",
                              animationDelay: "0.5s",
                            }}
                          >
                            ${bar.value}
                          </text>
                        )}
                      </React.Fragment>
                    );
                  })}
                </Group>
              ))
            }
          </BarGroup>
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          left={margin.left}
          scale={xScale}
          tickFormat={formatDate}
          stroke="black"
          strokeWidth={0}
          hideAxisLine
          tickStroke="black"
          tickLabelProps={{ fill: "black", fontSize: 11, textAnchor: "middle" }}
        />
        <AxisLeft
          left={margin.left}
          top={margin.top}
          scale={yScale}
          stroke="black"
          tickStroke="black"
          strokeWidth={0}
          hideAxisLine
          tickLabelProps={{
            fill: "black",
            fontSize: 11,
            textAnchor: "end",
            dx: -5,
            dy: 3,
          }}
        />
      </svg>
      {tooltipData && (
        <div
          style={{
            transform: `translateX(${tooltipData.left ?? 0}px)`,
            position: "absolute",
            top: tooltipData.top,
          }}
        >
          <Tooltip
            style={{
              ...defaultStyles,
              left: tooltipData.isHoveredOnLeft ? 0 : "auto",
              right: tooltipData.isHoveredOnLeft ? "auto" : 0,
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
            <div style={{ marginTop: "4px", fontSize: "14px" }}>
              {tooltipData.key}: <strong>{tooltipData.value}</strong>
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default GroupedBarChart;
