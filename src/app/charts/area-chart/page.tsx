"use client";

import ParentSize from "@visx/responsive/lib/components/ParentSize";
import AreaChartWithBrush from "@/modules/charts/components/AreaChartWithBrush";

export default function Home() {
  return (
    <div className="relative p-8">
      <ParentSize>
        {({ width, height }) => (
          <AreaChartWithBrush width={width} height={400} />
        )}
      </ParentSize>
    </div>
  );
}
