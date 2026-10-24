import dagre from '@dagrejs/dagre';
import { Edge, XYPosition } from '@xyflow/react';
import { newId, useProjectStore } from '@/src/stores/useProjectStore';
import {
  branchIds,
  CustomNode,
  IF_OPERATORS,
  IfOperator,
  NodeData,
  NodeType,
  Scene,
  VariableTypeOption,
  VariableValue,
} from '@/src/types';

/**
 * Portable story format for import/export. Links are `next` ids instead of edge
 * objects, so it is easy for people and AI chats to write by hand.
 */
export interface Story {
  characters?: { id: string; name: string }[];
  variables?: { id: string; name: string; type: VariableTypeOption; value: VariableValue }[];
  files?: { name: string; content: string }[];
  scenes: { id: string; name: string; nodes: StoryNode[] }[];
}

export interface StoryNode {
  id: string;
  type: NodeType;
  title?: string;
  position?: XYPosition;
  characterId?: string;
  dialogue?: string;
  next?: string;
  choices?: { text: string; next?: string }[];
  variableId?: string;
  conditions?: { op: IfOperator; value: VariableValue; next?: string }[];
  targetNodeId?: string;
  nextSceneId?: string;
}

// A dialogue node with several outgoing edges exports only the first; `next` is a single id.
const sceneToStory = (scene: Scene): Story['scenes'][number] => {
  const edges = Object.values(scene.edges);
  const next = (source: string, handle?: string) =>
    edges.find((e) => e.source === source && (handle === undefined || e.sourceHandle === handle))
      ?.target;

  const nodes = Object.values(scene.nodes).map((n): StoryNode => {
    const base = { id: n.id, type: n.type, title: n.data.title, position: n.position };
    switch (n.type) {
      case NodeType.Dialogue:
        return {
          ...base,
          characterId: n.data.characterId,
          dialogue: n.data.dialogue,
          next: next(n.id),
        };
      case NodeType.Choice:
        return {
          ...base,
          choices: Object.entries(n.data.choices).map(([h, text]) => ({
            text,
            next: next(n.id, h),
          })),
        };
      case NodeType.If:
        return {
          ...base,
          variableId: n.data.variableId,
          conditions: Object.entries(n.data.conditions).map(([h, c]) => ({
            op: c.type,
            value: c.value,
            next: next(n.id, h),
          })),
        };
      case NodeType.Jump:
        return { ...base, targetNodeId: n.data.targetNodeId };
      case NodeType.SwitchScene:
        return { ...base, nextSceneId: n.data.nextSceneId };
    }
  });
  return { id: scene.id, name: scene.name, nodes };
};

export const exportStory = (): Story => {
  const { characters, variables, files, scenes } = useProjectStore.getState();
  return {
    characters: Object.values(characters),
    variables: Object.values(variables),
    files: Object.values(files).map(({ name, content }) => ({ name, content })),
    scenes: Object.values(scenes).map(sceneToStory),
  };
};

const VARIABLE_TYPES: VariableTypeOption[] = ['text', 'number', 'boolean'];

/** Replace the whole project with a story. Throws on input that isn't a story. */
export const importStory = (story: Story) => {
  if (!Array.isArray(story?.scenes) || story.scenes.length === 0) {
    throw new Error('Expected a JSON object with a non-empty "scenes" array.');
  }

  // Story ids are arbitrary strings ("n1"); give everything fresh ids, per kind.
  const ids = new Map<string, string>();
  const ref = (kind: string, raw?: string) => {
    if (!raw) return '';
    const key = `${kind}:${raw}`;
    if (!ids.has(key)) ids.set(key, newId(kind));
    return ids.get(key)!;
  };

  const characters = Object.fromEntries(
    (story.characters ?? []).map((c) => {
      const id = ref('character', c.id);
      return [id, { id, name: String(c.name ?? '') }];
    }),
  );
  const variables = Object.fromEntries(
    (story.variables ?? []).map((v) => {
      const id = ref('variable', v.id);
      const type = VARIABLE_TYPES.includes(v.type) ? v.type : 'text';
      return [id, { id, name: String(v.name ?? ''), type, value: v.value ?? '' }];
    }),
  );
  const files = Object.fromEntries(
    (story.files ?? []).map((f) => {
      const id = newId('file');
      return [id, { id, name: String(f.name ?? ''), content: String(f.content ?? '') }];
    }),
  );

  const scenes = story.scenes.map((s): Scene => {
    const nodes: Record<string, CustomNode> = {};
    const edges: Record<string, Edge> = {};
    const link = (source: string, target?: string, sourceHandle?: string) => {
      if (!target) return;
      const id = newId('edge');
      edges[id] = { id, source, target: ref('node', target), sourceHandle };
    };

    for (const n of s.nodes ?? []) {
      const id = ref('node', n.id);
      const title = String(n.title ?? '');
      let data: NodeData[NodeType];
      switch (n.type) {
        case NodeType.Dialogue:
          data = {
            title,
            characterId: ref('character', n.characterId),
            dialogue: n.dialogue ?? '',
          };
          link(id, n.next);
          break;
        case NodeType.Choice: {
          const choices: Record<string, string> = {};
          for (const c of n.choices ?? []) {
            const handle = newId('choice');
            choices[handle] = String(c.text ?? '');
            link(id, c.next, handle);
          }
          data = { title, choices };
          break;
        }
        case NodeType.If: {
          const conditions: NodeData[NodeType.If]['conditions'] = {};
          for (const c of n.conditions ?? []) {
            const handle = newId('condition');
            const type = IF_OPERATORS.some((op) => op.value === c.op) ? c.op : 'equals';
            conditions[handle] = { type, value: c.value ?? '' };
            link(id, c.next, handle);
          }
          data = { title, variableId: ref('variable', n.variableId), conditions };
          break;
        }
        case NodeType.Jump:
          data = { title, targetNodeId: ref('node', n.targetNodeId) };
          break;
        case NodeType.SwitchScene:
          data = { title, nextSceneId: ref('scene', n.nextSceneId) };
          break;
        default:
          continue;
      }
      nodes[id] = { id, type: n.type, position: n.position ?? { x: 0, y: 0 }, data } as CustomNode;
    }

    // Drop links to nodes the scene never defines.
    for (const [id, e] of Object.entries(edges)) if (!nodes[e.target]) delete edges[id];

    const scene = { id: ref('scene', s.id), name: String(s.name ?? 'Scene'), nodes, edges };
    return (s.nodes ?? []).some((n) => !n.position) ? withLayout(scene) : scene;
  });

  useProjectStore.setState({
    characters,
    variables,
    files,
    scenes: Object.fromEntries(scenes.map((s) => [s.id, s])),
    currentSceneId: scenes[0].id,
  });
};

/** Left-to-right layered layout. Unmeasured nodes use a size estimate. */
const withLayout = (scene: Scene): Scene => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 120 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of Object.values(scene.nodes)) {
    g.setNode(n.id, {
      width: n.measured?.width ?? 400,
      height:
        n.measured?.height ??
        110 + 45 * branchIds(n).length + (n.type === NodeType.Dialogue ? 90 : 0),
    });
  }
  for (const e of Object.values(scene.edges)) g.setEdge(e.source, e.target);
  dagre.layout(g);

  // dagre positions are node centers, matching the diagram's nodeOrigin of [0.5, 0.5].
  const nodes = Object.fromEntries(
    Object.values(scene.nodes).map((n) => {
      const { x, y } = g.node(n.id);
      return [n.id, { ...n, position: { x, y } }];
    }),
  );
  return { ...scene, nodes };
};

export const layoutCurrentScene = () =>
  useProjectStore.setState((s) => ({
    scenes: { ...s.scenes, [s.currentSceneId]: withLayout(s.scenes[s.currentSceneId]) },
  }));

/** Instructions to paste into any AI chat so it replies with an importable story. */
export const STORY_FORMAT_PROMPT = `Write a branching dialogue story as JSON in this exact format (no comments, no extra keys):

{
  "characters": [{ "id": "c1", "name": "Mara" }],
  "variables": [{ "id": "v1", "name": "Trust", "type": "number", "value": 0 }],
  "scenes": [
    {
      "id": "s1",
      "name": "The Gate",
      "nodes": [
        { "id": "n1", "type": "dialogue", "title": "Greeting", "characterId": "c1", "dialogue": "Who goes there?", "next": "n2" },
        { "id": "n2", "type": "choice", "title": "Answer", "choices": [
          { "text": "A friend.", "next": "n3" },
          { "text": "None of your business.", "next": "n4" }
        ] },
        { "id": "n3", "type": "if", "title": "Trusted?", "variableId": "v1", "conditions": [
          { "op": "greaterThanOrEqual", "value": 1, "next": "n5" },
          { "op": "lessThan", "value": 1, "next": "n4" }
        ] },
        { "id": "n4", "type": "jump", "title": "Retry", "targetNodeId": "n1" },
        { "id": "n5", "type": "switchScene", "title": "Enter", "nextSceneId": "s2" }
      ]
    }
  ]
}

Rules:
- Node types: "dialogue" (one spoken line; "next" is the following node), "choice" (player options, each with its own "next"), "if" (checks a variable; conditions are tried in order and the first true one is followed; ops: equals, notEquals, greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual), "jump" (go to another node in the same scene), "switchScene" (go to the first node of another scene).
- A scene starts at its first node. A node without "next" ends the story there.
- Variables keep their starting "value"; nothing changes them during play, so "if" nodes branch on the starting values only.
- Ids only need to be unique and consistent within the JSON. Every "characterId", "variableId", "next", "targetNodeId" and "nextSceneId" must refer to an id defined in the JSON.
- "title" is a short label for the editor; "dialogue" is the line the character says.

Reply with only the JSON.

Story request: `;
