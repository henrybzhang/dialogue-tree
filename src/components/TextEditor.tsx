import React, { ReactNode, useState } from 'react';
import { ActionIcon, Box, Divider, Group, Stack, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useCurrentScene } from '@/src/stores/useProjectStore';
import { branchIds, CustomNode } from '@/src/types';
import { BranchFields, NodeFields, NodeHeader } from './NodeFields';

const INDENT = 40;

const Row = ({
  level,
  toggle,
  children,
}: {
  level: number;
  toggle?: ReactNode;
  children: ReactNode;
}) => (
  <Group gap={0} align="flex-start" wrap="nowrap" mb={8}>
    <Box w={32} pt={4} style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
      {toggle}
    </Box>
    <Stack gap={2} style={{ flex: 1, marginLeft: level * INDENT }}>
      {children}
    </Stack>
  </Group>
);

const TextEditor = () => {
  const scene = useCurrentScene();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const nodes = Object.values(scene.nodes);
  const edges = Object.values(scene.edges);

  const toggleCollapse = (nodeId: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (!next.delete(nodeId)) next.add(nodeId);
      return next;
    });

  const children = (node: CustomNode, handle?: string) =>
    edges
      .filter((e) => e.source === node.id && (handle === undefined || e.sourceHandle === handle))
      .map((e) => scene.nodes[e.target])
      .filter(Boolean);

  // Each node is rendered once; later visits (merges, loops) become a reference line.
  const shown = new Set<string>();

  const renderTree = (node: CustomNode, level: number): ReactNode => {
    if (shown.has(node.id)) {
      return (
        <Row key={`ref-${level}-${node.id}`} level={level}>
          <Text size="sm" c="dimmed">
            ↪ continues at “{node.data.title}”
          </Text>
        </Row>
      );
    }
    shown.add(node.id);

    const branches = branchIds(node);
    const isCollapsed = collapsed.has(node.id);
    const toggle = branches.length > 0 && (
      <ActionIcon variant="subtle" onClick={() => toggleCollapse(node.id)}>
        {isCollapsed ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
      </ActionIcon>
    );

    return (
      <React.Fragment key={node.id}>
        <Row level={level} toggle={toggle}>
          <NodeHeader node={node} />
          <Group gap="xs" align="flex-start">
            <NodeFields node={node} />
          </Group>
        </Row>
        {!isCollapsed &&
          (branches.length > 0
            ? branches.map((branchId) => (
                <React.Fragment key={branchId}>
                  <Row level={level + 1}>
                    <Group gap="xs" wrap="nowrap">
                      <BranchFields node={node} branchId={branchId} />
                    </Group>
                  </Row>
                  {children(node, branchId).map((child) => renderTree(child, level + 2))}
                </React.Fragment>
              ))
            : children(node).map((child) => renderTree(child, level)))}
      </React.Fragment>
    );
  };

  // Roots first, then anything only reachable through a cycle.
  const roots = nodes.filter((node) => !edges.some((edge) => edge.target === node.id));
  const trees: ReactNode[] = roots.map((node) => renderTree(node, 0));
  for (const node of nodes) {
    if (!shown.has(node.id)) trees.push(renderTree(node, 0));
  }

  return (
    <Box p="2rem" style={{ flex: 1, overflow: 'auto' }}>
      <Stack gap="md">
        {trees.map((tree, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider my="md" />}
            {tree}
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  );
};

export default TextEditor;
