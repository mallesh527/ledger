import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { AppState, Action, Person, Transaction } from '../types';
import { generateId, getRandomColor, SAMPLE_DATA } from '../types';
import { subscribeToLedger, pushLedgerToCloud } from '../firebase';

const STORAGE_KEY = 'ledger-app-state-v2';
const SYNC_KEY_STORAGE = 'ledger-sync-key-v1';

const initialState: AppState = {
  people: [],
  transactions: [],
};

function getInitialSyncKey(): string {
  try {
    const saved = localStorage.getItem(SYNC_KEY_STORAGE);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (e) {
    console.error('Failed to load sync key:', e);
  }
  const newKey = `ledger-${Math.random().toString(36).slice(2, 8)}`;
  try {
    localStorage.setItem(SYNC_KEY_STORAGE, newKey);
  } catch (_) {}
  return newKey;
}

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.people)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load local state:', e);
  }
  return initialState;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save local state:', e);
  }
}

function reducer(state: AppState, action: Action): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'ADD_PERSON': {
      const newPerson: Person = {
        ...action.payload,
        id: generateId(),
        createdAt: Date.now(),
        transactions: [],
        balance: 0,
      };
      newState = {
        ...state,
        people: [...state.people, newPerson],
      };
      break;
    }

    case 'REMOVE_PERSON': {
      newState = {
        ...state,
        people: state.people.filter(p => p.id !== action.payload),
        transactions: state.transactions.filter(t => t.personId !== action.payload),
      };
      break;
    }

    case 'EDIT_PERSON': {
      newState = {
        ...state,
        people: state.people.map(p =>
          p.id === action.payload.id
            ? {
                ...p,
                name: action.payload.name,
                color: action.payload.color || p.color,
                notes: action.payload.notes !== undefined ? action.payload.notes : p.notes,
                phone: action.payload.phone !== undefined ? action.payload.phone : p.phone,
              }
            : p
        ),
      };
      break;
    }

    case 'ADD_TRANSACTION': {
      const newTransaction: Transaction = {
        ...action.payload,
        id: generateId(),
        createdAt: Date.now(),
      };
      newState = {
        ...state,
        transactions: [newTransaction, ...state.transactions],
      };
      break;
    }

    case 'REMOVE_TRANSACTION': {
      newState = {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
      break;
    }

    case 'EDIT_TRANSACTION': {
      newState = {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id
            ? {
                ...t,
                personId: action.payload.personId,
                type: action.payload.type,
                amount: action.payload.amount,
                category: action.payload.category,
                description: action.payload.description,
                date: action.payload.date,
              }
            : t
        ),
      };
      break;
    }

    case 'CLEAR_ALL': {
      newState = initialState;
      break;
    }

    case 'LOAD_STATE': {
      newState = action.payload;
      break;
    }

    default:
      return state;
  }

  saveState(newState);
  return newState;
}

interface LedgerContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  syncKey: string;
  setSyncKey: (key: string) => void;
  isSynced: boolean;
  people: (Person & { transactions: Transaction[]; balance: number })[];
  addPerson: (name: string, notes?: string, phone?: string) => void;
  removePerson: (id: string) => void;
  editPerson: (id: string, name: string, color?: string, notes?: string, phone?: string) => void;
  addTransaction: (
    personId: string,
    type: 'given' | 'received',
    amount: number,
    category: string,
    description: string,
    date: string
  ) => void;
  removeTransaction: (personId: string, transactionId: string) => void;
  editTransaction: (
    id: string,
    personId: string,
    type: 'given' | 'received',
    amount: number,
    category: string,
    description: string,
    date: string
  ) => void;
  clearAll: () => void;
  loadSampleData: () => void;
  exportCSV: () => void;
  exportJSON: () => void;
  importJSON: (jsonData: string) => boolean;
  getPersonById: (id: string) => (Person & { transactions: Transaction[]; balance: number }) | undefined;
}

const LedgerContext = createContext<LedgerContextValue | undefined>(undefined);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);
  const [syncKey, setSyncKeyInternal] = useState<string>(getInitialSyncKey);
  const [isSynced, setIsSynced] = useState<boolean>(false);

  const setSyncKey = (key: string) => {
    const trimmed = key.trim().toLowerCase();
    if (!trimmed) return;
    setSyncKeyInternal(trimmed);
    try {
      localStorage.setItem(SYNC_KEY_STORAGE, trimmed);
    } catch (_) {}
  };

  useEffect(() => {
    if (!syncKey) return;

    if (state.people.length > 0 || state.transactions.length > 0) {
      pushLedgerToCloud(syncKey, state);
    }

    const unsubscribe = subscribeToLedger(
      syncKey,
      (remoteState) => {
        setIsSynced(true);
        dispatch({ type: 'LOAD_STATE', payload: remoteState });
      },
      () => {
        setIsSynced(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [syncKey]);

  const dispatchAndCloudSync = (action: Action) => {
    dispatch(action);
    setTimeout(() => {
      const currentState = loadState();
      pushLedgerToCloud(syncKey, currentState);
    }, 50);
  };

  const addPerson = (name: string, notes?: string, phone?: string) => {
    const usedColors = state.people.map(p => p.color);
    dispatchAndCloudSync({
      type: 'ADD_PERSON',
      payload: { name, color: getRandomColor(usedColors), notes, phone },
    });
  };

  const removePerson = (id: string) => {
    dispatchAndCloudSync({ type: 'REMOVE_PERSON', payload: id });
  };

  const editPerson = (id: string, name: string, color?: string, notes?: string, phone?: string) => {
    dispatchAndCloudSync({
      type: 'EDIT_PERSON',
      payload: { id, name, color, notes, phone },
    });
  };

  const addTransaction = (
    personId: string,
    type: 'given' | 'received',
    amount: number,
    category: string,
    description: string,
    date: string
  ) => {
    dispatchAndCloudSync({
      type: 'ADD_TRANSACTION',
      payload: { personId, type, amount, category, description, date },
    });
  };

  const removeTransaction = (_personId: string, transactionId: string) => {
    dispatchAndCloudSync({ type: 'REMOVE_TRANSACTION', payload: transactionId });
  };

  const editTransaction = (
    id: string,
    personId: string,
    type: 'given' | 'received',
    amount: number,
    category: string,
    description: string,
    date: string
  ) => {
    dispatchAndCloudSync({
      type: 'EDIT_TRANSACTION',
      payload: { id, personId, type, amount, category, description, date },
    });
  };

  const clearAll = () => {
    dispatchAndCloudSync({ type: 'CLEAR_ALL' });
  };

  const loadSampleData = () => {
    dispatchAndCloudSync({ type: 'LOAD_STATE', payload: SAMPLE_DATA });
  };

  const exportCSV = () => {
    const headers = ['Person', 'Type', 'Amount', 'Category', 'Description', 'Date'];
    const rows = state.transactions.map(t => {
      const person = state.people.find(p => p.id === t.personId);
      return [
        `"${person?.name || 'Unknown'}"`,
        `"${t.type === 'given' ? 'GAVE' : 'RECEIVED'}"`,
        t.amount.toFixed(2),
        `"${t.category}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${t.date}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `ledger_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const importJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.people) && Array.isArray(parsed.transactions)) {
        dispatchAndCloudSync({ type: 'LOAD_STATE', payload: parsed });
        return true;
      }
    } catch (e) {
      console.error('Import JSON error:', e);
    }
    return false;
  };

  const peopleWithData = state.people.map(person => {
    const personTransactions = state.transactions.filter(t => t.personId === person.id);
    const given = personTransactions
      .filter(t => t.type === 'given')
      .reduce((sum, t) => sum + t.amount, 0);
    const received = personTransactions
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...person,
      transactions: personTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      balance: given - received,
    };
  });

  const getPersonById = (id: string) => {
    return peopleWithData.find(p => p.id === id);
  };

  return (
    <LedgerContext.Provider
      value={{
        state,
        dispatch,
        syncKey,
        setSyncKey,
        isSynced,
        people: peopleWithData,
        addPerson,
        removePerson,
        editPerson,
        addTransaction,
        removeTransaction,
        editTransaction,
        clearAll,
        loadSampleData,
        exportCSV,
        exportJSON,
        importJSON,
        getPersonById,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
}