import React, { ReactNode, CSSProperties } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableAreaProps {
  id: string;
  children: ReactNode;
  style?: CSSProperties;
}

const DroppableArea: React.FC<DroppableAreaProps> = ({ id, children, style }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      id={id}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        border: '2px dashed #000',
        borderRadius: '4px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default DroppableArea;
