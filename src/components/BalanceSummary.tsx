import { TrendingUp, TrendingDown, Wallet, Users, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface BalanceSummaryProps {
  totalOwedToYou: number;
  totalYouOwe: number;
  netBalance: number;
  peopleCount: number;
}

export function BalanceSummary({
  totalOwedToYou,
  totalYouOwe,
  netBalance,
  peopleCount,
}: BalanceSummaryProps) {
  const { formatAmount } = useTheme();
  const isPositive = netBalance >= 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top 3 Summary Cards - Mobile Responsive with Green Headings and Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Total Owed To You */}
        <div className="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 relative overflow-hidden group transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </span>
              Owed to You
            </div>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-600 text-white dark:bg-emerald-400 dark:text-neutral-950 font-black uppercase tracking-wider shadow-xs">
              Receivable
            </span>
          </div>

          <div className="mt-2.5 sm:mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
              {formatAmount(totalOwedToYou)}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Money lent out to contacts
            </p>
          </div>
        </div>

        {/* Card 2: Total You Owe */}
        <div className="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 relative overflow-hidden group transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <span className="p-1 sm:p-1.5 rounded-lg bg-neutral-100 dark:bg-[#121c15] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#1d3326]">
                <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </span>
              You Owe
            </div>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800 dark:bg-[#18261e] dark:text-neutral-200 font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#233a2d]">
              Payable
            </span>
          </div>

          <div className="mt-2.5 sm:mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
              {formatAmount(totalYouOwe)}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
              <TrendingDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> Pending settlements owed
            </p>
          </div>
        </div>

        {/* Card 3: Net Balance Position */}
        <div className="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 relative overflow-hidden group transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              Net Position
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-bold">
              <Users className="w-3.5 h-3.5 text-emerald-600/70 dark:text-emerald-400/70" />
              <span>{peopleCount} People</span>
            </div>
          </div>

          <div className="mt-2.5 sm:mt-4">
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight truncate ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
              {isPositive ? '+' : ''}{formatAmount(netBalance)}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {isPositive ? 'Overall surplus position' : 'Overall deficit position'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}