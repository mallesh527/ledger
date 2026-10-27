import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button, Input, Select } from './UI';
import { useTheme } from '../context/ThemeContext';
import { ArrowUpRight, ArrowDownLeft, Calendar, FileText, Pencil } from 'lucide-react';
import type { Person, Transaction } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  categories: string[];
  initialPersonId?: string | null;
  initialType?: 'given' | 'received';
  transactionToEdit?: Transaction | null;
  onSubmit: (data: {
    id?: string;
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
  transactionToEdit,
  onSubmit,
}: AddTransactionModalProps) {
  const { currency } = useTheme();

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
      if (transactionToEdit) {
        setPersonId(transactionToEdit.personId);
        setType(transactionToEdit.type);
        setAmount(transactionToEdit.amount.toString());
        setCategory(transactionToEdit.category);
        setDescription(transactionToEdit.description || '');
        setDate(transactionToEdit.date);
      } else {
        setPersonId(initialPersonId || people[0]?.id || '');
        setType(initialType);
        setAmount('');
        setCategory(categories[0] || 'Food & Dining');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
      }
      setErrors({});
    }
  }, [isOpen, people, categories, initialPersonId, initialType, transactionToEdit]);

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
        id: transactionToEdit?.id,
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

  const modalTitle = transactionToEdit ? 'Edit Transaction Details' : 'Record Transaction';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle: You Gave vs You Got */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-[#0c140f] rounded-xl border border-neutral-200 dark:border-[#16251c]">
          <button
            type="button"
            onClick={() => setType('given')}
            className={`py-2.5 px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              type === 'given'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 border border-emerald-500 dark:border-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" /> You Gave (Outflow)
          </button>
          <button
            type="button"
            onClick={() => setType('received')}
            className={`py-2.5 px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              type === 'received'
                ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-950 border border-neutral-700 dark:border-neutral-300 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" /> You Got (Inflow)
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
            label={`Amount (${currency.symbol})`}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            error={errors.amount}
            required
            icon={<span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">{currency.symbol}</span>}
          />

          {/* Quick Amount Chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
            <span className="text-[10px] uppercase font-black text-emerald-700/60 dark:text-emerald-400/60 mr-1">Quick:</span>
            {quickAmounts.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0c140f] border border-neutral-200 dark:border-[#16251c] text-neutral-800 dark:text-neutral-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-all cursor-pointer"
              >
                +{currency.symbol}{val}
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
          placeholder="e.g. Lunch at Bistro or UPI transfer"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={100}
          icon={<FileText className="w-4 h-4 text-emerald-600/70 dark:text-emerald-400/70" />}
        />

        {/* Date Selection */}
        <Input
          label="Transaction Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
          icon={<Calendar className="w-4 h-4 text-emerald-600/70 dark:text-emerald-400/70" />}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-neutral-200 dark:border-[#16251c]">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1">
            {transactionToEdit ? (
              <>
                <Pencil className="w-4 h-4" /> Save Changes
              </>
            ) : type === 'given' ? (
              'Record Outflow (-)'
            ) : (
              'Record Inflow (+)'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}