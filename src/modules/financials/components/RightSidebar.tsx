import React, { useState } from 'react';
import { Box, IconButton, Tabs, Tab, Dialog, DialogTitle, DialogContent } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronLeft';
import ChevronLeftIcon from '@mui/icons-material/ChevronRight';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import { SketchPicker } from 'react-color';
import Settings from './Settings';

interface RightSidebarProps {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  allCharts: string[];
  selectedChart: string[];
  handleChartClick: (chart: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  barColor: string;
  setBarColor: (color: string) => void;
  labelColor: string;
  setLabelColor: (color: string) => void;
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
  backgroundColor,
  setBackgroundColor,
  barColor,
  setBarColor,
  labelColor,
  setLabelColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerType, setColorPickerType] = useState<'background' | 'bar' | 'label'>('background');

  const handleToggleSidebar = () => {
    setIsExpanded(!isExpanded);
    toggleSidebar();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleColorPickerOpen = (type: 'background' | 'bar' | 'label') => {
    setColorPickerType(type);
    setColorPickerOpen(true);
  };

  const handleColorChange = (color: any) => {
    if (colorPickerType === 'background') {
      setBackgroundColor(color.hex);
    } else if (colorPickerType === 'bar') {
      setBarColor(color.hex);
    } else if (colorPickerType === 'label') {
      setLabelColor(color.hex);
    }
  };

  return (
    <Box
      sx={{
        width: isExpanded ? '10%' : '2%',
        borderLeft: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'white',
        p: isExpanded ? 2 : 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto', // Make the sidebar scrollable
        transition: 'width 0.3s, padding 0.3s',
        position: 'relative',
      }}
    >
      <IconButton onClick={handleToggleSidebar} sx={{ mb: 1, position: 'absolute', top: 8, left: isExpanded ? -10 : -8, zIndex: 1 }}>
        {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
      <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth" sx={{ mt: 4 }}>
        <Tab icon={<BarChartIcon />} />
        <Tab icon={<SettingsIcon />} />
      </Tabs>
      {isExpanded && tabIndex === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 1,
            mt: 4,
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
      )}
      {isExpanded && tabIndex === 1 && (
        <Box sx={{ mt: 4, width: '100%' }}>
          <Settings
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            barColor={barColor}
            setBarColor={setBarColor}
            labelColor={labelColor}
            setLabelColor={setLabelColor}
          />
        </Box>
      )}
      <Dialog open={colorPickerOpen} onClose={() => setColorPickerOpen(false)}>
        <DialogTitle>Pick a Color</DialogTitle>
        <DialogContent>
          <SketchPicker color={colorPickerType === 'background' ? backgroundColor : colorPickerType === 'bar' ? barColor : labelColor} onChange={handleColorChange} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RightSidebar;