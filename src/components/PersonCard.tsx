import { Trash2, ArrowUpRight, ArrowDownLeft, ChevronRight, CheckCircle2, History } from 'lucide-react';
import type { Person, Transaction } from '../types';
import { formatCurrency } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';

interface PersonCardProps {
  person: Person & { transactions: Transaction[]; balance: number };
  onClick: () => void;
  onDelete: () => void;
  onQuickAdd: (personId: string, type: 'given' | 'received') => void;
}

export function PersonCard({ person, onClick, onDelete, onQuickAdd }: PersonCardProps) {
  const isPositive = person.balance > 0;
  const isSettled = person.balance === 0;

  const status = isSettled ? 'SETTLED' : isPositive ? 'OWES YOU' : 'YOU OWE';

  const statusBadgeStyle = isSettled
    ? 'bg-slate-800/80 text-slate-400 border-slate-700/60'
    : isPositive
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  const recentTransactions = person.transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  return (
    <div
      className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer"
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${person.color || 'from-indigo-500 to-purple-600'} flex items-center justify-center font-bold text-white shadow-md shadow-indigo-950/50 flex-shrink-0 text-lg border border-white/20`}>
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors truncate">
                {person.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <History className="w-3 h-3 text-slate-500" />
                {person.transactions.length} transaction{person.transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadgeStyle}`}>
              {status}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title={`Delete ${person.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-baseline justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Current Balance</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${isSettled ? 'text-slate-400' : isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{formatCurrency(person.balance)}
            </p>
          </div>
          <p className="text-xs font-medium text-slate-400">
            {isSettled ? (
              <span className="flex items-center gap-1 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> All settled
              </span>
            ) : isPositive ? (
              'They owe you'
            ) : (
              'You owe them'
            )}
          </p>
        </div>

        {/* Recent Activity List */}
        {recentTransactions.length > 0 && (
          <div className="mt-4 space-y-2 bg-slate-900/60 rounded-xl p-3 border border-slate-800/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recent Activity</p>
            <div className="space-y-1.5">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`p-1 rounded-md ${tx.type === 'given' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {getCategoryIcon(tx.category)}
                    </span>
                    <span className="text-slate-300 truncate max-w-[130px]" title={tx.category}>
                      {tx.category}
                    </span>
                  </div>
                  <span className={`font-semibold ${tx.type === 'given' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {tx.type === 'given' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Footer Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onQuickAdd(person.id, 'given')}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
        >
          <ArrowUpRight className="w-3.5 h-3.5" /> + Gave
        </button>
        <button
          onClick={() => onQuickAdd(person.id, 'received')}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
        >
          <ArrowDownLeft className="w-3.5 h-3.5" /> + Got
        </button>
        <button
          onClick={onClick}
          className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center transition-all"
          title="View Details"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}