import { Alert } from '@mantine/core';
import { ControlButton, Controls, NodeTypes, ReactFlow, useReactFlow } from '@xyflow/react';
import { IconSitemap } from '@tabler/icons-react';
import '@xyflow/react/dist/style.css';
import { useCurrentScene, useProjectStore } from '@/src/stores/useProjectStore';
import { layoutCurrentScene } from '@/src/story';
import { NodeType } from '@/src/types';
import DiagramNode from './DiagramNode';

export const DRAG_MIME = 'application/x-dialogue-node';

const nodeTypes: NodeTypes = Object.fromEntries(
  Object.values(NodeType).map((type) => [type, DiagramNode]),
);

const Diagram = () => {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const scene = useCurrentScene();
  const { addNode, addEdge, onNodesChange, onEdgesChange } = useProjectStore();
  const nodes = Object.values(scene.nodes);
  const edges = Object.values(scene.edges);

  const disconnected = nodes.filter(
    (node) => !edges.some((edge) => edge.source === node.id || edge.target === node.id),
  ).length;

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {disconnected > 0 && (
        <Alert
          color="yellow"
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          There are {disconnected} disconnected nodes
        </Alert>
      )}
      <ReactFlow
        key={scene.id} // remount (and fit) when switching scenes or importing
        fitView
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={addEdge}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          e.preventDefault();
          const type = e.dataTransfer.getData(DRAG_MIME) as NodeType;
          if (type) addNode(type, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
        }}
        nodeTypes={nodeTypes}
        nodeOrigin={[0.5, 0.5]}
        noDragClassName="nodrag"
      >
        <Controls>
          <ControlButton
            title="Auto layout"
            onClick={() => {
              layoutCurrentScene();
              requestAnimationFrame(() => fitView());
            }}
          >
            <IconSitemap />
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
};

export default Diagram;
