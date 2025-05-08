import { useState } from 'react';
import {
  Box,
  Text,
  Stack,
  Button,
  Divider,
  Burger,
  Group,
  TextInput,
  NumberInput,
  Modal,
  ActionIcon,
  Select,
} from '@mantine/core';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import { useProjectStore } from '@/src/stores/useProjectStore';
import { VariableType, VariableTypeOption } from '@/src/components/types/GlobalContextType';
import { useSceneStore } from '@/src/stores/useSceneStore';
import { NodeType, NodeData } from '@/src/components/types/CustomNodeTypes';

interface RightSidebarProps {
  opened: boolean;
  onToggle: () => void;
}

const RightSidebar = ({ opened, onToggle }: RightSidebarProps) => {
  const {
    characters,
    addCharacter,
    removeCharacter,
    variables,
    addVariable,
    removeVariable,
    files,
    addFile,
    removeFile,
  } = useProjectStore();
  const { getNodesArray, updateNode } = useSceneStore();

  const [newCharacterName, setNewCharacterName] = useState('');
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableType, setNewVariableType] = useState<VariableTypeOption>('text');
  const [newVariableValue, setNewVariableValue] = useState<VariableType>('A random value');
  const [newFileName, setNewFileName] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'character' | 'variable' | 'file'>('character');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    type: 'character' | 'variable';
    id: string;
  } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: 'character' | 'variable' | 'file';
    id: string;
  } | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState<VariableType>('');
  const [editType, setEditType] = useState<VariableTypeOption>('text');

  const handleAddCharacter = () => {
    if (newCharacterName.trim()) {
      addCharacter(newCharacterName.trim());
      setNewCharacterName('');
    }
  };

  const handleAddVariable = () => {
    if (newVariableName.trim()) {
      let value: boolean | string | number;

      try {
        if (newVariableType === 'number') {
          value = Number(newVariableValue);
          if (isNaN(value)) {
            throw new Error('Invalid number value');
          }
        } else if (newVariableType === 'boolean') {
          value = Boolean(newVariableValue);
        } else {
          value = String(newVariableValue);
        }

        addVariable(newVariableName.trim(), newVariableType, value);
        setNewVariableName('');
        setNewVariableValue('');
      } catch (error) {
        // You might want to show an error message to the user here
        console.error('Invalid variable value:', error);
      }
    }
  };

  const handleAddFile = () => {
    if (newFileName.trim()) {
      addFile(newFileName.trim(), '');
      setNewFileName('');
    }
  };

  const handleModalSubmit = () => {
    switch (modalType) {
      case 'character':
        handleAddCharacter();
        break;
      case 'variable':
        handleAddVariable();
        break;
      case 'file':
        handleAddFile();
        break;
    }
    setIsAddModalOpen(false);
  };

  const openAddModal = (type: 'character' | 'variable' | 'file') => {
    setModalType(type);
    setIsAddModalOpen(true);
  };

  const isCharacterInUse = (characterId: string) => {
    const nodes = getNodesArray();
    return nodes.some(
      (node) =>
        node.type === NodeType.Dialogue &&
        (node.data as NodeData[NodeType.Dialogue]).character === characters[characterId].name,
    );
  };

  const isVariableInUse = (variableId: string) => {
    const nodes = getNodesArray();
    return nodes.some((node) => {
      const data = node.data as any; // TODO: fix this when variables are used in other node types
      return data.variables?.includes(variableId);
    });
  };

  const handleDelete = (type: 'character' | 'variable', id: string) => {
    if (
      (type === 'character' && isCharacterInUse(id)) ||
      (type === 'variable' && isVariableInUse(id))
    ) {
      setDeleteConfirmModal({ type, id });
      return;
    }

    performDelete(type, id);
  };

  const performDelete = (type: 'character' | 'variable', id: string) => {
    if (type === 'character') {
      const characterName = characters[id].name;
      // Remove character from all dialogue nodes
      const nodes = getNodesArray();
      nodes.forEach((node) => {
        if (node.type === NodeType.Dialogue) {
          const dialogueData = node.data as NodeData[NodeType.Dialogue];
          if (dialogueData.character === characterName) {
            updateNode(node.id, { ...dialogueData, character: '' });
          }
        }
      });
      removeCharacter(id);
    } else {
      const variableName = variables[id].name;
      // Remove variable from all nodes that use it
      const nodes = getNodesArray();
      nodes.forEach((node) => {
        const data = node.data as any;
        if (data.variables?.includes(variableName)) {
          updateNode(node.id, {
            ...data,
            variables: data.variables.filter((v: string) => v !== variableName),
          });
        }
      });
      removeVariable(id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        addFile(file.name, content);
      };
      reader.readAsText(file);
    }
  };

  const handleEdit = (type: 'character' | 'variable' | 'file', id: string) => {
    setEditingItem({ type, id });
    if (type === 'character') {
      setEditName(characters[id].name);
    } else if (type === 'variable') {
      const variable = variables[id];
      setEditName(variable.name);
      setEditValue(variable.value);
      setEditType(variable.type);
    } else {
      setEditName(files[id].name);
    }
    setEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingItem) return;

    if (editingItem.type === 'character') {
      const character = characters[editingItem.id];
      character.name = editName;
      // Update character name in all dialogue nodes
      const nodes = getNodesArray();
      nodes.forEach((node) => {
        if (node.type === NodeType.Dialogue) {
          const dialogueData = node.data as NodeData[NodeType.Dialogue];
          if (dialogueData.character === character.name) {
            updateNode(node.id, { ...dialogueData, character: editName });
          }
        }
      });
    } else if (editingItem.type === 'variable') {
      const variable = variables[editingItem.id];
      variable.name = editName;
      variable.value = editValue;
      variable.type = editType;
    } else {
      const file = files[editingItem.id];
      file.name = editName;
    }

    setEditModalOpen(false);
    setEditingItem(null);
  };

  return (
    <Box>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        {opened && (
          <Text size="lg" fw={700}>
            Project
          </Text>
        )}
        <Burger opened={opened} onClick={onToggle} size="sm" style={{ marginLeft: 'auto' }} />
      </div>
      {opened && (
        <Stack>
          <Group style={{ justifyContent: 'space-between' }}>
            <Text size="md" fw={600}>
              Characters
            </Text>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => openAddModal('character')}
            >
              Add Character
            </Button>
          </Group>
          <Stack>
            {Object.values(characters).map((character) => (
              <Group key={character.id} style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text style={{ flex: 1 }}>{character.name}</Text>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    onClick={() => handleEdit('character', character.id)}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete('character', character.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}
          </Stack>

          <Divider my="md" />

          <Group style={{ justifyContent: 'space-between' }}>
            <Text size="md" fw={600}>
              Variables
            </Text>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => openAddModal('variable')}
            >
              Add Variable
            </Button>
          </Group>
          <Stack>
            {Object.values(variables).map((variable) => (
              <Group key={variable.id} style={{ width: '100%', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <Text>
                    {variable.name} ({variable.type})
                  </Text>
                  <Text size="sm" c="dimmed">
                    {String(variable.value)}
                  </Text>
                </div>
                <Group gap="xs">
                  <ActionIcon variant="subtle" onClick={() => handleEdit('variable', variable.id)}>
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete('variable', variable.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}
          </Stack>

          <Divider my="md" />

          <Group style={{ justifyContent: 'space-between' }}>
            <Text size="md" fw={600}>
              Files
            </Text>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Add File
            </Button>
            <input
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </Group>
          <Stack>
            {Object.values(files).map((file) => (
              <Group key={file.id} style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text style={{ flex: 1 }}>{file.name}</Text>
                <Group gap="xs">
                  <ActionIcon variant="subtle" onClick={() => handleEdit('file', file.id)}>
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => removeFile(file.id)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}
          </Stack>
        </Stack>
      )}

      <Modal
        opened={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
      >
        {modalType === 'character' && (
          <Stack>
            <TextInput
              label="Character Name"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.currentTarget.value)}
            />
          </Stack>
        )}

        {modalType === 'variable' && (
          <Stack>
            <TextInput
              label="Variable Name"
              value={newVariableName}
              onChange={(e) => setNewVariableName(e.currentTarget.value)}
            />
            <Select
              label="Variable Type"
              value={newVariableType}
              onChange={(value) => setNewVariableType(value as VariableTypeOption)}
              data={[
                { value: 'text', label: 'Text' },
                { value: 'number', label: 'Number' },
                { value: 'boolean', label: 'Boolean' },
              ]}
            />
            {newVariableType === 'boolean' ? (
              <Select
                label="Initial Value"
                value={String(newVariableValue)}
                onChange={(value) => setNewVariableValue(value === 'true')}
                data={[
                  { value: 'true', label: 'True' },
                  { value: 'false', label: 'False' },
                ]}
              />
            ) : newVariableType === 'number' ? (
              <NumberInput
                label="Initial Value"
                value={Number(newVariableValue)}
                onChange={(value) => setNewVariableValue(value)}
              />
            ) : (
              <TextInput
                label="Initial Value"
                value={String(newVariableValue)}
                onChange={(e) => setNewVariableValue(e.currentTarget.value)}
              />
            )}
          </Stack>
        )}

        {modalType === 'file' && (
          <Stack>
            <TextInput
              label="File Name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.currentTarget.value)}
            />
          </Stack>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleModalSubmit}>Add</Button>
        </Group>
      </Modal>

      <Modal
        opened={!!deleteConfirmModal}
        onClose={() => setDeleteConfirmModal(null)}
        title="Confirm Delete"
      >
        <Text>
          This {deleteConfirmModal?.type} is currently in use by one or more nodes. Are you sure you
          want to delete it?
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={() => setDeleteConfirmModal(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              if (deleteConfirmModal) {
                performDelete(deleteConfirmModal.type, deleteConfirmModal.id);
                setDeleteConfirmModal(null);
              }
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingItem(null);
        }}
        title={`Edit ${editingItem ? editingItem?.type.charAt(0).toUpperCase() + editingItem?.type.slice(1) : "undefined"}`}
      >
        {editingItem && (
          <Stack>
            <TextInput
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.currentTarget.value)}
            />
            {editingItem.type === 'variable' && (
              <>
                <Select
                  label="Variable Type"
                  value={editType}
                  onChange={(value) => setEditType(value as VariableTypeOption)}
                  data={[
                    { value: 'text', label: 'Text' },
                    { value: 'number', label: 'Number' },
                    { value: 'boolean', label: 'Boolean' },
                  ]}
                />
                {editType === 'boolean' ? (
                  <Select
                    label="Value"
                    value={String(editValue)}
                    onChange={(value) => setEditValue(value === 'true')}
                    data={[
                      { value: 'true', label: 'True' },
                      { value: 'false', label: 'False' },
                    ]}
                  />
                ) : editType === 'number' ? (
                  <NumberInput
                    label="Value"
                    value={Number(editValue)}
                    onChange={(value) => setEditValue(value)}
                  />
                ) : (
                  <TextInput
                    label="Value"
                    value={String(editValue)}
                    onChange={(e) => setEditValue(e.currentTarget.value)}
                  />
                )}
              </>
            )}
          </Stack>
        )}
        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={() => {
              setEditModalOpen(false);
              setEditingItem(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleEditSubmit}>Save</Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default RightSidebar;
