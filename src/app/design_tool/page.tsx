"use client";
import dynamic from 'next/dynamic';

const DesignTool = dynamic(
  () => import('@/modules/infographics/components/DesignTool'),
  { ssr: false }
);

export default function DashboardPage() {
  return <DesignTool />;
}