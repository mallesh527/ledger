import { useState, useMemo } from 'react';
import { PersonCard } from './PersonCard';
import { BalanceSummary } from './BalanceSummary';
import { Button, Input } from './UI';
import { Search, UserPlus, Sparkles, Filter, Users, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import type { Person, Transaction } from '../types';

interface DashboardProps {
  people: (Person & { transactions: Transaction[]; balance: number })[];
  onAddPerson: (name: string) => void;
  onDeletePerson: (id: string) => void;
  onViewPerson: (id: string) => void;
  onQuickAddTransaction: (personId?: string, type?: 'given' | 'received') => void;
  onLoadSampleData: () => void;
}

export function Dashboard({
  people,
  onAddPerson,
  onDeletePerson,
  onViewPerson,
  onQuickAddTransaction,
  onLoadSampleData,
}: DashboardProps) {
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'owes_you' | 'you_owe' | 'settled'>('all');

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim());
      setNewPersonName('');
      setShowAddPerson(false);
    }
  };

  const totalOwedToYou = useMemo(() => {
    return people.reduce((sum, p) => (p.balance > 0 ? sum + p.balance : sum), 0);
  }, [people]);

  const totalYouOwe = useMemo(() => {
    return people.reduce((sum, p) => (p.balance < 0 ? sum + Math.abs(p.balance) : sum), 0);
  }, [people]);

  const netBalance = totalOwedToYou - totalYouOwe;

  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (statusFilter === 'owes_you') return p.balance > 0;
      if (statusFilter === 'you_owe') return p.balance < 0;
      if (statusFilter === 'settled') return p.balance === 0;

      return true;
    });
  }, [people, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Financial Stats Cards */}
      <BalanceSummary
        totalOwedToYou={totalOwedToYou}
        totalYouOwe={totalYouOwe}
        netBalance={netBalance}
        peopleCount={people.length}
      />

      {/* Main Section Header + Controls Bar */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100 tracking-tight">Contacts & Ledgers</h2>
              <p className="text-xs text-slate-400">
                Showing {filteredPeople.length} of {people.length} contacts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="primary" size="sm" onClick={() => setShowAddPerson(true)}>
              <UserPlus className="w-4 h-4" /> Add Person
            </Button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          {/* Search Input */}
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search contact by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              All ({people.length})
            </button>
            <button
              onClick={() => setStatusFilter('owes_you')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
                statusFilter === 'owes_you'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/25'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-emerald-400'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Owes You ({people.filter(p => p.balance > 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('you_owe')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
                statusFilter === 'you_owe'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/25'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-rose-400'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> You Owe ({people.filter(p => p.balance < 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('settled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
                statusFilter === 'settled'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Settled ({people.filter(p => p.balance === 0).length})
            </button>
          </div>
        </div>

        {/* Inline Add Person Form */}
        {showAddPerson && (
          <form onSubmit={handleAddPerson} className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end animate-fade-in">
            <div className="flex-1">
              <Input
                label="Person Name"
                placeholder="e.g. Alex Rivera"
                value={newPersonName}
                onChange={e => setNewPersonName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Escape' && setShowAddPerson(false)}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md">
                Add Person
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={() => setShowAddPerson(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Empty State when no people exist */}
        {people.length === 0 && !showAddPerson && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-1">No contacts added yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              Start tracking who owes you or who you owe money to by adding your first contact or loading sample demo data.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="primary" onClick={() => setShowAddPerson(true)}>
                <UserPlus className="w-4 h-4" /> Add First Contact
              </Button>
              <Button variant="secondary" onClick={onLoadSampleData}>
                <Sparkles className="w-4 h-4 text-amber-400" /> Load Demo Data
              </Button>
            </div>
          </div>
        )}

        {/* Empty Search Result State */}
        {people.length > 0 && filteredPeople.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Filter className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-300">No matching contacts found</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing search filters or changing the status tab</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-3 text-xs font-semibold text-indigo-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Contact Cards Grid */}
        {filteredPeople.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {filteredPeople.map(person => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={() => onViewPerson(person.id)}
                onDelete={() => onDeletePerson(person.id)}
                onQuickAdd={(personId, type) => onQuickAddTransaction(personId, type)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}