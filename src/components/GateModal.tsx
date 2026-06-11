import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Save, DollarSign } from 'lucide-react';
import { useFinancial } from '../contexts/FinancialContext';

interface GateModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateIdToEdit?: number | null;
}

export const GateModal: React.FC<GateModalProps> = ({ isOpen, onClose, gateIdToEdit }) => {
  const { gates, createGate, updateGate } = useFinancial();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [currency, setCurrency] = useState('DZD');
  const [submitting, setSubmitting] = useState(false);

  const currencies = ['DZD', 'USD', 'EUR', 'GBP'];

  useEffect(() => {
    if (gateIdToEdit) {
      const gate = gates.find((g) => g.id === gateIdToEdit);
      if (gate) {
        setName(gate.name);
        setCode(gate.code);
        setCurrency(gate.currency || 'DZD');
        setInitialBalance(gate.initial_balance.toString());
      }
    } else {
      setName('');
      setCode('');
      setCurrency('DZD');
      setInitialBalance('');
    }
  }, [gateIdToEdit, gates, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      initial_balance: parseFloat(initialBalance) || 0,
      currency,
    };

    let success = false;
    if (gateIdToEdit) {
      success = await updateGate(gateIdToEdit, payload);
    } else {
      success = await createGate(payload);
    }

    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md overflow-hidden rounded-lg bg-[#0F0F0F] border border-zinc-800 shadow-2xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-zinc-400" />
              <h3 className="text-lg font-semibold tracking-tight text-zinc-100 font-sans uppercase">
                {gateIdToEdit ? 'Modify Gate Configuration' : 'Establish New Gate Slot'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                  Gate Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prestige Wealth Gate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-sans placeholder-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                  Gate Code Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE-01/PRESTIGE"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-mono placeholder-zinc-700 uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                  Currency Denomination
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-mono appearance-none cursor-pointer"
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>
                        {c === 'DZD' ? 'DA - Algerian Dinar' : c === 'USD' ? '$ - US Dollar' : c === 'EUR' ? '€ - Euro' : '£ - British Pound'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                  Initial Balance ({currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full pl-3 pr-14 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-mono placeholder-zinc-700"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[11px] font-medium text-zinc-500 font-sans">
                    {currency}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium uppercase tracking-widest text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium uppercase tracking-widest text-black bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 rounded flex items-center gap-2 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {submitting ? 'Saving...' : 'Save Config'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
