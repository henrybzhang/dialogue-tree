import { Card, TextInput, Text } from '@mantine/core';
import { Handle, Position } from '@xyflow/react';
import { useSceneStore } from '@/src/stores/useSceneStore';
import { NodeType, NODE_COLORS } from '@/src/components/types/CustomNodeTypes';

interface BaseNodeProps {
  id: string;
  nodeType: NodeType;
  nodeLabel: string;
  includeSourceHandle?: boolean;
  children: React.ReactNode;
}

const BaseNode = ({
  id,
  nodeType,
  nodeLabel,
  includeSourceHandle = true,
  children,
}: BaseNodeProps) => {
  const { getNode, updateNode } = useSceneStore();
  const node = getNode(id);
  if (!node) return null;

  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <Card shadow="sm" padding="lg" radius="md" withBorder w={400}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: NODE_COLORS[nodeType],
            }}
          />
          <Text size="sm" c="dimmed">
            {nodeLabel}
          </Text>
        </div>
        <TextInput
          value={node.data.title}
          onChange={(e) => updateNode(id, { ...node.data, title: e.currentTarget.value })}
          className="nodrag"
          styles={{
            input: {
              fontWeight: 'bold',
              border: 'none',
              padding: 0,
              '&:focus': {
                border: 'none',
                outline: 'none',
              },
            },
          }}
        />
        {children}
      </Card>
      {includeSourceHandle && <Handle type="source" position={Position.Right} />}
    </div>
  );
};

export default BaseNode;
