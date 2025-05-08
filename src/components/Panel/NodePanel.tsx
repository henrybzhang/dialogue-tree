import { CSSProperties, List, ThemeIcon } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import { useContext } from 'react';
import { GlobalContext } from '@/src/components/GlobalContext';
import { GlobalContextType } from '@/src/components/types/GlobalContextType';
import { PanelDraggable } from '@/src/components/Panel/PanelDraggable';
import { NodeType } from '@/src/components/types/CustomNodeTypes';

const DragIcon = () => (
  <ThemeIcon>
    <IconGripVertical></IconGripVertical>
  </ThemeIcon>
);

const templateNodes: [NodeType, string][] = [
  [NodeType.Dialogue, 'Dialogue'],
  [NodeType.Choice, 'Choice'],
  [NodeType.Jump, 'Jump'],
  [NodeType.SwitchScene, 'Scene Change'],
  [NodeType.If, 'If'],
];

const NodePanel = () => {
  const { selectedNode, setSelectedNode } = useContext(GlobalContext) as GlobalContextType;

  const handleClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const selectedStyle: CSSProperties = {
    outlineColor: 'blue',
    outlineStyle: 'solid',
  };

  return (
    <List
      icon={DragIcon()}
      style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
    >
      {templateNodes.map(([nodeId, nodeName]) => (
        <PanelDraggable key={nodeId} type={nodeId}>
          <List.Item
            key={nodeId}
            onClick={() => handleClick(nodeId)}
            style={{
              ...(selectedNode === nodeId ? selectedStyle : undefined),
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {nodeName}
          </List.Item>
        </PanelDraggable>
      ))}
    </List>
  );
};

export default NodePanel;
