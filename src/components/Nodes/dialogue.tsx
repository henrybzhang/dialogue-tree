import { Select, Textarea } from '@mantine/core';
import { NodeProps } from '@xyflow/react';
import { useSceneStore } from '@/src/stores/useSceneStore';
import { NodeType, NodeData } from '@/src/components/types/CustomNodeTypes';
import { useProjectStore } from '@/src/stores/useProjectStore';
import BaseNode from './BaseNode';

const DialogueNode = ({ id }: NodeProps) => {
  const { getNode, updateNode } = useSceneStore();
  const { getCharacters } = useProjectStore();
  const node = getNode(id);
  if (!node) return null;

  const data = node.data as NodeData[NodeType.Dialogue];
  const characters = getCharacters();

  return (
    <BaseNode id={id} nodeType={NodeType.Dialogue} nodeLabel="Dialogue">
      <Select
        label="Character"
        searchable
        data={characters.map((char) => char.name)}
        value={data.character}
        onChange={(value) => updateNode(id, { ...data, character: value || '' })}
        className="nodrag"
      />
      <Textarea
        placeholder="Insert dialogue here"
        label="Dialogue"
        value={data.dialogue}
        onChange={(event) => updateNode(id, { ...data, dialogue: event.currentTarget.value })}
        minRows={3}
        className="nodrag"
      />
    </BaseNode>
  );
};

export default DialogueNode;
