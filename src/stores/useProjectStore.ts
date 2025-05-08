import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { VariableType, VariableTypeOption } from '@/src/components/types/GlobalContextType';
import { Scene } from '@/src/components/types/CustomNodeTypes';

interface Character {
  id: string;
  name: string;
}

interface Variable {
  id: string;
  name: string;
  type: VariableTypeOption;
  value: VariableType;
}

interface File {
  id: string;
  name: string;
  content: string;
}

interface ProjectState {
  characters: Record<string, Character>;
  variables: Record<string, Variable>;
  files: Record<string, File>;
  scenes: Record<string, Scene>;
  currentSceneId: string;
  addCharacter: (name: string, description?: string) => void;
  removeCharacter: (id: string) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  getCharacters: () => Character[];
  addVariable: (name: string, type: VariableTypeOption, value: boolean | string | number) => void;
  removeVariable: (id: string) => void;
  updateVariable: (id: string, variable: Partial<Variable>) => void;
  getVariables: () => Variable[];
  addFile: (name: string, content: string) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, file: Partial<File>) => void;
  getFiles: () => File[];
  addScene: (name: string) => void;
  switchScene: (sceneId: string) => void;
  getCurrentScene: () => Scene | undefined;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  getScenes: () => Scene[];
  getSceneIds: () => string[];
}

const defaultCharacters = [
  {
    id: `character-${uuid()}`,
    name: 'Jeff',
  },
  {
    id: `character-${uuid()}`,
    name: 'Sarah',
  },
];

const defaultVariables = [
  {
    id: `variable-${uuid()}`,
    name: 'Energy',
    type: 'number' as VariableTypeOption,
    value: 100,
  },
];

export const useProjectStore = create<ProjectState>((set, get) => ({
  characters: Object.fromEntries(defaultCharacters.map((char) => [char.id, char])),
  variables: Object.fromEntries(defaultVariables.map((v) => [v.id, v])),
  files: {},
  scenes: {},
  currentSceneId: '',

  addCharacter: (name, description) => {
    const id = `character-${uuid()}`;
    set((state) => ({
      ...state,
      characters: {
        ...state.characters,
        [id]: {
          id,
          name,
          description,
        },
      },
    }));
  },

  removeCharacter: (id) => {
    set((state) => {
      const { [id]: removed, ...remaining } = state.characters;
      return {
        ...state,
        characters: remaining,
      };
    });
  },

  updateCharacter: (id, character) => {
    set((state) => ({
      ...state,
      characters: {
        ...state.characters,
        [id]: {
          ...state.characters[id],
          ...character,
        },
      },
    }));
  },

  getCharacters: () => {
    return Object.values(get().characters);
  },

  addVariable: (name, type, value) => {
    const id = `variable-${uuid()}`;
    set((state) => ({
      ...state,
      variables: {
        ...state.variables,
        [id]: {
          id,
          name,
          type,
          value,
        },
      },
    }));
  },

  removeVariable: (id) => {
    set((state) => {
      const { [id]: removed, ...remaining } = state.variables;
      return {
        ...state,
        variables: remaining,
      };
    });
  },

  updateVariable: (id, variable) => {
    set((state) => ({
      ...state,
      variables: {
        ...state.variables,
        [id]: {
          ...state.variables[id],
          ...variable,
        },
      },
    }));
  },

  getVariables: () => {
    return Object.values(get().variables);
  },

  addFile: (name, content) => {
    const id = `file-${uuid()}`;
    set((state) => ({
      ...state,
      files: {
        ...state.files,
        [id]: {
          id,
          name,
          content,
        },
      },
    }));
  },

  removeFile: (id) => {
    set((state) => {
      const { [id]: removed, ...remaining } = state.files;
      return {
        ...state,
        files: remaining,
      };
    });
  },

  updateFile: (id, file) => {
    set((state) => ({
      ...state,
      files: {
        ...state.files,
        [id]: {
          ...state.files[id],
          ...file,
        },
      },
    }));
  },

  getFiles: () => {
    return Object.values(get().files);
  },

  addScene: (name: string): void => {
    const id = `scene-${uuid()}`;
    const newScene: Scene = {
      id,
      name,
      nodes: {},
      edges: {},
    };

    set((state) => {
      const newScenes = { ...state.scenes, [id]: newScene };
      // If this is the first scene, set it as current
      const newCurrentSceneId = state.currentSceneId || id;

      return {
        ...state,
        scenes: newScenes,
        currentSceneId: newCurrentSceneId,
      };
    });
  },

  switchScene: (sceneId: string): void => {
    set((state) => {
      const scene = state.scenes[sceneId];
      if (!scene) return state;

      return {
        ...state,
        currentSceneId: sceneId,
      };
    });
  },

  getCurrentScene: (): Scene | undefined => {
    const state = get();
    return state.scenes[state.currentSceneId];
  },

  updateScene: (sceneId: string, updates: Partial<Scene>): void => {
    set((state) => {
      const scene = state.scenes[sceneId];
      if (!scene) return state;

      return {
        ...state,
        scenes: {
          ...state.scenes,
          [sceneId]: {
            ...scene,
            ...updates,
          },
        },
      };
    });
  },

  getScenes: (): Scene[] => {
    return Object.values(get().scenes);
  },

  getSceneIds: (): string[] => {
    return Object.keys(get().scenes);
  },
}));
