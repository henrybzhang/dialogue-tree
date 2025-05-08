import { NativeSelect } from '@mantine/core';
import { NodeProps } from '@xyflow/react';
import { useSceneStore } from '@/src/stores/useSceneStore';
import { NodeType, NodeData } from '@/src/components/types/CustomNodeTypes';
import BaseNode from './BaseNode';

const JumpNode = ({ id }: NodeProps) => {
  const { getNode, updateNode, getNodesArray } = useSceneStore();
  const node = getNode(id);
  if (!node) return null;

  const data = node.data as NodeData[NodeType.Jump];
  const nodes = getNodesArray();

  return (
    <BaseNode id={id} nodeType={NodeType.Jump} nodeLabel="Jump" includeSourceHandle={false}>
      <NativeSelect
        label="Next Node"
        data={nodes.map((node) => ({
          value: node.id,
          label: node.data.title,
        }))}
        value={data.targetNodeId}
        onChange={(event) => updateNode(id, { ...data, targetNodeId: event.currentTarget.value })}
        className="nodrag"
      />
    </BaseNode>
  );
};

export default JumpNode;
