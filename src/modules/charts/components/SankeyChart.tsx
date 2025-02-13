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
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { Text } from "@visx/text";
import energy from "./../../../../public/temp_data/energy.json";

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
  const [nodePadding, setNodePadding] = useState(40);
  const [nodeWidth, setNodeWidth] = useState(20);

  if (width < 10) return null;

  return (
    <div>
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
          <Sankey<NodeDatum, LinkDatum>
            root={processData()}
            nodeWidth={nodeWidth}
            size={[xMax, yMax]}
            nodePadding={nodePadding}
            nodeAlign={nodeAlignments[nodeAlignment]}
            nodeSort={(a, b) => (a.index ?? 0) - (b.index ?? 0)}
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
                    const nodeHeight = y1 - y0;
                    const isNearTop = false;
                    const textY = y1 + 15;
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
                        <Text
                          x={(x0 + x1) / 2}
                          y={textY}
                          fill="red"
                          fontSize={12}
                          textAnchor={textAnchor}
                          dy={isNearTop ? 0 : -5}
                        >
                          {name}
                        </Text>
                      </Group>
                    );
                  })}
                </Group>
              </>
            )}
          </Sankey>
        </svg>

        {/* Tooltip */}
        {tooltipOpen && (
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop}
            left={tooltipLeft}
          >
            {tooltipData}
          </TooltipWithBounds>
        )}
      </div>
    </div>
  );
}
