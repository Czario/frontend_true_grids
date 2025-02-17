"use client";
import { ParentSize } from "@visx/responsive";
import SankeyChart from "@/modules/charts/components/InsiderTradingVolume";

function SankeyChartComp() {
  return (
    <div>
      <ParentSize>
        {({ width, height }) => <SankeyChart width={500} height={400} />}
      </ParentSize>
    </div>
  );
}

export default SankeyChartComp;
