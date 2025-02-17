"use client";
import { ParentSize } from "@visx/responsive";
import SankeyChart from "@/modules/charts/components/VerticalSankeyChart";

function SankeyChartComp() {
  return (
    <div>
      <ParentSize>
        {({ width, height }) => <SankeyChart width={700} height={700} />}
      </ParentSize>
    </div>
  );
}

export default SankeyChartComp;
