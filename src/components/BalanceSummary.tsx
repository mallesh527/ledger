import { TrendingUp, TrendingDown, Wallet, Users, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { formatCurrency } from '../types';

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
  const isPositive = netBalance >= 0;

  return (
    <div className="space-y-4">
      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Owed To You */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <ArrowUpRight className="w-4 h-4" />
              </span>
              Owed to You
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Receivable
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {formatCurrency(totalOwedToYou)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Total money lent out across active contacts
            </p>
          </div>
        </div>

        {/* Card 2: Total You Owe */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <span className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <ArrowDownLeft className="w-4 h-4" />
              </span>
              You Owe
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
              Payable
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {formatCurrency(totalYouOwe)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Pending settlements owed to friends
            </p>
          </div>
        </div>

        {/* Card 3: Net Balance Position */}
        <div className={`glass-card rounded-2xl p-5 relative overflow-hidden group border ${isPositive ? 'hover:border-indigo-500/40' : 'hover:border-rose-500/40'} transition-all`}>
          <div className={`absolute top-0 right-0 w-32 h-32 ${isPositive ? 'bg-indigo-500/15' : 'bg-rose-500/15'} rounded-full blur-2xl pointer-events-none`} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Wallet className="w-4 h-4" />
              </span>
              Net Position
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5" />
              <span>{peopleCount} People</span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className={`text-3xl font-extrabold tracking-tight ${isPositive ? 'text-indigo-300' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{formatCurrency(netBalance)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              {isPositive ? 'Overall surplus position' : 'Overall deficit position'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}