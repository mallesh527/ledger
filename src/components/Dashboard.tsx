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
  onEditPerson: (person: Person) => void;
  onViewPerson: (id: string) => void;
  onQuickAddTransaction: (personId?: string, type?: 'given' | 'received') => void;
  onLoadSampleData: () => void;
}

export function Dashboard({
  people,
  onAddPerson,
  onDeletePerson,
  onEditPerson,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Top Financial Stats Cards */}
      <BalanceSummary
        totalOwedToYou={totalOwedToYou}
        totalYouOwe={totalYouOwe}
        netBalance={netBalance}
        peopleCount={people.length}
      />

      {/* Main Section Header + Controls Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-[#16251c]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-neutral-200 dark:border-[#16251c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold shrink-0 shadow-xs">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight uppercase">
                Contacts & Ledgers
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Showing {filteredPeople.length} of {people.length} contacts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setShowAddPerson(true)} className="w-full sm:w-auto h-9 text-xs">
              <UserPlus className="w-4 h-4" /> Add Person
            </Button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-3 sm:mt-4">
          {/* Search Input */}
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search contact by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status Filter Badges - Horizontally Scrollable on Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 border-emerald-600 dark:border-emerald-400 shadow-sm shadow-emerald-500/10'
                  : 'bg-white dark:bg-[#0c140f] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-[#1d3326] hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-300'
              }`}
            >
              All ({people.length})
            </button>
            <button
              onClick={() => setStatusFilter('owes_you')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer ${
                statusFilter === 'owes_you'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 border-emerald-600 dark:border-emerald-400 shadow-sm shadow-emerald-500/10'
                  : 'bg-white dark:bg-[#0c140f] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-[#1d3326] hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-300'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> Owes You ({people.filter(p => p.balance > 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('you_owe')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer ${
                statusFilter === 'you_owe'
                  ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-950 border-neutral-800 dark:border-neutral-200'
                  : 'bg-white dark:bg-[#0c140f] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-[#1d3326] hover:border-neutral-400 dark:hover:border-neutral-600'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" /> You Owe ({people.filter(p => p.balance < 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('settled')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer ${
                statusFilter === 'settled'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-950 dark:text-emerald-300 border-emerald-700 dark:border-emerald-700'
                  : 'bg-white dark:bg-[#0c140f] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-[#1d3326] hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Settled ({people.filter(p => p.balance === 0).length})
            </button>
          </div>
        </div>

        {/* Inline Add Person Form */}
        {showAddPerson && (
          <form onSubmit={handleAddPerson} className="mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-[#0c140f] border border-emerald-500/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end animate-fade-in shadow-xs">
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
              <Button type="submit" variant="primary" size="md" className="flex-1 sm:flex-initial">
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
          <div className="text-center py-12 sm:py-16 px-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 sm:mb-4 shadow-sm shadow-emerald-500/10">
              <Users className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mb-1">No contacts added yet</h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-5 sm:mb-6">
              Start tracking who owes you or who you owe money to by adding your first contact or loading sample demo data.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Button variant="primary" onClick={() => setShowAddPerson(true)} className="w-full sm:w-auto">
                <UserPlus className="w-4 h-4" /> Add First Contact
              </Button>
              <Button variant="secondary" onClick={onLoadSampleData} className="w-full sm:w-auto">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Load Demo Data
              </Button>
            </div>
          </div>
        )}

        {/* Empty Search Result State */}
        {people.length > 0 && filteredPeople.length === 0 && (
          <div className="text-center py-10 sm:py-12 text-neutral-500 dark:text-neutral-400">
            <Filter className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-emerald-500/60" />
            <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm sm:text-base">No matching contacts found</p>
            <p className="text-xs text-neutral-500 mt-1">Try clearing search filters or changing the status tab</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline uppercase cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Contact Cards Grid - 1 col on mobile, 2 col on tablet, 3 col on desktop */}
        {filteredPeople.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-5">
            {filteredPeople.map(person => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={() => onViewPerson(person.id)}
                onDelete={() => onDeletePerson(person.id)}
                onEdit={() => onEditPerson(person)}
                onQuickAdd={(personId, type) => onQuickAddTransaction(personId, type)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}