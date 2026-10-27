import { useState, useCallback } from 'react';
import { LedgerProvider, useLedger } from './context/LedgerContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Dashboard } from './components/Dashboard';
import { AddTransactionModal } from './components/AddTransactionModal';
import { PersonDetailModal } from './components/PersonDetailModal';
import { EditPersonModal } from './components/EditPersonModal';
import { SettingsModal } from './components/SettingsModal';
import { SyncModal } from './components/SyncModal';
import { ConfirmDialog, Toaster } from './components/Modal';
import { Button } from './components/UI';
import { CATEGORIES, type Person, type Transaction } from './types';
import {
  Wallet,
  Plus,
  Download,
  Sparkles,
  ShieldCheck,
  Heart,
  Radio,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';

function AppContent() {
  const { setTheme, resolvedTheme } = useTheme();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [addModalConfig, setAddModalConfig] = useState<{ personId?: string; type?: 'given' | 'received' }>({});
  const [showConfirm, setShowConfirm] = useState<{ type: 'clear' | 'deletePerson'; id?: string } | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const {
    people,
    syncKey,
    isSynced,
    addPerson,
    editPerson,
    removePerson,
    addTransaction,
    editTransaction,
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

  const handleSaveEditPerson = (id: string, name: string, color: string, notes?: string, phone?: string) => {
    try {
      editPerson(id, name, color, notes, phone);
      showToast(`Contact details updated for ${name}`, 'success');
      setEditingPerson(null);
    } catch (e) {
      showToast('Failed to update contact', 'error');
    }
  };

  const handleQuickAddTransaction = (personId?: string, type: 'given' | 'received' = 'given') => {
    if (people.length === 0) {
      showToast('Please add at least one person before recording a transaction', 'info');
      return;
    }
    setEditingTransaction(null);
    setAddModalConfig({ personId, type });
    setShowAddModal(true);
  };

  const handleStartEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setShowAddModal(true);
  };

  const handleAddOrEditTransaction = (data: {
    id?: string;
    personId: string;
    type: 'given' | 'received';
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => {
    try {
      const person = getPersonById(data.personId);

      if (data.id) {
        editTransaction(
          data.id,
          data.personId,
          data.type,
          data.amount,
          data.category,
          data.description,
          data.date
        );
        showToast(`Transaction updated for ${person?.name}`, 'success');
      } else {
        addTransaction(data.personId, data.type, data.amount, data.category, data.description, data.date);
        const actionText = data.type === 'given' ? 'Lent' : 'Received';
        showToast(
          `${actionText} transaction recorded for ${person?.name}`,
          'success'
        );
      }
      setShowAddModal(false);
      setEditingTransaction(null);
    } catch (e) {
      showToast('Failed to save transaction', 'error');
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

  const toggleQuickTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-150 bg-neutral-50 dark:bg-[#060907] text-neutral-900 dark:text-neutral-100">
      {/* Header Bar - Fully Mobile Optimized */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#060907]/90 backdrop-blur-md border-b border-neutral-200 dark:border-[#16251c]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black flex-shrink-0 shadow-sm shadow-emerald-500/10">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight uppercase truncate">
                    Ledger
                  </h1>
                  <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 hidden md:block font-medium truncate">
                  Personal Lending & Borrowing Tracker
                </p>
              </div>
            </div>

            {/* Quick Actions Bar - Clean & Responsive */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Quick Theme Toggle Button */}
              <button
                onClick={toggleQuickTheme}
                className="p-1.5 sm:p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 sm:p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title="Open Settings & Preferences"
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Device Sync Button */}
              <button
                onClick={() => setShowSyncModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0c140f] text-neutral-900 dark:text-neutral-100 border border-emerald-300/60 dark:border-emerald-800/60 hover:border-emerald-500 dark:hover:border-emerald-400 text-xs font-bold transition-all shadow-xs"
                title="Sync across devices (Mobile/Laptop)"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline text-neutral-500 dark:text-neutral-400 font-medium">Sync:</span>
                <span className="text-[11px] sm:text-xs max-w-[80px] sm:max-w-none truncate font-bold text-emerald-700 dark:text-emerald-300">{syncKey}</span>
              </button>

              {people.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => exportCSV()}
                    title="Export all transactions as CSV file"
                    className="hidden lg:inline-flex"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </Button>

                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleQuickAddTransaction()}
                    className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Transaction</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </>
              )}

              {people.length === 0 && (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={loadSampleData}
                  className="h-8 sm:h-9 px-2.5 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Demo</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full">
        <Dashboard
          people={people}
          onAddPerson={handleAddPerson}
          onDeletePerson={handleDeletePerson}
          onEditPerson={person => setEditingPerson(person)}
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
            onEditTransaction={handleStartEditTransaction}
            onEditPerson={person => setEditingPerson(person)}
          />
        )}

        {/* Add or Edit Transaction Modal */}
        <AddTransactionModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingTransaction(null);
          }}
          people={people}
          categories={[...CATEGORIES]}
          initialPersonId={addModalConfig.personId}
          initialType={addModalConfig.type || 'given'}
          transactionToEdit={editingTransaction}
          onSubmit={handleAddOrEditTransaction}
        />

        {/* Edit Person Modal */}
        <EditPersonModal
          isOpen={!!editingPerson}
          onClose={() => setEditingPerson(null)}
          person={editingPerson}
          onSave={handleSaveEditPerson}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onShowToast={showToast}
        />

        {/* Device Sync Modal */}
        <SyncModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          onShowToast={showToast}
        />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!showConfirm}
          onClose={() => setShowConfirm(null)}
          onConfirm={handleConfirm}
          title={showConfirm?.type === 'clear' ? 'Clear All Data?' : 'Delete Contact?'}
          message={
            showConfirm?.type === 'clear'
              ? 'This action will permanently delete all contacts, balances, and transaction history.'
              : 'This person has existing transaction records. Deleting them will also remove all associated balance logs.'
          }
          confirmText={showConfirm?.type === 'clear' ? 'Clear Everything' : 'Delete Contact'}
          variant="danger"
        />

        {/* Toast Notifications */}
        <Toaster toasts={toasts} onClose={id => setToasts(prev => prev.filter(t => t.id !== id))} />
      </main>

      {/* Floating Action Button (FAB) for Mobile Quick Add */}
      {people.length > 0 && (
        <button
          onClick={() => handleQuickAddTransaction()}
          className="sm:hidden fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-2xl shadow-emerald-500/30 flex items-center justify-center border border-emerald-400 active:scale-95 transition-transform"
          aria-label="Add transaction"
          title="Add Transaction"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-[#16251c] py-4 sm:py-6 text-center text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#060907] transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cloud Synced & Private Local Storage ({isSynced ? 'Synced' : 'Local'})</span>
          </div>
          <p className="flex items-center gap-1 font-medium">
            Built with <Heart className="w-3 h-3 fill-current text-emerald-500" /> for financial tracking
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LedgerProvider>
        <AppContent />
      </LedgerProvider>
    </ThemeProvider>
  );
}