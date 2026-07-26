// src/pages/Login.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { Button } from "../components/ui/Button";
import { FloatingLabelInput } from "../components/ui/FloatingLabelInput";
import { SocialButton } from "../components/ui/SocialButton";
import { LanguageSwitcher } from "../components/ui/LanguageSwitcher";
import { BackgroundOverlay } from "../components/ui/BackgroundOverlay";

export default function Login() {
  const { login, loginError, lockedUntil } = useAuth();
  const { t } = useSettings();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(username, password);
    // In a real app you would redirect on success
    setLoading(false);
    if (!success) {
      // error handled inside context (loginError)
    }
  };

  return (
    <>
      <BackgroundOverlay />
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="bg-gradient-to-r from-emerald-500 to-rose-500 p-1 rounded-xl max-w-lg w-full">
        <motion.div
          className="bg-neutral-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <header className="mb-8 text-center">
            <img src="/favicon.svg" alt="Algiers Prestige" className="mx-auto h-10 mb-4" />
            <h1 className="text-3xl font-display font-bold text-white">{t("login.title") || "Secure Login"}</h1>
            <p className="mt-2 text-sm text-neutral-400">{t("login.subtitle") || "Enter your credentials"}</p>
          </header>

          {/* Social login options */}
          <div className="space-y-3 mb-6">
            <SocialButton provider="google" />
            <SocialButton provider="microsoft" />
            <SocialButton provider="apple" />
          </div>

          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-neutral-700" />
            <span className="mx-2 text-xs text-neutral-500">{t("common.or") || "or"}</span>
            <div className="flex-1 h-px bg-neutral-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingLabelInput
              name="username"
              label={t("login.username") || "Username"}
              type="text"
              icon={<Mail size={18} className="text-neutral-400" />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FloatingLabelInput
              name="password"
              label={t("login.password") || "Password"}
              type="password"
              icon={<Lock size={18} className="text-neutral-400" />}
              showToggle
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 focus:ring-emerald-500"
                />
                {t("login.rememberMe") || "Remember Me"}
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-500 hover:underline"
              >
                {t("login.forgotPassword") || "Forgot Password?"}
              </Link>
            </div>
            {loginError && (
              <p className="text-sm text-rose-500" role="alert">
                {loginError}
              </p>
            )}
            <Button type="submit" variant="primary" disabled={loading} className="w-full py-2.5">
              {loading ? (
                <motion.span
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                />
              ) : (
                t("login.signIn") || "Sign In"
              )}
            </Button>
          </form>

          <footer className="mt-6 flex justify-between text-sm text-neutral-400">
            <LanguageSwitcher />
            <Link to="/register" className="underline hover:text-neutral-200">
              {t("login.noAccount") || "Create an account"}
            </Link>
          </footer>
        </motion.div>
      </div>
    </div>
    </>
  );
};
