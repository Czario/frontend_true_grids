import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Resizable } from 're-resizable';
import { Typography } from '@mui/material';

interface CanvasItemProps {
  id: string;
  type: string;
  x: number;
  y: number;
}

const CanvasItem: React.FC<CanvasItemProps> = ({ id, type, x, y }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        cursor: 'grab',
        transition: 'left 200ms ease, top 200ms ease'
      }}
    >
      <Resizable
        defaultSize={{ width: 100, height: 100 }}
        style={{
          border: '1px solid black',
          padding: '10px',
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 4
        }}
      >
        <Typography>{type}</Typography>
      </Resizable>
    </div>
  );
};

export default CanvasItem;
