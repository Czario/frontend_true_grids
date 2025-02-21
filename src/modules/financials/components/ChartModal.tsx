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
  // Default selected chart is Bar Chart.
  const [selectedChart, setSelectedChart] = useState<string[]>(['Bar Chart']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Track selected row IDs from the left sidebar.
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  // Controls for left sidebar (tabs & search).
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Flatten nested rows (if any)
  const flattenRows = (rows: ParsedRow[]): ParsedRow[] => {
    const flat: ParsedRow[] = [];
    const flatten = (row: ParsedRow) => {
      flat.push(row);
      if (row.children) {
        row.children.forEach(flatten);
      }
    };
    rows.forEach(flatten);
    return flat;
  };

  const flattenedRowData = useMemo(() => flattenRows(rowData), [rowData]);

  // Determine which rows to show in the left sidebar.
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

  // Auto-select the clicked row if provided and if no row is already selected.
  useEffect(() => {
    if (clickedRowId && selectedRows.length === 0) {
      setSelectedRows([clickedRowId]);
    }
  }, [clickedRowId, selectedRows]);

  const selectedRowsData = flattenedRowData.filter(row =>
    selectedRows.includes(row.id)
  );

  // Build series data for composite charts.
  // Use the provided header values as x-axis labels.
  // Assume col0 holds the row name; then for each index from 1 onward, use headers[i] and the numeric value.
  const seriesData = selectedRowsData.map(row => {
    const seriesName = String(row.col0) || '';
    const data = [];
    // Start from index 1 (skip col0)
    for (let i = 1; i < headers.length; i++) {
      const key = `col${i}`;
      const value = Number(row[key]);
      if (!isNaN(value)) {
        data.push({ label: headers[i], value });
      }
    }
    return { name: seriesName, data };
  });

  // Chart dimensions (for demo purposes)
  const chartWidth = 600;
  const chartHeight = 400;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: isFullscreen ? '100%' : '80%',
          height: isFullscreen ? '100%' : '80vh', // Fixed container height
          margin: 'auto',
          backgroundColor: '#f5f5f5',
          boxShadow: 24,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
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
        {/* Body container */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar */}
          <LeftSidebar
            items={leftSidebarItems}
            selectedRows={selectedRows}
            handleRowSelect={handleRowSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            tabIndex={tabIndex}
            handleTabChange={handleTabChange}
          />
          {/* Main Chart Area – single composite chart */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
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
                      width={chartWidth}
                      height={chartHeight}
                    />
                  ) : (
                    <BarChart
                      data={seriesData[0].data.reduce((acc, cur) => {
                        acc[cur.label] = cur.value;
                        return acc;
                      }, {} as Record<string, number>)}
                      width={chartWidth}
                      height={chartHeight}
                    />
                  )
                ) : selectedChart.includes('Line Chart') ? (
                  seriesData.length > 1 ? (
                    <MultiSeriesLineChart
                      series={seriesData}
                      width={chartWidth}
                      height={chartHeight}
                    />
                  ) : (
                    <LineChart
                      data={seriesData[0].data.reduce((acc, cur) => {
                        acc[cur.label] = cur.value;
                        return acc;
                      }, {} as Record<string, number>)}
                      width={chartWidth}
                      height={chartHeight}
                    />
                  )
                ) : (
                  <Typography>No chart type selected</Typography>
                )}
              </Box>
            )}
          </Box>
          {/* Right Sidebar */}
          <RightSidebar
            isSidebarExpanded={false}
            toggleSidebar={() => {}}
            allCharts={allCharts}
            selectedChart={selectedChart}
            handleChartClick={handleChartClick}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default ChartModal;