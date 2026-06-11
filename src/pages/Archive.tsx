import React, { useState, useMemo } from 'react';
import { useFinancial, Transaction } from '../contexts/FinancialContext';
import { formatDZD, formatDate, computeDailySummaries, computeWeeklySummaries, computeMonthlySummaries, DaySummary, PeriodSummary } from '../utils/format';
import { RotateCcw, Trash2, Search, Calendar, ArrowUpRight, ArrowDownLeft, FileCheck, FileClock, BarChart3, List, ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

type ViewMode = 'summary' | 'records';
type PeriodMode = 'daily' | 'weekly' | 'monthly';

interface ArchiveProps {
  onDeleteTransaction: (id: number) => void;
}

export const Archive: React.FC<ArchiveProps> = ({ onDeleteTransaction }) => {
  const { transactions, archivedTransactions, unarchiveTransaction, loading } = useFinancial();
  const allTx = useMemo(() => [...transactions, ...archivedTransactions], [transactions, archivedTransactions]);

  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [periodMode, setPeriodMode] = useState<PeriodMode>('daily');
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

  // Records view state
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');

  const togglePeriod = (key: string) => {
    setExpandedPeriods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleComment = (id: number) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRestore = async (id: number) => {
    await unarchiveTransaction(id);
  };

  const dailySummaries = useMemo(() => computeDailySummaries(allTx), [allTx]);
  const weeklySummaries = useMemo(() => computeWeeklySummaries(dailySummaries), [dailySummaries]);
  const monthlySummaries = useMemo(() => computeMonthlySummaries(dailySummaries), [dailySummaries]);

  const currentSummaries: PeriodSummary[] = useMemo(() => {
    switch (periodMode) {
      case 'weekly': return weeklySummaries;
      case 'monthly': return monthlySummaries;
      default: return dailySummaries.map(d => ({
        key: d.date,
        label: d.label,
        deposits: d.deposits,
        withdrawals: d.withdrawals,
        net: d.net,
        count: d.count,
        days: [d],
      }));
    }
  }, [periodMode, dailySummaries, weeklySummaries, monthlySummaries]);

  // Records view logic (original Archive behavior)
  const filteredArchived = archivedTransactions.filter((tx) => {
    const matchesSearch =
      tx.recipient.toLowerCase().includes(search.toLowerCase()) ||
      (tx.comments || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.gate?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.gate?.code || '').toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || tx.type === filterType;

    let matchesDate = true;
    if (selectedDate) {
      const txDate = new Date(tx.created_at).toISOString().split('T')[0];
      matchesDate = txDate === selectedDate;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const groupedArchived = filteredArchived.reduce<Record<string, Transaction[]>>((groups, tx) => {
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

  const totalDeposits = currentSummaries.reduce((s, p) => s + p.deposits, 0);
  const totalWithdrawals = currentSummaries.reduce((s, p) => s + p.withdrawals, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
            Data Management
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans mt-1">
            {viewMode === 'summary' ? 'DAILY FLOW ARCHIVE' : 'ARCHIVED RECORDS'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900/60 p-0.5 border border-zinc-800/80 rounded">
            <button
              onClick={() => setViewMode('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                viewMode === 'summary'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              Summary
            </button>
            <button
              onClick={() => setViewMode('records')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                viewMode === 'records'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List className="w-3 h-3" />
              Records
            </button>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {viewMode === 'summary'
              ? `${allTx.length} total entries`
              : `${filteredArchived.length} archived records`}
          </span>
        </div>
      </div>

      {/* Summary View */}
      {viewMode === 'summary' && (
        <>
          {/* Period Toggle + Stats Cards */}
          <div className="space-y-4">
            <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mr-2">
                  Aggregate By:
                </span>
                {(['daily', 'weekly', 'monthly'] as PeriodMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPeriodMode(mode)}
                    className={`px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all ${
                      periodMode === mode
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                        : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {mode === 'daily' ? 'Daily' : mode === 'weekly' ? 'Weekly' : 'Monthly'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">
                      Total Deposits
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {formatDZD(totalDeposits)}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-2 bg-rose-950/20 border border-rose-900/30 rounded">
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">
                      Total Withdrawals
                    </span>
                    <span className="text-sm font-bold font-mono text-rose-400">
                      {formatDZD(totalWithdrawals)}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 border border-zinc-700 rounded">
                    <DollarSign className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">
                      Net Flow
                    </span>
                    <span className={`text-sm font-bold font-mono ${totalDeposits - totalWithdrawals >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatDZD(totalDeposits - totalWithdrawals)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Period List */}
            {currentSummaries.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 p-12 text-center bg-[#0F0F0F]">
                <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase block mb-2">
                  No Transaction Data
                </span>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  Record transactions to see your daily, weekly, and monthly flow summaries.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentSummaries.map((period) => {
                  const isExpanded = !!expandedPeriods[period.key];
                  const dayCount = periodMode === 'daily' ? 1 : period.days.length;
                  return (
                    <div key={period.key} className="bg-[#0F0F0F] border border-zinc-800 rounded-lg overflow-hidden">
                      {/* Period Header */}
                      <button
                        onClick={() => togglePeriod(period.key)}
                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                              {periodMode === 'daily' ? 'DAY' : periodMode === 'weekly' ? 'WK' : 'MO'}
                            </span>
                            <span className="text-xs font-bold text-zinc-200 font-mono">
                              {periodMode === 'daily'
                                ? period.key.slice(8)
                                : periodMode === 'weekly'
                                  ? period.key.slice(-2)
                                  : period.key.slice(5)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-zinc-200 block">
                              {period.label}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {period.count} transactions{dayCount > 1 ? ` across ${dayCount} days` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 block">
                              Deposits
                            </span>
                            <span className="text-xs font-bold font-mono text-emerald-400">
                              +{formatDZD(period.deposits)}
                            </span>
                          </div>
                          <div className="text-right hidden sm:block">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500 block">
                              Withdrawals
                            </span>
                            <span className="text-xs font-bold font-mono text-rose-400">
                              -{formatDZD(period.withdrawals)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">
                              Net
                            </span>
                            <span className={`text-xs font-bold font-mono ${period.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {period.net >= 0 ? '+' : ''}{formatDZD(period.net)}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-zinc-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Day Details */}
                      {isExpanded && (
                        <div className="border-t border-zinc-800/60">
                          {periodMode !== 'daily' && period.days.length > 0 && (
                            <div className="divide-y divide-zinc-800/40">
                              {period.days.map((day) => (
                                <div key={day.date} className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900/20">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-zinc-400 w-24">
                                      {new Date(day.date).toLocaleDateString('fr-DZ', { weekday: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="text-[10px] text-zinc-600 font-mono">
                                      {day.count} tx
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    {day.deposits > 0 && (
                                      <span className="text-[11px] font-bold font-mono text-emerald-400">
                                        +{formatDZD(day.deposits)}
                                      </span>
                                    )}
                                    {day.withdrawals > 0 && (
                                      <span className="text-[11px] font-bold font-mono text-rose-400">
                                        -{formatDZD(day.withdrawals)}
                                      </span>
                                    )}
                                    <span className={`text-[11px] font-bold font-mono w-24 text-right ${day.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {day.net >= 0 ? '+' : ''}{formatDZD(day.net)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {periodMode === 'daily' && (
                            <div className="p-4 bg-zinc-900/20">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                  Breakdown
                                </span>
                                <div className="flex gap-4">
                                  <span className="text-[10px] font-bold text-emerald-400">
                                    +{formatDZD(period.deposits)}
                                  </span>
                                  <span className="text-[10px] font-bold text-rose-400">
                                    -{formatDZD(period.withdrawals)}
                                  </span>
                                </div>
                              </div>

                              {period.deposits > 0 && (
                                <div className="mb-2">
                                  <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                    <span>Deposits</span>
                                    <span>{((period.deposits / (period.deposits + period.withdrawals)) * 100).toFixed(0)}%</span>
                                  </div>
                                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full"
                                      style={{ width: `${(period.deposits / (period.deposits + period.withdrawals)) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                              {period.withdrawals > 0 && (
                                <div>
                                  <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                    <span>Withdrawals</span>
                                    <span>{((period.withdrawals / (period.deposits + period.withdrawals)) * 100).toFixed(0)}%</span>
                                  </div>
                                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-rose-500 rounded-full"
                                      style={{ width: `${(period.withdrawals / (period.deposits + period.withdrawals)) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Records View (Original Archive logic) */}
      {viewMode === 'records' && (
        <>
          <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search counterparties or notes..."
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
                  All Types
                </button>
                <button
                  onClick={() => setFilterType('deposit')}
                  className={`flex-1 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                    filterType === 'deposit'
                      ? 'bg-emerald-950/40 border border-emerald-900/30 text-emerald-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Deposits
                </button>
                <button
                  onClick={() => setFilterType('withdrawal')}
                  className={`flex-1 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                    filterType === 'withdrawal'
                      ? 'bg-rose-950/40 border border-rose-900/30 text-rose-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Withdrawals
                </button>
              </div>
            </div>
          </div>

          {loading && archivedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
                Loading Archived Records...
              </span>
            </div>
          ) : filteredArchived.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 p-12 text-center bg-[#0F0F0F]">
              <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase block mb-2">
                No Archived Records Located
              </span>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Your archive is empty. Archive transactions from the ledger to manage historical data here.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedArchived).map(([dateLabel, txs]) => (
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
                            Recipient & Gate Info
                          </th>
                          <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans">
                            Original Date
                          </th>
                          <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans">
                            Amount & Type
                          </th>
                          <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans">
                            Archived Date
                          </th>
                          <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans">
                            Comments / Notes
                          </th>
                          <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-sans text-right">
                            Actions
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
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mt-0.5">
                                    {tx.gate?.name || 'Gate Reference'} ({tx.gate?.code || 'N/A'})
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
                                    {tx.type === 'deposit' ? '+' : '-'} {formatDZD(Math.abs(tx.amount))}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-xs text-zinc-400 font-mono">
                                {tx.archived_at ? formatDate(tx.archived_at) : 'N/A'}
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
                                        className="text-[10px] text-zinc-600 hover:text-zinc-400 mt-1 font-sans transition-colors"
                                      >
                                        {isExpanded ? 'Show less' : 'Show more'}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-zinc-600">No notes</span>
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleRestore(tx.id)}
                                    className="p-1.5 bg-blue-950/20 border border-blue-900/30 rounded hover:bg-blue-900/30 transition-colors text-blue-400 hover:text-blue-300 group"
                                    title="Restore from archive"
                                  >
                                    <RotateCcw className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteTransaction(tx.id)}
                                    className="p-1.5 bg-red-950/20 border border-red-900/30 rounded hover:bg-red-900/30 transition-colors text-red-400 hover:text-red-300 group"
                                    title="Permanently delete"
                                  >
                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
        </>
      )}
    </div>
  );
};
