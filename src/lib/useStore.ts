import { useState, useCallback } from 'react';
import { Material, Tax, Transaction, UserRole } from './types';
import * as store from './store';

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>(store.getMaterials);
  const refresh = useCallback(() => setMaterials(store.getMaterials()), []);
  const add = useCallback((m: Material) => { store.addMaterial(m); refresh(); }, [refresh]);
  const update = useCallback((m: Material) => { store.updateMaterial(m); refresh(); }, [refresh]);
  const remove = useCallback((id: string) => { store.deleteMaterial(id); refresh(); }, [refresh]);
  return { materials, add, update, remove, refresh };
}

export function useTaxes() {
  const [taxes, setTaxes] = useState<Tax[]>(store.getTaxes);
  const refresh = useCallback(() => setTaxes(store.getTaxes()), []);
  const add = useCallback((t: Tax) => { store.addTax(t); refresh(); }, [refresh]);
  const update = useCallback((t: Tax) => { store.updateTax(t); refresh(); }, [refresh]);
  const remove = useCallback((id: string) => { store.deleteTax(id); refresh(); }, [refresh]);
  return { taxes, add, update, remove, refresh };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(store.getTransactions);
  const refresh = useCallback(() => setTransactions(store.getTransactions()), []);
  const add = useCallback((tx: Transaction) => { store.addTransaction(tx); refresh(); }, [refresh]);
  return { transactions, add, refresh };
}

export function useRole() {
  const [role, setRoleState] = useState<UserRole>(store.getRole);
  const setRole = useCallback((r: UserRole) => { store.setRole(r); setRoleState(r); }, []);
  return { role, setRole };
}
