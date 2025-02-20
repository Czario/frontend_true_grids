import React from 'react';
import { List, ListItem, ListItemText, ListItemButton, Divider } from '@mui/material';

interface ChartSidebarProps {
  onSelectChart: (chartType: string) => void;
}

const ChartSidebar: React.FC<ChartSidebarProps> = ({ onSelectChart }) => {
  const chartTypes = ['Bar Chart', 'Line Chart', 'Pie Chart'];

  return (
    <List component="nav">
      {chartTypes.map((chartType) => (
        <React.Fragment key={chartType}>
          <ListItemButton onClick={() => onSelectChart(chartType)}>
            <ListItemText primary={chartType} />
          </ListItemButton>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};

export default ChartSidebar;