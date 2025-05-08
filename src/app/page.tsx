'use client';

import { AppShell, Switch, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReactFlowProvider } from '@xyflow/react';
import GlobalProvider from '@/src/components/GlobalContext';
import Diagram from '@/src/components/Main/Diagram';
import TextEditor from '@/src/components/Main/TextEditor';
import NodePanel from '@/src/components/Panel/NodePanel';
import ScenesSidebar from '@/src/components/Sidebar/ScenesSidebar';
import RightSidebar from '@/src/components/Sidebar/RightSidebar';
import { useProjectStore } from '@/src/stores/useProjectStore';

const HomePage = () => {
  const [leftOpened, { toggle: toggleLeft }] = useDisclosure(true);
  const [rightOpened, { toggle: toggleRight }] = useDisclosure(true);
  const [isTextMode, setIsTextMode] = React.useState(false);
  const { scenes, addScene } = useProjectStore();

  useEffect(() => {
    // Create default scene only if no scenes exist
    if (Object.keys(scenes).length === 0) {
      addScene('Default Scene');
    }
  }, [addScene, scenes]);

  return (
    <GlobalProvider>
      <DndProvider backend={HTML5Backend}>
        <ReactFlowProvider>
          <AppShell
            style={{ height: '100vh' }}
            navbar={{
              width: leftOpened ? 300 : 50,
              breakpoint: 'sm',
            }}
            aside={{
              width: rightOpened ? 300 : 50,
              breakpoint: 'sm',
            }}
          >
            <AppShell.Navbar p="md">
              <ScenesSidebar opened={leftOpened} onToggle={toggleLeft} />
            </AppShell.Navbar>

            <AppShell.Main
              style={{
                position: 'relative',
                height: '100%',
                padding: 0,
                marginLeft: leftOpened ? '300px' : '50px',
                marginRight: rightOpened ? '300px' : '50px',
                transition: 'margin 0.2s ease',
                overflow: isTextMode ? 'auto' : 'hidden',
              }}
            >
              <div style={{ height: '100%', width: '100%', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50px',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5,
                  }}
                >
                  <Group>
                    <Text>Diagram View</Text>
                    <Switch
                      checked={isTextMode}
                      onChange={(event) => setIsTextMode(event.currentTarget.checked)}
                    />
                    <Text>Text View</Text>
                  </Group>
                </div>
                {isTextMode ? <TextEditor /> : <Diagram />}
                {isTextMode ? null : (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '5%',
                      left: 0,
                      right: 0,
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      zIndex: 5,
                    }}
                  >
                    <NodePanel />
                  </div>
                )}
              </div>
            </AppShell.Main>

            <AppShell.Aside p="md">
              <RightSidebar opened={rightOpened} onToggle={toggleRight} />
            </AppShell.Aside>
          </AppShell>
        </ReactFlowProvider>
      </DndProvider>
    </GlobalProvider>
  );
};

export default HomePage;
