"use client";

import { useMemo, useState } from "react";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import BarGroup from "@/modules/charts/components/BarGroup";
import LineGroup from "@/modules/charts/components/LineGroup";
import BarStack from "@/modules/charts/components/BarStack";
import YearRangeSlider from "@/modules/charts/components/YearRangeSlider";
import { Box } from "@mui/material";
import FincanceData from "./../../../../public/temp_data/FinancialData.json";

const financialData = FincanceData.data;

const keys = FincanceData.keys;
const data = financialData.map((item) => {
  return {
    date: item.date,
  };
});

export default function Home() {
  const [range, setRange] = useState<number[]>([0, financialData.length - 1]);

  const graphData = useMemo(() => {
    return financialData.slice(range[0], range[1] + 1); // Add 1 to include last index
  }, [range, financialData]);

  const setRangeSelection = (value: number[]) => {
    setRange(value);
  };
  return (
    <div>
      <Box>
        <YearRangeSlider
          data={data}
          range={range}
          setRangeSelection={setRangeSelection}
        />
      </Box>
      <div style={{ position: "relative" }}>
        <div>
          <ParentSize>
            {({ width, height }) => (
              <BarGroup
                width={1100}
                height={500}
                data={graphData}
                keys={keys}
                isQuarter={true}
              />
            )}
          </ParentSize>
        </div>
        <div className="relative p-8">
          <ParentSize>
            {({ width, height }) => (
              <LineGroup
                width={900}
                height={500}
                data={graphData}
                isQuarter={true}
                keys={keys}
              />
            )}
          </ParentSize>
        </div>
        <div className="relative p-8">
          <ParentSize>
            {({ width, height }) => (
              <BarStack
                width={900}
                height={500}
                data={graphData}
                keys={keys}
                isQuarter={true}
              />
            )}
          </ParentSize>
        </div>
      </div>
    </div>
  );
}
