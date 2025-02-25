import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import BarChart from './BarChart';
import LineChart from './LineChart';
import MultiSeriesLineChart from './MultiSeriesLineChart';
import MultiSeriesBarChart from './MultiSeriesBarChart';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { ParsedRow } from '@/modules/financials/interfaces/financials';

interface ChartModalProps {
  open: boolean;
  onClose: () => void;
  rowData: ParsedRow[];
  clickedRowId?: string | null;
  headers: string[]; // header values (e.g., quarter dates) for the x-axis
}

const ChartModal: React.FC<ChartModalProps> = ({
  open,
  onClose,
  rowData,
  clickedRowId,
  headers,
}) => {
  const [selectedChart, setSelectedChart] = useState<string[]>(['Bar Chart']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('white');
  const [barColor, setBarColor] = useState('#4caf50');
  const [labelColor, setLabelColor] = useState('#000000');
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);

  const allCharts = ['Bar Chart', 'Line Chart', 'Pie Chart', 'Scatter Chart'];

  const handleChartClick = (chart: string) => {
    const updated = selectedChart.includes(chart)
      ? selectedChart.filter(c => c !== chart)
      : [...selectedChart, chart];
    setSelectedChart(updated);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const toggleLeftSidebar = () => {
    setIsLeftSidebarExpanded(prev => !prev);
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarExpanded(prev => !prev);
  };

  const flattenRows = (rows: ParsedRow[]): ParsedRow[] => {
    const flat: ParsedRow[] = [];
    const traverse = (row: ParsedRow) => {
      flat.push(row);
      if (row.children) {
        row.children.forEach(traverse);
      }
    };
    rows.forEach(traverse);
    return flat;
  };

  useEffect(() => {
    console.log('Original rowData:', rowData);
    console.log('Flattened rowData:', flattenRows(rowData));
  }, [rowData]);

  const flattenedRowData = useMemo(() => flattenRows(rowData), [rowData]);

  const popularRows = flattenedRowData.slice(0, 5);
  const filteredRows = flattenedRowData.filter(
    row =>
      typeof row.col0 === 'string' &&
      row.col0.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const leftSidebarItems = tabIndex === 0 ? popularRows : filteredRows;

  const handleRowSelect = (rowId: string) => {
    setSelectedRows(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  useEffect(() => {
    if (clickedRowId && selectedRows.length === 0) {
      setSelectedRows([clickedRowId]);
    }
  }, [clickedRowId, selectedRows]);

  const selectedRowsData = flattenedRowData.filter(row =>
    selectedRows.includes(row.id)
  );

  const seriesData = selectedRowsData.map(row => {
    const seriesName = String(row.col0) || '';
    const data = [];
    for (let i = 1; i < headers.length; i++) {
      const key = `col${i}`;
      const value = Number(row[key]);
      if (!isNaN(value)) {
        data.push({ label: headers[i], value });
      }
    }
    return { name: seriesName, data };
  });

  const calculateChartDimensions = () => {
    const baseWidth = isFullscreen ? window.innerWidth : window.innerWidth * 0.8;
    const baseHeight = isFullscreen ? window.innerHeight : window.innerHeight * 0.8;
    const width = baseWidth * (
      isLeftSidebarExpanded && isRightSidebarExpanded ? 0.5 :
      isLeftSidebarExpanded || isRightSidebarExpanded ? 0.7 : 0.9
    );
    const height = baseHeight * 0.8;
    return { width, height };
  };

  const { width: chartWidth, height: chartHeight } = calculateChartDimensions();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: isFullscreen ? '100%' : '80%',
          height: isFullscreen ? '100%' : '80vh',
          margin: 'auto',
          backgroundColor: '#f5f5f5',
          boxShadow: 24,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            p: 1.4,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
          }}
        >
          <Typography variant="h6">TESLA</Typography>
          <Box>
            <IconButton onClick={toggleFullscreen} sx={{ color: 'black' }}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton onClick={onClose} sx={{ color: 'black' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <LeftSidebar
            items={leftSidebarItems}
            selectedRows={selectedRows}
            handleRowSelect={handleRowSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            tabIndex={tabIndex}
            handleTabChange={handleTabChange}
            isSidebarExpanded={isLeftSidebarExpanded}
            toggleSidebar={toggleLeftSidebar}
          />
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {selectedRowsData.length === 0 ? (
              <Typography variant="body1">No rows selected.</Typography>
            ) : (
              <Box sx={{ width: '100%', height: '100%' }}>
                {selectedChart.includes('Bar Chart') ? (
                  seriesData.length > 1 ? (
                    <MultiSeriesBarChart
                      series={seriesData}
                      width={chartWidth} // Ensure width is a number
                      height={chartHeight} // Ensure height is a number
                      backgroundColor={backgroundColor}
                      barColor={barColor}
                      labelColor={labelColor}
                    />
                  ) : (
                    <BarChart
                      data={seriesData[0].data.reduce((acc, cur) => {
                        acc[cur.label] = cur.value;
                        return acc;
                      }, {} as Record<string, number>)}
                      width={chartWidth} // Ensure width is a number
                      height={chartHeight} // Ensure height is a number
                      backgroundColor={backgroundColor}
                      barColor={barColor}
                      labelColor={labelColor}
                    />
                  )
                ) : selectedChart.includes('Line Chart') ? (
                  seriesData.length > 1 ? (
                    <MultiSeriesLineChart
                      series={seriesData}
                      width={chartWidth} // Ensure width is a number
                      height={chartHeight} // Ensure height is a number
                      backgroundColor={backgroundColor}
                      barColor={barColor}
                      labelColor={labelColor}
                    />
                  ) : (
                    <LineChart
                      data={seriesData[0].data.reduce((acc, cur) => {
                        acc[cur.label] = cur.value;
                        return acc;
                      }, {} as Record<string, number>)}
                      width={chartWidth} // Ensure width is a number
                      height={chartHeight} // Ensure height is a number
                      backgroundColor={backgroundColor}
                      barColor={barColor}
                      labelColor={labelColor}
                    />
                  )
                ) : (
                  <Typography>No chart type selected</Typography>
                )}
              </Box>
            )}
          </Box>
          <RightSidebar
            isSidebarExpanded={isRightSidebarExpanded}
            toggleSidebar={toggleRightSidebar}
            allCharts={allCharts}
            selectedChart={selectedChart}
            handleChartClick={handleChartClick}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            barColor={barColor}
            setBarColor={setBarColor}
            labelColor={labelColor}
            setLabelColor={setLabelColor}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default ChartModal;