import React, { useState } from 'react';
import { useFinancial, Transaction } from '../contexts/FinancialContext';
import { formatDate } from '../utils/format';
import { useSettings } from '../contexts/SettingsContext';
import { downloadCSV } from '../utils/export';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Check, X, Search, Calendar, ArrowUpRight, ArrowDownLeft, FileCheck, FileClock, Archive, Download, FileText } from 'lucide-react';

interface LedgerProps {
  onEditTransaction: (id: number) => void;
  onDeleteTransaction: (id: number) => void;
  onOpenInvoice: (recipient?: string) => void;
}

export const Ledger: React.FC<LedgerProps> = ({ onEditTransaction, onDeleteTransaction, onOpenInvoice }) => {
  const { transactions, updateTransaction, archiveTransaction, loading } = useFinancial();
  const { t, formatCurrency } = useSettings();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Accepted' | 'Pending'>('all');
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

  const toggleComment = (id: number) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVerificationToggle = async (id: number, currentVerified: boolean) => {
    await updateTransaction(id, { verified: !currentVerified });
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.recipient.toLowerCase().includes(search.toLowerCase()) ||
      (tx.comments || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.gate?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.gate?.code || '').toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;

    let matchesDate = true;
    if (selectedDate) {
      const txDate = new Date(tx.created_at).toISOString().split('T')[0];
      matchesDate = txDate === selectedDate;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const groupedTransactions = filteredTransactions.reduce<Record<string, Transaction[]>>((groups, tx) => {
    const dateStr = new Date(tx.created_at).toLocaleDateString('fr-DZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(tx);
    return groups;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-zinc-900 mb-6">
        <div>
          <span className="text-sm font-mono tracking-wide text-zinc-400 uppercase">
            {t('ledger.subtitle')}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans mt-1">
            {t('ledger.title').toUpperCase()}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded font-sans transition-all"
            >
              {t('ledger.clearFilter')}
            </button>
          )}
          <button
            onClick={() => {
              downloadCSV(
                `ledger-${new Date().toISOString().split('T')[0]}.csv`,
                ['Recipient', 'Gate', 'Amount', 'Type', 'Status', 'Date', 'Comments', 'Verified'],
                filteredTransactions.map(tx => [
                  tx.recipient, tx.gate?.name || '', Math.abs(tx.amount), tx.type, tx.status,
                  tx.created_at, tx.comments || '', tx.verified ? 'Yes' : 'No',
                ])
              );
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {t('ledger.export')}
          </button>
            <button
              onClick={() => onOpenInvoice()}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950/20 border border-emerald-900/30 rounded text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-all"
            >
            <FileText className="w-3.5 h-3.5" />
            {t('invoice.invoice')}
          </button>
          <span className="text-xs text-zinc-500 font-mono">
            {t('ledger.recordsCount').replace('{count}', String(filteredTransactions.length))}
          </span>
        </div>
      </div>

      <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder={t('ledger.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-900/60 border border-zinc-800/80 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700 font-sans"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-900/60 border border-zinc-800/80 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-700 transition-colors font-mono"
            />
          </div>

          <div className="flex bg-zinc-900/60 p-1 border border-zinc-800/80 rounded">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                filterType === 'all'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
                {t('ledger.allTypes')}
            </button>
            <button
              onClick={() => setFilterType('deposit')}
              className={`flex-1 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                filterType === 'deposit'
                  ? 'bg-emerald-950/40 border border-emerald-900/30 text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
                {t('ledger.deposits')}
            </button>
            <button
              onClick={() => setFilterType('withdrawal')}
              className={`flex-1 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                filterType === 'withdrawal'
                  ? 'bg-rose-950/40 border border-rose-900/30 text-rose-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
                {t('ledger.withdrawals')}
            </button>
          </div>

          <div className="flex bg-zinc-900/60 p-1 border border-zinc-800/80 rounded">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                filterStatus === 'all'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
                {t('ledger.allStatus')}
            </button>
            <button
              onClick={() => setFilterStatus('Accepted')}
              className={`flex-1 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                filterStatus === 'Accepted'
                  ? 'bg-zinc-800 text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
                {t('ledger.accepted')}
            </button>
            <button
              onClick={() => setFilterStatus('Pending')}
              className={`flex-1 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                filterStatus === 'Pending'
                  ? 'bg-amber-950/30 border border-amber-900/30 text-amber-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
                {t('ledger.pending')}
            </button>
          </div>
        </div>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
            {t('ledger.loadingRecords')}
          </span>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 p-12 text-center bg-[#0F0F0F]">
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase block mb-2">
            {t('ledger.noRecords')}
          </span>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            {t('ledger.adjustFilters')}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="flex items-center gap-3 sticky top-16 bg-[#0A0A0A] py-2 z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans">
                  {dateLabel}
                </span>
                <div className="flex-1 h-[1px] bg-zinc-900" />
              </div>

              <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-[#0F0F0F]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950/40">
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans">
                        {t('ledger.recipient')}
                      </th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans">
                        {t('ledger.timestamp')}
                      </th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans">
                        {t('ledger.amount')}
                      </th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans">
                        {t('ledger.status')}
                      </th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans">
                        {t('ledger.comments')}
                      </th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans text-center">
                        {t('ledger.verified')}
                      </th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans text-right">
                        {t('ledger.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {txs.map((tx) => {
                      const isExpanded = !!expandedComments[tx.id];
                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <span className="text-xs font-bold text-zinc-100 block">
                                {tx.recipient}
                              </span>
                              <span onClick={() => navigate('/')} className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mt-0.5 cursor-pointer hover:text-emerald-400 transition-colors">
                                {tx.gate?.name || t('ledger.gateReference')} ({tx.gate?.code || t('ledger.na')})
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-xs text-zinc-400 font-mono">
                            {formatDate(tx.created_at)}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              {tx.type === 'deposit' ? (
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500" />
                              )}
                              <span
                                className={`text-xs font-bold font-mono ${
                                  tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {tx.type === 'deposit' ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase border ${
                                tx.status === 'Accepted'
                                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                  : 'bg-amber-950/10 border-amber-900/30 text-amber-500'
                              }`}
                            >
                              {tx.status === 'Accepted' ? (
                                <FileCheck className="w-2.5 h-2.5" />
                              ) : (
                                <FileClock className="w-2.5 h-2.5" />
                              )}
                              {tx.status}
                            </span>
                          </td>

                          <td className="px-4 py-4 max-w-[200px]">
                            {tx.comments ? (
                              <div>
                                <p
                                  className={`text-xs text-zinc-400 leading-relaxed ${
                                    isExpanded ? '' : 'truncate'
                                  }`}
                                >
                                  {tx.comments}
                                </p>
                                {tx.comments.length > 30 && (
                                  <button
                                    onClick={() => toggleComment(tx.id)}
                                    className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 mt-1 transition-colors block"
                                  >
                                    {isExpanded ? t('ledger.showLess') : t('ledger.readFullNote')}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-600 font-sans italic">{t('ledger.noRemarks')}</span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleVerificationToggle(tx.id, tx.verified)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                tx.verified
                                  ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 hover:bg-emerald-950/40'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                              }`}
                            >
                              {tx.verified ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  {t('ledger.verified')}
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3 text-zinc-600" />
                                  {t('ledger.unverified')}
                                </>
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => onOpenInvoice(tx.recipient)}
                                className="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/20 border border-transparent hover:border-emerald-900/30 rounded transition-all"
                                title="Generate Invoice"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onEditTransaction(tx.id)}
                                className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all"
                                title={t('ledger.modifyRecord')}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => archiveTransaction(tx.id)}
                                className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-amber-950/20 border border-transparent hover:border-amber-900/30 rounded transition-all"
                                title={t('ledger.archiveRecord')}
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteTransaction(tx.id)}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 rounded transition-all"
                                title={t('ledger.deleteRecord')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
