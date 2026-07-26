import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Currency, getTranslation, currencySymbols } from '../utils/i18n';

interface SettingsContextType {
  language: Language;
  currency: Currency;
  passcodeEnabled: boolean;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  isPasscodeEnabled: () => boolean;
  setPasscode: (passcode: string) => void;
  clearPasscode: () => void;
  changePasscode: (oldPasscode: string, newPasscode: string) => boolean;
  verifyPasscode: (passcode: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [currency, setCurrencyState] = useState<Currency>('DZD');

  // تحميل الإعدادات من localStorage
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('app_language') as Language;
      const savedCurrency = localStorage.getItem('app_currency') as Currency;

      if (savedLanguage && ['ar', 'en', 'fr'].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
      if (savedCurrency && ['DZD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'AED'].includes(savedCurrency)) {
        setCurrencyState(savedCurrency);
      }

      // تعيين اتجاه الصفحة حسب اللغة
      document.documentElement.lang = savedLanguage || 'ar';
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('app_currency', curr);
  };

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  const [passcodeEnabled, setPasscodeEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app_passcode');
    if (stored) setPasscodeEnabled(true);
  }, []);

  const isPasscodeEnabled = () => {
    return !!localStorage.getItem('app_passcode');
  };

  const setPasscode = (passcode: string) => {
    localStorage.setItem('app_passcode', btoa(passcode));
    setPasscodeEnabled(true);
  };

  const clearPasscode = () => {
    localStorage.removeItem('app_passcode');
    sessionStorage.removeItem('app_unlocked');
    setPasscodeEnabled(false);
  };

  const changePasscode = (oldPasscode: string, newPasscode: string): boolean => {
    const stored = localStorage.getItem('app_passcode');
    if (!stored || stored !== btoa(oldPasscode)) return false;
    localStorage.setItem('app_passcode', btoa(newPasscode));
    return true;
  };

  const verifyPasscode = (passcode: string): boolean => {
    const stored = localStorage.getItem('app_passcode');
    if (!stored) return true;
    return stored === btoa(passcode);
  };

  const formatCurrency = (amount: number): string => {
    const symbol = currencySymbols[currency];
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatted} ${symbol}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        currency,
        passcodeEnabled,
        setLanguage,
        setCurrency,
        t,
        formatCurrency,
        isPasscodeEnabled,
        setPasscode,
        clearPasscode,
        changePasscode,
        verifyPasscode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
