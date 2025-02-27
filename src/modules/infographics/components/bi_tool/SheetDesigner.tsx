// components/SheetDesigner.tsx
import React, { useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import Sidebar, { SidebarItem } from './Sidebar';
import { VisxLineChart, VisxBarChart, DataPoint } from './VisxCharts';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import AdvancedVisualizations from './AdvancedVisualizations';
import { Button, Container, Typography } from '@mui/material';
import ImageWidget from './widgets/ImageWidget';
import TextWidget from './widgets/TextWidget';

// Types for widgets and sheet design
export type WidgetType = 'line' | 'bar' | 'table' | 'pie' | 'scatter' | 'image' | 'text';

export interface Widget {
  id: string;
  type: WidgetType;
}

export interface SheetData {
  items: Widget[];
  layout: Layout[];
}

interface SheetDesignerProps {
  saveSheet: (sheet: SheetData) => void;
}

// Sample data (the same data is used for both charts)
const sampleLineData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Line Chart Data',
      data: [10, 20, 15, 30, 25],
    },
  ],
};

const sampleBarData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Bar Chart Data',
      data: [12, 19, 3, 5, 2],
    },
  ],
};

const sampleTableData = [
  { id: 1, name: 'Item A', value: 100 },
  { id: 2, name: 'Item B', value: 200 },
  { id: 3, name: 'Item C', value: 150 },
];

const SheetDesigner: React.FC<SheetDesignerProps> = ({ saveSheet }) => {
  const [items, setItems] = useState<Widget[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);

  const addItem = (type: WidgetType) => {
    const newItem: Widget = { id: Date.now().toString(), type };
    setItems((prev) => [...prev, newItem]);
    const newLayoutItem: Layout = {
      i: newItem.id,
      x: (items.length * 2) % 12,
      y: Infinity, // places item at the bottom
      w: 4,
      h: 4,
    };
    setLayout((prev) => [...prev, newLayoutItem]);
  };

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  const renderItem = (item: Widget) => {
    let content: React.ReactNode = null;
    if (item.type === 'line') {
      // Convert sampleLineData to DataPoint array
      const dataPoints: DataPoint[] = sampleLineData.datasets[0].data.map(
        (y: number, i: number) => ({ x: i, y })
      );
      content = <VisxLineChart data={dataPoints} width={300} height={200} />;
    } else if (item.type === 'bar') {
      const dataPoints: DataPoint[] = sampleBarData.datasets[0].data.map(
        (y: number, i: number) => ({ x: i, y })
      );
      content = <VisxBarChart data={dataPoints} width={300} height={200} />;
    } else if (item.type === 'table') {
      content = (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc' }}>ID</th>
              <th style={{ border: '1px solid #ccc' }}>Name</th>
              <th style={{ border: '1px solid #ccc' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {sampleTableData.map((row) => (
              <tr key={row.id}>
                <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{row.id}</td>
                <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{row.name}</td>
                <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (item.type === 'pie' || item.type === 'scatter') {
      const dataPoints: DataPoint[] = sampleLineData.datasets[0].data.map(
        (y: number, i: number) => ({ x: i, y })
      );
      content = <AdvancedVisualizations type={item.type} data={dataPoints} />;
    } else if (item.type === 'image') {
      content = <ImageWidget />;
    } else if (item.type === 'text') {
      content = <TextWidget />;
    }
    return (
      <div
        key={item.id}
        style={{
          background: '#f9f9f9',
          border: '1px solid #ddd',
          padding: '5px',
          overflow: 'auto',
          height: '100%',
        }}
      >
        {content}
      </div>
    );
  };

  const handleSaveSheet = () => {
    if (items.length === 0) {
      alert('Please add at least one widget before saving.');
      return;
    }
    saveSheet({ items, layout });
  };

  // Sidebar items for widget types
  const sidebarItems: SidebarItem[] = [
    { type: 'line', label: 'Line Chart' },
    { type: 'bar', label: 'Bar Chart' },
    { type: 'table', label: 'Table' },
    { type: 'pie', label: 'Pie Chart' },
    { type: 'scatter', label: 'Scatter Plot' },
    { type: 'image', label: 'Image' },
    { type: 'text', label: 'Text' },
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      <Sidebar title="Widgets" items={sidebarItems} onItemClick={addItem} />
      <Container style={{ flex: 1, padding: '10px' }}>
        <Typography variant="h4" gutterBottom>
          Sheet Designer
        </Typography>
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          width={800}
          onLayoutChange={onLayoutChange}
        >
          {items.map(renderItem)}
        </GridLayout>
        <div style={{ marginTop: '10px' }}>
          <Button variant="contained" color="primary" onClick={handleSaveSheet}>
            Save Sheet
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default SheetDesigner;
