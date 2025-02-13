"use client";
import React, { useRef, useState, useMemo, useEffect } from "react";
import { scaleTime, scaleLinear } from "@visx/scale";
import appleStock from "@visx/mock-data/lib/mocks/appleStock";
import { Brush } from "@visx/brush";
import { Bounds } from "@visx/brush/lib/types";
import BaseBrush, {
  BaseBrushState,
  UpdateBrush,
} from "@visx/brush/lib/BaseBrush";
import { PatternLines } from "@visx/pattern";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";
import { max, extent } from "@visx/vendor/d3-array";
import { BrushHandleRenderProps } from "@visx/brush/lib/BrushHandle";
import AreaChart from "./AreaChart";
import { Tooltip, defaultStyles } from "@visx/tooltip";
import {
  AreaTooltipMarker,
  BrushProps,
  StockDataItem,
  EventTooltipMarker,
} from "@/modules/charts/interfaces/areaChart";

// Initialize some variables
const stock = appleStock.slice(1000);
const brushMargin = { top: 10, bottom: 15, left: 0, right: 0 };
const chartSeparation = 30;
const PATTERN_ID = "brush_pattern";
const GRADIENT_ID = "brush_gradient";
export const accentColor = "#f6acc8";
export const background = "#584153";
export const background2 = "#af8baf";
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: "white",
};

// accessors
const getDate = (d: StockDataItem) => new Date(d.date);
const getStockValue = (d: StockDataItem) => d.close;

function BrushChart({
  compact = false,
  width,
  height,
  margin = {
    top: 75,
    left: 0,
    bottom: 20,
    right: 0,
  },
}: BrushProps) {
  const brushRef = useRef<BaseBrush | null>(null);
  const [filteredStock, setFilteredStock] = useState(stock);

  // flag Tooltip state
  const [tooltipData, setTooltipData] = useState<EventTooltipMarker | null>(
    null
  );
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // area Tooltip state
  const [areaTooltipData, setAreaTooltipData] =
    useState<AreaTooltipMarker | null>(null);

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const stockCopy = stock.filter((s) => {
      const x = getDate(s).getTime();
      const y = getStockValue(s);
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredStock(stockCopy);
  };

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = compact
    ? chartSeparation / 2
    : chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(
    bottomChartHeight - brushMargin.top - brushMargin.bottom,
    0
  );

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: extent(filteredStock, getDate) as [Date, Date],
      }),
    [xMax, filteredStock]
  );

  const stockScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, max(filteredStock, getStockValue) || 0],
        nice: true,
      }),
    [yMax, filteredStock]
  );

  const brushDateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain: extent(stock, getDate) as [Date, Date],
      }),
    [xBrushMax]
  );

  const brushStockScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(stock, getStockValue) || 0],
        nice: true,
      }),
    [yBrushMax]
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: brushDateScale(getDate(stock[50])) },
      end: { x: brushDateScale(getDate(stock[100])) },
    }),
    [brushDateScale]
  );

  // event handlers
  const handleClearClick = () => {
    if (brushRef?.current) {
      setFilteredStock(stock);
      brushRef.current.reset();
    }
  };

  const handleResetClick = () => {
    if (brushRef?.current) {
      const updater: UpdateBrush = (prevBrush) => {
        const newExtent = brushRef.current!.getExtent(
          initialBrushPosition.start,
          initialBrushPosition.end
        );

        const newState: BaseBrushState = {
          ...prevBrush,
          start: { y: newExtent.y0, x: newExtent.x0 },
          end: { y: newExtent.y1, x: newExtent.x1 },
          extent: newExtent,
        };

        return newState;
      };
      brushRef.current.updateBrush(updater);
    }
  };

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <LinearGradient
          id={GRADIENT_ID}
          from={background}
          to={background2}
          rotate={45}
        />
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={`url(#${GRADIENT_ID})`}
          rx={14}
        />
        <AreaChart
          hideBottomAxis={compact}
          data={filteredStock}
          width={width}
          margin={{
            ...margin,
            bottom: topChartBottomMargin,
          }}
          yMax={yMax}
          xScale={dateScale}
          showHoverLines={true}
          yScale={stockScale}
          gradientColor={background2}
          events={[
            { date: new Date("2010-11-15"), label: "Earnings Q4 2010" },
            { date: new Date("2011-02-20"), label: "Product Launch" },
            { date: new Date("2011-05-05"), label: "Stock Split" },
            { date: new Date("2011-05-25"), label: "Earnings Q2 2011" },
            { date: new Date("2011-08-12"), label: "New CEO Announcement" },
            { date: new Date("2011-10-01"), label: "Market Dip" },
            { date: new Date("2012-01-05"), label: "Earnings Q4 2011" },
            { date: new Date("2012-04-18"), label: "Major Acquisition" },
            { date: new Date("2012-07-07"), label: "Dividend Increase" },
            { date: new Date("2012-10-15"), label: "Stock Buyback Program" },
          ]}
          setTooltipData={setTooltipData}
          setTooltipVisible={setTooltipVisible}
          setAreaTooltipData={setAreaTooltipData}
        />
        <AreaChart
          hideBottomAxis
          hideLeftAxis
          data={stock}
          width={width}
          yMax={yBrushMax}
          xScale={brushDateScale}
          yScale={brushStockScale}
          margin={brushMargin}
          top={topChartHeight + topChartBottomMargin + margin.top}
          gradientColor={background2}
        >
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            stroke={accentColor}
            strokeWidth={1}
            orientation={["diagonal"]}
          />
          <Brush
            xScale={brushDateScale}
            yScale={brushStockScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={brushMargin}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={["left", "right"]}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            onClick={() => setFilteredStock(stock)}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
            renderBrushHandle={(props) => <BrushHandle {...props} />}
          />
        </AreaChart>
      </svg>
      {tooltipVisible && tooltipData && (
        <div
          style={{
            position: "absolute",
            top: 0,
            transform: `translate(${tooltipData.left ?? 0}px, ${
              tooltipData.top - 50
            }px)`,
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
            {tooltipData.label}
          </Tooltip>
        </div>
      )}
      {areaTooltipData && (
        <div
          style={{
            transform: `translateX(${areaTooltipData.left ?? 0}px)`,
            position: "absolute",
            top: "25px",
          }}
        >
          <Tooltip
            style={{
              ...defaultStyles,
              left: areaTooltipData.isHoveredOnLeft ? 0 : "auto",
              right: areaTooltipData.isHoveredOnLeft ? "auto" : 0,
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
            <div style={{ fontWeight: "bold" }}>
              {new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                month: "short",
                day: "2-digit",
                year: "numeric",
              }).format(areaTooltipData.date)}
            </div>
            <div style={{ marginTop: "4px", fontSize: "14px" }}>
              Value: <strong>{areaTooltipData.value}</strong>
            </div>
          </Tooltip>
        </div>
      )}
      <button
        className="mt-1 px-2 py-1 text-white text-[0.875rem] bg-blue-500 rounded hover:bg-blue-600 transition"
        onClick={handleClearClick}
      >
        Clear
      </button>
      &nbsp;
      <button
        className="mt-1 px-2 py-1 text-white text-[0.875rem] bg-blue-500 rounded hover:bg-blue-600 transition"
        onClick={handleResetClick}
      >
        Reset
      </button>
    </div>
  );
}
// We need to manually offset the handles for them to be rendered at the right position
function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
  const pathWidth = 8;
  const pathHeight = 15;
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
      <path
        fill="#f2f2f2"
        d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
        stroke="#999999"
        strokeWidth="1"
        style={{ cursor: "ew-resize" }}
      />
    </Group>
  );
}

export default BrushChart;
