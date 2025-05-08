import { Select, TextInput, NumberInput, Group, Stack, ActionIcon, Button } from '@mantine/core';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { useSceneStore } from '@/src/stores/useSceneStore';
import { NodeType, NodeData, IfOperator } from '@/src/components/types/CustomNodeTypes';
import { useProjectStore } from '@/src/stores/useProjectStore';
import { IconX } from '@tabler/icons-react';
import { v4 as uuid } from 'uuid';
import BaseNode from './BaseNode';

const IfNode = ({ id }: NodeProps) => {
  const { getNode, updateNode } = useSceneStore();
  const { getVariables } = useProjectStore();
  const node = getNode(id);
  if (!node) return null;

  const data = node.data as NodeData[NodeType.If];
  const variables = getVariables();

  const handleVariableChange = (value: string | null) => {
    if (!value) return;
    const variable = variables.find((v) => v.id === value);
    if (!variable) return;

    const newConditions = Object.fromEntries(
      Object.entries(data.conditions).map(([key, op]) => [
        key,
        {
          ...op,
          value: variable.type === 'boolean' ? false : variable.type === 'number' ? 0 : '',
        },
      ]),
    );

    updateNode(id, {
      ...data,
      variableId: value,
      conditions: newConditions,
    });
  };

  const handleAddCondition = () => {
    const optionId = 'condition-' + uuid();
    updateNode(id, {
      ...data,
      conditions: {
        ...data.conditions,
        [optionId]: { type: 'equals', value: '' },
      },
    });
  };

  const handleUpdateCondition = (
    conditionId: string,
    type: string,
    value: string | number | boolean,
  ) => {
    updateNode(id, {
      ...data,
      conditions: {
        ...data.conditions,
        [conditionId]: {
          type: type as IfOperator,
          value,
        },
      },
    });
  };

  const handleRemoveCondition = (conditionId: string) => {
    const { [conditionId]: _, ...remaining } = data.conditions;
    updateNode(id, {
      ...data,
      conditions: remaining,
    });
  };

  const selectedVariable = variables.find((v) => v.id === data.variableId);
  const variableType = selectedVariable?.type;

  const getConditionOptions = () => {
    const baseOptions = [
      { value: 'equals', label: '=' },
      { value: 'notEquals', label: '≠' },
    ];

    if (variableType === 'number') {
      return [
        ...baseOptions,
        { value: 'greaterThan', label: '>' },
        { value: 'lessThan', label: '<' },
        { value: 'greaterThanOrEqual', label: '≥' },
        { value: 'lessThanOrEqual', label: '≤' },
      ];
    }

    return baseOptions;
  };

  return (
    <BaseNode id={id} nodeType={NodeType.If} nodeLabel="If" includeSourceHandle={false}>
      <Stack>
        <Select
          label="Variable"
          value={data.variableId}
          onChange={handleVariableChange}
          data={variables.map((v) => ({ value: v.id, label: v.name }))}
          placeholder="Select a variable"
        />

        {data.variableId &&
          Object.entries(data.conditions).map(([conditionId, condition]) => (
            <Group key={conditionId} style={{ position: 'relative', paddingRight: 30 }}>
              <Select
                value={condition.type}
                onChange={(value) =>
                  handleUpdateCondition(conditionId, value || 'equals', condition.value)
                }
                data={getConditionOptions()}
                style={{ width: 60 }}
              />
              {variableType === 'number' ? (
                <NumberInput
                  value={condition.value as number}
                  onChange={(value) =>
                    handleUpdateCondition(conditionId, condition.type, value || 0)
                  }
                  style={{ flex: 1 }}
                />
              ) : variableType === 'boolean' ? (
                <Select
                  value={String(condition.value)}
                  onChange={(value) =>
                    handleUpdateCondition(conditionId, condition.type, value === 'true')
                  }
                  data={[
                    { value: 'true', label: 'True' },
                    { value: 'false', label: 'False' },
                  ]}
                  style={{ flex: 1 }}
                />
              ) : (
                <TextInput
                  value={String(condition.value)}
                  onChange={(event) =>
                    handleUpdateCondition(conditionId, condition.type, event.currentTarget.value)
                  }
                  style={{ flex: 1 }}
                />
              )}
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => handleRemoveCondition(conditionId)}
                style={{ position: 'absolute', right: 0 }}
              >
                <IconX size={16} />
              </ActionIcon>
              <Handle type="source" position={Position.Right} id={conditionId} />
            </Group>
          ))}
        <Button variant="subtle" onClick={handleAddCondition} size="xs">
          Add Condition
        </Button>
      </Stack>
    </BaseNode>
  );
};

export default IfNode;
