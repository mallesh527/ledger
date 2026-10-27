import { format, parseISO } from 'date-fns';
import { useState, useMemo } from 'react';
import { Modal, ConfirmDialog } from './Modal';
import { Button, Input } from './UI';
import { useTheme } from '../context/ThemeContext';
import { ArrowUpRight, ArrowDownLeft, Trash2, Search, Calendar, History, Wallet, Tag, Pencil, Phone, FileText } from 'lucide-react';
import type { Person, Transaction } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';

interface PersonDetailModalProps {
  person: Person & { transactions: Transaction[]; balance: number };
  isOpen: boolean;
  onClose: () => void;
  onDeleteTransaction: (personId: string, transactionId: string) => void;
  onQuickAddTransaction: (personId: string, type: 'given' | 'received') => void;
  onEditTransaction: (tx: Transaction) => void;
  onEditPerson: (person: Person) => void;
}

export function PersonDetailModal({
  person,
  isOpen,
  onClose,
  onDeleteTransaction,
  onQuickAddTransaction,
  onEditTransaction,
  onEditPerson,
}: PersonDetailModalProps) {
  const { formatAmount } = useTheme();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ledger: ${person.name}`} size="lg">
      <div className="space-y-6">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0c140f] border border-neutral-200 dark:border-[#16251c]">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${person.color || 'from-emerald-700 to-neutral-900'} flex items-center justify-center font-black text-white text-2xl shadow-xs border border-white/20`}>
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">{person.name}</h3>
                <button
                  onClick={() => onEditPerson(person)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  title="Edit Contact Name & Details"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex-wrap font-medium">
                <span className="flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-emerald-600/60 dark:text-emerald-400/60" />
                  {person.transactions.length} record{person.transactions.length !== 1 ? 's' : ''}
                </span>
                {person.phone && (
                  <span className="flex items-center gap-1 text-neutral-800 dark:text-neutral-200 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-emerald-600/70 dark:text-emerald-400/70" /> {person.phone}
                  </span>
                )}
                {person.notes && (
                  <span className="flex items-center gap-1 truncate max-w-[200px]" title={person.notes}>
                    <FileText className="w-3.5 h-3.5" /> {person.notes}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => onQuickAddTransaction(person.id, 'given')}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" /> + You Gave
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => onQuickAddTransaction(person.id, 'received')}
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" /> + You Got
            </Button>
          </div>
        </div>

        {/* Financial Stat Breakdown Pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#0c140f] rounded-xl p-3.5 border border-neutral-200 dark:border-[#16251c] text-center">
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" /> Total Given
            </p>
            <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              -{formatAmount(totalGiven)}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c140f] rounded-xl p-3.5 border border-neutral-200 dark:border-[#16251c] text-center">
            <p className="text-[11px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-1">
              <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" /> Total Got
            </p>
            <p className="text-lg sm:text-xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
              +{formatAmount(totalReceived)}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c140f] rounded-xl p-3.5 border border-neutral-200 dark:border-[#16251c] text-center">
            <p className="text-[11px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-1">
              <Wallet className="w-3 h-3" /> Net Balance
            </p>
            <p className={`text-lg sm:text-xl font-black mt-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
              {isPositive ? '+' : ''}{formatAmount(person.balance)}
            </p>
          </div>
        </div>

        {/* Transactions List Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <h4 className="font-black text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">
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
            <div className="text-center py-10 bg-white dark:bg-[#0c140f] rounded-xl border border-neutral-200 dark:border-[#16251c]">
              <Tag className="w-8 h-8 mx-auto text-emerald-500/40 mb-2" />
              <p className="text-emerald-600 dark:text-emerald-400 font-bold">No transactions recorded</p>
              <p className="text-xs text-neutral-500 mt-0.5">Use the "+ You Gave" or "+ You Got" buttons to add a transaction.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sortedTransactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0c140f] rounded-xl border border-neutral-200 dark:border-[#16251c] hover:border-emerald-400/60 dark:hover:border-emerald-500/60 transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl flex-shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                      {getCategoryIcon(tx.category, "w-4 h-4")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm truncate">{tx.category}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                          tx.type === 'given'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                        }`}>
                          {tx.type === 'given' ? 'GAVE' : 'GOT'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {tx.description || 'No description added'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className={`font-black text-base ${tx.type === 'given' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                        {tx.type === 'given' ? '-' : '+'}{formatAmount(tx.amount)}
                      </p>
                      <p className="text-[11px] text-neutral-500 flex items-center justify-end gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        {format(parseISO(tx.date), 'MMM d, yyyy')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        title="Edit Transaction"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm({ txId: tx.id, tx })}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
        message={`Are you sure you want to delete "${showDeleteConfirm?.tx.category}" for ${showDeleteConfirm ? formatAmount(showDeleteConfirm.tx.amount) : ''}?`}
        confirmText="Delete Transaction"
        variant="danger"
      />
    </Modal>
  );
}