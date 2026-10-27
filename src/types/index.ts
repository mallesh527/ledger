export interface Person {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  notes?: string;
  phone?: string;
  transactions?: Transaction[];
  balance?: number;
}

export interface Transaction {
  id: string;
  personId: string;
  type: 'given' | 'received';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: number;
}

export interface AppState {
  people: Person[];
  transactions: Transaction[];
  customCategories?: string[];
}

export type Action =
  | { type: 'ADD_PERSON'; payload: Omit<Person, 'id' | 'createdAt' | 'transactions' | 'balance'> }
  | { type: 'REMOVE_PERSON'; payload: string }
  | { type: 'EDIT_PERSON'; payload: { id: string; name: string; color?: string; notes?: string; phone?: string } }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id' | 'createdAt'> }
  | { type: 'REMOVE_TRANSACTION'; payload: string }
  | { type: 'EDIT_TRANSACTION'; payload: { id: string; personId: string; type: 'given' | 'received'; amount: number; category: string; description: string; date: string } }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD_STATE'; payload: AppState };

export const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Rent & Utilities',
  'Shopping',
  'Entertainment',
  'Travel & Cabs',
  'Groceries',
  'Healthcare',
  'Gifts & Celebrations',
  'Education',
  'Other',
] as const;

export const CATEGORIES = DEFAULT_CATEGORIES;

/* Curated Emerald & Green Fintech Badge Gradients */
export const PERSON_COLORS = [
  'from-emerald-600 to-teal-900',
  'from-emerald-700 to-emerald-950',
  'from-teal-600 to-emerald-900',
  'from-green-600 to-emerald-800',
  'from-emerald-500 to-neutral-900',
  'from-emerald-800 to-neutral-950',
  'from-teal-700 to-neutral-900',
  'from-green-700 to-neutral-950',
] as const;

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getRandomColor(usedColors: string[]): string {
  const available = PERSON_COLORS.filter(c => !usedColors.includes(c));
  return available.length > 0 ? available[0] : PERSON_COLORS[Math.floor(Math.random() * PERSON_COLORS.length)];
}

export function formatCurrency(amount: number, symbol = '₹'): string {
  const absVal = Math.abs(amount);
  try {
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absVal);
    return `${symbol}${formattedNumber}`;
  } catch (_) {
    return `${symbol}${absVal.toFixed(2)}`;
  }
}

export const SAMPLE_DATA: AppState = {
  people: [
    { id: 'p-1', name: 'Rahul Sharma', color: 'from-emerald-600 to-teal-900', createdAt: Date.now() - 86400000 * 5, notes: 'College friend' },
    { id: 'p-2', name: 'Ananya Verma', color: 'from-emerald-700 to-emerald-950', createdAt: Date.now() - 86400000 * 4, notes: 'Flatmate' },
    { id: 'p-3', name: 'Vikram Patel', color: 'from-teal-600 to-emerald-900', createdAt: Date.now() - 86400000 * 3 },
    { id: 'p-4', name: 'Priya Sundaram', color: 'from-green-600 to-emerald-800', createdAt: Date.now() - 86400000 * 2, notes: 'Colleague' },
  ],
  transactions: [
    {
      id: 't-1',
      personId: 'p-1',
      type: 'given',
      amount: 1250,
      category: 'Food & Dining',
      description: 'Dinner at Bistro & drinks',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 't-2',
      personId: 'p-1',
      type: 'given',
      amount: 450,
      category: 'Travel & Cabs',
      description: 'Cab split to airport',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      createdAt: Date.now() - 86400000,
    },
    {
      id: 't-3',
      personId: 'p-2',
      type: 'given',
      amount: 3200,
      category: 'Rent & Utilities',
      description: 'WiFi & Electricity bill split',
      date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 't-4',
      personId: 'p-2',
      type: 'received',
      amount: 1500,
      category: 'Other',
      description: 'UPI transfer for concert tickets',
      date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 't-5',
      personId: 'p-3',
      type: 'received',
      amount: 800,
      category: 'Shopping',
      description: 'Borrowed for groceries earlier',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      createdAt: Date.now() - 86400000,
    },
    {
      id: 't-6',
      personId: 'p-4',
      type: 'given',
      amount: 2000,
      category: 'Gifts & Celebrations',
      description: 'Team birthday present contribution',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 't-7',
      personId: 'p-4',
      type: 'received',
      amount: 2000,
      category: 'Gifts & Celebrations',
      description: 'Settled birthday split via GPay',
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    },
  ],
};