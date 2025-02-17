import React, { useState } from "react";
import {
  Sankey,
  sankeyCenter,
  sankeyRight,
  sankeyLeft,
  sankeyJustify,
  SankeyNode,
} from "@visx/sankey";
import { Group } from "@visx/group";
import { BarRounded, LinkHorizontal } from "@visx/shape";
import { useTooltip, Tooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { Text } from "@visx/text";
import energy from "./../../../../public/temp_data/VerticalSankeyMock.json";

export const background = "#f7f9fc";
export const nodeColor = "#4A90E2";
export const linkColor = "rgba(74, 144, 226, 0.5)";
export const textColor = "#ffffff";

type NodeDatum = { name: string };
type LinkDatum = {};

const nodeAlignments = {
  sankeyCenter,
  sankeyJustify,
  sankeyLeft,
  sankeyRight,
} as const;

const defaultMargin = { top: 50, left: 50, right: 50, bottom: 50 };

export type SankeyDemoProps = {
  width: number;
  height: number;
  showControls?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function SankeyDemo({
  width,
  height,
  margin = defaultMargin,
}: SankeyDemoProps) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const processData = () => {
    let links = energy.links.map((item) => ({
      ...item,
      source: energy.nodes.findIndex((node) => node.name === item.source),
      target: energy.nodes.findIndex((node) => node.name === item.target),
    }));

    let nodes = [...energy.nodes].map((node, index) => ({ ...node, index }));

    nodes.sort((a, b) => a.index - b.index); // Sort by index before passing to Sankey

    return { nodes, links };
  };

  const [nodeAlignment, setTileMethod] =
    useState<keyof typeof nodeAlignments>("sankeyCenter");
  const [nodePadding, setNodePadding] = useState(100);
  const [nodeWidth, setNodeWidth] = useState(40);

  if (width < 10) return null;

  return (
    <div className=" flex items-center justify-center">
      <style>{`
        .visx-sankey-link:hover {
          stroke-opacity: 0.7;
        }
        .visx-sankey-node:hover {
          filter: brightness(1.3);
        }
        .visx-sankey-demo-container {
          background: ${background};
          padding: ${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px;
          border-radius: 5px;
          position: relative;
        }
      `}</style>
      <div className="visx-sankey-demo-container">
        <svg width={xMax} height={yMax}>
          <g transform={`rotate(-90) translate(-${xMax}, 0)`}>
            <Sankey<NodeDatum, LinkDatum>
              root={processData()}
              nodeWidth={nodeWidth}
              size={[xMax, yMax]}
              nodePadding={nodePadding}
            >
              {({ graph, createPath }) => (
                <>
                  {/* Links */}
                  <Group>
                    {graph.links.map((link, i) => (
                      <LinkHorizontal
                        key={i}
                        className="visx-sankey-link"
                        data={link}
                        path={createPath}
                        fill="transparent"
                        stroke={linkColor}
                        strokeWidth={link.width}
                        strokeOpacity={0.5}
                        onPointerMove={(event) => {
                          const coords = localPoint(
                            (event.target as SVGElement).ownerSVGElement,
                            event
                          );
                          showTooltip({
                            tooltipData: `${
                              (link.source as SankeyNode<NodeDatum, LinkDatum>)
                                .name
                            } > ${
                              (link.target as SankeyNode<NodeDatum, LinkDatum>)
                                .name
                            } = ${link.value}`,
                            tooltipTop: (coords?.y ?? 0) + 10,
                            tooltipLeft: (coords?.x ?? 0) + 10,
                          });
                        }}
                        onMouseOut={hideTooltip}
                      />
                    ))}
                  </Group>

                  {/* Nodes */}
                  <Group>
                    {graph.nodes.map(({ y0, y1, x0, x1, name }, i) => {
                      if (
                        y0 == undefined ||
                        y1 == undefined ||
                        x0 == undefined ||
                        x1 == undefined
                      ) {
                        return null;
                      }
                      const nodeHeight = y1 - y0;
                      const isNearTop = false;
                      const textAnchor = "middle";

                      return (
                        <Group key={i}>
                          {/* Node Bar */}
                          <BarRounded
                            key={i}
                            className="visx-sankey-node"
                            width={x1 - x0}
                            height={nodeHeight}
                            x={x0}
                            y={y0}
                            radius={3}
                            all
                            fill={nodeColor}
                            onPointerMove={(event) => {
                              const coords = localPoint(
                                (event.target as SVGElement).ownerSVGElement,
                                event
                              );
                              showTooltip({
                                tooltipData: name,
                                tooltipTop: (coords?.y ?? 0) + 10,
                                tooltipLeft: (coords?.x ?? 0) + 10,
                              });
                            }}
                            onMouseOut={hideTooltip}
                          />

                          {/* Node Label */}
                          <g
                            transform={`rotate(90, ${(x0 + x1) / 2}, ${
                              (y0 + y1) / 2
                            })`}
                          >
                            <Text
                              x={(x0 + x1) / 2}
                              y={(y0 + y1) / 2}
                              fill="green" // Adjust color based on nodeColor contrast
                              fontSize={14}
                              textAnchor="middle"
                              dy="0.35em" // Center vertically
                              width={y1 - y0 - 6} // Ensure text fits inside bar with padding
                            >
                              {name.length * 8 > y1 - y0 - 6
                                ? `${name.slice(
                                    0,
                                    Math.floor((y1 - y0 - 6) / 8)
                                  )}...`
                                : name}
                            </Text>
                          </g>
                        </Group>
                      );
                    })}
                  </Group>
                </>
              )}
            </Sankey>
          </g>
        </svg>

        {/* Tooltip */}
        {tooltipOpen && (
          <Tooltip key={Math.random()} top={tooltipTop} left={tooltipLeft}>
            {tooltipData}
          </Tooltip>
        )}
      </div>
    </div>
  );
}
