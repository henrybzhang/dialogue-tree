import { Group, Select, Text, Textarea, TextInput } from '@mantine/core';
import { useCurrentScene, useProjectStore } from '@/src/stores/useProjectStore';
import {
  CustomNode,
  defaultValue,
  IF_OPERATORS,
  NODE_COLORS,
  NODE_LABELS,
  NodeType,
} from '@/src/types';
import ValueInput from './ValueInput';

// Shared by the diagram cards and the text view so both edit nodes the same way.

export const NodeHeader = ({ node }: { node: CustomNode }) => {
  const updateNode = useProjectStore((s) => s.updateNode);
  return (
    <Group gap="xs" wrap="nowrap">
      <div
        style={{
          width: 8,
          height: 8,
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: NODE_COLORS[node.type],
        }}
      />
      <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {NODE_LABELS[node.type]}
      </Text>
      <TextInput
        value={node.data.title}
        onChange={(e) => updateNode(node.id, { ...node.data, title: e.currentTarget.value })}
        variant="unstyled"
        fw="bold"
        className="nodrag"
        style={{ flex: 1 }}
      />
    </Group>
  );
};

export const NodeFields = ({ node }: { node: CustomNode }) => {
  const updateNode = useProjectStore((s) => s.updateNode);
  const characters = useProjectStore((s) => s.characters);
  const variables = useProjectStore((s) => s.variables);
  const scenes = useProjectStore((s) => s.scenes);
  const scene = useCurrentScene();

  switch (node.type) {
    case NodeType.Dialogue:
      return (
        <>
          <Select
            placeholder="Character"
            searchable
            data={Object.values(characters).map((c) => ({ value: c.id, label: c.name }))}
            value={node.data.characterId || null}
            onChange={(v) => updateNode(node.id, { ...node.data, characterId: v ?? '' })}
            className="nodrag"
          />
          <Textarea
            placeholder="Dialogue"
            autosize
            minRows={2}
            value={node.data.dialogue}
            onChange={(e) => updateNode(node.id, { ...node.data, dialogue: e.currentTarget.value })}
            className="nodrag"
            style={{ flex: 1 }}
          />
        </>
      );
    case NodeType.If:
      return (
        <Select
          placeholder="Variable"
          data={Object.values(variables).map((v) => ({ value: v.id, label: v.name }))}
          value={node.data.variableId || null}
          onChange={(id) => {
            if (!id) return;
            const value = defaultValue(variables[id].type);
            const conditions = Object.fromEntries(
              Object.entries(node.data.conditions).map(([k, c]) => [k, { ...c, value }]),
            );
            updateNode(node.id, { ...node.data, variableId: id, conditions });
          }}
          className="nodrag"
        />
      );
    case NodeType.Jump:
      return (
        <Select
          placeholder="Target node"
          data={Object.values(scene.nodes)
            .filter((n) => n.id !== node.id)
            .map((n) => ({ value: n.id, label: n.data.title }))}
          value={node.data.targetNodeId || null}
          onChange={(v) => updateNode(node.id, { ...node.data, targetNodeId: v ?? '' })}
          className="nodrag"
        />
      );
    case NodeType.SwitchScene:
      return (
        <Select
          placeholder="Next scene"
          data={Object.values(scenes)
            .filter((s) => s.id !== scene.id)
            .map((s) => ({ value: s.id, label: s.name }))}
          value={node.data.nextSceneId || null}
          onChange={(v) => updateNode(node.id, { ...node.data, nextSceneId: v ?? '' })}
          className="nodrag"
        />
      );
    default:
      return null;
  }
};

/** Editor for one outgoing branch: a choice's text or an if-condition. */
export const BranchFields = ({ node, branchId }: { node: CustomNode; branchId: string }) => {
  const updateNode = useProjectStore((s) => s.updateNode);
  const variables = useProjectStore((s) => s.variables);

  if (node.type === NodeType.Choice) {
    return (
      <TextInput
        value={node.data.choices[branchId]}
        onChange={(e) =>
          updateNode(node.id, {
            ...node.data,
            choices: { ...node.data.choices, [branchId]: e.currentTarget.value },
          })
        }
        className="nodrag"
        style={{ flex: 1 }}
      />
    );
  }
  if (node.type !== NodeType.If) return null;

  const condition = node.data.conditions[branchId];
  const variableType = variables[node.data.variableId]?.type;
  const setCondition = (patch: Partial<typeof condition>) =>
    updateNode(node.id, {
      ...node.data,
      conditions: { ...node.data.conditions, [branchId]: { ...condition, ...patch } },
    });

  return (
    <>
      <Select
        value={condition.type}
        onChange={(v) => v && setCondition({ type: v as typeof condition.type })}
        data={IF_OPERATORS.filter((op) => variableType === 'number' || !op.numericOnly)}
        className="nodrag"
        style={{ width: 70 }}
      />
      <ValueInput
        type={variableType}
        value={condition.value}
        onChange={(value) => setCondition({ value })}
        className="nodrag"
        style={{ flex: 1 }}
      />
    </>
  );
};
