import React, { useState } from 'react';
import { Gate, useFinancial } from '../contexts/FinancialContext';
import { formatCurrency } from '../utils/format';
import { Edit2, Trash2, ChevronDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GateCardProps {
  gate: Gate;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const GateCard: React.FC<GateCardProps> = ({ gate, onEdit, onDelete }) => {
  const { createTransaction } = useFinancial();
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [comments, setComments] = useState('');
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [submitting, setSubmitting] = useState(false);

  const handleQuickAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipient.trim()) return;

    setSubmitting(true);
    const parsedAmount = parseFloat(amount);

    const success = await createTransaction({
      gate_id: gate.id,
      recipient: recipient.trim(),
      amount: txType === 'withdrawal' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
      type: txType,
      status: 'Accepted',
      comments: comments.trim(),
      verified: true,
    });

    setSubmitting(false);
    if (success) {
      setAmount('');
      setRecipient('');
      setComments('');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative flex flex-col overflow-hidden rounded-lg bg-[#0F0F0F] border border-zinc-800 hover:border-zinc-600 transition-all duration-300 shadow-xl cursor-pointer"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />

      <motion.div
        layout
        onClick={() => setExpanded(!expanded)}
        className="p-6 pb-4 select-none"
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              {gate.code}
            </span>
            <h3 className="text-base font-semibold text-zinc-100 font-sans tracking-tight mt-0.5">
              {gate.name}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(gate.id); }}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all"
              title="Edit Gate Configuration"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(gate.id); }}
              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 rounded transition-all"
              title="Purge Gate Slot"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-1.5 text-zinc-500"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </div>
        </div>

        <div className="mt-4 mb-2">
          <span className="text-[9px] font-medium uppercase tracking-widest text-zinc-500 block">
            Current Position Balance
          </span>
          <motion.span
            layout
            className="text-2xl font-bold tracking-tight text-white font-mono block mt-1"
          >
            {formatCurrency(gate.balance, gate.currency)}
          </motion.span>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.form
            key="quick-action-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onSubmit={handleQuickAction}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-zinc-900 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Quick Ledger Action
                </span>
                <div className="flex gap-1 bg-zinc-900/80 p-0.5 border border-zinc-800/60 rounded">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTxType('deposit')}
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                      txType === 'deposit'
                        ? 'bg-emerald-950/40 border border-emerald-900/30 text-emerald-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <ArrowUpRight className="inline w-2.5 h-2.5 mr-0.5" />
                    In flow
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTxType('withdrawal')}
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                      txType === 'withdrawal'
                        ? 'bg-rose-950/40 border border-rose-900/30 text-rose-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <ArrowDownLeft className="inline w-2.5 h-2.5 mr-0.5" />
                    Out flow
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-sans placeholder-zinc-700"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-2.5 pr-8 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono placeholder-zinc-700"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-[9px] font-medium text-zinc-500 font-sans">
                    {gate.currency}
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Action description / notes..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={1}
                  className="w-full px-2.5 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-sans placeholder-zinc-700 resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitting || !amount || !recipient.trim()}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-2 text-[10px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-1.5 transition-all ${
                  txType === 'deposit'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-zinc-800 disabled:text-zinc-600'
                    : 'bg-rose-600 hover:bg-rose-700 text-white disabled:bg-zinc-800 disabled:text-zinc-600'
                }`}
              >
                {submitting ? 'Executing...' : `Queue ${txType === 'deposit' ? 'Deposit' : 'Withdrawal'}`}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
