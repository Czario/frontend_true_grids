import React from 'react';
import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';

interface RightSidebarProps {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  allCharts: string[];
  selectedChart: string[];
  handleChartClick: (chart: string) => void;
}

const defaultIcons: Record<string, React.ReactElement> = {
  'Bar Chart': <BarChartIcon />,
  'Line Chart': <ShowChartIcon />,
  'Pie Chart': <PieChartIcon />,
  'Scatter Chart': <ScatterPlotIcon />,
};

const RightSidebar: React.FC<RightSidebarProps> = ({
  isSidebarExpanded,
  toggleSidebar,
  allCharts,
  selectedChart,
  handleChartClick,
}) => {
  return (
    <Box
      sx={{
        width: isSidebarExpanded ? '10%' : '5%',
        borderLeft: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'white',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <IconButton onClick={toggleSidebar} sx={{ mb: 1, alignSelf: 'flex-start' }}>
        {isSidebarExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {allCharts.map(chart => (
          <IconButton
            key={chart}
            onClick={() => handleChartClick(chart)}
            sx={{
              border: selectedChart.includes(chart) ? '2px solid' : 'none',
              borderColor: 'primary.main',
            }}
          >
            {defaultIcons[chart]}
          </IconButton>
        ))}
      </Box>
    </Box>
  );
};

export default RightSidebar;