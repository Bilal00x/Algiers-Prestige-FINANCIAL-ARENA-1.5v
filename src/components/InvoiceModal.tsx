import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileText, Landmark, TrendingUp, TrendingDown, User } from 'lucide-react';
import { useFinancial } from '../contexts/FinancialContext';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from './ui/Button';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, defaultRecipient }) => {
  const { t, formatCurrency, currency } = useSettings();
  const { gates, transactions, archivedTransactions } = useFinancial();
  const allTx = useMemo(() => [...transactions, ...archivedTransactions], [transactions, archivedTransactions]);
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedGateId, setSelectedGateId] = useState<number | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');

  useEffect(() => {
    if (defaultRecipient) setSelectedRecipient(defaultRecipient);
  }, [defaultRecipient, isOpen]);

  const uniqueRecipients = useMemo(() => {
    const names = new Set<string>();
    allTx.forEach(tx => { if (tx.recipient) names.add(tx.recipient); });
    return Array.from(names).sort();
  }, [allTx]);

  const invoiceNumber = useMemo(() => `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`, [isOpen]);

  const filtered = useMemo(() => {
    return allTx.filter(tx => {
      if (selectedGateId !== 'all' && tx.gate_id !== selectedGateId) return false;
      if (selectedRecipient && tx.recipient !== selectedRecipient) return false;
      if (dateFrom && new Date(tx.created_at) < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setDate(end.getDate() + 1);
        if (new Date(tx.created_at) > end) return false;
      }
      return true;
    });
  }, [allTx, selectedGateId, selectedRecipient, dateFrom, dateTo]);

  const totalDeposits = useMemo(() => filtered.filter(tx => tx.type === 'deposit').reduce((s, tx) => s + Math.abs(tx.amount), 0), [filtered]);
  const totalWithdrawals = useMemo(() => filtered.filter(tx => tx.type === 'withdrawal').reduce((s, tx) => s + Math.abs(tx.amount), 0), [filtered]);

  const handlePrint = () => { window.print(); };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm print:hidden"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-xl bg-gradient-to-b from-[#121212] to-[#0A0A0A] border border-zinc-800/80 shadow-2xl shadow-black/50 print:shadow-none print:border-none print:rounded-none print:max-h-none print:overflow-visible print:bg-white"
        >
          {/* Controls */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-zinc-800 bg-[#121212] print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-bold text-white">{t('invoice.title')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={handlePrint} className="flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                {t('invoice.print')}
              </Button>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-zinc-800 bg-[#0F0F0F] print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{t('invoice.selectGate')}</span>
                <select value={selectedGateId} onChange={e => setSelectedGateId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-xs focus:outline-none focus:border-zinc-700">
                  <option value="all">{t('invoice.allGates')}</option>
                  {gates.map(g => <option key={g.id} value={g.id}>{g.name} ({g.code})</option>)}
                </select>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{t('invoice.recipient')}</span>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
                  <select value={selectedRecipient} onChange={e => setSelectedRecipient(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-xs focus:outline-none focus:border-zinc-700">
                    <option value="">{t('invoice.allGates')}</option>
                    {uniqueRecipients.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{t('invoice.dateFrom')}</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 font-mono" />
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{t('invoice.dateTo')}</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 font-mono" />
              </div>
              <div className="flex items-end">
                <span className="text-[10px] text-zinc-500 font-mono">{filtered.length} {t('invoice.transactions')}</span>
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <div ref={printRef} className="p-6 sm:p-8 print:p-8 text-zinc-100 print:text-zinc-900">
            {/* Letterhead */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-zinc-800 print:border-zinc-300">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded bg-zinc-900 print:bg-zinc-100 border border-zinc-800 print:border-zinc-300">
                    <Landmark className="w-6 h-6 text-white print:text-zinc-900" />
                  </div>
                  <div>
                    <span className="text-xs font-mono tracking-[0.25em] text-zinc-500 print:text-zinc-600 uppercase block">Algiers Prestige</span>
                    <span className="text-lg font-bold text-white print:text-zinc-900 tracking-tight block">FINANCIAL ARENA</span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 print:text-zinc-600 font-mono">123 Business Avenue, Algiers, Algeria</p>
                <p className="text-[10px] text-zinc-500 print:text-zinc-600 font-mono">contact@algiersprestige.dz | +213 21 123 456</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 print:text-emerald-700 block mb-1">{t('invoice.invoice')}</span>
                <span className="text-lg font-bold text-white print:text-zinc-900 block">{invoiceNumber}</span>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600 block mb-1">{t('invoice.date')}</span>
                <span className="text-sm font-semibold text-zinc-200 print:text-zinc-800">{new Date().toLocaleDateString('en-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600 block mb-1">{t('invoice.dueDate')}</span>
                <span className="text-sm font-semibold text-zinc-200 print:text-zinc-800">{new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Bill To */}
            {selectedRecipient && (
              <div className="mb-6 p-4 bg-zinc-900/40 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-lg">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600 block mb-1">{t('invoice.to')}</span>
                <span className="text-sm font-bold text-white print:text-zinc-900">{selectedRecipient}</span>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-zinc-900/60 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600">{t('invoice.totalDeposits')}</span>
                </div>
                <span className="text-base font-bold font-mono text-emerald-400 print:text-emerald-700">{formatCurrency(totalDeposits)}</span>
              </div>
              <div className="bg-zinc-900/60 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600">{t('invoice.totalWithdrawals')}</span>
                </div>
                <span className="text-base font-bold font-mono text-rose-400 print:text-rose-700">{formatCurrency(totalWithdrawals)}</span>
              </div>
              <div className="bg-zinc-900/60 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600">{t('invoice.netTotal')}</span>
                </div>
                <span className={`text-base font-bold font-mono ${totalDeposits - totalWithdrawals >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>{formatCurrency(totalDeposits - totalWithdrawals)}</span>
              </div>
            </div>

            {/* Transactions Table */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 print:border-zinc-300 rounded-lg">
                <FileText className="w-8 h-8 text-zinc-700 print:text-zinc-400 mx-auto mb-3" />
                <span className="text-xs font-mono tracking-widest text-zinc-600 print:text-zinc-500 uppercase">{t('invoice.noTransactions')}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 print:border-zinc-300">
                      <th className="pb-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600">{t('invoice.description')}</th>
                      <th className="pb-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600">{t('invoice.gate')}</th>
                      <th className="pb-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600">{t('invoice.type')}</th>
                      <th className="pb-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 print:text-zinc-600 text-right">{t('invoice.amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 print:divide-zinc-200">
                    {filtered.map(tx => (
                      <tr key={tx.id} className="hover:bg-zinc-900/30 print:hover:bg-transparent">
                        <td className="py-3 pr-4">
                          <span className="text-xs text-zinc-300 print:text-zinc-700 block">{tx.comments || `${tx.type === 'deposit' ? 'Funds received' : 'Funds transferred'}`}</span>
                          <span className="text-[10px] text-zinc-600 print:text-zinc-500 font-mono">{new Date(tx.created_at).toLocaleDateString('en-DZ', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-zinc-200 print:text-zinc-800 font-semibold">{tx.gate?.name || ''}</span>
                          <span className="text-[10px] text-zinc-600 print:text-zinc-500 font-mono block">{tx.gate?.code || ''}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${tx.type === 'deposit' ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 print:bg-emerald-50 print:border-emerald-300 print:text-emerald-700' : 'bg-rose-950/20 border-rose-900/30 text-rose-400 print:bg-rose-50 print:border-rose-300 print:text-rose-700'}`}>
                            {tx.type === 'deposit' ? t('invoice.totalDeposits') : t('invoice.totalWithdrawals')}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-xs font-bold font-mono ${tx.type === 'deposit' ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-700 print:border-zinc-400">
                      <td colSpan={3} className="pt-3 text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 print:text-zinc-700">{t('invoice.subtotal')}</span>
                      </td>
                      <td className="pt-3 text-right">
                        <span className="text-sm font-bold font-mono text-white print:text-zinc-900">{formatCurrency(totalDeposits - totalWithdrawals)}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-zinc-800 print:border-zinc-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Landmark className="w-4 h-4 text-zinc-500 print:text-zinc-400" />
                    <span className="text-[10px] font-mono tracking-widest text-zinc-600 print:text-zinc-500 uppercase">Algiers Prestige</span>
                  </div>
                  <p className="text-[10px] text-zinc-600 print:text-zinc-500 italic max-w-md">
                    {t('invoice.footer')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="h-12 w-40 border-b border-zinc-700 print:border-zinc-400 mb-1" />
                  <span className="text-[9px] font-mono text-zinc-600 print:text-zinc-500 uppercase tracking-wider">Authorized Signature</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .fixed.inset-0, .fixed.inset-0 * { visibility: visible; }
          .fixed.inset-0 { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 0.5in; size: A4; }
        }
      `}</style>
    </AnimatePresence>
  );
};
