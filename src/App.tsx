import { useState, useCallback } from 'react';
import { LedgerProvider, useLedger } from './context/LedgerContext';
import { Dashboard } from './components/Dashboard';
import { AddTransactionModal } from './components/AddTransactionModal';
import { PersonDetailModal } from './components/PersonDetailModal';
import { SyncModal } from './components/SyncModal';
import { ConfirmDialog, Toaster } from './components/Modal';
import { Button } from './components/UI';
import { CATEGORIES } from './types';
import { Wallet, Plus, Download, Sparkles, Trash2, ShieldCheck, Heart, Radio } from 'lucide-react';

function AppContent() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [addModalConfig, setAddModalConfig] = useState<{ personId?: string; type?: 'given' | 'received' }>({});
  const [showConfirm, setShowConfirm] = useState<{ type: 'clear' | 'deletePerson'; id?: string } | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const {
    people,
    syncKey,
    isSynced,
    addPerson,
    removePerson,
    addTransaction,
    removeTransaction,
    clearAll,
    loadSampleData,
    exportCSV,
    getPersonById,
  } = useLedger();

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const handleAddPerson = (name: string) => {
    if (!name.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }
    if (people.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      showToast('Person already exists in your ledger', 'error');
      return;
    }
    addPerson(name.trim());
    showToast(`${name.trim()} added to ledger`, 'success');
  };

  const handleQuickAddTransaction = (personId?: string, type: 'given' | 'received' = 'given') => {
    if (people.length === 0) {
      showToast('Please add at least one person before recording a transaction', 'info');
      return;
    }
    setAddModalConfig({ personId, type });
    setShowAddModal(true);
  };

  const handleAddTransaction = (data: {
    personId: string;
    type: 'given' | 'received';
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => {
    try {
      addTransaction(data.personId, data.type, data.amount, data.category, data.description, data.date);
      const person = getPersonById(data.personId);
      const actionText = data.type === 'given' ? 'Lent' : 'Received';
      showToast(
        `${actionText} ₹${data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${data.type === 'given' ? 'to' : 'from'} ${person?.name}`,
        'success'
      );
      setShowAddModal(false);
    } catch (e) {
      showToast('Failed to record transaction', 'error');
    }
  };

  const handleDeleteTransaction = (personId: string, transactionId: string) => {
    removeTransaction(personId, transactionId);
    showToast('Transaction removed from ledger', 'info');
  };

  const handleDeletePerson = (personId: string) => {
    const person = getPersonById(personId);
    if (!person) return;

    if (person.transactions.length > 0) {
      setShowConfirm({ type: 'deletePerson', id: personId });
    } else {
      removePerson(personId);
      showToast(`${person.name} removed from contacts`, 'info');
    }
  };

  const handleConfirm = () => {
    if (!showConfirm) return;
    if (showConfirm.type === 'clear') {
      clearAll();
      showToast('All ledger records reset', 'info');
    } else if (showConfirm.type === 'deletePerson' && showConfirm.id) {
      const person = getPersonById(showConfirm.id);
      removePerson(showConfirm.id);
      showToast(`${person?.name || 'Contact'} and associated transactions deleted`, 'info');
    }
    setShowConfirm(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold text-slate-100 tracking-tight">Ledger</h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Personal Lending & Borrowing Tracker</p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2">
              {/* Device Sync Button */}
              <button
                onClick={() => setShowSyncModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all shadow-sm"
                title="Sync across devices (Mobile/Laptop)"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="hidden sm:inline">Sync Devices:</span>
                <span className="font-mono text-indigo-200">{syncKey}</span>
              </button>

              {people.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => exportCSV()}
                    title="Export all transactions as CSV file"
                    className="hidden md:inline-flex"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </Button>

                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleQuickAddTransaction()}
                  >
                    <Plus className="w-4 h-4" /> Add Transaction
                  </Button>
                </>
              )}

              {people.length === 0 && (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={loadSampleData}
                  className="bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Demo Data
                </Button>
              )}

              {people.length > 0 && (
                <button
                  onClick={() => setShowConfirm({ type: 'clear' })}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Clear all ledger data"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <Dashboard
          people={people}
          onAddPerson={handleAddPerson}
          onDeletePerson={handleDeletePerson}
          onViewPerson={setSelectedPerson}
          onQuickAddTransaction={handleQuickAddTransaction}
          onLoadSampleData={loadSampleData}
        />

        {/* Modal Views */}
        {selectedPerson && (
          <PersonDetailModal
            person={getPersonById(selectedPerson)!}
            isOpen={!!selectedPerson}
            onClose={() => setSelectedPerson(null)}
            onDeleteTransaction={handleDeleteTransaction}
            onQuickAddTransaction={(personId, type) => handleQuickAddTransaction(personId, type)}
          />
        )}

        <AddTransactionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          people={people}
          categories={[...CATEGORIES]}
          initialPersonId={addModalConfig.personId}
          initialType={addModalConfig.type || 'given'}
          onSubmit={handleAddTransaction}
        />

        <SyncModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          onShowToast={showToast}
        />

        <ConfirmDialog
          isOpen={!!showConfirm}
          onClose={() => setShowConfirm(null)}
          onConfirm={handleConfirm}
          title={showConfirm?.type === 'clear' ? 'Clear All Ledger Data?' : 'Delete Contact?'}
          message={
            showConfirm?.type === 'clear'
              ? 'This action will permanently delete all contacts, balances, and transaction history. This cannot be undone.'
              : 'This person has existing transaction records. Deleting them will also remove all associated balance logs.'
          }
          confirmText={showConfirm?.type === 'clear' ? 'Clear Everything' : 'Delete Contact'}
          variant="danger"
        />

        <Toaster toasts={toasts} onClose={id => setToasts(prev => prev.filter(t => t.id !== id))} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cloud Synced & Private Local Storage ({isSynced ? 'Synced' : 'Local'})</span>
          </div>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for seamless personal financial tracking
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LedgerProvider>
      <AppContent />
    </LedgerProvider>
  );
}