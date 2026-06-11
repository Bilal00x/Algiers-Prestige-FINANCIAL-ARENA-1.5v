import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinancialProvider, useFinancial } from './contexts/FinancialContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Ledger } from './pages/Ledger';
import { Archive } from './pages/Archive';
import { GateModal } from './components/GateModal';
import { TransactionModal } from './components/TransactionModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import { LockScreen } from './components/LockScreen';
import { UserManagementModal } from './components/UserManagementModal';
import { AuditLogModal } from './components/AuditLogModal';

const AppContent: React.FC = () => {
  const { deleteGate, deleteTransaction } = useFinancial();
  const { loading: authLoading, currentUser, isAdmin, logout } = useAuth();

  // جميع hooks في الأعلى قبل أي early return (قاعدة React)
  const [locked, setLocked] = useState(() => {
    const unlocked = sessionStorage.getItem('app_unlocked') === 'true';
    return !unlocked;
  });
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [gateIdToEdit, setGateIdToEdit] = useState<number | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txIdToEdit, setTxIdToEdit] = useState<number | null>(null);
  const [isGateDeleteOpen, setIsGateDeleteOpen] = useState(false);
  const [gateIdToDelete, setGateIdToDelete] = useState<number | null>(null);
  const [isTxDeleteOpen, setIsTxDeleteOpen] = useState(false);
  const [txIdToDelete, setTxIdToDelete] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center">
        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">Initializing...</span>
      </div>
    );
  }

  if (locked) {
    return <LockScreen onUnlock={() => setLocked(false)} />;
  }

  // Handlers for Gate Modal
  const handleOpenAddGate = () => {
    setGateIdToEdit(null);
    setIsGateModalOpen(true);
  };

  const handleOpenEditGate = (id: number) => {
    setGateIdToEdit(id);
    setIsGateModalOpen(true);
  };

  // Handlers for Transaction Modal
  const handleOpenAddTx = () => {
    setTxIdToEdit(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (id: number) => {
    setTxIdToEdit(id);
    setIsTxModalOpen(true);
  };

  // Handlers for Delete Gate
  const handleOpenDeleteGate = (id: number) => {
    setGateIdToDelete(id);
    setIsGateDeleteOpen(true);
  };

  const handleConfirmDeleteGate = async () => {
    if (gateIdToDelete !== null) {
      await deleteGate(gateIdToDelete);
      setGateIdToDelete(null);
    }
  };

  // Handlers for Delete Transaction
  const handleOpenDeleteTx = (id: number) => {
    setTxIdToDelete(id);
    setIsTxDeleteOpen(true);
  };

  const handleConfirmDeleteTx = async () => {
    if (txIdToDelete !== null) {
      await deleteTransaction(txIdToDelete);
      setTxIdToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        onAddGate={handleOpenAddGate}
        onAddTransaction={handleOpenAddTx}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        onLogout={() => {
          logout();
          setLocked(true);
        }}
        currentUserName={currentUser?.name}
        isAdmin={isAdmin}
      />

      {/* Main Page Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                onEditGate={handleOpenEditGate}
                onDeleteGate={handleOpenDeleteGate}
              />
            }
          />
          <Route
            path="/ledger"
            element={
              <Ledger
                onEditTransaction={handleOpenEditTx}
                onDeleteTransaction={handleOpenDeleteTx}
              />
            }
          />
          <Route
            path="/archive"
            element={
              <Archive
                onDeleteTransaction={handleOpenDeleteTx}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/40 py-6 text-center text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
        © {new Date().getFullYear()} Algiers Prestige Financial Arena. All rights reserved. SECURE AUDIT UPLINK.
      </footer>

      {/* Global Modals */}
      <GateModal
        isOpen={isGateModalOpen}
        onClose={() => setIsGateModalOpen(false)}
        gateIdToEdit={gateIdToEdit}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        txIdToEdit={txIdToEdit}
      />

      {/* Gate Deletion Confirmation */}
      <ConfirmationModal
        isOpen={isGateDeleteOpen}
        onClose={() => setIsGateDeleteOpen(false)}
        onConfirm={handleConfirmDeleteGate}
        title="Purge Operational Gate"
        message="WARNING: Deleting this gate slot will permanently purge its configuration and ALL associated transaction ledgers from the secure database. This action is absolute and cannot be undone."
        confirmText="Purge Gate & Ledgers"
        cancelText="Keep Gate Slot"
        isDanger={true}
      />

      {/* Transaction Deletion Confirmation */}
      <ConfirmationModal
        isOpen={isTxDeleteOpen}
        onClose={() => setIsTxDeleteOpen(false)}
        onConfirm={handleConfirmDeleteTx}
        title="Purge Ledger Record"
        message="WARNING: Deleting this transaction ledger entry will permanently remove it from the audit stream and instantly re-calibrate all related gate balances. Proceed with caution."
        confirmText="Purge Record"
        cancelText="Keep Record"
        isDanger={true}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenUserManagement={isAdmin ? () => { setIsSettingsOpen(false); setIsUserManagementOpen(true); } : undefined}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <FinancialProvider>
            <AppContent />
          </FinancialProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
