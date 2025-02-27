import React from 'react';
import { WidgetType } from './SheetDesigner';
import { List, ListItem, ListItemText, ListItemIcon, Paper, Typography, ListItemButton } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DashboardIcon from '@mui/icons-material/Dashboard';

export interface SidebarItem {
  type: WidgetType | string;
  label: string;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  onItemClick: (type: WidgetType | string) => void;
}

const getIcon = (type: WidgetType | string) => {
  switch (type) {
    case 'line':
      return <ShowChartIcon />;
    case 'bar':
      return <BarChartIcon />;
    case 'table':
      return <TableChartIcon />;
    case 'pie':
      return <PieChartIcon />;
    case 'scatter':
      return <ScatterPlotIcon />;
    case 'image':
      return <ImageIcon />;
    case 'text':
      return <TextFieldsIcon />;
    default:
      return <DashboardIcon />;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ title, items, onItemClick }) => {
  return (
    <Paper elevation={3} style={{ width: '220px', height: '100%', boxSizing: 'border-box' }}>
      <Typography variant="h6" style={{ padding: '10px' }}>
        {title}
      </Typography>
      <List>
        {items.map((item) => (
          <ListItemButton key={item.type} onClick={() => onItemClick(item.type)}>
            <ListItemIcon>{getIcon(item.type)}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;
