"use client";
import React, { useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Box } from '@mui/material';

const initialLayout: Layout[] = [
  { i: 'Item 1', x: 0,  y: 0,  w: 4, h: 4 },
  { i: 'Item 2', x: 4,  y: 0,  w: 4, h: 2 },
  { i: 'Item 3', x: 8,  y: 0,  w: 4, h: 2 },
  { i: 'Item 4', x: 0,  y: 4,  w: 4, h: 2 },
  { i: 'Item 5', x: 4,  y: 4,  w: 4, h: 4 },
  { i: 'Item 6', x: 8,  y: 4,  w: 4, h: 4 },
  { i: 'Item 7', x: 0,  y: 6,  w: 4, h: 2 },
  { i: 'Item 8', x: 4,  y: 8,  w: 4, h: 2 },
  { i: 'Item 9', x: 8,  y: 8,  w: 4, h: 2 },
  { i: 'Item 10', x: 0, y: 10, w: 4, h: 2 },
  { i: 'Item 11', x: 4, y: 10, w: 4, h: 2 },
  { i: 'Item 12', x: 8, y: 10, w: 4, h: 2 },
  { i: 'Item 13', x: 0, y: 12, w: 4, h: 2 },
  { i: 'Item 14', x: 4, y: 12, w: 4, h: 2 },
];

const FinancialInfographic: React.FC = () => {
  const [layout, setLayout] = useState<Layout[]>(initialLayout);
  const items = Array.from({ length: 14 }, (_, index) => `Item ${index + 1}`);

  return (
    <Box sx={{ width: '100%', padding: '20px', background: '#f5f5f5' }}>
      <h1 style={{ textAlign: 'center', color: '#e82127' }}>
        Tesla Financial Infographic
      </h1>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        draggableHandle=".drag-handle"
      >
        {items.map((item) => (
          <div
            key={item}
            style={{
              background: '#fff',
              border: '2px solid #e82127',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div
              className="drag-handle"
              style={{
                background: '#e82127',
                color: '#fff',
                padding: '6px 10px',
                cursor: 'move',
                fontWeight: 'bold',
              }}
            >
              {item}
            </div>
            <div style={{ padding: '10px', flex: 1 }}>
              Financial data goes here...
            </div>
          </div>
        ))}
      </GridLayout>
    </Box>
  );
};

export default FinancialInfographic;