"use client";
import { ParentSize } from "@visx/responsive";
import DrilldownBarChart from "@/modules/charts/components/BarChartWithImage";

function SankeyChartComp() {
  return (
    <div>
      <ParentSize>
        {({ width, height }) => <DrilldownBarChart width={600} height={400} />}
      </ParentSize>
    </div>
  );
}

export default SankeyChartComp;
