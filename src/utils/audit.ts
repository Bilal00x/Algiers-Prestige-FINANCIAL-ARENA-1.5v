const AUDIT_KEY = 'app_audit_log';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'archive' | 'unarchive' | 'verify';
  entity: 'gate' | 'transaction' | 'user';
  entityId: number | string;
  summary: string;
  performedBy?: string;
}

export function getAuditLog(): AuditEntry[] {
  try {
    const stored = localStorage.getItem(AUDIT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  try {
    const log = getAuditLog();
    const newEntry: AuditEntry = {
      ...entry,
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    log.unshift(newEntry);
    // Keep last 500 entries
    if (log.length > 500) log.length = 500;
    localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}

export function clearAuditLog() {
  localStorage.removeItem(AUDIT_KEY);
}
