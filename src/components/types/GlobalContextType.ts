export type VariableTypeOption = 'text' | 'number' | 'boolean';
export type VariableType = boolean | string | number;

interface Variable {
  name: string;
  type: VariableTypeOption;
  value: VariableType;
}

interface GlobalContextType {
  selectedNode: string;
  setSelectedNode: (nodeId: string) => void;
}

export type { Variable, GlobalContextType };
