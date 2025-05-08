import React, { useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { PanelDraggableProps } from '@/src/components/types/DraggableProps';

export function PanelDraggable(props: PanelDraggableProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PanelDraggable',
    item: { type: props.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [ref, drag]);

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {props.children}
    </div>
  );
}
