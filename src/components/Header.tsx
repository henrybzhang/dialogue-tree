import { useState } from 'react';
import {
  Alert,
  Button,
  CopyButton,
  FileButton,
  Group,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { exportStory, importStory, STORY_FORMAT_PROMPT } from '@/src/story';

export type View = 'diagram' | 'text' | 'play';

const downloadJson = () => {
  const blob = new Blob([JSON.stringify(exportStory(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'story.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

const Header = ({ view, onViewChange }: { view: View; onViewChange: (v: View) => void }) => {
  const [importOpen, setImportOpen] = useState(false);
  const [json, setJson] = useState('');
  const [error, setError] = useState('');

  const doImport = (text: string) => {
    try {
      // AI chats often wrap the JSON in prose or ``` fences; take the outermost object.
      importStory(JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)));
      setImportOpen(false);
      setJson('');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Text fw={700}>Dialogue Tree</Text>
      <SegmentedControl
        value={view}
        onChange={(v) => onViewChange(v as View)}
        data={[
          { value: 'diagram', label: 'Diagram' },
          { value: 'text', label: 'Text' },
          { value: 'play', label: 'Play' },
        ]}
      />
      <Group gap="xs">
        <Button
          variant="default"
          size="xs"
          leftSection={<IconUpload size={14} />}
          onClick={() => setImportOpen(true)}
        >
          Import
        </Button>
        <Button
          variant="default"
          size="xs"
          leftSection={<IconDownload size={14} />}
          onClick={downloadJson}
        >
          Export
        </Button>
      </Group>

      <Modal
        opened={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import story"
        size="lg"
      >
        <Stack>
          <Text size="sm">
            Paste story JSON or choose a file. This replaces the current project. To have an AI
            write one, copy the format instructions into any AI chat, add what the story should be
            about, and paste its reply here.
          </Text>
          <CopyButton value={STORY_FORMAT_PROMPT}>
            {({ copied, copy }) => (
              <Button variant="light" onClick={copy}>
                {copied ? 'Copied' : 'Copy format instructions for an AI chat'}
              </Button>
            )}
          </CopyButton>
          <Textarea
            placeholder='{ "scenes": [ ... ] }'
            autosize
            minRows={8}
            maxRows={20}
            value={json}
            onChange={(e) => setJson(e.currentTarget.value)}
            styles={{ input: { fontFamily: 'monospace' } }}
          />
          {error && <Alert color="red">{error}</Alert>}
          <Group justify="space-between">
            <FileButton
              accept="application/json"
              onChange={async (f) => f && doImport(await f.text())}
            >
              {(props) => (
                <Button variant="subtle" {...props}>
                  Choose file…
                </Button>
              )}
            </FileButton>
            <Button disabled={!json.trim()} onClick={() => doImport(json)}>
              Import
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Group>
  );
};

export default Header;
