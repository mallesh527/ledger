import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button, Input } from './UI';
import { useLedger } from '../context/LedgerContext';
import { Smartphone, Laptop, Copy, Check, RefreshCw, Radio, ShieldCheck, ArrowRight } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { syncKey, setSyncKey, isSynced } = useLedger();
  const [inputKey, setInputKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(syncKey);
    setCopied(true);
    onShowToast('Sync Code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      onShowToast('Please enter a valid Sync Code', 'error');
      return;
    }
    const formatted = inputKey.trim().toLowerCase();
    setSyncKey(formatted);
    setInputKey('');
    onShowToast(`Connected to Ledger: ${formatted}`, 'success');
    onClose();
  };

  const handleGenerateNew = () => {
    const newKey = `ledger-${Math.random().toString(36).slice(2, 8)}`;
    setSyncKey(newKey);
    onShowToast(`Created new sync workspace: ${newKey}`, 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cross-Device Sync & Cloud Connect" size="md">
      <div className="space-y-6">
        {/* Connection Status Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sync Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <p className="text-sm font-bold text-slate-100">
                  {isSynced ? 'Real-time Cloud Sync Active' : 'Connecting to Cloud...'}
                </p>
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            Live
          </span>
        </div>

        {/* Device Visual Diagram */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-400 mb-3">Changes sync instantly across all your devices</p>
          <div className="flex items-center justify-center gap-4 text-indigo-400">
            <div className="flex flex-col items-center gap-1">
              <Smartphone className="w-7 h-7" />
              <span className="text-[10px] text-slate-400">Mobile Phone</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 animate-pulse" />
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold text-xs">
                Cloud DB
              </div>
              <span className="text-[10px] text-slate-400">Firebase</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 animate-pulse" />
            <div className="flex flex-col items-center gap-1">
              <Laptop className="w-7 h-7" />
              <span className="text-[10px] text-slate-400">Laptop / PC</span>
            </div>
          </div>
        </div>

        {/* Current Sync Code Box */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Your Device Sync Code
          </label>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 flex items-center justify-between font-mono text-sm text-indigo-300 font-bold">
              <span>{syncKey}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Copy Sync Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={handleGenerateNew} title="Generate new code">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Enter this code on your other phone or laptop to view and edit the exact same ledger.
          </p>
        </div>

        {/* Join Existing Workspace Form */}
        <form onSubmit={handleJoin} className="pt-2 border-t border-slate-800 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Connect to Another Device / Sync Code
            </label>
            <div className="flex gap-2">
              <Input
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="e.g. ledger-a8f9d2"
                className="font-mono text-sm"
              />
              <Button type="submit" variant="primary" size="sm" className="whitespace-nowrap">
                Join Ledger
              </Button>
            </div>
          </div>
        </form>

        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 flex items-start gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            Data is stored in Firebase Cloud and synced in real-time. Any changes made on one phone or computer update instantly everywhere.
          </span>
        </div>
      </div>
    </Modal>
  );
};
