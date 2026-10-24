import { Button, Group } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import { NODE_LABELS, NodeType } from '@/src/types';
import { DRAG_MIME } from './Diagram';

const NodePanel = () => (
  <Group justify="center" gap="md">
    {Object.values(NodeType).map((type) => (
      <Button
        key={type}
        variant="default"
        leftSection={<IconGripVertical size={16} />}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(DRAG_MIME, type);
          e.dataTransfer.effectAllowed = 'move';
        }}
        style={{ cursor: 'grab' }}
      >
        {NODE_LABELS[type]}
      </Button>
    ))}
  </Group>
);

export default NodePanel;
