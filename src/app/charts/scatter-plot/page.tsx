"use client";

import ParentSize from "@visx/responsive/lib/components/ParentSize";
import AreaChartWithBrush from "@/modules/charts/components/ScatterPlot";

export default function Home() {
  return (
    <div className="relative p-8" style={{ width: "500px", height: "500px" }}>
      <ParentSize>
        {({ width, height }) => (
          <AreaChartWithBrush width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
}
