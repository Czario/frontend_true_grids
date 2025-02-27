"use client";
import React, { useState, useMemo } from "react";
import { Group } from "@visx/group";
import { LinePath, Circle, Line } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleLinear, scaleOrdinal, scaleTime } from "@visx/scale";
import { timeParse, timeFormat } from "@visx/vendor/d3-time-format";
import { GridRows } from "@visx/grid";
import { curveMonotoneX } from "@visx/curve";
import { localPoint } from "@visx/event";
import { bisector } from "d3-array";
import { Tooltip, defaultStyles } from "@visx/tooltip";

export interface KeyMetadata {
  key: string;
  color: string;
}

export interface LineChartProps {
  width: number;
  height: number;
  data: Record<string, any>[];
  keys: KeyMetadata[];
  isQuarter: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const defaultMargin = { top: 40, right: 50, bottom: 40, left: 50 };
const parseDate = timeParse("%Y-%m-%d");
const formatQuarter = timeFormat("%b %Y");
const formatYear = timeFormat("%Y");
const bisectDate = bisector((d: any) => parseDate(d.date)!.getTime()).left;

const LineChart: React.FC<LineChartProps> = ({
  width,
  height,
  data,
  keys,
  isQuarter = false,
  margin = defaultMargin,
}) => {
  if (width < 10) return null;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const formatDate = (date: string) => {
    const parsedDate = parseDate(date);
    if (!parsedDate) return date;
    return isQuarter ? formatQuarter(parsedDate) : formatYear(parsedDate);
  };

  const xScale = scaleTime({
    domain: [
      Math.min(...data.map((d) => parseDate(d.date)?.getTime() || 0)),
      Math.max(...data.map((d) => parseDate(d.date)?.getTime() || 0)),
    ],
    range: [0, xMax],
  });

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

  const [tooltipData, setTooltipData] = useState<{
    x: number;
    d: any;
    left: number;
    isHoveredOnLeft: boolean;
    top: number;
    activeKey: string | null;
  } | null>(null);

  const handleMouseMove = (
    event: React.MouseEvent<SVGPathElement>,
    key: string
  ) => {
    const { x } = localPoint(event) || { x: 0 };
    const x0 = xScale.invert(x - margin.left).getTime();
    const index = bisectDate(data, x0, 1);
    const d0 = data[index - 1];
    const d1 = data[index];
    let d = d0;
    if (d1 && parseDate(d1.date)) {
      d =
        x0 - parseDate(d0.date)!.getTime() > parseDate(d1.date)!.getTime() - x0
          ? d1
          : d0;
    }
    const tooltipLeft = xScale(parseDate(d.date)!.getTime());
    const isHoveredOnLeft = tooltipLeft < xMax / 2;
    const tooltipOffset = isHoveredOnLeft ? 10 : -10;
    setTooltipData({
      x: tooltipLeft!,
      d,
      left: tooltipLeft + margin.left + tooltipOffset,
      top: 0,
      isHoveredOnLeft,
      activeKey: key,
    });
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  const generateXTickValues = useMemo(() => {
    const allDates = data
      .map((d) => parseDate(d.date))
      .filter(Boolean) as Date[];
    if (allDates.length < 15) {
      return allDates.map((date) => date.getTime());
    }
    // Show alternate labels (every 2nd one)
    return allDates.filter((_, i) => i % 2 === 0).map((date) => date.getTime());
  }, [data]);

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

          <rect
            width={xMax}
            height={yMax}
            fill="transparent"
            onMouseMove={(e) => handleMouseMove(e, "")}
            onMouseLeave={handleMouseLeave}
          />
          {keys.map((key) => (
            <LinePath
              key={key.key}
              data={data}
              x={(d) => xScale(parseDate(d.date)?.getTime() || 0) || 0}
              y={(d) => yScale(Number(d[key.key])) || 0}
              stroke={colorScale(key.key)}
              strokeWidth={tooltipData?.activeKey === key.key ? 3 : 2}
              opacity={
                tooltipData?.activeKey && tooltipData.activeKey !== key.key
                  ? 0.2
                  : 1
              }
              curve={curveMonotoneX}
              onMouseEnter={(e) => {
                handleMouseMove(e, key.key);
              }}
              onMouseMove={(e) => handleMouseMove(e, key.key)}
            />
          ))}

          {tooltipData && (
            <>
              <Line
                from={{ x: tooltipData.x, y: 0 }}
                to={{ x: tooltipData.x, y: yMax }}
                stroke="gray"
                strokeDasharray="4 4"
              />
              {keys.map((key) => (
                <Circle
                  key={key.key}
                  cx={tooltipData.x}
                  cy={yScale(Number(tooltipData.d[key.key])) || 0}
                  r={4}
                  fill={colorScale(key.key)}
                />
              ))}
            </>
          )}
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          left={margin.left}
          scale={xScale}
          tickFormat={(val) =>
            formatDate(timeFormat("%Y-%m-%d")(new Date(val)))
          }
          tickValues={generateXTickValues}
          stroke="black"
          hideAxisLine
          hideTicks
          tickStroke="black"
          tickLabelProps={{ fill: "black", fontSize: 11, textAnchor: "middle" }}
        />

        <AxisLeft
          left={margin.left}
          top={margin.top}
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
      {tooltipData && (
        <div
          style={{
            transform: `translateX(${tooltipData.left}px)`,
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
            <div>{formatDate(tooltipData.d.date)}</div>
            {keys.map((key) => (
              <div key={key.key}>
                <strong>{key.key}:</strong> {tooltipData.d[key.key]}
              </div>
            ))}
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default LineChart;
