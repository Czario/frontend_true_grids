"use client";

import dynamic from "next/dynamic";
import ParentSize from "@visx/responsive/lib/components/ParentSize";

const SunBurst = dynamic(() => import("@/modules/charts/components/SunBurst"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative p-8">
      <ParentSize>
        {({ width, height }) => <SunBurst width={600} height={600} />}
      </ParentSize>
    </div>
  );
}
