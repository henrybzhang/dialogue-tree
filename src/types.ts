import { Edge, Node } from '@xyflow/react';

export enum NodeType {
  Dialogue = 'dialogue',
  Choice = 'choice',
  Jump = 'jump',
  SwitchScene = 'switchScene',
  If = 'if',
}

export type IfOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual';

export type VariableTypeOption = 'text' | 'number' | 'boolean';
export type VariableValue = string | number | boolean;

type BaseNodeData = {
  [NodeType.Dialogue]: {
    characterId: string;
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
    variableId: string;
    conditions: Record<string, { type: IfOperator; value: VariableValue }>;
  };
};

export type NodeData = {
  [K in NodeType]: BaseNodeData[K] & { title: string };
};

// Discriminated on `type`, so checking node.type narrows node.data.
export type CustomNode<T extends NodeType = NodeType> = {
  [K in T]: Node<NodeData[K], K> & { type: K };
}[T];

export type Scene = {
  id: string;
  name: string;
  nodes: Record<string, CustomNode>;
  edges: Record<string, Edge>;
};

export interface Character {
  id: string;
  name: string;
}

export interface Variable {
  id: string;
  name: string;
  type: VariableTypeOption;
  value: VariableValue;
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
}

export const NODE_COLORS: Record<NodeType, string> = {
  [NodeType.Dialogue]: '#4CAF50',
  [NodeType.Choice]: '#2196F3',
  [NodeType.If]: '#FF9800',
  [NodeType.Jump]: '#9C27B0',
  [NodeType.SwitchScene]: '#E91E63',
};

export const NODE_LABELS: Record<NodeType, string> = {
  [NodeType.Dialogue]: 'Dialogue',
  [NodeType.Choice]: 'Choice',
  [NodeType.Jump]: 'Jump',
  [NodeType.SwitchScene]: 'Switch Scene',
  [NodeType.If]: 'If',
};

export const IF_OPERATORS: { value: IfOperator; label: string; numericOnly?: boolean }[] = [
  { value: 'equals', label: '=' },
  { value: 'notEquals', label: '≠' },
  { value: 'greaterThan', label: '>', numericOnly: true },
  { value: 'lessThan', label: '<', numericOnly: true },
  { value: 'greaterThanOrEqual', label: '≥', numericOnly: true },
  { value: 'lessThanOrEqual', label: '≤', numericOnly: true },
];

export const defaultValue = (type?: VariableTypeOption): VariableValue =>
  type === 'number' ? 0 : type === 'boolean' ? false : '';

/** Ids of a node's outgoing branches (one source handle each); empty for single-exit nodes. */
export const branchIds = (node: CustomNode): string[] =>
  node.type === NodeType.Choice
    ? Object.keys(node.data.choices)
    : node.type === NodeType.If
      ? Object.keys(node.data.conditions)
      : [];
