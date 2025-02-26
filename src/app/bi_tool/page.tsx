"use client";
import dynamic from 'next/dynamic';

const BI_Home = dynamic(
  () => import('@/modules/infographics/components/bi_tool/Home'),
  { ssr: false }
);

export default function DashboardPage() {
  return <BI_Home />;
}