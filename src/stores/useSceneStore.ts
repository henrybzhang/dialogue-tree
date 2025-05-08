import { create } from 'zustand';
import {
  XYPosition,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Edge,
} from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import { NodeType, NodeData, CustomNode } from '@/src/components/types/CustomNodeTypes';
import { useProjectStore } from './useProjectStore';

interface SceneState {
  updateNode: (nodeId: string, data: NodeData[NodeType]) => void;
  addNode: (type: NodeType, position: XYPosition) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  getNode: (nodeId: string) => CustomNode | undefined;
  getEdge: (edgeId: string) => Edge | undefined;
  getNodesArray: () => CustomNode[];
  getEdgesArray: () => Edge[];
  updateNodes: (changes: NodeChange[]) => void;
  updateEdges: (changes: EdgeChange[]) => void;
  cleanupEdgesForNodes: (nodeIds: string[]) => Record<string, Edge>;
}

const defaultDialogueNodeData: NodeData[NodeType.Dialogue] = {
  character: '',
  dialogue: '',
  title: 'New Dialogue',
};

const defaultChoiceNodeData: NodeData[NodeType.Choice] = {
  title: 'New Choice',
  choices: {
    ['choice-' + uuid()]: 'Yes',
    ['choice-' + uuid()]: 'No',
  },
};

const defaultJumpNodeData: NodeData[NodeType.Jump] = {
  title: 'New Jump',
  targetNodeId: '',
};

const defaultSwitchSceneNodeData: NodeData[NodeType.SwitchScene] = {
  title: 'New Switch Scene',
  nextSceneId: '',
};

const defaultIfNodeData: NodeData[NodeType.If] = {
  title: 'New If',
  variableId: '',
  conditions: {
    ['condition-' + uuid()]: {
      type: 'equals',
      value: '',
    },
  },
};

export const useSceneStore = create<SceneState>((set, get) => ({
  updateNodes: (changes: NodeChange[]): void =>
    set((state) => {
      const projectStore = useProjectStore.getState();
      const currentScene = projectStore.getCurrentScene();
      if (!currentScene) return state;

      const updatedNodes = applyNodeChanges(changes, Object.values(currentScene.nodes));
      const newNodes = Object.fromEntries(
        updatedNodes.map((node) => [node.id, node as CustomNode]),
      );

      // Clean up any edges connected to deleted nodes
      const deletedNodeIds = Object.keys(currentScene.nodes).filter((id) => !newNodes[id]);
      const remainingEdges = get().cleanupEdgesForNodes(deletedNodeIds);

      projectStore.updateScene(currentScene.id, {
        nodes: newNodes,
        edges: remainingEdges,
      });

      return state;
    }),

  cleanupEdgesForNodes: (nodeIds: string[]): Record<string, Edge> => {
    const projectStore = useProjectStore.getState();
    const currentScene = projectStore.getCurrentScene();
    if (!currentScene) return {};

    return Object.fromEntries(
      Object.entries(currentScene.edges).filter(
        ([, edge]) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target),
      ),
    );
  },

  updateEdges: (changes: EdgeChange[]): void =>
    set((state) => {
      const projectStore = useProjectStore.getState();
      const currentScene = projectStore.getCurrentScene();
      if (!currentScene) return state;

      const updatedEdges = applyEdgeChanges(changes, Object.values(currentScene.edges));
      const newEdges = Object.fromEntries(updatedEdges.map((edge) => [edge.id, edge]));

      projectStore.updateScene(currentScene.id, {
        edges: newEdges,
      });

      return state;
    }),

  updateNode: (nodeId: string, data: NodeData[NodeType]): void =>
    set((state) => {
      const projectStore = useProjectStore.getState();
      const currentScene = projectStore.getCurrentScene();
      if (!currentScene) return state;

      projectStore.updateScene(currentScene.id, {
        nodes: {
          ...currentScene.nodes,
          [nodeId]: {
            ...currentScene.nodes[nodeId],
            data,
          },
        },
      });

      return state;
    }),

  addNode: (type: NodeType, position: XYPosition): void =>
    set((state) => {
      const projectStore = useProjectStore.getState();
      const currentScene = projectStore.getCurrentScene();
      if (!currentScene) return state;

      const id = `node-${uuid()}`;
      let defaultData: NodeData[NodeType];

      switch (type) {
        case NodeType.Choice:
          defaultData = defaultChoiceNodeData;
          break;
        case NodeType.Dialogue:
          defaultData = defaultDialogueNodeData;
          break;
        case NodeType.Jump:
          defaultData = defaultJumpNodeData;
          break;
        case NodeType.SwitchScene:
          defaultData = defaultSwitchSceneNodeData;
          break;
        case NodeType.If:
          defaultData = defaultIfNodeData;
          break;
        default:
          throw new Error(`Unknown node type: ${type}`);
      }

      const newNode: CustomNode = {
        id,
        type,
        position,
        data: defaultData,
      };

      projectStore.updateScene(currentScene.id, {
        nodes: { ...currentScene.nodes, [id]: newNode },
      });

      return state;
    }),

  addEdge: (edge: Edge): void =>
    set((state) => {
      const projectStore = useProjectStore.getState();
      const currentScene = projectStore.getCurrentScene();
      if (!currentScene) return state;

      projectStore.updateScene(currentScene.id, {
        edges: { ...currentScene.edges, [edge.id]: edge },
      });

      return state;
    }),

  removeNode: (nodeId: string): void =>
    set((state) => {
      const projectStore = useProjectStore.getState();
      const currentScene = projectStore.getCurrentScene();
      if (!currentScene) return state;

      const { [nodeId]: _, ...remainingNodes } = currentScene.nodes;
      const remainingEdges = get().cleanupEdgesForNodes([nodeId]);

      projectStore.updateScene(currentScene.id, {
        nodes: remainingNodes,
        edges: remainingEdges,
      });

      return state;
    }),

  removeEdge: (edgeId: string): void =>
    set((state) => {
      const projectStore = useProjectStore.getState();
      const currentScene = projectStore.getCurrentScene();
      if (!currentScene) return state;

      const { [edgeId]: _, ...remainingEdges } = currentScene.edges;

      projectStore.updateScene(currentScene.id, {
        edges: remainingEdges,
      });

      return state;
    }),

  getNode: (nodeId: string): CustomNode | undefined => {
    const projectStore = useProjectStore.getState();
    const currentScene = projectStore.getCurrentScene();
    if (!currentScene) return undefined;

    const node = currentScene.nodes[nodeId];
    if (!node) {
      console.warn(`Node with id ${nodeId} not found in current scene`);
    }
    return node;
  },

  getEdge: (edgeId: string): Edge | undefined => {
    const projectStore = useProjectStore.getState();
    const currentScene = projectStore.getCurrentScene();
    if (!currentScene) return undefined;

    const edge = currentScene.edges[edgeId];
    if (!edge) {
      console.error(`Edge with id ${edgeId} not found in current scene`);
    }
    return edge;
  },

  getNodesArray: (): CustomNode[] => {
    const projectStore = useProjectStore.getState();
    const currentScene = projectStore.getCurrentScene();
    return currentScene ? Object.values(currentScene.nodes) : [];
  },

  getEdgesArray: (): Edge[] => {
    const projectStore = useProjectStore.getState();
    const currentScene = projectStore.getCurrentScene();
    return currentScene ? Object.values(currentScene.edges) : [];
  },
}));
