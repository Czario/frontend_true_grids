"use client";
import React, { useState, useEffect } from "react";
import { Group } from "@visx/group";
import { AreaClosed } from "@visx/shape";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { LinearGradient } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";
import { bisector } from "@visx/vendor/d3-array";
import {
  AreaChartComp,
  EventMarker,
  HoverPoint,
  StockDataItem,
} from "@/modules/charts/interfaces/areaChart";

// Initialize some variables
const axisColor = "#fff";
const axisBottomTickLabelProps = {
  textAnchor: "middle" as const,
  fontFamily: "Arial",
  fontSize: 10,
  fill: axisColor,
};
const axisLeftTickLabelProps = {
  dx: "-0.25em",
  dy: "0.25em",
  fontFamily: "Arial",
  fontSize: 10,
  textAnchor: "end" as const,
  fill: axisColor,
};

// Accessors
const getDate = (d: StockDataItem) => new Date(d.date);
const getStockValue = (d: StockDataItem) => d.close;

export default function AreaChart({
  data,
  gradientColor,
  width,
  yMax,
  margin,
  xScale,
  yScale,
  hideBottomAxis = false,
  hideLeftAxis = false,
  top,
  left,
  children,
  events = [],
  setTooltipData,
  setTooltipVisible,
  showHoverLines = false,
  setAreaTooltipData,
}: AreaChartComp) {
  const [hoverPoint, setHoverPoint] = useState<HoverPoint | null>(null);

  const updateTooltipData = (dataPoint: StockDataItem) => {
    const x = xScale(getDate(dataPoint)) || 0;
    const y = yScale(getStockValue(dataPoint)) || 0;

    const chartWidth = xScale.range()[1];
    const isHoveredOnLeft = x < chartWidth / 2;

    setHoverPoint({
      x,
      y,
      date: new Date(getDate(dataPoint)),
      value: getStockValue(dataPoint),
    });

    setAreaTooltipData &&
      setAreaTooltipData({
        date: new Date(getDate(dataPoint)),
        value: getStockValue(dataPoint),
        isHoveredOnLeft,
        left: x,
      });
  };

  const handleAreaTooltip = () => {
    if (data.length > 0) {
      updateTooltipData(data[data.length - 1]); // Use latest data point
    }
  };

  const handleAreaTooltipOnMouseOver = (
    event: React.MouseEvent<SVGRectElement, MouseEvent>
  ) => {
    const { offsetX } = event.nativeEvent;
    const hoveredDate = xScale.invert(offsetX);

    // Find closest data point
    const index = bisectDate(data, hoveredDate);
    const d0 = data[index - 1];
    const d1 = data[index];

    const closestData =
      !d0 ||
      (d1 &&
        Math.abs(getDate(d1).getTime() - hoveredDate) <
          Math.abs(getDate(d0).getTime() - hoveredDate))
        ? d1
        : d0;

    if (!closestData) return;

    updateTooltipData(closestData);
  };

  useEffect(() => {
    handleAreaTooltip();
  }, [data, xScale, yScale]);

  if (width < 10) return null;
  // D3 Bisector to find closest data point

  const bisectDate = bisector<StockDataItem, Date>((d) => getDate(d)).left;

  const handleEventTooltip = (
    currentEvent: EventMarker,
    x: number,
    y: number
  ) => {
    const chartWidth = xScale.range()[1];
    const isHoveredOnLeft = x < chartWidth / 2;
    setTooltipData &&
      setTooltipData({ ...currentEvent, isHoveredOnLeft, left: x, top: y });
    setTooltipVisible && setTooltipVisible(true);
  };

  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <LinearGradient
        id="gradient"
        from={gradientColor}
        fromOpacity={1}
        to={gradientColor}
        toOpacity={0.2}
      />
      <AreaClosed<StockDataItem>
        data={data}
        x={(d) => xScale(getDate(d)) || 0}
        y={(d) => yScale(getStockValue(d)) || 0}
        yScale={yScale}
        strokeWidth={1}
        stroke="url(#gradient)"
        fill="transparent"
        curve={curveMonotoneX}
      />
      {!hideBottomAxis && (
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={width > 520 ? 7 : 4}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={axisBottomTickLabelProps}
        />
      )}
      {/* {!hideLeftAxis && (
        <AxisLeft
          scale={yScale}
          numTicks={5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={axisLeftTickLabelProps}
        />
      )} */}

      {/* Hover Tracking */}
      <rect
        width={width}
        height={yMax}
        fill="transparent"
        onMouseMove={(event) => {
          handleAreaTooltipOnMouseOver(event);
        }}
      />

      {/* Hover Lines & Circle */}
      {showHoverLines && hoverPoint && (
        <Group>
          {/* Vertical Line to X-Axis */}
          <line
            x1={hoverPoint.x}
            x2={hoverPoint.x}
            y1={0}
            y2={yScale.range()[0]}
            strokeWidth={0.5}
            stroke="white"
            strokeDasharray="4"
          />

          {/* Horizontal Line to Y-Axis */}
          <line
            x1={0}
            x2={xScale.range()[1]}
            y1={hoverPoint.y}
            y2={hoverPoint.y}
            strokeWidth={0.5}
            stroke="white"
            strokeDasharray="4"
          />

          {/* Intersection Point */}
          <circle
            cx={hoverPoint.x}
            cy={hoverPoint.y}
            r={4}
            fill="white"
            stroke="white"
            strokeWidth={2}
            pointerEvents="none"
          />
        </Group>
      )}

      {/* Render Flags */}
      {events.map((event, index) => {
        const x = xScale(event.date);
        const y = yMax - 20; // Position slightly above the x-axis
        if (!x || !y || x <= 0) return null;

        return (
          <Group
            key={index}
            left={x}
            top={y}
            onMouseEnter={(e) => {
              handleEventTooltip(event, x, y + margin.top);
            }}
            onMouseMove={(e) => {
              handleEventTooltip(event, x, y + margin.top);
            }}
            onMouseLeave={() => {
              setTooltipVisible && setTooltipVisible(false);
            }}
          >
            <circle r={8} fill="red" />
          </Group>
        );
      })}
      {children}
    </Group>
  );
}
