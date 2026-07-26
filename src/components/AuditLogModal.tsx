import React, { useState, useMemo } from 'react';
import { X, Clock, Shield, FileText, Plus, Pencil, Trash2, Archive, RotateCcw, Check, Search, Download } from 'lucide-react';
import { getAuditLog, AuditEntry } from '../utils/audit';
import { useSettings } from '../contexts/SettingsContext';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  create: <Plus className="w-3 h-3 text-emerald-500" />,
  update: <Pencil className="w-3 h-3 text-blue-500" />,
  delete: <Trash2 className="w-3 h-3 text-rose-500" />,
  archive: <Archive className="w-3 h-3 text-amber-500" />,
  unarchive: <RotateCcw className="w-3 h-3 text-blue-500" />,
  verify: <Check className="w-3 h-3 text-emerald-500" />,
};

const actionColors: Record<string, string> = {
  create: 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400',
  update: 'bg-blue-950/20 border-blue-900/30 text-blue-400',
  delete: 'bg-rose-950/20 border-rose-900/30 text-rose-400',
  archive: 'bg-amber-950/20 border-amber-900/30 text-amber-400',
  unarchive: 'bg-blue-950/20 border-blue-900/30 text-blue-400',
  verify: 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400',
};

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { formatCurrency } = useSettings();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const log = useMemo(() => getAuditLog(), [isOpen]);

  const filtered = useMemo(() => {
    return log.filter(e => {
      const matchesSearch = search === '' ||
        e.summary.toLowerCase().includes(search.toLowerCase()) ||
        (e.performedBy || '').toLowerCase().includes(search.toLowerCase()) ||
        String(e.entityId).includes(search);
      const matchesAction = actionFilter === 'all' || e.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [log, search, actionFilter]);

  const handleExport = () => {
    const csv = [
      'Timestamp,Action,Entity,Entity ID,Summary,Performed By',
      ...log.map(e =>
        `"${e.timestamp}","${e.action}","${e.entity}","${e.entityId}","${e.summary}","${e.performedBy || ''}"`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-bold text-white">Audit Log</h2>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-zinc-800 space-y-3 shrink-0">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search audit entries..."
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900/60 border border-zinc-800/80 rounded text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
                />
              </div>
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-900/60 border border-zinc-800/80 rounded text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="archive">Archive</option>
                <option value="unarchive">Unarchive</option>
                <option value="verify">Verify</option>
              </select>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-200 text-black rounded text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">{filtered.length} entries</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <span className="text-xs font-mono tracking-widest text-zinc-600 uppercase">No audit entries found</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 bg-zinc-900/40 border border-zinc-800/50 rounded-lg hover:bg-zinc-900/60 transition-colors">
                    <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded mt-0.5">
                      {actionIcons[entry.action] || <Clock className="w-3 h-3 text-zinc-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${actionColors[entry.action] || 'text-zinc-500'}`}>
                          {entry.action}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">{entry.entity}</span>
                        <span className="text-[10px] font-mono text-zinc-600">#{entry.entityId}</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1">{entry.summary}</p>
                      {entry.amount && (
                        <span className="text-xs font-bold font-mono text-emerald-400 mt-0.5 block">
                          {formatCurrency(entry.amount)}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-zinc-600">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.timestamp).toLocaleString('fr-DZ')}
                        {entry.performedBy && (
                          <>
                            <span>•</span>
                            <span>{entry.performedBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-800 shrink-0">
            <button onClick={onClose} className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black rounded font-semibold uppercase tracking-wider transition-all text-xs">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
