import React from 'react';
import { VisxPieChart, VisxScatterPlot, DataPoint } from './VisxCharts';

interface AdvancedVisualizationsProps {
  type: 'pie' | 'scatter';
  data: DataPoint[];
}

const AdvancedVisualizations: React.FC<AdvancedVisualizationsProps> = ({ type, data }) => {
  let content: React.ReactNode = null;

  if (type === 'pie') {
    content = <VisxPieChart data={data} width={300} height={300} />;
  } else if (type === 'scatter') {
    content = <VisxScatterPlot data={data} width={300} height={300} />;
  }

  return <div>{content}</div>;
};

export default AdvancedVisualizations;
