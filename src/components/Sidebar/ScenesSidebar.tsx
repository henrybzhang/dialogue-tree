import { Box, Text, Stack, Button, Burger, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useProjectStore } from '@/src/stores/useProjectStore';

interface ScenesSidebarProps {
  opened: boolean;
  onToggle: () => void;
}

const ScenesSidebar = ({ opened, onToggle }: ScenesSidebarProps) => {
  const { scenes, currentSceneId, addScene, switchScene } = useProjectStore();

  const handleAddScene = () => {
    const sceneName = `Scene ${Object.keys(scenes).length + 1}`;
    addScene(sceneName);
  };

  return (
    <Box>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <Burger opened={opened} onClick={onToggle} size="sm" />
        {opened && (
          <Group style={{ marginLeft: '1rem', flex: 1, justifyContent: 'space-between' }}>
            <Text size="lg" fw={700}>
              Scenes
            </Text>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={handleAddScene}
            >
              Add Scene
            </Button>
          </Group>
        )}
      </div>

      {opened && (
        <Stack>
          {Object.values(scenes).map((scene) => (
            <Button
              key={scene.id}
              variant={scene.id === currentSceneId ? 'filled' : 'subtle'}
              onClick={() => switchScene(scene.id)}
              fullWidth
            >
              {scene.name}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ScenesSidebar;
