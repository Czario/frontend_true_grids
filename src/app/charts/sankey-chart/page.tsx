"use client";
import { ParentSize } from "@visx/responsive";
import SankeyChart from "@/modules/charts/components/SankeyChart";

function SankeyChartComp() {
  return (
    <div className="max-w-[1500px] h-[500px]">
      <ParentSize>
        {({ width, height }) => <SankeyChart width={width} height={height} />}
      </ParentSize>
    </div>
  );
}

export default SankeyChartComp;
