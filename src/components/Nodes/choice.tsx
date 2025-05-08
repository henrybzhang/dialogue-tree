import { Button, Group, Stack, ActionIcon, TextInput } from '@mantine/core';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import { useSceneStore } from '@/src/stores/useSceneStore';
import { NodeType, NodeData } from '@/src/components/types/CustomNodeTypes';
import { IconX } from '@tabler/icons-react';
import BaseNode from './BaseNode';

const ChoiceNode = ({ id }: NodeProps) => {
  const { getNode, updateNode } = useSceneStore();
  const node = getNode(id);
  if (!node) return null;

  const data = node.data as NodeData[NodeType.Choice];

  // Initialize with default choices if none exist
  if (Object.keys(data.choices).length === 0) {
    updateNode(id, {
      ...data,
      choices: {
        ['choice-' + uuid()]: 'Yes',
        ['choice-' + uuid()]: 'No',
      },
    });
  }

  const handleAddChoice = () => {
    const newChoiceId = uuid();
    updateNode(id, {
      ...data,
      choices: {
        ...data.choices,
        [newChoiceId]: 'New Choice',
      },
    });
  };

  const handleUpdateChoice = (choiceId: string, value: string) => {
    updateNode(id, {
      ...data,
      choices: {
        ...data.choices,
        [choiceId]: value,
      },
    });
  };

  const handleRemoveChoice = (choiceId: string) => {
    const { [choiceId]: removed, ...remaining } = data.choices;
    updateNode(id, {
      ...data,
      choices: remaining,
    });
  };

  return (
    <BaseNode id={id} nodeType={NodeType.Choice} nodeLabel="Choice" includeSourceHandle={false}>
      <Stack>
        {Object.entries(data.choices).map(([choiceId, choice]) => (
          <Group key={choiceId} style={{ position: 'relative', paddingRight: 30 }}>
            <TextInput
              value={choice}
              onChange={(event) => handleUpdateChoice(choiceId, event.currentTarget.value)}
              style={{ flex: 1 }}
              className="nodrag"
            />
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => handleRemoveChoice(choiceId)}
              size="sm"
            >
              <IconX size={14} />
            </ActionIcon>
            <Handle
              type="source"
              position={Position.Right}
              id={choiceId}
              style={{
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          </Group>
        ))}
        <Button variant="light" onClick={handleAddChoice}>
          Add Choice
        </Button>
      </Stack>
    </BaseNode>
  );
};

export default ChoiceNode;
