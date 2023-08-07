import { useContext } from 'react';
import { UseSafeReturn } from '../types/use-safe-return';
import { SafeContext } from '../components/SafeProvider';

export function useSafe(): UseSafeReturn {
  const context = useContext(SafeContext);
  if (!context) {
    throw new Error('useSafe must be used within a SafeProvider');
  }
  return context;
}
