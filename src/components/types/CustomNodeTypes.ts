import { Node, Edge } from '@xyflow/react';

export enum NodeType {
  Dialogue = 'dialogue',
  Choice = 'choice',
  Jump = 'jump',
  SwitchScene = 'switchScene',
  If = 'if',
}

type BaseNodeData = {
  [NodeType.Dialogue]: {
    character: string;
    dialogue: string;
  };

  [NodeType.Choice]: {
    choices: Record<string, string>;
  };

  [NodeType.Jump]: {
    targetNodeId: string;
  };

  [NodeType.SwitchScene]: {
    nextSceneId: string;
  };

  [NodeType.If]: {
    variableId?: string;
    conditions: Record<
      string,
      {
        type: IfOperator;
        value: string | number | boolean;
      }
    >;
  };
};

export type NodeData = {
  [K in keyof BaseNodeData]: BaseNodeData[K] & { title: string };
};

export type CustomNode<T extends NodeType = NodeType> = Node<NodeData[T], T>;

export type Scene = {
  id: string;
  name: string;
  nodes: Record<string, CustomNode>;
  edges: Record<string, Edge>;
};

export const NODE_COLORS = {
  [NodeType.Dialogue]: '#4CAF50',
  [NodeType.Choice]: '#2196F3',
  [NodeType.If]: '#FF9800',
  [NodeType.Jump]: '#9C27B0',
  [NodeType.SwitchScene]: '#E91E63',
  default: '#757575',
} as const;

export type IfOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual';
