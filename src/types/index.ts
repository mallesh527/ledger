export interface Person {
  id: string;
  name: string;
  color: string;
  createdAt: number;
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
}

export type Action =
  | { type: 'ADD_PERSON'; payload: Omit<Person, 'id' | 'createdAt' | 'transactions' | 'balance'> }
  | { type: 'REMOVE_PERSON'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id' | 'createdAt'> }
  | { type: 'REMOVE_TRANSACTION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD_STATE'; payload: AppState };

export const CATEGORIES = [
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

export const PERSON_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-fuchsia-600',
  'from-sky-500 to-indigo-600',
  'from-lime-500 to-emerald-600',
] as const;

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getRandomColor(usedColors: string[]): string {
  const available = PERSON_COLORS.filter(c => !usedColors.includes(c));
  return available.length > 0 ? available[0] : PERSON_COLORS[Math.floor(Math.random() * PERSON_COLORS.length)];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const SAMPLE_DATA: AppState = {
  people: [
    { id: 'p-1', name: 'Rahul Sharma', color: 'from-indigo-500 to-purple-600', createdAt: Date.now() - 86400000 * 5 },
    { id: 'p-2', name: 'Ananya Verma', color: 'from-rose-500 to-pink-600', createdAt: Date.now() - 86400000 * 4 },
    { id: 'p-3', name: 'Vikram Patel', color: 'from-emerald-500 to-teal-600', createdAt: Date.now() - 86400000 * 3 },
    { id: 'p-4', name: 'Priya Sundaram', color: 'from-cyan-500 to-blue-600', createdAt: Date.now() - 86400000 * 2 },
  ],
  transactions: [
    {
      id: 't-1',
      personId: 'p-1',
      type: 'given',
      amount: 1250,
      category: 'Food & Dining',
      description: 'Dinner at Olive Bistro & drinks',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 't-2',
      personId: 'p-1',
      type: 'given',
      amount: 450,
      category: 'Travel & Cabs',
      description: 'Uber split to airport',
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