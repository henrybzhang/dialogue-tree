import React, { createContext, useState } from 'react';
import { GlobalContextType } from '@/src/components/types/GlobalContextType';

export const GlobalContext = createContext<GlobalContextType>({} as GlobalContextType);

interface GlobalProviderProps {
  children: React.ReactElement;
}

const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [selectedNode, setSelectedNode] = useState('');

  return (
    <GlobalContext.Provider
      value={{
        selectedNode,
        setSelectedNode,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
