import React, { useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import Sidebar from './Sidebar';
import { VisxLineChart, VisxBarChart, DataPoint } from './VisxCharts';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { SheetData } from './SheetDesigner';
import AdvancedVisualizations from './AdvancedVisualizations';
import { Button, Container, TextField, Typography, IconButton, Paper, Menu, MenuItem } from '@mui/material';
import ImageWidget from './widgets/ImageWidget';
import TextWidget from './widgets/TextWidget';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';

export interface DashboardItem {
  id: string;
  sheetId: string;
}

export interface DashboardData {
  name: string;
  items: DashboardItem[];
  layout: Layout[];
}

interface DashboardDesignerProps {
  sheets: (SheetData & { id: number })[];
  saveDashboard: (dashboard: DashboardData) => void;
}

const DashboardDesigner: React.FC<DashboardDesignerProps> = ({ sheets, saveDashboard }) => {
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [widgetStates, setWidgetStates] = useState<{ [key: string]: any }>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const addSheetToDashboard = (sheetId: string) => {
    if (!sheetId) return;
    const newItem = { id: Date.now().toString(), sheetId };
    setDashboardItems((prev) => [...prev, newItem]);
    const newLayoutItem: Layout = {
      i: newItem.id,
      x: (dashboardItems.length * 2) % 12,
      y: Infinity,
      w: 4,
      h: 4,
    };
    setLayout((prev) => [...prev, newLayoutItem]);
  };

  const removeSheetFromDashboard = (id: string) => {
    setDashboardItems((prev) => prev.filter((item) => item.id !== id));
    setLayout((prev) => prev.filter((layoutItem) => layoutItem.i !== id));
  };

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItemId(null);
  };

  const handleEditSheet = () => {
    // Implement edit functionality here
    handleMenuClose();
  };

  const handleRemoveSheet = () => {
    if (selectedItemId) {
      removeSheetFromDashboard(selectedItemId);
    }
    handleMenuClose();
  };

  // Build sidebar items from available sheets
  const sidebarItems = sheets.map((sheet) => ({
    type: sheet.id.toString(),
    label: `Sheet ${sheet.id}`,
  }));

  // Render a simplified preview of a sheet's content
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
      } else if (item.type === 'pie' || item.type === 'scatter') {
        const dataPoints: DataPoint[] = [10, 20, 15, 30, 25].map((y, i) => ({ x: i, y }));
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
            marginBottom: '10px',
            border: '1px solid #ddd',
            padding: '10px',
            height: '150px',
            overflow: 'hidden',
            backgroundColor: '#f9f9f9',
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

  const handleSaveDashboard = () => {
    if (dashboardItems.length === 0) {
      alert('Please add at least one sheet to the dashboard.');
      return;
    }
    if (!dashboardName) {
      alert('Please enter a dashboard name.');
      return;
    }
    saveDashboard({ name: dashboardName, items: dashboardItems, layout });
  };

  const handleSidebarItemClick = (sheetId: string) => {
    addSheetToDashboard(sheetId);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      <Sidebar title="Available Sheets" items={sidebarItems} onItemClick={handleSidebarItemClick} />
      <Container style={{ flex: 1, padding: '10px' }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Designer
        </Typography>
        <TextField
          label="Dashboard Name"
          variant="outlined"
          fullWidth
          value={dashboardName}
          onChange={(e) => setDashboardName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          width={800}
          onLayoutChange={onLayoutChange}
        >
          {dashboardItems.map((item) => {
            const sheet = getSheetById(item.sheetId);
            return (
              <Paper
                key={item.id}
                style={{ background: '#fff', border: '1px solid #ccc', padding: '10px', overflow: 'auto', position: 'relative' }}
              >
                <IconButton
                  style={{ position: 'absolute', top: '5px', right: '5px' }}
                  onClick={(event) => handleMenuOpen(event, item.id)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Typography variant="subtitle1" gutterBottom>
                  {sheet ? `Sheet ${sheet.id}` : 'Sheet not found'}
                </Typography>
                {sheet ? renderSheetPreview(sheet) : null}
              </Paper>
            );
          })}
        </GridLayout>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditSheet}>Edit</MenuItem>
          <MenuItem onClick={handleRemoveSheet}>Remove</MenuItem>
        </Menu>
        <div style={{ marginTop: '10px' }}>
          <Button variant="contained" color="primary" onClick={handleSaveDashboard}>
            Save Dashboard
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default DashboardDesigner;
