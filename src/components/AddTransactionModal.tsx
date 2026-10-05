import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button, Input, Select } from './UI';
import { ArrowUpRight, ArrowDownLeft, Calendar, FileText, IndianRupee } from 'lucide-react';
import type { Person } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  categories: string[];
  initialPersonId?: string | null;
  initialType?: 'given' | 'received';
  onSubmit: (data: {
    personId: string;
    type: 'given' | 'received';
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => void;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  people,
  categories,
  initialPersonId,
  initialType = 'given',
  onSubmit,
}: AddTransactionModalProps) {
  const [personId, setPersonId] = useState('');
  const [type, setType] = useState<'given' | 'received'>('given');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Food & Dining');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPersonId(initialPersonId || people[0]?.id || '');
      setType(initialType);
      setAmount('');
      setCategory(categories[0] || 'Food & Dining');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setErrors({});
    }
  }, [isOpen, people, categories, initialPersonId, initialType]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!personId) newErrors.personId = 'Select a person';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Enter a valid positive amount';
    if (!category) newErrors.category = 'Select a category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      onSubmit({
        personId,
        type,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        date,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const personOptions = people.map(p => ({ value: p.id, label: p.name }));
  const categoryOptions = categories.map(c => ({ value: c, label: c }));

  const quickAmounts = [100, 250, 500, 1000, 2500, 5000];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Transaction" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle: You Gave vs You Received */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setType('given')}
            className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              type === 'given'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 border border-rose-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> You Gave (Outflow)
          </button>
          <button
            type="button"
            onClick={() => setType('received')}
            className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              type === 'received'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" /> You Got (Inflow)
          </button>
        </div>

        {/* Person Dropdown */}
        <Select
          label="Select Person"
          options={personOptions}
          value={personId}
          onChange={e => setPersonId(e.target.value)}
          error={errors.personId}
          required
        />

        {/* Amount Input with Quick Chips */}
        <div>
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            error={errors.amount}
            required
            icon={<IndianRupee className="w-4 h-4 text-slate-400" />}
          />

          {/* Quick Amount Chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Quick:</span>
            {quickAmounts.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 text-xs font-medium transition-all"
              >
                +₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Category Picker */}
        <div>
          <Select
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={e => setCategory(e.target.value)}
            error={errors.category}
            required
          />
        </div>

        {/* Description Input */}
        <Input
          label="Description / Notes (Optional)"
          placeholder="e.g. Lunch at Olive Bistro or GPay transfer"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={100}
          icon={<FileText className="w-4 h-4 text-slate-400" />}
        />

        {/* Date Selection */}
        <Input
          label="Transaction Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
          icon={<Calendar className="w-4 h-4 text-slate-400" />}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant={type === 'given' ? 'danger' : 'success'} isLoading={isSubmitting} className="flex-1">
            {type === 'given' ? 'Record Outflow (-)' : 'Record Inflow (+)'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}