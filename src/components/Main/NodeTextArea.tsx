import React from 'react';
import {
  NodeType,
  NodeData,
  NODE_COLORS,
  CustomNode,
  IfOperator,
} from '@/src/components/types/CustomNodeTypes';
import {
  Textarea,
  Stack,
  Group,
  Text,
  Select,
  TextInput,
  Checkbox,
  NumberInput,
} from '@mantine/core';
import { useProjectStore } from '@/src/stores/useProjectStore';
import { useSceneStore } from '@/src/stores/useSceneStore';
import { Node } from '@xyflow/react';

interface NodeTextAreaProps {
  node: CustomNode;
  onChange: (nodeChange: { nodeId: string; newData: NodeData[NodeType] }) => void;
  indentLevel: number;
  optionId?: string;
}

interface NodeContentProps {
  node: Node;
  content: string | number | boolean;
  onChange: (nodeChange: { nodeId: string; newData: NodeData[NodeType] }) => void;
  optionId?: string;
}

const NodeContent: React.FC<NodeContentProps> = ({ node, content, onChange, optionId }) => {
  if (node.type === NodeType.Dialogue) {
    return (
      <Textarea
        value={content as string}
        onChange={(e) =>
          onChange({
            nodeId: node.id,
            newData: {
              ...(node.data as NodeData[NodeType.Dialogue]),
              dialogue: e.target.value,
            },
          })
        }
        style={{ flex: 1 }}
        styles={{
          input: {
            fontFamily: 'monospace',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            padding: '8px 12px',
          },
        }}
      />
    );
  } else if (node.type === NodeType.Choice && optionId) {
    return (
      <TextInput
        value={content as string}
        onChange={(e) =>
          onChange({
            nodeId: node.id,
            newData: {
              ...(node.data as NodeData[NodeType.Choice]),
              choices: {
                ...(node.data as NodeData[NodeType.Choice]).choices,
                [optionId]: e.target.value,
              },
            },
          })
        }
        style={{ flex: 1 }}
        styles={{
          input: {
            fontFamily: 'monospace',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            padding: '8px 12px',
          },
        }}
      />
    );
  } else if (typeof content === 'number' && optionId) {
    return (
      <NumberInput
        value={content}
        onChange={(value) =>
          onChange({
            nodeId: node.id,
            newData: {
              ...(node.data as NodeData[NodeType.If]),
              conditions: {
                ...(node.data as NodeData[NodeType.If]).conditions,
                [optionId]: {
                  type: (node.data as NodeData[NodeType.If]).conditions[optionId].type,
                  value: value,
                },
              },
            },
          })
        }
        style={{ flex: 1 }}
        styles={{
          input: {
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '8px 12px',
          },
        }}
      />
    );
  } else if (typeof content === 'boolean' && optionId) {
    return (
      <Checkbox
        checked={content}
        onChange={(e) =>
          onChange({
            nodeId: node.id,
            newData: {
              ...(node.data as NodeData[NodeType.If]),
              conditions: {
                ...(node.data as NodeData[NodeType.If]).conditions,
                [optionId]: {
                  type: (node.data as NodeData[NodeType.If]).conditions[optionId].type,
                  value: e.currentTarget.checked,
                },
              },
            },
          })
        }
        style={{ flex: 1 }}
        styles={{
          input: {
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '8px 12px',
          },
        }}
      />
    );
  }
  return null;
};

const NodeTextArea: React.FC<NodeTextAreaProps> = ({ node, onChange, indentLevel, optionId }) => {
  const { getCharacters, getVariables, scenes } = useProjectStore();
  const characters = getCharacters();
  const variables = getVariables();
  const { getNodesArray } = useSceneStore();

  // Get dropdowns based on node type
  const getDropdowns = () => {
    switch (node.type) {
      case NodeType.Dialogue: {
        return [
          {
            type: 'character' as const,
            value: (node.data as NodeData[NodeType.Dialogue]).character,
            options: characters.map((char) => ({ value: char.name, label: char.name })),
            onChange: (value: string) => {
              onChange({
                nodeId: node.id,
                newData: {
                  ...node.data,
                  character: value,
                },
              });
            },
          },
        ];
      }
      case NodeType.If: {
        if (!optionId) {
          return [];
        }

        const data = node.data as NodeData[NodeType.If];
        const conditionOptions = [
          { value: 'equals', label: 'equals' },
          { value: 'notEquals', label: 'not equals' },
          { value: 'greaterThan', label: 'greater than' },
          { value: 'lessThan', label: 'less than' },
          { value: 'greaterThanOrEqual', label: 'greater than or equal' },
          { value: 'lessThanOrEqual', label: 'less than or equal' },
        ];
        return [
          {
            type: 'variable' as const,
            value: data.variableId,
            options: variables.map((v) => ({ value: v.id, label: v.name })),
            onChange: (value: string) => {
              onChange({
                nodeId: node.id,
                newData: {
                  ...data,
                  variableId: value,
                },
              });
            },
          },
          {
            type: 'operator' as const,
            value: data.conditions[optionId].type,
            options: conditionOptions,
            onChange: (value: string) => {
              onChange({
                nodeId: node.id,
                newData: {
                  ...data,
                  conditions: {
                    ...data.conditions,
                    [optionId]: {
                      type: value as IfOperator,
                      value: data.conditions[optionId].value,
                    },
                  },
                },
              });
            },
          },
        ];
      }
      case NodeType.Jump: {
        const data = node.data as NodeData[NodeType.Jump];
        return [
          {
            type: 'node' as const,
            value: data.targetNodeId,
            options:
              getNodesArray().map((n: CustomNode) => ({ value: n.id, label: n.data.title })) || [],
            onChange: (value: string) => {
              onChange({
                nodeId: node.id,
                newData: {
                  ...node.data,
                  targetNodeId: value,
                },
              });
            },
          },
        ];
      }
      case NodeType.SwitchScene: {
        const data = node.data as NodeData[NodeType.SwitchScene];
        return [
          {
            type: 'scene' as const,
            value: data.nextSceneId,
            options: Object.entries(scenes).map(([id, scene]) => ({
              value: id,
              label: scene.name,
            })),
            onChange: (value: string) => {
              onChange({
                nodeId: node.id,
                newData: {
                  ...node.data,
                  nextSceneId: value,
                },
              });
            },
          },
        ];
      }
      default:
        return [];
    }
  };

  // Calculate the width needed for each dropdown based on its options
  const calculateDropdownWidth = (options: { label: string }[]) => {
    const maxLength = Math.max(...options.map((opt) => opt.label.length));
    // Convert character length to pixels (approximate)
    // Using 8px per character as a base, plus padding
    return Math.max(200, Math.min(300, maxLength * 8 + 40)) + 'px';
  };

  let content: string | number | boolean = '';
  let showContent = false;
  switch (node.type) {
    case NodeType.Dialogue:
      content = (node.data as NodeData[NodeType.Dialogue]).dialogue;
      showContent = true;
      break;
    case NodeType.Choice:
      if (optionId) {
        content = (node.data as NodeData[NodeType.Choice]).choices[optionId];
        showContent = true;
      }
      break;
    case NodeType.If:
      if (optionId) {
        content = (node.data as NodeData[NodeType.If]).conditions[optionId].value;
        showContent = true;
      }
      break;
    default:
      content = '';
  }

  const nodeDropdowns = getDropdowns();
  const nodeColor = NODE_COLORS[node.type as NodeType] || NODE_COLORS.default;

  const textAreaType =
    optionId && node.type === NodeType.Choice
      ? 'Choice Option'
      : optionId && node.type === NodeType.If
        ? 'If Condition'
        : `${node.type}:`;

  return (
    <Stack
      gap={2}
      style={{
        marginLeft: `${indentLevel * 40}px`,
        width: `calc(100% - ${indentLevel * 40}px)`,
        marginBottom: '8px',
      }}
    >
      <Group gap="xs" align="center">
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: nodeColor,
          }}
        />
        <Text size="sm" c="dimmed" style={{ lineHeight: 1 }}>
          {textAreaType}
        </Text>
        {!optionId && (
          <TextInput
            value={node.data.title}
            onChange={(e) =>
              onChange({
                nodeId: node.id,
                newData: {
                  ...node.data,
                  title: e.target.value,
                },
              })
            }
            style={{ flex: 1 }}
            styles={{
              input: {
                fontFamily: 'monospace',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
              },
            }}
          />
        )}
      </Group>
      <Group gap="xs">
        {nodeDropdowns.map((config, index) => (
          <div key={index} style={{ width: calculateDropdownWidth(config.options) }}>
            <Select
              value={String(config.value)}
              onChange={(value) => {
                if (value) {
                  config.onChange(value);
                }
              }}
              data={config.options}
              styles={{
                input: {
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                },
              }}
            />
          </div>
        ))}
        {showContent && (
          <div style={{ flex: 1 }}>
            <NodeContent node={node} content={content} onChange={onChange} optionId={optionId} />
          </div>
        )}
      </Group>
    </Stack>
  );
};

export default NodeTextArea;
