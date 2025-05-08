import { NativeSelect } from '@mantine/core';
import { NodeProps } from '@xyflow/react';
import { useSceneStore } from '@/src/stores/useSceneStore';
import { useProjectStore } from '@/src/stores/useProjectStore';
import { NodeType, NodeData } from '@/src/components/types/CustomNodeTypes';
import BaseNode from './BaseNode';

const SwitchSceneNode = ({ id }: NodeProps) => {
  const { getNode, updateNode } = useSceneStore();
  const { getScenes, currentSceneId } = useProjectStore();
  const node = getNode(id);
  if (!node) return null;

  const data = node.data as NodeData[NodeType.SwitchScene];
  const scenes = getScenes().filter((scene) => scene.id !== currentSceneId);

  return (
    <BaseNode
      id={id}
      nodeType={NodeType.SwitchScene}
      nodeLabel="Switch Scene"
      includeSourceHandle={false}
    >
      <NativeSelect
        label="Next Scene"
        data={scenes.map((scene) => ({
          value: scene.id,
          label: scene.name,
        }))}
        value={data.nextSceneId}
        onChange={(event) => updateNode(id, { ...data, nextSceneId: event.currentTarget.value })}
        className="nodrag"
      />
    </BaseNode>
  );
};

export default SwitchSceneNode;
