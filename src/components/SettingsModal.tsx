import { useState, useRef } from 'react';
import { Modal, ConfirmDialog } from './Modal';
import { Button, Input, Select } from './UI';
import { useTheme, SUPPORTED_CURRENCIES } from '../context/ThemeContext';
import { useLedger } from '../context/LedgerContext';
import {
  Moon,
  Sun,
  Laptop,
  Coins,
  Radio,
  Download,
  Upload,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function SettingsModal({ isOpen, onClose, onShowToast }: SettingsModalProps) {
  const { theme, setTheme, currency, setCurrency } = useTheme();
  const { syncKey, setSyncKey, isSynced, exportCSV, exportJSON, importJSON, clearAll } = useLedger();

  const [inputSyncKey, setInputSyncKey] = useState(syncKey);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSyncKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSyncKey.trim()) {
      setSyncKey(inputSyncKey.trim());
      onShowToast(`Sync Key updated to "${inputSyncKey.trim()}"`, 'success');
    }
  };

  const handleCopySyncKey = () => {
    navigator.clipboard.writeText(syncKey);
    setCopiedKey(true);
    onShowToast('Sync Key copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateNewKey = () => {
    const fresh = `ledger-${Math.random().toString(36).slice(2, 8)}`;
    setInputSyncKey(fresh);
    setSyncKey(fresh);
    onShowToast(`Generated new Sync Key: ${fresh}`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJSON(content);
        if (success) {
          onShowToast('Backup imported successfully!', 'success');
          onClose();
        } else {
          onShowToast('Invalid JSON backup file structure', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="App Settings & Preferences" size="lg">
        <div className="space-y-6">
          {/* Section 1: Appearance & Theme */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0c140f] border border-neutral-200 dark:border-[#16251c] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Color Theme Mode
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Choose visual mode (High-Tech Dark, Crisp Light, or System Auto)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 border-emerald-600 dark:border-emerald-400 shadow-sm shadow-emerald-500/10'
                    : 'bg-white dark:bg-[#060907] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-[#16251c] hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Moon className="w-5 h-5" />
                Dark Mode
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 border-emerald-600 dark:border-emerald-400 shadow-sm shadow-emerald-500/10'
                    : 'bg-white dark:bg-[#060907] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-[#16251c] hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Sun className="w-5 h-5" />
                Light Mode
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 border-emerald-600 dark:border-emerald-400 shadow-sm shadow-emerald-500/10'
                    : 'bg-white dark:bg-[#060907] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-[#16251c] hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Laptop className="w-5 h-5" />
                System Auto
              </button>
            </div>
          </div>

          {/* Section 2: Currency Preference */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0c140f] border border-neutral-200 dark:border-[#16251c] space-y-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Coins className="w-4 h-4" /> Currency Symbol
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Select default currency unit used for displaying amounts
              </p>
            </div>

            <Select
              options={SUPPORTED_CURRENCIES.map(c => ({ value: c.code, label: c.name }))}
              value={currency.code}
              onChange={e => {
                const found = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
                if (found) {
                  setCurrency(found);
                  onShowToast(`Currency updated to ${found.symbol} (${found.code})`, 'info');
                }
              }}
            />
          </div>

          {/* Section 3: Device Sync Settings */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0c140f] border border-neutral-200 dark:border-[#16251c] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Radio className="w-4 h-4 animate-pulse text-emerald-500" /> Real-time Cloud Device Sync
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Use this sync code on your phone/laptop to access identical ledger data
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isSynced ? 'Synced' : 'Local'}
              </span>
            </div>

            <form onSubmit={handleSyncKeySubmit} className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={inputSyncKey}
                  onChange={e => setInputSyncKey(e.target.value)}
                  placeholder="Enter Sync Key"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                Update
              </Button>
              <Button type="button" variant="outline" size="md" onClick={handleCopySyncKey} title="Copy Key">
                {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={handleGenerateNewKey} title="Generate New Key">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Section 4: Backup, Import & Clear */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0c140f] border border-neutral-200 dark:border-[#16251c] space-y-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Download className="w-4 h-4" /> Data Management & Backup
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Export your transactions or import saved backup snapshots
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => exportCSV()}>
                <FileSpreadsheet className="w-4 h-4" /> Export CSV Spreadsheet
              </Button>

              <Button variant="outline" size="sm" onClick={() => exportJSON()}>
                <Download className="w-4 h-4" /> Export JSON Backup
              </Button>

              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 text-emerald-500" /> Restore / Import JSON
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button variant="danger" size="sm" onClick={() => setShowClearConfirm(true)}>
                <Trash2 className="w-4 h-4" /> Reset All Data
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearAll();
          setShowClearConfirm(false);
          onClose();
          onShowToast('All ledger data has been completely reset.', 'info');
        }}
        title="Reset All Ledger Data?"
        message="This action will permanently remove all contacts, balances, and transaction history. Make sure you have exported a backup if needed."
        confirmText="Reset Everything"
        variant="danger"
      />
    </>
  );
}
