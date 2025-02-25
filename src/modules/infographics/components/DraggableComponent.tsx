import React, { ReactNode, useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableComponentProps {
  id: string;
  children: ReactNode;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const [ariaDescribedBy, setAriaDescribedBy] = useState<string | undefined>(undefined);

  useEffect(() => {
    setAriaDescribedBy(attributes['aria-describedby']);
  }, [attributes]);

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    position: 'absolute',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} aria-describedby={ariaDescribedBy}>
      {children}
    </div>
  );
};

export default DraggableComponent;