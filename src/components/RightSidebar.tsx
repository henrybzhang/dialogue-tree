import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Burger,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useProjectStore } from '@/src/stores/useProjectStore';
import { defaultValue, NodeType, VariableTypeOption, VariableValue } from '@/src/types';
import ValueInput from './ValueInput';

type Kind = 'character' | 'variable' | 'file';

/** Add (no id) or edit (id) form state for the modal. */
type Form = {
  kind: Kind;
  id?: string;
  name: string;
  type: VariableTypeOption;
  value: VariableValue;
};

interface SectionProps {
  title: string;
  onAdd: () => void;
  items: { id: string; label: string; detail?: string }[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const Section = ({ title, onAdd, items, onEdit, onDelete }: SectionProps) => (
  <>
    <Group justify="space-between">
      <Text size="md" fw={600}>
        {title}
      </Text>
      <Button variant="subtle" size="xs" leftSection={<IconPlus size={14} />} onClick={onAdd}>
        Add
      </Button>
    </Group>
    <Stack>
      {items.map((item) => (
        <Group key={item.id} justify="space-between" wrap="nowrap">
          <div style={{ flex: 1 }}>
            <Text>{item.label}</Text>
            {item.detail && (
              <Text size="sm" c="dimmed">
                {item.detail}
              </Text>
            )}
          </div>
          <Group gap="xs">
            <ActionIcon variant="subtle" onClick={() => onEdit(item.id)}>
              <IconEdit size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={() => onDelete(item.id)}>
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>
      ))}
    </Stack>
  </>
);

const RightSidebar = ({ opened, onToggle }: { opened: boolean; onToggle: () => void }) => {
  const store = useProjectStore();
  const { characters, variables, files, scenes } = store;
  const [form, setForm] = useState<Form | null>(null);

  const openForm = (kind: Kind, id?: string) => {
    const variable = kind === 'variable' && id ? variables[id] : undefined;
    const name = id
      ? { character: characters, variable: variables, file: files }[kind][id].name
      : '';
    setForm({
      kind,
      id,
      name,
      type: variable?.type ?? 'text',
      value: variable?.value ?? '',
    });
  };

  const save = () => {
    if (!form) return;
    const name = form.name.trim();
    if (!name) return;
    if (form.kind === 'character') {
      if (form.id) store.updateCharacter(form.id, { name });
      else store.addCharacter(name);
    } else if (form.kind === 'variable') {
      const variable = { name, type: form.type, value: form.value };
      if (form.id) store.updateVariable(form.id, variable);
      else store.addVariable(variable);
    } else if (form.id) {
      store.updateFile(form.id, { name });
    }
    setForm(null);
  };

  const nodes = Object.values(scenes).flatMap((scene) => Object.values(scene.nodes));
  const remove = (kind: 'character' | 'variable', id: string) => {
    const inUse = nodes.some((n) =>
      kind === 'character'
        ? n.type === NodeType.Dialogue && n.data.characterId === id
        : n.type === NodeType.If && n.data.variableId === id,
    );
    if (inUse && !window.confirm(`This ${kind} is used by one or more nodes. Delete it anyway?`)) {
      return;
    }
    if (kind === 'character') store.removeCharacter(id);
    else store.removeVariable(id);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) store.addFile(file.name, await file.text());
    event.target.value = '';
  };

  return (
    <Box>
      <Group mb="md">
        {opened && (
          <Text size="lg" fw={700}>
            Project
          </Text>
        )}
        <Burger opened={opened} onClick={onToggle} size="sm" ml="auto" />
      </Group>
      {opened && (
        <Stack>
          <Section
            title="Characters"
            onAdd={() => openForm('character')}
            items={Object.values(characters).map((c) => ({ id: c.id, label: c.name }))}
            onEdit={(id) => openForm('character', id)}
            onDelete={(id) => remove('character', id)}
          />
          <Divider my="md" />
          <Section
            title="Variables"
            onAdd={() => openForm('variable')}
            items={Object.values(variables).map((v) => ({
              id: v.id,
              label: `${v.name} (${v.type})`,
              detail: String(v.value),
            }))}
            onEdit={(id) => openForm('variable', id)}
            onDelete={(id) => remove('variable', id)}
          />
          <Divider my="md" />
          <Section
            title="Files"
            onAdd={() => document.getElementById('file-upload')?.click()}
            items={Object.values(files).map((f) => ({ id: f.id, label: f.name }))}
            onEdit={(id) => openForm('file', id)}
            onDelete={store.removeFile}
          />
          <input id="file-upload" type="file" hidden onChange={handleFileUpload} />
        </Stack>
      )}

      <Modal
        opened={!!form}
        onClose={() => setForm(null)}
        title={form && `${form.id ? 'Edit' : 'Add'} ${form.kind}`}
      >
        {form && (
          <Stack>
            <TextInput
              label="Name"
              data-autofocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
            {form.kind === 'variable' && (
              <>
                <Select
                  label="Type"
                  value={form.type}
                  onChange={(type) =>
                    type &&
                    setForm({
                      ...form,
                      type: type as VariableTypeOption,
                      value: defaultValue(type as VariableTypeOption),
                    })
                  }
                  data={[
                    { value: 'text', label: 'Text' },
                    { value: 'number', label: 'Number' },
                    { value: 'boolean', label: 'Boolean' },
                  ]}
                />
                <ValueInput
                  label={form.id ? 'Value' : 'Initial Value'}
                  type={form.type}
                  value={form.value}
                  onChange={(value) => setForm({ ...form, value })}
                />
              </>
            )}
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button onClick={save}>{form.id ? 'Save' : 'Add'}</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default RightSidebar;
