import React, { useMemo, useCallback, useRef, useState } from "react";
import { Group } from "@visx/group";
import { Circle } from "@visx/shape";
import { scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { withTooltip, Tooltip } from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { localPoint } from "@visx/event";
import { GridColumns, GridRows } from "@visx/grid";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";

export type ScatterPlotProps = {
  width: number;
  height: number;
  selectedStocks: string[];
  xAxisField: string;
  yAxisField: string;
  financialData: FinancialData[];
  keys: KeyMetadata[];
};

type FinancialData = {
  stock: string;
  [key: string]: number | string;
};

export interface KeyMetadata {
  key: string;
  color: string;
}

let tooltipTimeout: number;

export default withTooltip<ScatterPlotProps, FinancialData>(
  ({
    width,
    height,
    selectedStocks,
    financialData = [],
    keys = [],
    xAxisField,
    yAxisField,
    hideTooltip,
    showTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  }: ScatterPlotProps & WithTooltipProvidedProps<FinancialData>) => {
    if (width < 10) return null;
    const [sizeMultiplier, setSizeMultiplier] = useState(1);
    const svgRef = useRef<SVGSVGElement>(null);
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };

    const filteredData = useMemo(
      () => financialData.filter((d) => selectedStocks.includes(d.stock)),
      [selectedStocks]
    );

    const colorScale = scaleOrdinal<string, string>({
      domain: keys.map((k) => k.key),
      range: keys.map((k) => k.color),
    });

    const xMax = width - margin.right - margin.left;
    const xScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [
            Math.min(...financialData.map((d) => d[xAxisField] as number)) - 20,
            Math.max(...financialData.map((d) => d[xAxisField] as number)) + 20,
          ],
          range: [margin.left, width - margin.right],
        }),
      [width, xAxisField]
    );

    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [
            Math.min(...financialData.map((d) => d[yAxisField] as number)) - 20,
            Math.max(...financialData.map((d) => d[yAxisField] as number)) + 20,
          ],
          range: [height - margin.bottom, margin.top],
        }),
      [height, yAxisField]
    );
    const yMax = height - margin.bottom - margin.top;

    const sizeScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [
            Math.min(...financialData.map((d) => d.netIncome as number)),
            Math.max(...financialData.map((d) => d.netIncome as number)),
          ],
          range: [6, 18],
        }),
      []
    );

    const handleMouseMove = useCallback(
      (event: React.MouseEvent | React.TouchEvent, data: FinancialData) => {
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
        if (!svgRef.current) return;

        const point = localPoint(svgRef.current, event);
        if (!point) return;

        showTooltip({
          tooltipLeft: point.x,
          tooltipTop: point.y,
          tooltipData: data,
        });
      },
      [showTooltip]
    );

    const handleMouseLeave = useCallback(() => {
      tooltipTimeout = window.setTimeout(() => {
        hideTooltip();
      }, 300);
    }, [hideTooltip]);

    return (
      <div>
        <Box sx={{ width: 300, marginBottom: 2 }}>
          <Slider
            value={sizeMultiplier}
            onChange={(_, value) => setSizeMultiplier(value as number)}
            min={0.5}
            max={2}
            step={0.1}
            valueLabelDisplay="auto"
            aria-labelledby="size-slider"
          />
        </Box>
        <svg width={width} height={height} ref={svgRef}>
          <rect width={width} height={height} fill="#f4f4f4" rx={14} />
          <GridRows
            scale={yScale}
            width={xMax}
            left={margin.left}
            stroke="#e2e8f0"
            strokeOpacity={0.8}
          />
          <GridColumns
            scale={xScale}
            top={margin.top}
            height={yMax}
            stroke="#e2e8f0"
            strokeOpacity={0.8}
          />

          <AxisBottom
            scale={xScale}
            top={height - margin.bottom}
            stroke="#333"
            tickStroke="#333"
            tickLabelProps={() => ({
              fill: "#333",
              fontSize: 12,
              textAnchor: "middle",
            })}
          />

          <AxisLeft
            scale={yScale}
            left={margin.left}
            stroke="#333"
            tickStroke="#333"
            tickLabelProps={() => ({
              fill: "#333",
              fontSize: 12,
              textAnchor: "end",
              dx: "-4",
            })}
          />

          <Group>
            {filteredData.map((point, i) => {
              const cx = xScale(point[xAxisField]);
              const cy = yScale(point[yAxisField]);
              const radius = sizeScale(point.netIncome);
              const color = colorScale(point.stock) as string;

              return (
                <Circle
                  key={`point-${point.stock}`}
                  cx={cx}
                  cy={cy}
                  r={radius * sizeMultiplier}
                  fill={color}
                  stroke="white"
                  strokeWidth={1.5}
                  onMouseMove={(e) => handleMouseMove(e, point)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}
          </Group>
        </svg>
        {tooltipOpen &&
          tooltipData &&
          tooltipLeft != null &&
          tooltipTop != null && (
            <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
              <div>
                <strong>Stock:</strong> {tooltipData.stock}
              </div>
              <div>
                <strong>{xAxisField}:</strong> {tooltipData[xAxisField]}
              </div>
              <div>
                <strong>{yAxisField}:</strong> {tooltipData[yAxisField]}
              </div>
              <div>
                <strong>Net Income:</strong> {tooltipData.netIncome}
              </div>
            </Tooltip>
          )}
      </div>
    );
  }
);
