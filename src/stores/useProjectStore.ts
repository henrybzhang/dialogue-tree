import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  NodeChange,
  XYPosition,
} from '@xyflow/react';
import {
  Character,
  CustomNode,
  NodeData,
  NodeType,
  ProjectFile,
  Scene,
  Variable,
} from '@/src/types';

export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const without = <T>(record: Record<string, T>, id: string): Record<string, T> => {
  const { [id]: _, ...rest } = record;
  return rest;
};

const newScene = (name: string): Scene => ({ id: newId('scene'), name, nodes: {}, edges: {} });

const newNodeData = (type: NodeType): NodeData[NodeType] => {
  switch (type) {
    case NodeType.Dialogue:
      return { title: 'New Dialogue', characterId: '', dialogue: '' };
    case NodeType.Choice:
      return {
        title: 'New Choice',
        choices: { [newId('choice')]: 'Yes', [newId('choice')]: 'No' },
      };
    case NodeType.Jump:
      return { title: 'New Jump', targetNodeId: '' };
    case NodeType.SwitchScene:
      return { title: 'New Switch Scene', nextSceneId: '' };
    case NodeType.If:
      return {
        title: 'New If',
        variableId: '',
        conditions: { [newId('condition')]: { type: 'equals', value: '' } },
      };
  }
};

/** Apply fn to every node in every scene. */
const mapAllNodes = (
  scenes: Record<string, Scene>,
  fn: (node: CustomNode) => CustomNode,
): Record<string, Scene> =>
  Object.fromEntries(
    Object.values(scenes).map((scene) => [
      scene.id,
      {
        ...scene,
        nodes: Object.fromEntries(Object.values(scene.nodes).map((n) => [n.id, fn(n)])),
      },
    ]),
  );

interface ProjectState {
  characters: Record<string, Character>;
  variables: Record<string, Variable>;
  files: Record<string, ProjectFile>;
  scenes: Record<string, Scene>;
  currentSceneId: string;
  addCharacter: (name: string) => void;
  updateCharacter: (id: string, patch: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  addVariable: (variable: Omit<Variable, 'id'>) => void;
  updateVariable: (id: string, patch: Partial<Variable>) => void;
  removeVariable: (id: string) => void;
  addFile: (name: string, content: string) => void;
  updateFile: (id: string, patch: Partial<ProjectFile>) => void;
  removeFile: (id: string) => void;
  addScene: (name: string) => void;
  switchScene: (sceneId: string) => void;
  addNode: (type: NodeType, position: XYPosition) => void;
  updateNode: (nodeId: string, data: NodeData[NodeType]) => void;
  removeBranch: (nodeId: string, branchId: string) => void;
  addEdge: (edge: Omit<Edge, 'id'>) => void;
  onNodesChange: (changes: NodeChange<CustomNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
}

const firstScene = newScene('Default Scene');
const defaultCharacters = [
  { id: newId('character'), name: 'Jeff' },
  { id: newId('character'), name: 'Sarah' },
];
const defaultVariable: Variable = {
  id: newId('variable'),
  name: 'Energy',
  type: 'number',
  value: 100,
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => {
      const updateCurrentScene = (fn: (scene: Scene) => Partial<Scene>) =>
        set((s) => {
          const scene = s.scenes[s.currentSceneId];
          return { scenes: { ...s.scenes, [scene.id]: { ...scene, ...fn(scene) } } };
        });

      return {
        characters: Object.fromEntries(defaultCharacters.map((c) => [c.id, c])),
        variables: { [defaultVariable.id]: defaultVariable },
        files: {},
        scenes: { [firstScene.id]: firstScene },
        currentSceneId: firstScene.id,

        addCharacter: (name) => {
          const id = newId('character');
          set((s) => ({ characters: { ...s.characters, [id]: { id, name } } }));
        },
        updateCharacter: (id, patch) =>
          set((s) => ({
            characters: { ...s.characters, [id]: { ...s.characters[id], ...patch } },
          })),
        removeCharacter: (id) =>
          set((s) => ({
            characters: without(s.characters, id),
            scenes: mapAllNodes(s.scenes, (n) =>
              n.type === NodeType.Dialogue && n.data.characterId === id
                ? { ...n, data: { ...n.data, characterId: '' } }
                : n,
            ),
          })),

        addVariable: (variable) => {
          const id = newId('variable');
          set((s) => ({ variables: { ...s.variables, [id]: { ...variable, id } } }));
        },
        updateVariable: (id, patch) =>
          set((s) => ({ variables: { ...s.variables, [id]: { ...s.variables[id], ...patch } } })),
        removeVariable: (id) =>
          set((s) => ({
            variables: without(s.variables, id),
            scenes: mapAllNodes(s.scenes, (n) =>
              n.type === NodeType.If && n.data.variableId === id
                ? { ...n, data: { ...n.data, variableId: '' } }
                : n,
            ),
          })),

        addFile: (name, content) => {
          const id = newId('file');
          set((s) => ({ files: { ...s.files, [id]: { id, name, content } } }));
        },
        updateFile: (id, patch) =>
          set((s) => ({ files: { ...s.files, [id]: { ...s.files[id], ...patch } } })),
        removeFile: (id) => set((s) => ({ files: without(s.files, id) })),

        addScene: (name) => {
          const scene = newScene(name);
          set((s) => ({ scenes: { ...s.scenes, [scene.id]: scene } }));
        },
        switchScene: (sceneId) => set({ currentSceneId: sceneId }),

        addNode: (type, position) => {
          const node = { id: newId('node'), type, position, data: newNodeData(type) } as CustomNode;
          updateCurrentScene((scene) => ({ nodes: { ...scene.nodes, [node.id]: node } }));
        },
        updateNode: (nodeId, data) =>
          updateCurrentScene((scene) => ({
            nodes: {
              ...scene.nodes,
              [nodeId]: { ...scene.nodes[nodeId], data } as CustomNode,
            },
          })),
        removeBranch: (nodeId, branchId) =>
          updateCurrentScene((scene) => {
            const node = scene.nodes[nodeId];
            const data =
              node.type === NodeType.Choice
                ? { ...node.data, choices: without(node.data.choices, branchId) }
                : node.type === NodeType.If
                  ? { ...node.data, conditions: without(node.data.conditions, branchId) }
                  : node.data;
            return {
              nodes: { ...scene.nodes, [nodeId]: { ...node, data } as CustomNode },
              edges: Object.fromEntries(
                Object.entries(scene.edges).filter(
                  ([, e]) => !(e.source === nodeId && e.sourceHandle === branchId),
                ),
              ),
            };
          }),
        addEdge: (edge) => {
          const id = newId('edge');
          updateCurrentScene((scene) => ({ edges: { ...scene.edges, [id]: { ...edge, id } } }));
        },
        onNodesChange: (changes) =>
          updateCurrentScene((scene) => ({
            nodes: Object.fromEntries(
              applyNodeChanges(changes, Object.values(scene.nodes)).map((n) => [n.id, n]),
            ),
          })),
        onEdgesChange: (changes) =>
          updateCurrentScene((scene) => ({
            edges: Object.fromEntries(
              applyEdgeChanges(changes, Object.values(scene.edges)).map((e) => [e.id, e]),
            ),
          })),
      };
    },
    // Rehydrated from localStorage on mount (see page.tsx) so the static prerender matches.
    { name: 'dialogue-tree', skipHydration: true },
  ),
);

export const useCurrentScene = () => useProjectStore((s) => s.scenes[s.currentSceneId]);
