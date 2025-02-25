"use client";

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';
import DroppableArea from './DroppableArea';
import Sidebar from './Sidebar';
import CanvasItem from './CanvasItem';

interface DesignComponent {
  id: string;
  type: string;
  x: number;
  y: number;
}

const DesignTool: React.FC = () => {
  const [components, setComponents] = useState<DesignComponent[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta, activatorEvent } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    setComponents((prev) => {
      const existingItem = prev.find(comp => comp.id === active.id);
      if (existingItem) {
        // Update position with smooth transition (handled via CSS)
        return prev.map(comp =>
          comp.id === active.id
            ? { ...comp, x: comp.x + delta.x, y: comp.y + delta.y }
            : comp
        );
      } else {
        // New item from sidebar – compute position relative to canvas
        const canvasElem = document.getElementById('canvas');
        if (!canvasElem || !activatorEvent) return prev;
        const canvasRect = canvasElem.getBoundingClientRect();
        const mouseEvent = activatorEvent as MouseEvent;
        const newX = mouseEvent.clientX - canvasRect.left;
        const newY = mouseEvent.clientY - canvasRect.top;
        const newId = `${active.id}-${Date.now()}`;
        const newItem: DesignComponent = {
          id: newId,
          type: active.id.replace('sidebar-', ''),
          x: newX,
          y: newY,
        };
        return [...prev, newItem];
      }
    });
    setActiveId(null);
  }, []);

  const activeCanvasItem = components.find(comp => comp.id === activeId);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
        <Sidebar />
        <DroppableArea id="canvas" style={{ flex: 1, padding: '10px', position: 'relative' }}>
          {components.map((comp) => (
            <CanvasItem
              key={comp.id}
              id={comp.id}
              type={comp.type}
              x={comp.x}
              y={comp.y}
            />
          ))}
        </DroppableArea>
      </Box>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'ease-in-out'
        }}
      >
        {activeId ? (
          <div
            style={{
              width: 100,
              height: 100,
              border: '1px solid black',
              padding: '10px',
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: 4,
              transform: 'scale(1.05)',
              transition: 'transform 200ms ease, box-shadow 200ms ease'
            }}
          >
            <Typography>
              {activeId.startsWith('sidebar-')
                ? activeId.replace('sidebar-', '')
                : activeCanvasItem?.type}
            </Typography>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DesignTool;
