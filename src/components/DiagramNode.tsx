import { ActionIcon, Button, Card, Group, Stack } from '@mantine/core';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { IconX } from '@tabler/icons-react';
import { useCurrentScene, useProjectStore } from '@/src/stores/useProjectStore';
import { branchIds, defaultValue, NodeType } from '@/src/types';
import { BranchFields, NodeFields, NodeHeader } from './NodeFields';

const DiagramNode = ({ id }: NodeProps) => {
  const node = useCurrentScene().nodes[id];
  const variables = useProjectStore((s) => s.variables);
  const updateNode = useProjectStore((s) => s.updateNode);
  const removeBranch = useProjectStore((s) => s.removeBranch);
  if (!node) return null;

  const addBranch = () => {
    const branchId = crypto.randomUUID();
    if (node.type === NodeType.Choice) {
      updateNode(id, { ...node.data, choices: { ...node.data.choices, [branchId]: 'New Choice' } });
    } else if (node.type === NodeType.If) {
      const value = defaultValue(variables[node.data.variableId]?.type);
      updateNode(id, {
        ...node.data,
        conditions: { ...node.data.conditions, [branchId]: { type: 'equals', value } },
      });
    }
  };

  const hasBranches = node.type === NodeType.Choice || node.type === NodeType.If;

  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <Card shadow="sm" padding="lg" radius="md" withBorder w={400}>
        <Stack gap="xs">
          <NodeHeader node={node} />
          <NodeFields node={node} />
          {branchIds(node).map((branchId) => (
            <Group key={branchId} gap="xs" wrap="nowrap" style={{ position: 'relative' }}>
              <BranchFields node={node} branchId={branchId} />
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => removeBranch(id, branchId)}
              >
                <IconX size={14} />
              </ActionIcon>
              <Handle type="source" position={Position.Right} id={branchId} />
            </Group>
          ))}
          {hasBranches && (
            <Button variant="light" size="xs" onClick={addBranch}>
              {node.type === NodeType.Choice ? 'Add Choice' : 'Add Condition'}
            </Button>
          )}
        </Stack>
      </Card>
      {node.type === NodeType.Dialogue && <Handle type="source" position={Position.Right} />}
    </div>
  );
};

export default DiagramNode;
