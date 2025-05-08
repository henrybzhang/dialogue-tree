import { Alert } from '@mantine/core';
import React, { useCallback, useRef } from 'react';
import { ComponentType } from 'react';
import {
  Connection,
  Controls,
  NodeProps,
  ReactFlow,
  useReactFlow,
  XYPosition,
  NodeChange,
  EdgeChange,
  Edge,
} from '@xyflow/react';
import { useDrop, ConnectDropTarget } from 'react-dnd';
import { NodeType } from '@/src/components/types/CustomNodeTypes';
import DialogueNode from '@/src/components/Nodes/dialogue';
import JumpNode from '@/src/components/Nodes/jump';
import SwitchSceneNode from '@/src/components/Nodes/switchScene';
import '@xyflow/react/dist/style.css';
import ChoiceNode from '@/src/components/Nodes/choice';
import IfNode from '@/src/components/Nodes/if';
import { PanelDraggableProps } from '@/src/components/types/DraggableProps';
import { useSceneStore } from '@/src/stores/useSceneStore';

const nodeTypes = {
  [NodeType.Dialogue]: DialogueNode as ComponentType<NodeProps>,
  [NodeType.Choice]: ChoiceNode as ComponentType<NodeProps>,
  [NodeType.Jump]: JumpNode as ComponentType<NodeProps>,
  [NodeType.SwitchScene]: SwitchSceneNode as ComponentType<NodeProps>,
  [NodeType.If]: IfNode as ComponentType<NodeProps>,
};

const Diagram = () => {
  const { screenToFlowPosition } = useReactFlow();
  const { addNode, addEdge, getNodesArray, getEdgesArray, updateNodes, updateEdges } =
    useSceneStore();
  const mainRef = useRef<HTMLDivElement>(null);

  // Find disconnected nodes
  const disconnectedNodes = getNodesArray().filter(
    (node) => !getEdgesArray().some((edge) => edge.source === node.id || edge.target === node.id),
  );

  const [, drop] = useDrop<PanelDraggableProps, void, ConnectDropTarget>(
    () => ({
      accept: 'PanelDraggable',
      drop: (item: PanelDraggableProps, monitor) => {
        const pointerPosition = monitor.getClientOffset() as XYPosition;
        addNode(item.type, screenToFlowPosition(pointerPosition));
      },
    }),
    [screenToFlowPosition, addNode],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const edge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
      };
      addEdge(edge);
    },
    [addEdge],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      updateNodes(changes);
    },
    [updateNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      updateEdges(changes);
    },
    [updateEdges],
  );

  const combinedRef = (node: HTMLDivElement | null) => {
    mainRef.current = node;
    drop(node);
  };

  return (
    <div
      ref={combinedRef}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        top: '50px',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      {disconnectedNodes.length > 0 && (
        <Alert
          color="yellow"
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}
        >
          There are {disconnectedNodes.length} disconnected nodes
        </Alert>
      )}
      <ReactFlow
        nodes={getNodesArray()}
        edges={getEdgesArray()}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodeOrigin={[0.5, 0.5]}
        noDragClassName="nodrag"
        style={{ width: '100%', height: '100%' }}
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Diagram;
