import React, { useState } from 'react';
import { useAuth, AppUser } from '../contexts/AuthContext';
import { X, UserPlus, UserCog, Shield, ShieldOff, Lock, Eye, EyeOff, AlertCircle, Check, Power, PowerOff, Trash2 } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, createUser, updateUser, deleteUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [newConfirm, setNewConfirm] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [resetPassFor, setResetPassFor] = useState<string | null>(null);
  const [resetPasscode, setResetPasscode] = useState('');
  const [resetShow, setResetShow] = useState(false);

  if (!isOpen) return null;

  const otherUsers = users.filter((u) => u.id !== currentUser?.id);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { setError('Enter a username.'); return; }
    if (newPasscode.length < 4) { setError('Passcode must be at least 4 characters.'); return; }
    if (newPasscode !== newConfirm) { setError('Passcodes do not match.'); return; }
    if (users.some((u) => u.name.toLowerCase() === newName.trim().toLowerCase())) {
      setError('Username already exists.'); return;
    }

    const ok = await createUser(newName.trim(), newPasscode, newRole, newEmail.trim() || undefined);
    if (ok) {
      setSuccess(`User "${newName.trim()}" created.`);
      setError('');
      setNewName('');
      setNewEmail('');
      setNewPasscode('');
      setNewConfirm('');
      setNewRole('user');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('Failed to create user.');
    }
  };

  const handleToggleActive = async (user: AppUser) => {
    await updateUser(user.id, { active: !user.active });
  };

  const handleResetPasscode = async (userId: string) => {
    if (resetPasscode.length < 4) { setError('Passcode must be at least 4 characters.'); return; }
    await updateUser(userId, { passcode: resetPasscode });
    setResetPassFor(null);
    setResetPasscode('');
    setSuccess('Passcode reset successfully.');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleRoleToggle = async (user: AppUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await updateUser(user.id, { role: newRole });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-bold text-white">User Management</h2>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Current User Info */}
            {currentUser && (
              <div className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg">
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">{currentUser.name} (you)</span>
                  <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
                    {currentUser.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/20 border border-emerald-900/30 text-emerald-400">
                  Active
                </span>
              </div>
            )}

            {/* Other Users */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Registered Users
              </span>

              {otherUsers.length === 0 && (
                <div className="text-center py-4 border border-dashed border-zinc-800 rounded">
                  <span className="text-xs text-zinc-600">No other users registered.</span>
                </div>
              )}

              {otherUsers.map((user) => (
                <div key={user.id} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${user.active ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                      <span className={`text-xs font-semibold truncate ${user.active ? 'text-zinc-200' : 'text-zinc-600'}`}>
                        {user.name}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${
                      user.role === 'admin'
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-all ${
                        user.active
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-900/30'
                          : 'bg-emerald-950/10 border-emerald-900/20 text-emerald-500 hover:text-emerald-400'
                      }`}
                    >
                      {user.active ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                      {user.active ? 'Lock' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleRoleToggle(user)}
                      className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-all"
                    >
                      {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    </button>

                    <button
                      onClick={() => { setResetPassFor(user.id); setResetPasscode(''); setError(''); }}
                      disabled={resetPassFor === user.id}
                      className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-all disabled:opacity-50"
                    >
                      <Lock className="w-3 h-3" />
                      Reset Passcode
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete user "${user.name}"?`)) {
                          deleteUser(user.id);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-rose-950/10 border border-rose-900/30 rounded text-[9px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-950/20 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>

                  {resetPassFor === user.id && (
                    <div className="flex gap-2 items-center pt-1">
                      <input
                        type={resetShow ? 'text' : 'password'}
                        value={resetPasscode}
                        onChange={(e) => setResetPasscode(e.target.value)}
                        placeholder="New passcode"
                        autoFocus
                        className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-xs font-mono tracking-widest focus:outline-none focus:border-zinc-700 placeholder-zinc-700"
                      />
                      <button onClick={() => setResetShow(!resetShow)} className="text-zinc-600 hover:text-zinc-400">
                        {resetShow ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleResetPasscode(user.id)}
                        disabled={!resetPasscode}
                        className="px-2.5 py-1.5 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded text-[9px] font-bold uppercase tracking-wider transition-all">
                        Save
                      </button>
                      <button onClick={() => setResetPassFor(null)}
                        className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded text-[9px] font-bold uppercase tracking-wider transition-all">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add User Form */}
            {!showForm ? (
              <button
                onClick={() => { setShowForm(true); setError(''); setSuccess(''); }}
                className="w-full py-3 border border-dashed border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add New User
              </button>
            ) : (
              <form onSubmit={handleCreate} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">New User Details</span>

                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Username"
                  autoFocus
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
                />

                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
                />

                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Passcode"
                    maxLength={20}
                    className="w-full px-3 py-2 pr-10 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm font-mono tracking-widest focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <input
                  type={showPass ? 'text' : 'password'}
                  value={newConfirm}
                  onChange={(e) => setNewConfirm(e.target.value)}
                  placeholder="Confirm passcode"
                  maxLength={20}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm font-mono tracking-widest focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
                />

                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1.5">Role</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setNewRole('user')}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded border transition-all ${
                        newRole === 'user'
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}>
                      User
                    </button>
                    <button type="button" onClick={() => setNewRole('admin')}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded border transition-all ${
                        newRole === 'admin'
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}>
                      Admin
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">{success}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button type="submit"
                    disabled={!newName || !newPasscode || !newConfirm}
                    className="flex-1 py-2 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded text-xs font-bold uppercase tracking-wider transition-all">
                    Create User
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setError(''); setSuccess(''); }}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded text-xs font-bold uppercase tracking-wider transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="flex gap-3 p-6 border-t border-zinc-800">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded font-semibold uppercase tracking-wider transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
