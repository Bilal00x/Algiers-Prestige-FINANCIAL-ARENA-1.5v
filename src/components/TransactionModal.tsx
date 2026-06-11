import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Send } from 'lucide-react';
import { useFinancial } from '../contexts/FinancialContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  txIdToEdit?: number | null;
  defaultGateId?: number | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  txIdToEdit,
  defaultGateId,
}) => {
  const { gates, transactions, createTransaction, updateTransaction } = useFinancial();
  const [gateId, setGateId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [status, setStatus] = useState<'Accepted' | 'Pending'>('Accepted');
  const [comments, setComments] = useState('');
  const [verified, setVerified] = useState(false);
  const selectedGate = gates.find((g) => g.id === parseInt(gateId));
  const currencyLabel =
    selectedGate?.currency === 'DZD' ? 'DZD / د.ج' :
    selectedGate?.currency === 'USD' ? 'USD / $' :
    selectedGate?.currency === 'EUR' ? 'EUR / €' :
    selectedGate?.currency === 'GBP' ? 'GBP / £' :
    selectedGate?.currency || 'DZD / د.ج';
  const [createdAt, setCreatedAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (txIdToEdit) {
      const tx = transactions.find((t) => t.id === txIdToEdit);
      if (tx) {
        setGateId(tx.gate_id.toString());
        setRecipient(tx.recipient);
        setAmount(Math.abs(tx.amount).toString());
        setType(tx.type);
        setStatus(tx.status);
        setComments(tx.comments || '');
        setVerified(tx.verified);
        setCreatedAt(tx.created_at ? tx.created_at.substring(0, 16) : '');
      }
    } else {
      setGateId(defaultGateId ? defaultGateId.toString() : (gates[0]?.id.toString() || ''));
      setRecipient('');
      setAmount('');
      setType('deposit');
      setStatus('Accepted');
      setComments('');
      setVerified(false);
      setCreatedAt('');
    }
  }, [txIdToEdit, defaultGateId, gates, transactions, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateId || !recipient.trim() || !amount) return;

    setSubmitting(true);
    const parsedAmount = parseFloat(amount);

    const payload: any = {
      gate_id: parseInt(gateId),
      recipient: recipient.trim(),
      amount: type === 'withdrawal' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
      type,
      status,
      comments: comments.trim(),
      verified,
    };

    if (txIdToEdit && createdAt) {
      payload.created_at = new Date(createdAt).toISOString();
    }

    let success = false;
    if (txIdToEdit) {
      success = await updateTransaction(txIdToEdit, payload);
    } else {
      success = await createTransaction(payload);
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
              <Send className="w-5 h-5 text-zinc-400" />
              <h3 className="text-lg font-semibold tracking-tight text-zinc-100 font-sans uppercase">
                {txIdToEdit ? 'Modify Ledger Entry' : 'Queue Transfer Action'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                  Target Gate (Slot)
                </label>
                <select
                  required
                  value={gateId}
                  onChange={(e) => setGateId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-sans"
                >
                  <option value="" disabled>Select a Gate</option>
                  {gates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                    Transaction Type
                  </label>
                  <div className="flex bg-zinc-900 p-1 border border-zinc-800 rounded">
                    <button
                      type="button"
                      onClick={() => setType('deposit')}
                      className={`flex-1 py-1 text-xs font-semibold tracking-wider uppercase rounded transition-all ${
                        type === 'deposit'
                          ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-400'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('withdrawal')}
                      className={`flex-1 py-1 text-xs font-semibold tracking-wider uppercase rounded transition-all ${
                        type === 'withdrawal'
                          ? 'bg-rose-950/40 border border-rose-900/40 text-rose-400'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Withdrawal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                    Document Status
                  </label>
                  <div className="flex bg-zinc-900 p-1 border border-zinc-800 rounded">
                    <button
                      type="button"
                      onClick={() => setStatus('Accepted')}
                      className={`flex-1 py-1 text-xs font-semibold tracking-wider uppercase rounded transition-all ${
                        status === 'Accepted'
                          ? 'bg-zinc-850 text-zinc-100'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Accepted
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Pending')}
                      className={`flex-1 py-1 text-xs font-semibold tracking-wider uppercase rounded transition-all ${
                        status === 'Pending'
                          ? 'bg-amber-950/30 border border-amber-900/30 text-amber-500'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                  Recipient / Counterparty
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sidi Yahia Concierge"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-sans placeholder-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                  Amount ({currencyLabel})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-3 pr-14 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-mono placeholder-zinc-700"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[11px] font-medium text-zinc-500 font-sans">
                    {selectedGate?.currency || 'DZD'}
                  </div>
                </div>
              </div>

              {txIdToEdit && (
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                    Original Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                  Verification Audit
                </label>
                <div className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded">
                  <span className="text-xs text-zinc-400 font-sans">Manually Verified & Audited</span>
                  <button
                    type="button"
                    onClick={() => setVerified(!verified)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      verified ? 'bg-emerald-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        verified ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                  Transaction Notes / Comments
                </label>
                <textarea
                  placeholder="Provide transaction details or audit notes..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-600 transition-colors font-sans placeholder-zinc-700 resize-none"
                />
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
                  {submitting ? 'Processing...' : 'Queue Action'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
