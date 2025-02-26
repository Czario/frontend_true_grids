// components/DashboardList.tsx
import React from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { VisxLineChart, VisxBarChart, DataPoint } from './VisxCharts';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { SheetData } from './SheetDesigner';
import { DashboardData } from './DashboardDesigner';

interface DashboardListProps {
  dashboards: (DashboardData & { id: number })[];
  sheets: (SheetData & { id: number })[];
}

const DashboardList: React.FC<DashboardListProps> = ({ dashboards, sheets }) => {
  const dashboardLayout: Layout[] = dashboards.map((dashboard, index) => ({
    i: dashboard.id.toString(),
    x: (index * 4) % 12,
    y: Infinity,
    w: 4,
    h: 6,
  }));

  const renderSheetPreview = (sheet: SheetData & { id: number }) => {
    return sheet.items.map((item) => {
      let content: React.ReactNode = null;
      if (item.type === 'line') {
        const dataPoints: DataPoint[] = [10, 20, 15, 30, 25].map((y, i) => ({ x: i, y }));
        content = <VisxLineChart data={dataPoints} width={200} height={150} />;
      } else if (item.type === 'bar') {
        const dataPoints: DataPoint[] = [12, 19, 3, 5, 2].map((y, i) => ({ x: i, y }));
        content = <VisxBarChart data={dataPoints} width={200} height={150} />;
      } else if (item.type === 'table') {
        content = (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc' }}>ID</th>
                <th style={{ border: '1px solid #ccc' }}>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>1</td>
                <td style={{ border: '1px solid #ccc', textAlign: 'center' }}>Item</td>
              </tr>
            </tbody>
          </table>
        );
      }
      return (
        <div
          key={item.id}
          style={{
            marginBottom: '2px',
            border: '1px solid #ddd',
            padding: '2px',
            height: '50px',
            overflow: 'hidden',
          }}
        >
          {content}
        </div>
      );
    });
  };

  const getSheetById = (id: string): (SheetData & { id: number }) | undefined => {
    return sheets.find((s) => s.id.toString() === id) as (SheetData & { id: number }) | undefined;
  };

  return (
    <div>
      <h2>Dashboard List</h2>
      {dashboards.length === 0 ? (
        <p>No dashboards saved. Create one in Dashboard Designer.</p>
      ) : (
        <GridLayout className="layout" layout={dashboardLayout} cols={12} rowHeight={30} width={1200}>
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              style={{ background: '#fff', border: '1px solid #ccc', padding: '5px', overflow: 'auto' }}
            >
              <h4>{dashboard.name}</h4>
              {dashboard.items.map((item) => {
                const sheet = getSheetById(item.sheetId);
                return (
                  <div key={item.id} style={{ marginBottom: '5px' }}>
                    {sheet ? renderSheetPreview(sheet) : <p>Sheet not found</p>}
                  </div>
                );
              })}
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  );
};

export default DashboardList;
