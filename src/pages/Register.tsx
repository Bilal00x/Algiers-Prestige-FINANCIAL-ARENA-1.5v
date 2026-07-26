// src/pages/Register.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Lock, User, Briefcase, Check } from "lucide-react";
import { Button } from "../components/ui/Button";
import { FloatingLabelInput } from "../components/ui/FloatingLabelInput";
import { SocialButton } from "../components/ui/SocialButton";
import { LanguageSwitcher } from "../components/ui/LanguageSwitcher";
import { BackgroundOverlay } from "../components/ui/BackgroundOverlay";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";

// Simple password strength estimator (0-4)
const getPasswordStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthColors = ["bg-rose-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];
const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

export default function Register() {
  const { t } = useSettings();
  const { createUser } = useAuth();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    taxId: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "password") {
      setPasswordScore(getPasswordStrength(value));
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!accountType) newErrors.accountType = t("error.selectAccount");
    } else if (step === 1) {
      if (!formData.name) newErrors.name = t("error.required");
      if (!formData.email) newErrors.email = t("error.required");
      if (accountType === "business") {
        if (!formData.company) newErrors.company = t("error.required");
        if (!formData.taxId) newErrors.taxId = t("error.required");
      }
    } else if (step === 2) {
      if (formData.password.length < 8) newErrors.password = t("error.passwordWeak");
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t("error.passwordMismatch");
    } else if (step === 3) {
      if (!formData.acceptTerms) newErrors.acceptTerms = t("error.acceptTerms");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step === 3) {
      // final submit
      setLoading(true);
      const success = await createUser(
        formData.name,
        formData.password,
        accountType === "business" ? "admin" : "user",
        formData.email
      );
      setLoading(false);
      if (success) setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => setStep(step - 1);

  // UI for each step
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">{t("register.selectAccountType")}</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAccountType("individual")}
                className={`py-4 px-3 rounded-md border text-center transition-all ${
                  accountType === "individual"
                    ? "bg-emerald-500 text-white border-transparent"
                    : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                }`}
              >
                <User className="inline-block mr-2" /> {t("register.individual")}
              </button>
              <button
                type="button"
                onClick={() => setAccountType("business")}
                className={`py-4 px-3 rounded-md border text-center transition-all ${
                  accountType === "business"
                    ? "bg-emerald-500 text-white border-transparent"
                    : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                }`}
              >
                <Briefcase className="inline-block mr-2" /> {t("register.business")}
              </button>
            </div>
            {errors.accountType && <p className="text-sm text-rose-500">{errors.accountType}</p>}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <FloatingLabelInput
              name="name"
              label={t("register.fullName")}
              type="text"
              icon={<User size={18} className="text-neutral-400" />}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            <FloatingLabelInput
              name="email"
              label={t("register.email")}
              type="email"
              icon={<Mail size={18} className="text-neutral-400" />}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            {accountType === "business" && (
              <>
                <FloatingLabelInput
                  name="company"
                  label={t("register.companyName")}
                  type="text"
                  icon={<Briefcase size={18} className="text-neutral-400" />}
                  value={formData.company}
                  onChange={handleChange}
                  error={errors.company}
                />
                <FloatingLabelInput
                  name="taxId"
                  label={t("register.taxId")}
                  type="text"
                  icon={<Check size={18} className="text-neutral-400" />}
                  value={formData.taxId}
                  onChange={handleChange}
                  error={errors.taxId}
                />
              </>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <FloatingLabelInput
              name="password"
              label={t("register.password")}
              type="password"
              icon={<Lock size={18} className="text-neutral-400" />}
              showToggle
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className={`h-2 flex-1 rounded ${strengthColors[passwordScore]}`} />
                <span className="text-xs text-neutral-400">{strengthLabels[passwordScore]}</span>
              </div>
            </div>
            <FloatingLabelInput
              name="confirmPassword"
              label={t("register.confirmPassword")}
              type="password"
              icon={<Lock size={18} className="text-neutral-400" />}
              showToggle
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-800 focus:ring-emerald-500"
              />
              <label className="text-sm text-neutral-400">
                {t("register.acceptTerms")} <Link to="/terms" className="underline hover:text-neutral-200">{t("register.terms")}</Link> &amp; <Link to="/privacy" className="underline hover:text-neutral-200">{t("register.privacy")}</Link>
              </label>
            </div>
            {errors.acceptTerms && <p className="text-sm text-rose-500">{errors.acceptTerms}</p>}
          </div>
        );
      case 4:
        return (
          <div className="text-center py-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <motion.svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-emerald-500"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">{t("register.welcome")}</h2>
            <p className="text-neutral-400">{t("register.checkInbox")}</p>
            <Link
              to="/"
              className="mt-6 inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded"
            >
              {t("register.goToDashboard")}
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  // Progress indicator (simple step circles)
  const steps = [t("register.account"), t("register.details"), t("register.security"), t("register.terms"), t("register.success")];

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
            <h1 className="text-3xl font-display font-bold text-white">{t("register.title")}</h1>
            <p className="mt-2 text-sm text-neutral-400">{t("register.subtitle")}</p>
          </header>

          {/* Social register (optional) */}
          <div className="space-y-3 mb-6">
            <SocialButton provider="google" />
            <SocialButton provider="microsoft" />
            <SocialButton provider="apple" />
          </div>

          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-neutral-700" />
            <span className="mx-2 text-xs text-neutral-500">{t("common.or")}</span>
            <div className="flex-1 h-px bg-neutral-700" />
          </div>

          {/* Progress */}
          <div className="flex justify-center mb-6">
            {steps.map((label, idx) => (
              <div key={idx} className="flex flex-col items-center mx-1">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${idx <= step ? "bg-emerald-500 text-white" : "bg-neutral-700 text-neutral-300"}`}>{idx + 1}</div>
                <span className={`mt-1 text-xs ${idx <= step ? "text-white" : "text-neutral-500"}`}>{label}</span>
              </div>
            ))}
          </div>

          {renderStep()}

          {step < 4 && (
            <div className="mt-6 flex justify-between">
              {step > 0 && (
                <Button variant="secondary" onClick={handleBack} className="px-4 py-2">
                  {t("common.back")}
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={loading}
                className="px-4 py-2 ml-auto"
              >
                {loading ? (
                  <motion.span
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                  />
                ) : step === 3 ? t("register.finish") : t("common.next")}
              </Button>
            </div>
          )}

          <footer className="mt-6 flex justify-between text-sm text-neutral-400">
            <LanguageSwitcher />
            <Link to="/login" className="underline hover:text-neutral-200">
              {t("login.alreadyAccount") || "Back to login"}
            </Link>
          </footer>
        </motion.div>
      </div>
    </div>
    </>
  );
}
