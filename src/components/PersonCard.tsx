import { Trash2, ArrowUpRight, ArrowDownLeft, ChevronRight, CheckCircle2, History, Pencil } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { Person, Transaction } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';

interface PersonCardProps {
  person: Person & { transactions: Transaction[]; balance: number };
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onQuickAdd: (personId: string, type: 'given' | 'received') => void;
}

export function PersonCard({ person, onClick, onDelete, onEdit, onQuickAdd }: PersonCardProps) {
  const { formatAmount } = useTheme();

  const isPositive = person.balance > 0;
  const isSettled = person.balance === 0;

  const status = isSettled ? 'SETTLED' : isPositive ? 'OWES YOU' : 'YOU OWE';

  const statusBadgeStyle = isSettled
    ? 'bg-neutral-100 dark:bg-[#111a14] text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-[#1d3326]'
    : isPositive
    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-black'
    : 'bg-neutral-200 text-neutral-800 dark:bg-[#18261e] dark:text-neutral-200 border-neutral-300 dark:border-[#233a2d] font-bold';

  const recentTransactions = person.transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  return (
    <div
      className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group border border-neutral-200 dark:border-[#16251c] cursor-pointer"
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${person.color || 'from-emerald-700 to-neutral-900'} flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 text-base sm:text-lg border border-white/20`}>
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm sm:text-base truncate leading-snug">
                {person.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5 font-medium whitespace-nowrap">
                <History className="w-3 h-3 text-emerald-600/60 dark:text-emerald-400/60 shrink-0" />
                <span>{person.transactions.length} transaction{person.transactions.length !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>

          {/* Badge & Quick Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-[9px] sm:text-[10px] font-black tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border whitespace-nowrap ${statusBadgeStyle}`}>
              {status}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 sm:p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              title={`Edit ${person.name}`}
              aria-label={`Edit ${person.name}`}
            >
              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 sm:p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title={`Delete ${person.name}`}
              aria-label={`Delete ${person.name}`}
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-neutral-200 dark:border-[#16251c] flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">Current Balance</p>
            <p className={`text-xl sm:text-2xl font-black mt-0.5 truncate ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
              {isPositive ? '+' : ''}{formatAmount(person.balance)}
            </p>
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-neutral-500 dark:text-neutral-400 whitespace-nowrap shrink-0">
            {isSettled ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> All settled
              </span>
            ) : isPositive ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">They owe you</span>
            ) : (
              'You owe them'
            )}
          </p>
        </div>

        {/* Recent Activity List */}
        {recentTransactions.length > 0 && (
          <div className="mt-3 space-y-1.5 bg-neutral-50 dark:bg-[#0c140f] rounded-xl p-2.5 sm:p-3 border border-neutral-200 dark:border-[#16251c]">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70">Recent Activity</p>
            <div className="space-y-1">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-[11px] sm:text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="p-0.5 sm:p-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
                      {getCategoryIcon(tx.category, "w-3 h-3")}
                    </span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-[110px] sm:max-w-[130px]" title={tx.category}>
                      {tx.category}
                    </span>
                  </div>
                  <span className={`font-bold shrink-0 ${tx.type === 'given' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                    {tx.type === 'given' ? '-' : '+'}{formatAmount(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Footer Buttons */}
      <div className="mt-3 sm:mt-4 pt-3 border-t border-neutral-200 dark:border-[#16251c] flex items-center justify-between gap-1.5 sm:gap-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onQuickAdd(person.id, 'given')}
          className="flex-1 py-1.5 sm:py-2 px-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-neutral-950 dark:hover:bg-emerald-400 border border-emerald-500 dark:border-emerald-400 text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[36px] shadow-xs cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> + Gave
        </button>
        <button
          onClick={() => onQuickAdd(person.id, 'received')}
          className="flex-1 py-1.5 sm:py-2 px-2 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-[#121c15] dark:text-neutral-100 dark:hover:bg-[#1a2b20] border border-neutral-200 dark:border-[#1d3326] text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[36px] cursor-pointer"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" /> + Got
        </button>
        <button
          onClick={onClick}
          className="py-1.5 sm:py-2 px-2.5 rounded-lg bg-neutral-100 dark:bg-[#121c15] hover:bg-neutral-200 dark:hover:bg-[#1a2b20] text-neutral-800 dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold flex items-center justify-center transition-all border border-neutral-300 dark:border-[#1d3326] min-h-[36px] cursor-pointer"
          title="View Details"
          aria-label="View Person Details"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}