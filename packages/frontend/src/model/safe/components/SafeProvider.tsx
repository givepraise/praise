import React, { ReactNode } from 'react';
import { UseSafeReturn } from '../types/use-safe-return';
import { useSafeInit } from '../hooks/useSafeInit';

// Define the context shape
type SafeContextType = UseSafeReturn | undefined;

export const SafeContext = React.createContext<SafeContextType>(undefined);

type SafeProviderProps = {
  children: ReactNode;
};

export const SafeProvider: React.FC<SafeProviderProps> = ({
  children,
}: SafeProviderProps) => {
  const safeData = useSafeInit();

  return (
    <SafeContext.Provider value={safeData}>{children}</SafeContext.Provider>
  );
};
