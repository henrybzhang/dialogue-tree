import { ReactNode } from 'react';
import { NodeType } from './CustomNodeTypes';

type Transform = {
  x: number;
  y: number;
};

type DraggableProps = {
  id: string;
  position: Transform;
  children: ReactNode;
};

type PanelDraggableProps = {
  type: NodeType;
  children: ReactNode;
};

export type { DraggableProps, PanelDraggableProps };
