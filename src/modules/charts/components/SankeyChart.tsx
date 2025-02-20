import React, { useState, useMemo } from "react";
import {
  Sankey,
  sankeyCenter,
  SankeyNode as VisxNodeDatum,
} from "@visx/sankey";
import { Group } from "@visx/group";
import { LinkHorizontal } from "@visx/shape";
import { Text } from "@visx/text";
import { Tooltip, defaultStyles } from "@visx/tooltip";
import {
  SankeyLink,
  SankeyDataType,
  NodeDatum,
} from "@/modules/charts/interfaces/Sankey";
export const primaryColor = "#2394DF";
export const accentColor1 = "#71E7D6";
export const accentTextColor = "#6f7288";
export const subTextColor = "#C9CBCF";

const defaultMargin = { top: 50, left: 20, right: 20, bottom: 20 };

export type DynamicSankeyChartProps = {
  width: number;
  // Optional passed height – we’ll choose the smaller of the passed value and our computed height.
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  sankeyData: SankeyDataType;
};

export default function DynamicSankeyChart({
  width,
  height: passedHeight,
  margin = defaultMargin,
  sankeyData,
}: DynamicSankeyChartProps) {
  if (width < 10) return null;

  // === DYNAMIC HEIGHT CALCULATION ===
  // Assume a constant height for each node. Adjust this constant as needed.
  const perNodeHeight = 60;

  const sourceNodes = useMemo(
    () =>
      sankeyData.nodes.filter((node: NodeDatum) =>
        sankeyData.links.every((link: SankeyLink) => link.target !== node.name)
      ),
    [sankeyData]
  );

  const sinkNodes = useMemo(
    () =>
      sankeyData.nodes.filter((node: NodeDatum) =>
        sankeyData.links.every((link: SankeyLink) => link.source !== node.name)
      ),
    [sankeyData]
  );

  const intermediateNodes = useMemo(
    () =>
      sankeyData.nodes.filter(
        (node: NodeDatum) =>
          sankeyData.links.some(
            (link: SankeyLink) => link.target === node.name
          ) &&
          sankeyData.links.some((link: SankeyLink) => link.source === node.name)
      ),
    [sankeyData]
  );

  // Get the maximum count among the columns
  const maxNodes = Math.max(
    sourceNodes.length,
    sinkNodes.length,
    intermediateNodes.length
  );
  // Compute a dynamic height based on node count plus vertical margins.
  const computedHeight = maxNodes * perNodeHeight + margin.top + margin.bottom;
  // If a height was passed, choose the smaller of that or the computed height.
  const finalHeight = passedHeight
    ? Math.min(passedHeight, computedHeight)
    : computedHeight;
  // === END DYNAMIC HEIGHT CALCULATION ===

  const xMax = width - margin.left - margin.right;
  const yMax = finalHeight - margin.top - margin.bottom;

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
    isHoveredOnLeft: boolean;
  }>({ visible: false, x: 0, y: 0, content: "", isHoveredOnLeft: false });

  const processData = useMemo(() => {
    const nodes: NodeDatum[] = sankeyData.nodes.map(
      (node: NodeDatum, index: number) => ({
        ...node,
        index,
      })
    );
    nodes.sort((a: NodeDatum, b: NodeDatum) => (a.index ?? 0) - (b.index ?? 0));

    const links = sankeyData.links.map((item: any) => ({
      ...item,
      source: sankeyData.nodes.findIndex(
        (node: any) => node.name === item.source
      ),
      target: sankeyData.nodes.findIndex(
        (node: any) => node.name === item.target
      ),
    }));

    return { nodes, links };
  }, [sankeyData]);

  // Sankey layout settings
  const sankeySettings = {
    nodeWidth: 20,
    nodePadding: 35,
    size: [xMax, yMax] as [number, number],
    nodeAlign: sankeyCenter,
    nodeSort: (a: NodeDatum, b: NodeDatum) => (a.index ?? 0) - (b.index ?? 0),
  };

  // Offsets for labels (always drawn above the node)
  const nodeTextOffset = 16;
  const valueLabelOffset = -12;

  // Helper for horizontal text alignment based on node x positions
  const getTextAnchor = (node: NodeDatum) => {
    if (node.x0 === undefined || node.x1 === undefined) return "middle";
    if (node.x0 < xMax / 3) return "start";
    if (node.x1 > (2 * xMax) / 3) return "end";
    return "middle";
  };

  return (
    <div style={{ borderRadius: 5, position: "relative" }}>
      <svg width={xMax} height={yMax} style={{ overflow: "visible" }}>
        <Group transform={`translate(0, ${margin.top})`}>
          <Sankey<NodeDatum, SankeyLink> root={processData} {...sankeySettings}>
            {({ graph, createPath }) => (
              <>
                {/* Render Links */}
                <Group>
                  {graph.links.map((link, i) => (
                    <LinkHorizontal
                      key={i}
                      data={link}
                      path={createPath}
                      fill="transparent"
                      stroke={primaryColor}
                      strokeWidth={link.width}
                      strokeOpacity={0.5}
                    />
                  ))}
                </Group>

                {/* Render Nodes */}
                <Group>
                  {graph.nodes.map((node, i) => {
                    const { x0, x1, y0, y1 } = node;
                    if (
                      x0 == undefined ||
                      x1 == undefined ||
                      y0 === undefined ||
                      y1 == undefined
                    )
                      return null;
                    const nodeWidth = x1 - x0;
                    const nodeHeight = y1 - y0;
                    const textAnchor = getTextAnchor(node);
                    // Always position labels above the rectangle.
                    const nameLabelY = -nodeTextOffset;
                    const valueLabelY = -nodeTextOffset - valueLabelOffset;
                    return (
                      <Group
                        key={i}
                        transform={`translate(${x0}, ${y0})`}
                        onMouseEnter={(event) => {
                          const { offsetX, offsetY } = event.nativeEvent;
                          setTooltip({
                            visible: true,
                            x: offsetX + margin.left,
                            y: offsetY + margin.top,
                            content: `${node.name}: US$${node.label}`,
                            isHoveredOnLeft: false,
                          });
                        }}
                        onMouseMove={(event) => {
                          setTooltip((prev) => ({
                            ...prev,
                            x: x0 + nodeWidth / 2 + margin.left,
                            y: y0 + margin.top,
                            isHoveredOnLeft: false,
                          }));
                        }}
                        onMouseLeave={() => {
                          setTooltip({
                            visible: false,
                            x: 0,
                            y: 0,
                            content: "",
                            isHoveredOnLeft: false,
                          });
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Node Rectangle */}
                        <rect
                          width={nodeWidth}
                          height={nodeHeight}
                          fill={primaryColor}
                        />
                        {/* Node Name Label */}
                        <Text
                          x={
                            textAnchor === "start"
                              ? 0
                              : textAnchor === "end"
                              ? nodeWidth
                              : nodeWidth / 2
                          }
                          y={nameLabelY}
                          textAnchor={textAnchor}
                          fill={accentTextColor}
                          fontSize={12}
                        >
                          {node.name.length > 12
                            ? `${node.name.slice(0, 12)}...`
                            : node.name}
                        </Text>
                        {/* Node Value Label */}
                        <Text
                          x={
                            textAnchor === "start"
                              ? 0
                              : textAnchor === "end"
                              ? nodeWidth
                              : nodeWidth / 2
                          }
                          y={valueLabelY}
                          textAnchor={textAnchor}
                          fill={subTextColor}
                          fontSize={12}
                        >
                          {`US$${node.label}`}
                        </Text>
                      </Group>
                    );
                  })}
                </Group>
              </>
            )}
          </Sankey>
        </Group>
      </svg>

      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            top: 0,
            transform: `translate(${tooltip.x ?? 0}px, ${tooltip.y - 50}px)`,
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
            {tooltip.content}
          </Tooltip>
        </div>
      )}
    </div>
  );
}
