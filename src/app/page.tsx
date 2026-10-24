'use client';

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Diagram from '@/src/components/Diagram';
import Header, { View } from '@/src/components/Header';
import NodePanel from '@/src/components/NodePanel';
import Player from '@/src/components/Player';
import RightSidebar from '@/src/components/RightSidebar';
import ScenesSidebar from '@/src/components/ScenesSidebar';
import TextEditor from '@/src/components/TextEditor';
import { useProjectStore } from '@/src/stores/useProjectStore';

const HomePage = () => {
  const [leftOpened, { toggle: toggleLeft }] = useDisclosure(true);
  const [rightOpened, { toggle: toggleRight }] = useDisclosure(true);
  const [view, setView] = useState<View>('diagram');

  useEffect(() => {
    useProjectStore.persist.rehydrate();
  }, []);

  const currentSceneId = useProjectStore((s) => s.currentSceneId);

  return (
    <ReactFlowProvider>
      <AppShell
        padding={0}
        header={{ height: 50 }}
        navbar={{ width: leftOpened ? 300 : 50, breakpoint: 'sm' }}
        aside={{ width: rightOpened ? 300 : 50, breakpoint: 'sm' }}
      >
        <AppShell.Header>
          <Header view={view} onViewChange={setView} />
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <ScenesSidebar opened={leftOpened} onToggle={toggleLeft} />
        </AppShell.Navbar>

        <AppShell.Main style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
          {view === 'play' ? (
            <Player key={currentSceneId} />
          ) : view === 'text' ? (
            <TextEditor />
          ) : (
            <>
              <Diagram />
              <div
                style={{
                  padding: '1rem',
                  borderTop: '1px solid var(--mantine-color-default-border)',
                }}
              >
                <NodePanel />
              </div>
            </>
          )}
        </AppShell.Main>

        <AppShell.Aside p="md">
          <RightSidebar opened={rightOpened} onToggle={toggleRight} />
        </AppShell.Aside>
      </AppShell>
    </ReactFlowProvider>
  );
};

export default HomePage;
