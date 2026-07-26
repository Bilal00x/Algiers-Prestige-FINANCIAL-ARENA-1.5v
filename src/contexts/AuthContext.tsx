import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  role: 'admin' | 'user';
  passcode: string;
  active: boolean;
  created_at: string;
  last_login?: string;
}

interface AuthContextType {
  users: AppUser[];
  currentUser: AppUser | null;
  loading: boolean;
  login: (name: string, passcode: string) => Promise<boolean>;
  logout: () => void;
  createUser: (name: string, passcode: string, role: 'admin' | 'user', email?: string) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<AppUser>) => Promise<boolean>;
  deleteUser: (id: string) => boolean;
  isAdmin: boolean;
  canManageUsers: boolean;
  lockedUntil: number | null;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'app_users';
const SESSION_KEY = 'app_session';
const FAILED_ATTEMPTS_KEY = 'app_failed_attempts';



const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

import bcrypt from 'bcryptjs';

const SEEDED_ADMIN_ID = 'seeded-admin';
const SEEDED_ADMIN_NAME = 'admin';
const SEEDED_ADMIN_EMAIL = 'admin@algiersprestige.com';

async function hashPassword(password: string): Promise<string> {
  // Use bcrypt with a work factor of 12 (adjust as needed)
  const saltRounds = 12;
  const hashed = await bcrypt.hash(password, saltRounds);
  return hashed;
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>&"'\/]/g, '').trim();
}

function loadUsers(): AppUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveUsers(users: AppUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getFailedAttempts(): Record<string, { count: number; lastAttempt: number }> {
  try {
    return JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{}');
  } catch { return {}; }
}

function saveFailedAttempts(attempts: Record<string, { count: number; lastAttempt: number }>) {
  localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attempts));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const seedAdmin = useCallback(async () => {
    const existing = loadUsers();
    const hasSeededAdmin = existing.some(u => u.id === SEEDED_ADMIN_ID);
    if (!hasSeededAdmin) {
      const envPass = import.meta.env.VITE_INITIAL_ADMIN_PASSCODE;
      const plainPass = envPass || [...crypto.getRandomValues(new Uint8Array(32))]
        .map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 32);
      if (!envPass) {
        console.warn('Seeded admin passcode:', plainPass);
      }
      const hashed = await hashPassword(plainPass);
      const adminUser: AppUser = {
        id: SEEDED_ADMIN_ID,
        name: SEEDED_ADMIN_NAME,
        email: SEEDED_ADMIN_EMAIL,
        role: 'admin',
        passcode: hashed,
        active: true,
        created_at: new Date().toISOString(),
        last_login: undefined,
      };
      existing.unshift(adminUser);
      saveUsers(existing);
    }
    setUsers(existing);
  }, []);

  useEffect(() => {
    const init = async () => {
      await seedAdmin();
      try {
        const sessionData = sessionStorage.getItem(SESSION_KEY);
        if (sessionData) {
          const { userId } = JSON.parse(sessionData);
          const allUsers = loadUsers();
          const user = allUsers.find((u) => u.id === userId && u.active);
          if (user) {
            setCurrentUser(user);
          }
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, [seedAdmin]);

  const login = useCallback(async (name: string, passcode: string): Promise<boolean> => {
    setLoginError(null);
    setLockedUntil(null);

    const sanitizedName = sanitizeInput(name);
    if (!sanitizedName) {
      setLoginError('Invalid username.');
      return false;
    }

    const attempts = getFailedAttempts();
    const attemptKey = sanitizedName.toLowerCase();
    const record = attempts[attemptKey];

    if (record && record.count >= MAX_LOGIN_ATTEMPTS) {
      const elapsed = Date.now() - record.lastAttempt;
      if (elapsed < LOCKOUT_DURATION_MS) {
        const remaining = Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 1000 / 60);
        setLockedUntil(record.lastAttempt + LOCKOUT_DURATION_MS);
        setLoginError(`Account locked. Try again in ${remaining} minute(s).`);
        return false;
      }
      delete attempts[attemptKey];
      saveFailedAttempts(attempts);
    }

    const allUsers = loadUsers();
    const user = allUsers.find(
      (u) => u.name.toLowerCase() === sanitizedName.toLowerCase() && u.active
    );
    if (!user) {
      setLoginError('User not found or account is disabled.');
      return false;
    }

    const passwordMatches = await bcrypt.compare(passcode, user.passcode);
    if (!passwordMatches) {
      attempts[attemptKey] = {
        count: (attempts[attemptKey]?.count || 0) + 1,
        lastAttempt: Date.now(),
      };
      saveFailedAttempts(attempts);

      const remaining = MAX_LOGIN_ATTEMPTS - attempts[attemptKey].count;
      if (remaining <= 0) {
        setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
        setLoginError(`Too many failed attempts. Account locked for 15 minutes.`);
      } else {
        setLoginError(`Incorrect password. ${remaining} attempt(s) remaining.`);
      }
      return false;
    }

    delete attempts[attemptKey];
    saveFailedAttempts(attempts);

    user.last_login = new Date().toISOString();
    saveUsers(allUsers);
    setCurrentUser(user);
    setUsers(allUsers);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setLoginError(null);
    setLockedUntil(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('app_unlocked');
  }, []);

  const createUser = useCallback(async (name: string, passcode: string, role: 'admin' | 'user', email?: string): Promise<boolean> => {
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email ? sanitizeInput(email) : undefined;

    if (!sanitizedName || sanitizedName.length < 2) return false;
    if (passcode.length < 4) return false;

    const currentUsers = loadUsers();
    if (currentUsers.some((u) => u.name.toLowerCase() === sanitizedName.toLowerCase())) return false;

    const hashed = await hashPassword(passcode);
    const newUser: AppUser = {
      id: crypto.randomUUID?.() || `${Date.now()}-${sanitizedName}`,
      name: sanitizedName,
      email: sanitizedEmail,
      role,
      passcode: hashed,
      active: true,
      created_at: new Date().toISOString(),
    };

    const updated = [...currentUsers, newUser];
    setUsers(updated);
    saveUsers(updated);
    return true;
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<AppUser>): Promise<boolean> => {
    // Protect seeded admin
    if (id === SEEDED_ADMIN_ID && updates.role && updates.role !== 'admin') return false;
    if (id === SEEDED_ADMIN_ID && updates.active === false) return false;

    const currentUsers = loadUsers();
    const idx = currentUsers.findIndex((u) => u.id === id);
    if (idx === -1) return false;

    const updated = [...currentUsers];
    updated[idx] = { ...updated[idx], ...updates };

    if (updates.passcode) {
      updated[idx].passcode = await hashPassword(updates.passcode);
    }

    if (updates.name) {
      updated[idx].name = sanitizeInput(updates.name);
    }
    if (updates.email) {
      updated[idx].email = sanitizeInput(updates.email);
    }

    setUsers(updated);
    saveUsers(updated);

    if (currentUser?.id === id) {
      setCurrentUser(updated[idx]);
    }
    return true;
  }, [currentUser]);

  const deleteUser = useCallback((id: string): boolean => {
    if (id === SEEDED_ADMIN_ID) return false;

    const currentUsers = loadUsers();
    if (currentUsers.length <= 1) return false;
    const updated = currentUsers.filter((u) => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
    if (currentUser?.id === id) logout();
    return true;
  }, [currentUser, logout]);

  const isAdmin = currentUser?.role === 'admin';
  const canManageUsers = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        loading,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
        isAdmin,
        canManageUsers,
        lockedUntil,
        loginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
