"use client";
import dynamic from 'next/dynamic';

const FinancialInfographic = dynamic(
  () => import('@/modules/infographics/components/SortableComponent'),
  { ssr: false }
);

export default function DashboardPage() {
  return <FinancialInfographic />;
}
