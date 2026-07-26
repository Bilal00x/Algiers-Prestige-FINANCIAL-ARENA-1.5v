import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Landmark, AlertCircle, ShieldCheck, Users, UserPlus, LogIn, UserCog } from 'lucide-react';
import { useAuth, AppUser } from '../contexts/AuthContext';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { users, login, createUser, lockedUntil, loginError } = useAuth();

  const hasUsers = users.length > 0;

  // Only show tabs if users exist (otherwise force setup)
  const [mode, setMode] = useState<'login' | 'register'>(hasUsers ? 'login' : 'register');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPasscode, setRegPasscode] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regShowPass, setRegShowPass] = useState(false);

  const [resetConfirm, setResetConfirm] = useState(false);

  const displayError = loginError || error;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || submitting) return;

    setSubmitting(true);
    setError('');
    const success = await login(selectedUser.name, passcode);
    if (success) {
      sessionStorage.setItem('app_unlocked', 'true');
      onUnlock();
    } else {
      setPasscode('');
    }
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!regName.trim()) { setError('Enter a username.'); return; }
    if (regPasscode.length < 4) { setError('Passcode must be at least 4 characters.'); return; }
    if (regPasscode !== regConfirm) { setError('Passcodes do not match.'); return; }

    setSubmitting(true);
    setError('');

    const ok = await createUser(regName.trim(), regPasscode, 'user', regEmail.trim() || undefined);
    if (!ok) { setError('Username already exists.'); setSubmitting(false); return; }

    const loggedIn = await login(regName.trim(), regPasscode);
    if (loggedIn) {
      sessionStorage.setItem('app_unlocked', 'true');
      onUnlock();
      setSubmitting(false);
      return;
    }

    // Fallback if login fails after creation
    const allUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const freshUser = allUsers.find((u: any) => u.name.toLowerCase() === regName.trim().toLowerCase());
    if (freshUser) {
      sessionStorage.setItem('app_session', JSON.stringify({ userId: freshUser.id }));
      sessionStorage.setItem('app_unlocked', 'true');
      onUnlock();
    } else {
      setError('Account created but login failed. Try again.');
    }
    setSubmitting(false);
  };

  const handleResetAll = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (mode === 'register' && !hasUsers) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Algiers Prestige</h1>
            <p className="text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase mt-1">FINANCIAL ARENA</p>
            <div className="mt-6 flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Create Admin Account</span>
            </div>
            <p className="text-[10px] text-zinc-600 max-w-xs mx-auto leading-relaxed">
              First-time setup. Create the administrator account to secure this device.
            </p>
          </div>
            <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              value={regName}
              onChange={(e) => { setRegName(e.target.value); setError(''); }}
              placeholder="Admin name"
              autoFocus
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm text-center font-sans focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
            />
            <input
              type="email"
              value={regEmail}
              onChange={(e) => { setRegEmail(e.target.value); setError(''); }}
              placeholder="Email (optional)"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm text-center font-sans focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
            />
            <div className="relative">
              <input
                type={regShowPass ? 'text' : 'password'}
                value={regPasscode}
                onChange={(e) => { setRegPasscode(e.target.value); setError(''); }}
                placeholder="Passcode"
                maxLength={350}
                className="w-full px-4 py-3 pr-10 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm text-center font-mono tracking-widest focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
              />
              <button type="button" onClick={() => setRegShowPass(!regShowPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                {regShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={regShowPass ? 'text' : 'password'}
              value={regConfirm}
              onChange={(e) => { setRegConfirm(e.target.value); setError(''); }}
              placeholder="Confirm passcode"
              maxLength={350}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm text-center font-mono tracking-widest focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
            />
            {displayError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-rose-950/20 border border-rose-900/30 rounded">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-xs text-rose-400">{displayError}</span>
              </div>
            )}
            <button type="submit" disabled={!regName || !regPasscode || !regConfirm || submitting}
              className="w-full py-3 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded font-bold uppercase tracking-wider transition-all text-sm">
              {submitting ? 'Securing...' : 'Secure This Device'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Algiers Prestige</h1>
          <p className="text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase mt-1">FINANCIAL ARENA</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => { setMode('login'); setError(''); setSelectedUser(null); }}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-zinc-800 text-zinc-100'
                : 'bg-zinc-900/50 text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSelectedUser(null); }}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-zinc-800 text-zinc-100'
                : 'bg-zinc-900/50 text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>
        </div>

        {mode === 'login' ? (
          <>
            {!selectedUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Select User</span>
                </div>
                {users.filter(u => u.active).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => { setSelectedUser(user); setPasscode(''); setError(''); }}
                    className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all text-left group"
                  >
                    <span className="text-sm font-semibold text-zinc-200 group-hover:text-white block">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-600">
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-2">
                  <span className="text-sm font-semibold text-zinc-300 block">{selectedUser.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Change user
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => { setPasscode(e.target.value); setError(''); }}
                    placeholder="Enter passcode"
                    autoFocus
                    maxLength={350}
                    className="w-full px-4 py-3 pr-10 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm text-center font-mono tracking-widest focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
                  />
                  <button type="button" onClick={() => setShowPasscode(!showPasscode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {displayError && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-rose-950/20 border border-rose-900/30 rounded">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-xs text-rose-400">{displayError}</span>
                  </div>
                )}

                <button type="submit" disabled={!passcode || submitting || !!lockedUntil}
                  className="w-full py-3 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded font-bold uppercase tracking-wider transition-all text-sm">
                  {submitting ? 'Verifying...' : 'Unlock Vault'}
                </button>
              </form>
            )}
          </>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserCog className="w-4 h-4 text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">New Account</span>
            </div>

            <input
              type="text"
              value={regName}
              onChange={(e) => { setRegName(e.target.value); setError(''); }}
              placeholder="Username"
              autoFocus
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm text-center font-sans focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
            />

            <input
              type="email"
              value={regEmail}
              onChange={(e) => { setRegEmail(e.target.value); setError(''); }}
              placeholder="Email (optional)"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm text-center font-sans focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
            />

            <div className="relative">
              <input
                type={regShowPass ? 'text' : 'password'}
                value={regPasscode}
                onChange={(e) => { setRegPasscode(e.target.value); setError(''); }}
                placeholder="Passcode"
                maxLength={350}
                className="w-full px-4 py-3 pr-10 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm text-center font-mono tracking-widest focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
              />
              <button type="button" onClick={() => setRegShowPass(!regShowPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                {regShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <input
              type={regShowPass ? 'text' : 'password'}
              value={regConfirm}
              onChange={(e) => { setRegConfirm(e.target.value); setError(''); }}
              placeholder="Confirm passcode"
              maxLength={350}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-sm text-center font-mono tracking-widest focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-700"
            />

            {displayError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-rose-950/20 border border-rose-900/30 rounded">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-xs text-rose-400">{displayError}</span>
              </div>
            )}

            <button type="submit" disabled={!regName || !regPasscode || !regConfirm || submitting}
              className="w-full py-3 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded font-bold uppercase tracking-wider transition-all text-sm">
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        {!resetConfirm ? (
          <button
            onClick={() => setResetConfirm(true)}
            className="mt-6 w-full text-[9px] font-mono tracking-widest text-zinc-700 hover:text-rose-500 transition-colors"
          >
            Reset All Data
          </button>
        ) : (
          <div className="mt-6 p-3 bg-rose-950/10 border border-rose-900/30 rounded space-y-2">
            <p className="text-[10px] text-rose-400 text-center leading-relaxed">
              This will permanently delete ALL data including users, gates, and transactions.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResetAll}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-all"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="flex-1 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded text-[9px] font-bold uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
