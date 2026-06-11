import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchGates as apiFetchGates,
  fetchTransactions as apiFetchTransactions,
  createGateApi,
  updateGateApi,
  deleteGateApi,
  createTransactionApi,
  updateTransactionApi,
  deleteTransactionApi,
  archiveTransactionApi,
} from '../services/api';
import { addAuditEntry } from '../utils/audit';

export interface Gate {
  id: number;
  name: string;
  code: string;
  initial_balance: number;
  balance: number;
  currency: string;
  created_at: string;
  created_by?: string;
}

export interface Transaction {
  id: number;
  gate_id: number;
  recipient: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'Accepted' | 'Pending';
  comments: string;
  verified: boolean;
  created_at: string;
  created_by?: string;
  archived: boolean;
  archived_at?: string;
  gate?: {
    name: string;
    code: string;
  };
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface FinancialContextType {
  gates: Gate[];
  transactions: Transaction[];
  archivedTransactions: Transaction[];
  allTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  toasts: ToastMessage[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  createGate: (gate: Omit<Gate, 'id' | 'balance' | 'created_at'>) => Promise<boolean>;
  updateGate: (id: number, gate: Omit<Gate, 'id' | 'balance' | 'created_at'>) => Promise<boolean>;
  deleteGate: (id: number) => Promise<boolean>;
  createTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'gate' | 'archived' | 'archived_at'>) => Promise<boolean>;
  updateTransaction: (id: number, tx: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: number) => Promise<boolean>;
  archiveTransaction: (id: number) => Promise<boolean>;
  unarchiveTransaction: (id: number) => Promise<boolean>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gates, setGates] = useState<Gate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [archivedTransactions, setArchivedTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage fallback
  const loadFromLocalStorage = () => {
    try {
      const storedGates = localStorage.getItem('financial_gates');
      const storedTransactions = localStorage.getItem('financial_transactions');

      if (storedGates) setGates(JSON.parse(storedGates));
      
      if (storedTransactions) {
        const txData = JSON.parse(storedTransactions);
        const active = txData.filter((tx: Transaction) => !tx.archived);
        const archived = txData.filter((tx: Transaction) => tx.archived);
        setTransactions(active);
        setArchivedTransactions(archived);
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  };

  const saveGatesToLocal = (newGates: Gate[]) => {
    try {
      localStorage.setItem('financial_gates', JSON.stringify(newGates));
      setGates(newGates);
    } catch (err) {
      console.error('Error saving gates to localStorage:', err);
    }
  };

  const saveTransactionsToLocal = (active: Transaction[], archived: Transaction[]) => {
    try {
      const allTx = [...active, ...archived];
      localStorage.setItem('financial_transactions', JSON.stringify(allTx));
      setTransactions(active);
      setArchivedTransactions(archived);
    } catch (err) {
      console.error('Error saving transactions to localStorage:', err);
    }
  };

  // تحميل البيانات من API (Supabase)
  const loadFromApi = async () => {
    const [gatesData, txsData] = await Promise.all([
      apiFetchGates(),
      apiFetchTransactions(),
    ]);

    setGates(gatesData);
    const active = txsData.filter(tx => !tx.archived);
    const archived = txsData.filter(tx => tx.archived);
    setTransactions(active);
    setArchivedTransactions(archived);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // محاولة التحميل من API أولاً، مع fallback إلى localStorage
      try {
        await loadFromApi();
      } catch {
        console.warn('API unavailable, falling back to localStorage.');
        loadFromLocalStorage();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred.');
      showToast(err.message || 'Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const getCurrentUserName = (): string | undefined => {
    try {
      const sessionData = sessionStorage.getItem('app_session');
      if (!sessionData) return undefined;
      const { userId } = JSON.parse(sessionData);
      const storedUsers = localStorage.getItem('app_users');
      if (!storedUsers) return undefined;
      const users = JSON.parse(storedUsers);
      const user = users.find((u: any) => u.id === userId);
      return user?.name;
    } catch { return undefined; }
  };

  const createGate = async (gate: Omit<Gate, 'id' | 'balance' | 'created_at'>) => {
    try {
      try {
        const newGate = await createGateApi(gate);
        setGates(prev => [...prev, newGate]);
      } catch {
        const newGate: Gate = {
          ...gate,
          currency: gate.currency || 'DZD',
          id: Math.max(...gates.map(g => g.id), 0) + 1,
          balance: gate.initial_balance,
          created_at: new Date().toISOString(),
          created_by: getCurrentUserName(),
        };
        const updatedGates = [...gates, newGate];
        saveGatesToLocal(updatedGates);
      }
      addAuditEntry({ action: 'create', entity: 'gate', entityId: 0, summary: `Gate "${gate.name}" created`, performedBy: getCurrentUserName() });
      showToast(`Gate "${gate.name}" successfully established.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to create gate.', 'error');
      return false;
    }
  };

  const updateGate = async (id: number, gate: Omit<Gate, 'id' | 'balance' | 'created_at'>) => {
    try {
      try {
        await updateGateApi(id, gate);
      } catch {
        const existingGate = gates.find(g => g.id === id);
        if (!existingGate) throw new Error('Gate not found');
        const updatedGates = gates.map(g =>
          g.id === id ? { ...g, ...gate } : g
        );
        saveGatesToLocal(updatedGates);
      }
      addAuditEntry({ action: 'update', entity: 'gate', entityId: id, summary: `Gate "${gate.name}" (#${id}) updated`, performedBy: getCurrentUserName() });
      showToast(`Gate "${gate.name}" configurations updated.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to update gate.', 'error');
      return false;
    }
  };

  const deleteGate = async (id: number) => {
    try {
      try {
        await deleteGateApi(id);
      } catch {
        const updatedGates = gates.filter(g => g.id !== id);
        saveGatesToLocal(updatedGates);
      }
      const targetGate = gates.find(g => g.id === id);
      addAuditEntry({ action: 'delete', entity: 'gate', entityId: id, summary: `Gate "${targetGate?.name || id}" deleted`, performedBy: getCurrentUserName() });
      showToast(`Gate "${targetGate?.name || id}" and all associated ledgers purged.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to delete gate.', 'error');
      return false;
    }
  };

  const createTransaction = async (tx: Omit<Transaction, 'id' | 'created_at' | 'gate' | 'archived' | 'archived_at'>) => {
    try {
      try {
        const newTx = await createTransactionApi(tx);
        setTransactions(prev => [newTx, ...prev]);
      } catch {
        const newTx: Transaction = {
          ...tx,
          id: Math.max(...transactions.map(t => t.id), ...archivedTransactions.map(t => t.id), 0) + 1,
          created_at: new Date().toISOString(),
          archived: false,
          created_by: getCurrentUserName(),
        } as Transaction;
        const updatedTransactions = [...transactions, newTx];
        saveTransactionsToLocal(updatedTransactions, archivedTransactions);
      }
      
      addAuditEntry({ action: 'create', entity: 'transaction', entityId: 0, summary: `${tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${Math.abs(tx.amount)} DZD for ${tx.recipient}`, performedBy: getCurrentUserName() });
      const typeLabel = tx.type === 'deposit' ? 'Deposit' : 'Withdrawal';
      showToast(`${typeLabel} of ${Math.abs(tx.amount)} DZD queued successfully.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to record transaction.', 'error');
      return false;
    }
  };

  const updateTransaction = async (id: number, tx: Partial<Transaction>) => {
    try {
      try {
        await updateTransactionApi(id, tx);
      } catch {
        const allTx = [...transactions, ...archivedTransactions];
        const original = allTx.find(t => t.id === id);
        if (!original) throw new Error('Transaction not found');

        const merged = { ...original, ...tx };
        const { gate, ...cleanTx } = merged as any;

        const isArchived = original.archived;
        if (isArchived) {
          const updatedArchived = archivedTransactions.map(t => t.id === id ? cleanTx : t);
          saveTransactionsToLocal(transactions, updatedArchived);
        } else {
          const updatedActive = transactions.map(t => t.id === id ? cleanTx : t);
          saveTransactionsToLocal(updatedActive, archivedTransactions);
        }
      }
      
      addAuditEntry({ action: 'update', entity: 'transaction', entityId: id, summary: `Transaction #${id} updated`, performedBy: getCurrentUserName() });
      showToast(`Transaction ledger record #${id} updated successfully.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to update transaction record.', 'error');
      return false;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      try {
        await deleteTransactionApi(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
        setArchivedTransactions(prev => prev.filter(t => t.id !== id));
      } catch {
        const updatedActive = transactions.filter(t => t.id !== id);
        const updatedArchived = archivedTransactions.filter(t => t.id !== id);
        saveTransactionsToLocal(updatedActive, updatedArchived);
      }
      addAuditEntry({ action: 'delete', entity: 'transaction', entityId: id, summary: `Transaction #${id} deleted`, performedBy: getCurrentUserName() });
      showToast(`Transaction record #${id} deleted. Balances re-calibrated.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to delete transaction.', 'error');
      return false;
    }
  };

  const archiveTransaction = async (id: number) => {
    try {
      try {
        await archiveTransactionApi(id, true);
        setTransactions(prev => prev.filter(t => t.id !== id));
        const tx = transactions.find(t => t.id === id);
        if (tx) {
          const archivedTx = { ...tx, archived: true, archived_at: new Date().toISOString() };
          setArchivedTransactions(prev => [...prev, archivedTx]);
        }
      } catch {
        const txToArchive = transactions.find(t => t.id === id);
        if (!txToArchive) throw new Error('Transaction not found');
        const archivedTx: Transaction = {
          ...txToArchive,
          archived: true,
          archived_at: new Date().toISOString()
        };
        const updatedActive = transactions.filter(t => t.id !== id);
        const updatedArchived = [...archivedTransactions, archivedTx];
        saveTransactionsToLocal(updatedActive, updatedArchived);
      }
      addAuditEntry({ action: 'archive', entity: 'transaction', entityId: id, summary: `Transaction #${id} archived`, performedBy: getCurrentUserName() });
      showToast(`Transaction record #${id} archived successfully.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to archive transaction.', 'error');
      return false;
    }
  };

  const unarchiveTransaction = async (id: number) => {
    try {
      try {
        await archiveTransactionApi(id, false);
        setArchivedTransactions(prev => prev.filter(t => t.id !== id));
        const tx = archivedTransactions.find(t => t.id === id);
        if (tx) {
          const restoredTx = { ...tx, archived: false, archived_at: undefined };
          setTransactions(prev => [restoredTx, ...prev]);
        }
      } catch {
        const txToRestore = archivedTransactions.find(t => t.id === id);
        if (!txToRestore) throw new Error('Transaction not found');
        const restoredTx: Transaction = {
          ...txToRestore,
          archived: false,
          archived_at: undefined
        };
        const updatedArchived = archivedTransactions.filter(t => t.id !== id);
        const updatedActive = [...transactions, restoredTx];
        saveTransactionsToLocal(updatedActive, updatedArchived);
      }
      addAuditEntry({ action: 'unarchive', entity: 'transaction', entityId: id, summary: `Transaction #${id} restored from archive`, performedBy: getCurrentUserName() });
      showToast(`Transaction record #${id} restored from archive.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to restore transaction.', 'error');
      return false;
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        gates,
        transactions,
        archivedTransactions,
        allTransactions: [...transactions, ...archivedTransactions],
        loading,
        error,
        toasts,
        showToast,
        removeToast,
        refreshData,
        createGate,
        updateGate,
        deleteGate,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        archiveTransaction,
        unarchiveTransaction,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
