"use client";
import { ParentSize } from "@visx/responsive";
import { WaterfallChart } from "@/modules/charts/components/WaterfallChart";

const data = [
  { month: "Jan", earnings: 23 },
  { month: "Feb", earnings: 18 },
  { month: "Mar", earnings: -14 },
  { month: "Apr", earnings: 4 },
  { month: "May", earnings: -26 },
  { month: "Jun", earnings: 10 },
  { month: "Jul", earnings: 32 },
];

function WaterFallChartComp() {
  return (
    <div className="w-[400px] h-[600px]">
      <ParentSize>
        {({ width, height }) => (
          <WaterfallChart
            width={900}
            height={600}
            data={data}
            xAccessor={(datum) => datum.month}
            yAccessor={(datum) => datum.earnings}
            yLabel="Earnings"
          />
        )}
      </ParentSize>
    </div>
  );
}

export default WaterFallChartComp;
