import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button, Input } from './UI';
import { User, Phone, FileText, Palette, Check } from 'lucide-react';
import type { Person } from '../types';
import { PERSON_COLORS } from '../types';

interface EditPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onSave: (id: string, name: string, color: string, notes?: string, phone?: string) => void;
}

export function EditPersonModal({ isOpen, onClose, person, onSave }: EditPersonModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(PERSON_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (person && isOpen) {
      setName(person.name || '');
      setColor(person.color || PERSON_COLORS[0]);
      setNotes(person.notes || '');
      setPhone(person.phone || '');
      setError('');
    }
  }, [person, isOpen]);

  if (!isOpen || !person) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    onSave(person.id, name.trim(), color, notes.trim(), phone.trim());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Contact Details" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <Input
          label="Contact Name"
          placeholder="e.g. Alex Rivera"
          value={name}
          onChange={e => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          icon={<User className="w-4 h-4 text-emerald-600/70 dark:text-emerald-400/70" />}
          required
        />

        {/* Color Gradient Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-emerald-500" /> Choose Badge Theme
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {PERSON_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c} flex items-center justify-center transition-all cursor-pointer ${
                  color === c ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#060907] scale-105' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {color === c && <Check className="w-4 h-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Phone Number */}
        <Input
          label="Phone / UPI Number (Optional)"
          placeholder="e.g. +91 9876543210"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          icon={<Phone className="w-4 h-4 text-emerald-600/70 dark:text-emerald-400/70" />}
        />

        {/* Optional Notes */}
        <Input
          label="Contact Notes (Optional)"
          placeholder="e.g. College buddy / Flatmate / Office split"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          icon={<FileText className="w-4 h-4 text-emerald-600/70 dark:text-emerald-400/70" />}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-neutral-200 dark:border-[#16251c]">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Save Contact
          </Button>
        </div>
      </form>
    </Modal>
  );
}
