import React from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatDZD, getMonthKey, formatMonthLabel } from '../utils/format';
import { downloadCSV, triggerPrint } from '../utils/export';
import { GateCard } from '../components/GateCard';
import { Landmark, TrendingUp, TrendingDown, Layers, Loader2, ArrowRight, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  onEditGate: (id: number) => void;
  onDeleteGate: (id: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onEditGate, onDeleteGate }) => {
  const { gates, transactions, loading } = useFinancial();
  const { t, formatCurrency } = useSettings();
  const navigate = useNavigate();

  const totalBalance = gates.reduce((sum, g) => sum + g.balance, 0);
  
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (loading && gates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
          {t('ledger.loadingRecords')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
            {t('dashboard.subtitle')}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans mt-1">
            {t('dashboard.title').toUpperCase()}
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
            {t('dashboard.status')}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 font-sans mt-1 bg-emerald-950/20 px-2.5 py-1 border border-emerald-900/30 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {t('dashboard.active')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-white" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                {t('dashboard.totalLiquidity')}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono mt-1.5">
                {formatCurrency(totalBalance)}
              </h2>
            </div>
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
              <Landmark className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                {t('dashboard.totalDeposits')}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-emerald-400 font-mono mt-1.5">
                {formatCurrency(totalDeposits)}
              </h2>
            </div>
            <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-600" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                {t('dashboard.totalWithdrawals')}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-rose-400 font-mono mt-1.5">
                {formatCurrency(totalWithdrawals)}
              </h2>
            </div>
            <div className="p-2 bg-rose-950/20 border border-rose-900/30 rounded">
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                {t('dashboard.activeGates')}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-300 font-mono mt-1.5">
                {gates.length} Slots
              </h2>
            </div>
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
              <Layers className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {gates.length > 0 && transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Distribution Bar Chart */}
          <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Gate Balance Distribution</h3>
            </div>
            {(() => {
              const maxBalance = Math.max(...gates.map(g => g.balance), 1);
              return (
                <div className="space-y-2.5">
                  {gates.slice(0, 5).map(gate => {
                    const pct = (gate.balance / maxBalance) * 100;
                    return (
                      <div key={gate.id} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-zinc-300 font-semibold truncate mr-2">{gate.name}</span>
                          <span className="text-zinc-400 font-mono">{formatDZD(gate.balance)}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-zinc-500 to-zinc-300 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Monthly Flow Chart */}
          <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Monthly Flow</h3>
            </div>
            {(() => {
              const byMonth = transactions.reduce<Record<string, { deposits: number; withdrawals: number }>>((acc, tx) => {
                const mk = getMonthKey(tx.created_at);
                if (!acc[mk]) acc[mk] = { deposits: 0, withdrawals: 0 };
                const amt = Math.abs(tx.amount);
                if (tx.type === 'deposit') acc[mk].deposits += amt;
                else acc[mk].withdrawals += amt;
                return acc;
              }, {});
              const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
              const maxVal = Math.max(...months.map(([, v]) => Math.max(v.deposits, v.withdrawals)), 1);
              return (
                <div className="flex items-end gap-2 h-32">
                  {months.map(([mk, vals]) => (
                    <div key={mk} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                      <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '100%' }}>
                        <div
                          className="w-2.5 bg-emerald-500/80 rounded-t"
                          style={{ height: `${(vals.deposits / maxVal) * 100}%` }}
                          title={`Deposits: ${formatDZD(vals.deposits)}`}
                        />
                        <div
                          className="w-2.5 bg-rose-500/80 rounded-t"
                          style={{ height: `${(vals.withdrawals / maxVal) * 100}%` }}
                          title={`Withdrawals: ${formatDZD(vals.withdrawals)}`}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600 mt-1 truncate w-full text-center">
                        {formatMonthLabel(mk).split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Active Gates & Export */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
              {t('dashboard.activeGates').toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                downloadCSV(
                  `gates-${new Date().toISOString().split('T')[0]}.csv`,
                  ['Name', 'Code', 'Initial Balance', 'Current Balance', 'Created'],
                  gates.map(g => [g.name, g.code, g.initial_balance, g.balance, g.created_at])
                );
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              onClick={triggerPrint}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all"
            >
              <Printer className="w-3 h-3" />
              Print
            </button>
            <span className="text-xs text-zinc-500 font-mono">
              {gates.length} slots operational
            </span>
          </div>
        </div>

        {gates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-12 text-center">
            <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase block mb-4">
              {t('ledger.noRecords')}
            </span>
            <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
              Establish a new card slot (Gate) to begin directing and ledgering capital flow in Algerian Dinar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gates.map((gate) => (
              <GateCard
                key={gate.id}
                gate={gate}
                onEdit={onEditGate}
                onDelete={onDeleteGate}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
              Recent Ledger Streams
            </h2>
          </div>
          <button
            onClick={() => navigate('/ledger')}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors font-sans"
          >
            Audit Full Ledger
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-xs text-zinc-500 font-mono">No transaction stream recorded.</span>
          </div>
        ) : (
          <div className="space-y-3.5">
            {transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded bg-zinc-900/40 border border-zinc-800/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-1.5 h-8 rounded-full ${
                      tx.type === 'deposit' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">
                      {tx.recipient}
                    </span>
                    <div className="flex gap-2 items-center text-[10px] text-zinc-500 font-mono mt-0.5">
                      <span>{tx.gate?.name || 'Gate'}</span>
                      <span>•</span>
                      <span>{new Date(tx.created_at).toLocaleDateString('fr-DZ')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold font-mono block ${
                      tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.type === 'deposit' ? '+' : '-'} {formatDZD(Math.abs(tx.amount))}
                  </span>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider ${
                      tx.status === 'Accepted' ? 'text-zinc-500' : 'text-amber-500'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
