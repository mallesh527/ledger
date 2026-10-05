import { format, parseISO } from 'date-fns';
import { useState, useMemo } from 'react';
import { Modal, ConfirmDialog } from './Modal';
import { Button, Input } from './UI';
import { ArrowUpRight, ArrowDownLeft, Trash2, Search, Calendar, History, Wallet, Tag } from 'lucide-react';
import type { Person, Transaction } from '../types';
import { formatCurrency } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';

interface PersonDetailModalProps {
  person: Person & { transactions: Transaction[]; balance: number };
  isOpen: boolean;
  onClose: () => void;
  onDeleteTransaction: (personId: string, transactionId: string) => void;
  onQuickAddTransaction: (personId: string, type: 'given' | 'received') => void;
}

export function PersonDetailModal({
  person,
  isOpen,
  onClose,
  onDeleteTransaction,
  onQuickAddTransaction,
}: PersonDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ txId: string; tx: Transaction } | null>(null);
  const [searchTx, setSearchTx] = useState('');

  const totalGiven = useMemo(() => {
    return person.transactions
      .filter(t => t.type === 'given')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [person.transactions]);

  const totalReceived = useMemo(() => {
    return person.transactions
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [person.transactions]);

  const sortedTransactions = useMemo(() => {
    return [...person.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(t => {
        if (!searchTx) return true;
        const q = searchTx.toLowerCase();
        return (
          t.category.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q)
        );
      });
  }, [person.transactions, searchTx]);

  if (!isOpen) return null;

  const isPositive = person.balance > 0;
  const isSettled = person.balance === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ledger: ${person.name}`} size="lg">
      <div className="space-y-6">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${person.color || 'from-indigo-500 to-purple-600'} flex items-center justify-center font-extrabold text-white text-2xl shadow-lg border border-white/20`}>
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">{person.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                {person.transactions.length} recorded transaction{person.transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="danger"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => onQuickAddTransaction(person.id, 'given')}
            >
              <ArrowUpRight className="w-4 h-4" /> + You Gave
            </Button>
            <Button
              variant="success"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => onQuickAddTransaction(person.id, 'received')}
            >
              <ArrowDownLeft className="w-4 h-4" /> + You Got
            </Button>
          </div>
        </div>

        {/* Financial Stat Breakdown Pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/80 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-rose-400" /> Total Given
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-rose-400 mt-1">
              -{formatCurrency(totalGiven)}
            </p>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/80 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> Total Got
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400 mt-1">
              +{formatCurrency(totalReceived)}
            </p>
          </div>

          <div className={`bg-slate-900/60 rounded-xl p-3.5 border text-center ${
            isSettled
              ? 'border-slate-800'
              : isPositive
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-rose-500/40 bg-rose-500/5'
          }`}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Wallet className="w-3 h-3" /> Net Balance
            </p>
            <p className={`text-lg sm:text-xl font-extrabold mt-1 ${
              isSettled ? 'text-slate-400' : isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isPositive ? '+' : ''}{formatCurrency(person.balance)}
            </p>
          </div>
        </div>

        {/* Transactions List Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider">
              Transaction History ({sortedTransactions.length})
            </h4>

            {person.transactions.length > 0 && (
              <div className="w-full sm:w-60">
                <Input
                  placeholder="Filter transactions..."
                  value={searchTx}
                  onChange={e => setSearchTx(e.target.value)}
                  icon={<Search className="w-3.5 h-3.5" />}
                />
              </div>
            )}
          </div>

          {sortedTransactions.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-slate-800/60">
              <Tag className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-slate-300 font-medium">No transactions recorded</p>
              <p className="text-xs text-slate-500 mt-0.5">Use the "+ You Gave" or "+ You Got" buttons to add a transaction.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sortedTransactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      tx.type === 'given'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {getCategoryIcon(tx.category, "w-4 h-4")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-200 text-sm truncate">{tx.category}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          tx.type === 'given' ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {tx.type === 'given' ? 'GAVE' : 'GOT'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {tx.description || 'No description added'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className={`font-bold text-base ${tx.type === 'given' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {tx.type === 'given' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        {format(parseISO(tx.date), 'MMM d, yyyy')}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowDeleteConfirm({ txId: tx.id, tx })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => {
          if (showDeleteConfirm) {
            onDeleteTransaction(person.id, showDeleteConfirm.txId);
            setShowDeleteConfirm(null);
          }
        }}
        title="Delete Transaction?"
        message={`Are you sure you want to delete "${showDeleteConfirm?.tx.category}" for ${showDeleteConfirm ? formatCurrency(showDeleteConfirm.tx.amount) : ''}?`}
        confirmText="Delete Transaction"
        variant="danger"
      />
    </Modal>
  );
}