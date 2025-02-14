"use client";
import { ParentSize } from "@visx/responsive";
import SankeyChart from "@/modules/charts/components/SankeyChart";

function SankeyChartComp() {
  return (
    <div>
      <ParentSize>
        {({ width, height }) => <SankeyChart width={1500} height={700} />}
      </ParentSize>
    </div>
  );
}

export default SankeyChartComp;
