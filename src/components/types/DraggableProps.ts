import { ReactNode } from 'react';
import { CustomNodeType } from './CustomNodeTypes';

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
  type: CustomNodeType;
  children: ReactNode;
};

export type { DraggableProps, PanelDraggableProps };
