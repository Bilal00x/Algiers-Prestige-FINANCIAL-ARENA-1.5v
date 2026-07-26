import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Landmark, History, Plus, Archive, Settings, Users, Shield, LogOut, DoorOpen } from 'lucide-react';
import { LanguageSwitcher } from './ui/LanguageSwitcher';
import { Button } from './ui/Button';

interface NavbarProps {
  onAddGate: () => void;
  onOpenSettings: () => void;
  onOpenUserManagement?: () => void;
  onOpenAuditLog?: () => void;
  onLogout: () => void;
  currentUserName?: string;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddGate, onOpenSettings, onOpenUserManagement, onOpenAuditLog, onLogout, currentUserName, isAdmin }) => {
  const { t } = useSettings();
  return (
    <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase block">
              Algiers Prestige
            </span>
            <span className="text-sm font-semibold text-white tracking-tight font-sans block">
              FINANCIAL ARENA
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold uppercase tracking-widest transition-all ${
                isActive
                  ? 'bg-zinc-900 border border-zinc-800 text-white shadow-inner'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`
            }
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Control Center
          </NavLink>
          <NavLink
            to="/ledger"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold uppercase tracking-widest transition-all ${
                isActive
                  ? 'bg-zinc-900 border border-zinc-800 text-white shadow-inner'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`
            }
          >
            <History className="w-3.5 h-3.5" />
            Ledger History
          </NavLink>
          <NavLink
            to="/archive"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold uppercase tracking-widest transition-all ${
                isActive
                  ? 'bg-zinc-900 border border-zinc-800 text-white shadow-inner'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`
            }
          >
            <Archive className="w-3.5 h-3.5" />
            Archive Vault
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {currentUserName && (
            <span className="hidden md:block text-[10px] font-mono text-zinc-600 mr-1">
              {currentUserName}
            </span>
          )}
          <LanguageSwitcher />
          <button
            onClick={onOpenAuditLog}
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all"
            title="Audit Log"
          >
            <Shield className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={onOpenUserManagement}
              className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all"
              title="User Management"
            >
              <Users className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 rounded transition-all"
            title="Logout"
          >
            <DoorOpen className="w-4 h-4" />
          </button>
          <Button
            onClick={onAddGate}
            variant="primary"
            size="sm"
            className="hidden sm:flex items-center gap-1.5 uppercase font-bold tracking-widest shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('nav.addGate')}
          </Button>
          
        </div>
      </div>
    </header>
  );
};
