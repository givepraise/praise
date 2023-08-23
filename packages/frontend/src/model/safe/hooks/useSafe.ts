import { ReactSafeContext } from '../components/SafeContextProvider';
import { SafeContext } from '../types/use-safe-return';
import { useContext } from 'react';

export function useSafe(): SafeContext {
  const context = useContext(ReactSafeContext);
  if (!context) {
    throw new Error('useSafe must be used within a SafeProvider');
  }
  return context;
}
