import { useEffect, useRef, useState } from 'react';
import { Box, Button, Paper, Stack, Text } from '@mantine/core';
import { useProjectStore } from '@/src/stores/useProjectStore';
import { CustomNode, IfOperator, NodeType, Scene, Variable, VariableValue } from '@/src/types';

type Line = { speaker?: string; text: string; picked?: boolean };
type PlayState = { sceneId: string; node: CustomNode | null; lines: Line[]; note?: string };

const startNode = (scene?: Scene) => {
  if (!scene) return null;
  const nodes = Object.values(scene.nodes);
  const edges = Object.values(scene.edges);
  return nodes.find((n) => !edges.some((e) => e.target === n.id)) ?? nodes[0] ?? null;
};

const nextNode = (scene: Scene, source: string, handle?: string) => {
  const edge = Object.values(scene.edges).find(
    (e) => e.source === source && (handle === undefined || e.sourceHandle === handle),
  );
  return edge ? scene.nodes[edge.target] : null;
};

const test = (op: IfOperator, a: VariableValue, b: VariableValue) => {
  switch (op) {
    case 'equals':
      return a === b;
    case 'notEquals':
      return a !== b;
    case 'greaterThan':
      return a > b;
    case 'lessThan':
      return a < b;
    case 'greaterThanOrEqual':
      return a >= b;
    case 'lessThanOrEqual':
      return a <= b;
  }
};

/** Follow if/jump/switchScene nodes until one that needs the reader (dialogue, choice) or the end. */
const settle = (
  scenes: Record<string, Scene>,
  variables: Record<string, Variable>,
  sceneId: string,
  node: CustomNode | null,
): Pick<PlayState, 'sceneId' | 'node' | 'note'> => {
  for (let steps = 0; node; steps++) {
    if (steps > 1000) return { sceneId, node: null, note: 'Stopped: jumps loop forever.' };
    const scene = scenes[sceneId];
    if (node.type === NodeType.Dialogue || node.type === NodeType.Choice) return { sceneId, node };
    if (node.type === NodeType.Jump) {
      node = scene.nodes[node.data.targetNodeId] ?? null;
    } else if (node.type === NodeType.SwitchScene) {
      sceneId = node.data.nextSceneId;
      node = startNode(scenes[sceneId]);
    } else {
      const value = variables[node.data.variableId]?.value;
      const hit = Object.entries(node.data.conditions).find(([, c]) =>
        test(c.type, value, c.value),
      );
      node = hit ? nextNode(scene, node.id, hit[0]) : null;
    }
  }
  return { sceneId, node: null };
};

const Player = () => {
  const { scenes, variables, characters, currentSceneId } = useProjectStore();
  const bottom = useRef<HTMLDivElement>(null);

  const enter = (sceneId: string, node: CustomNode | null, lines: Line[]): PlayState => {
    const next = settle(scenes, variables, sceneId, node);
    if (next.node?.type !== NodeType.Dialogue) return { ...next, lines };
    const { characterId, dialogue } = next.node.data;
    return {
      ...next,
      lines: [...lines, { speaker: characters[characterId]?.name, text: dialogue }],
    };
  };
  const restart = () => enter(currentSceneId, startNode(scenes[currentSceneId]), []);
  const [play, setPlay] = useState(restart);
  const { node, lines } = play;
  const scene = scenes[play.sceneId];

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [play]);

  return (
    <Box p="2rem" style={{ flex: 1, overflow: 'auto' }}>
      <Stack maw={700} mx="auto" gap="sm">
        {lines.map((line, i) =>
          line.picked ? (
            <Text key={i} ta="right" c="blue" fs="italic">
              {line.text}
            </Text>
          ) : (
            <Paper key={i} withBorder p="sm" radius="md">
              {line.speaker && (
                <Text fw={700} size="sm">
                  {line.speaker}
                </Text>
              )}
              <Text style={{ whiteSpace: 'pre-wrap' }}>{line.text}</Text>
            </Paper>
          ),
        )}

        {node?.type === NodeType.Dialogue && (
          <Button
            variant="light"
            onClick={() => setPlay(enter(play.sceneId, nextNode(scene, node.id), lines))}
          >
            Continue
          </Button>
        )}
        {node?.type === NodeType.Choice &&
          Object.entries(node.data.choices).map(([handle, text]) => (
            <Button
              key={handle}
              variant="outline"
              onClick={() =>
                setPlay(
                  enter(play.sceneId, nextNode(scene, node.id, handle), [
                    ...lines,
                    { text, picked: true },
                  ]),
                )
              }
            >
              {text}
            </Button>
          ))}
        {!node && (
          <>
            <Text ta="center" c="dimmed">
              {play.note ?? (lines.length ? 'The End' : 'This scene has nothing to play yet.')}
            </Text>
            <Button variant="subtle" onClick={() => setPlay(restart())}>
              Restart
            </Button>
          </>
        )}
        <div ref={bottom} />
      </Stack>
    </Box>
  );
};

export default Player;
