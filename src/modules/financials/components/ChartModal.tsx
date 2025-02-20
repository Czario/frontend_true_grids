import React, { useState } from 'react';
import { Modal, Box, IconButton, Typography, Divider, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BarChart from './BarChart';

interface ChartModalProps {
  open: boolean;
  onClose: () => void;
  rowData: Record<string, number>;
}

const ChartModal: React.FC<ChartModalProps> = ({ open, onClose, rowData }) => {
  const [selectedChart, setSelectedChart] = useState('Bar Chart');

  const handleSelectChart = (chartType: string) => {
    setSelectedChart(chartType);
  };

  if (!rowData) {
    return null;
  }

  const width = 500;
  const height = 400;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '80%',
          height: '80%',
          margin: 'auto',
          backgroundColor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ width: '20%', borderRight: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
          <List component="nav">
            {['Bar Chart', 'Line Chart', 'Pie Chart'].map((chartType) => (
              <React.Fragment key={chartType}>
                <ListItemButton onClick={() => handleSelectChart(chartType)}>
                  <ListItemText primary={chartType} />
                </ListItemButton>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
        <Box sx={{ flex: 1, p: 2, position: 'relative' }}>
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            {selectedChart}
          </Typography>
          {selectedChart === 'Bar Chart' && <BarChart data={rowData} width={width} height={height} />}
          {/* Add other chart components here based on selectedChart */}
        </Box>
      </Box>
    </Modal>
  );
};

export default ChartModal;