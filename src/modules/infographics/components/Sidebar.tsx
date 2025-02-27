import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';

interface SidebarItemProps {
  id: string;
  type: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ id, type }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ marginBottom: '8px', cursor: 'grab' }}
    >
      <Paper sx={{ p: 2 }} elevation={3}>
        <Typography>{type}</Typography>
      </Paper>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const items = [
    { id: 'box1', type: 'Box 1' },
    { id: 'box2', type: 'Box 2' },
  ];

  return (
    <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', p: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Components
      </Typography>
      {items.map((item) => (
        <SidebarItem key={item.id} id={`sidebar-${item.id}`} type={item.type} />
      ))}
    </Box>
  );
};

export default Sidebar;
