import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../api/types';

type OverridesMap = Record<number, Product>;
type OverridesCtx = {
  overrides: OverridesMap;
  setOverride: (p: Product) => void;
  setOverrides: (list: Product[]) => void;
  clearOverride: (id: number) => void;
  clearAll: () => void;
};

const OverridesContext = createContext<OverridesCtx | null>(null);

export function OverridesProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverridesState] = useState<OverridesMap>({});

  // Add or merge one
  const setOverride = useCallback((p: Product) => {
    setOverridesState(prev => ({ ...prev, [p.id]: { ...prev[p.id], ...p } }));
  }, []);

  // Merge several
  const setOverrides = useCallback((list: Product[]) => {
    setOverridesState(prev => {
      const next = { ...prev };
      list.forEach(p => {
        next[p.id] = { ...next[p.id], ...p };
      });
      return next;
    });
  }, []);

  // Remove one
  const clearOverride = useCallback((id: number) => {
    setOverridesState(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // Remove all
  const clearAll = useCallback(() => setOverridesState({}), []);
  const value = useMemo(
    () => ({ overrides, setOverride, setOverrides, clearOverride, clearAll }),
    [overrides, setOverride, setOverrides, clearOverride, clearAll]
  );

  return <OverridesContext.Provider value={value}>{children}</OverridesContext.Provider>;
}

export function useOverrides() {
  const ctx = useContext(OverridesContext);
  if (!ctx) throw new Error('useOverrides must be used within <OverridesProvider>');
  return ctx;
}
