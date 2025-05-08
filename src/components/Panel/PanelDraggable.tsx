import React from 'react';
import { useDrag } from 'react-dnd';
import { PanelDraggableProps } from '@/src/components/types/DraggableProps';

export function PanelDraggable(props: PanelDraggableProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    // "type" is required. It is used by the "accept" specification of drop targets.
    type: 'PanelDraggable',
    // The collect function utilizes a "monitor" instance (see the Overview for what this is)
    // to pull important pieces of state from the DnD system.
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: { type: props.type },
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {props.children}
    </div>
  );
}
