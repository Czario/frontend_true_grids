"use client";

import ScatterPlotWithOptions from "@/modules/charts/components/ScatterPlotWithOptions";

export default function Home() {
  return (
    <div className="relative p-8" style={{ width: "500px", height: "500px" }}>
      <ScatterPlotWithOptions />
    </div>
  );
}
