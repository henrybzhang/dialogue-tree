import React, { useState } from 'react';
import { useSceneStore } from '@/src/stores/useSceneStore';
import { Box, Stack, Divider, ActionIcon } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import NodeTextArea from './NodeTextArea';
import { CustomNode, NodeData, NodeType } from '../types/CustomNodeTypes';

type NodeChange = {
  nodeId: string;
  newData: NodeData[NodeType];
};

const TextEditor = () => {
  const { getNodesArray, getEdgesArray, updateNode } = useSceneStore();
  const [error, setError] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const nodes = getNodesArray();
  const edges = getEdgesArray();

  const toggleCollapse = (nodeId: string) => {
    setCollapsedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Find root nodes (nodes with no incoming edges)
  const rootNodes = nodes.filter((node) => !edges.some((edge) => edge.target === node.id));

  const handleNodeChange = (nodeChange: NodeChange) => {
    try {
      const node = nodes.find((n) => n.id === nodeChange.nodeId);
      if (!node) return;

      updateNode(nodeChange.nodeId, { ...node.data, ...nodeChange.newData } as NodeData[NodeType]);
      setError(null);
    } catch (err) {
      setError(err as string);
    }
  };

  const renderNodeTree = (node: CustomNode, level: number = 0) => {
    const childEdges = edges.filter((edge) => edge.source === node.id);
    const childNodes = childEdges
      .map((edge) => nodes.find((n) => n.id === edge.target))
      .filter((n): n is CustomNode => n !== undefined);

    const isCollapsible = node.type === NodeType.Choice || node.type === NodeType.If;
    const isCollapsed = collapsedNodes.has(node.id);

    return (
      <React.Fragment key={node.id}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ width: 32, display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
            {isCollapsible ? (
              <ActionIcon variant="subtle" onClick={() => toggleCollapse(node.id)}>
                {isCollapsed ? (
                  <IconChevronRight style={{ verticalAlign: 'middle' }} size={16} />
                ) : (
                  <IconChevronDown style={{ verticalAlign: 'middle' }} size={16} />
                )}
              </ActionIcon>
            ) : null}
          </div>
          <div style={{ flex: 1 }}>
            <NodeTextArea node={node} onChange={handleNodeChange} indentLevel={level} />
          </div>
        </div>
        {!isCollapsed && (
          <>
            {node.type === NodeType.Choice && (
              <React.Fragment>
                {Object.entries((node.data as NodeData[NodeType.Choice]).choices).map(
                  ([choiceId, choiceText]) => (
                    <React.Fragment key={choiceId}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ width: 32 }} />
                        <div style={{ flex: 1 }}>
                          <NodeTextArea
                            node={node}
                            onChange={handleNodeChange}
                            indentLevel={level + 1}
                            optionId={choiceId}
                          />
                        </div>
                      </div>
                      {childNodes
                        .filter((childNode) => {
                          const edge = edges.find(
                            (edge) =>
                              edge.source === node.id &&
                              edge.target === childNode.id &&
                              edge.sourceHandle === choiceId,
                          );
                          return edge !== undefined;
                        })
                        .map((childNode) => renderNodeTree(childNode, level + 2))}
                    </React.Fragment>
                  ),
                )}
              </React.Fragment>
            )}
            {node.type === NodeType.If && (
              <React.Fragment>
                {Object.entries((node.data as NodeData[NodeType.If]).conditions).map(
                  ([conditionId, condition]) => (
                    <React.Fragment key={conditionId}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ width: 32 }} />
                        <div style={{ flex: 1 }}>
                          <NodeTextArea
                            node={node}
                            onChange={handleNodeChange}
                            indentLevel={level + 1}
                            optionId={conditionId}
                          />
                        </div>
                      </div>
                      {childNodes
                        .filter((childNode) => {
                          const edge = edges.find(
                            (edge) =>
                              edge.source === node.id &&
                              edge.target === childNode.id &&
                              edge.sourceHandle === conditionId,
                          );
                          return edge !== undefined;
                        })
                        .map((childNode) => renderNodeTree(childNode, level + 2))}
                    </React.Fragment>
                  ),
                )}
              </React.Fragment>
            )}
            {node.type !== NodeType.Choice &&
              node.type !== NodeType.If &&
              childNodes.map((childNode) => {
                return renderNodeTree(childNode, level);
              })}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box
      style={{
        padding: '2rem',
        paddingTop: '4rem',
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        top: '50px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {error && (
        <Box
          style={{
            color: 'red',
            marginBottom: '1rem',
            padding: '0.5rem',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
          }}
        >
          {error}
        </Box>
      )}
      <Stack gap="md">
        {rootNodes.map((node, index) => (
          <React.Fragment key={node.id}>
            {index > 0 && <Divider my="md" />}
            {renderNodeTree(node)}
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  );
};

export default TextEditor;
