import React, { useState } from 'react';
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, Button, Tooltip } from '@mui/material';
import { ChromePicker } from 'react-color';
import ColorLensIcon from '@mui/icons-material/ColorLens';

interface SettingsProps {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  barColor: string;
  setBarColor: (color: string) => void;
  labelColor: string;
  setLabelColor: (color: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ backgroundColor, setBackgroundColor, barColor, setBarColor, labelColor, setLabelColor }) => {
  const [open, setOpen] = useState(false);
  const [colorType, setColorType] = useState<'background' | 'bar' | 'label'>('background');
  const [tempColor, setTempColor] = useState(backgroundColor);

  const handleClickOpen = (type: 'background' | 'bar' | 'label') => {
    setColorType(type);
    setTempColor(type === 'background' ? backgroundColor : type === 'bar' ? barColor : labelColor);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeComplete = (color: any) => {
    setTempColor(color.hex);
  };

  const handleApply = () => {
    if (colorType === 'background') {
      setBackgroundColor(tempColor);
    } else if (colorType === 'bar') {
      setBarColor(tempColor);
    } else {
      setLabelColor(tempColor);
    }
    handleClose();
  };

  const getIconStyle = (color: string) => ({
    color: color === '#ffffff' ? '#000000' : color,
    fontSize: 30,
    backgroundColor: color,
    border: '1px solid #000',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Tooltip title="Change Background Color">
          <Box sx={{ textAlign: 'center', padding: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton onClick={() => handleClickOpen('background')} sx={getIconStyle(backgroundColor)}>
              <ColorLensIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Background</Typography>
          </Box>
        </Tooltip>
        <Tooltip title="Change Bar Color">
          <Box sx={{ textAlign: 'center', padding: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton onClick={() => handleClickOpen('bar')} sx={getIconStyle(barColor)}>
              <ColorLensIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Bar</Typography>
          </Box>
        </Tooltip>
        <Tooltip title="Change Label Color">
          <Box sx={{ textAlign: 'center', padding: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton onClick={() => handleClickOpen('label')} sx={getIconStyle(labelColor)}>
              <ColorLensIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Label</Typography>
          </Box>
        </Tooltip>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Pick a Color</DialogTitle>
        <DialogContent>
          <ChromePicker
            color={tempColor}
            onChangeComplete={handleChangeComplete}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={handleApply}>
              Apply
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Settings;
