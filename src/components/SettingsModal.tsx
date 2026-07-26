import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { X, Globe, DollarSign, Users, UserCog } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUserManagement?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenUserManagement }) => {
  const { language, currency, setLanguage, setCurrency, t } = useSettings();

  if (!isOpen) return null;

  const languages: Array<{ code: 'ar' | 'en' | 'fr'; label: string }> = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
  ];

  const currencies: Array<{ code: 'DZD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'CAD' | 'AUD' | 'CHF' | 'AED'; label: string }> = [
    { code: 'DZD', label: 'DA - ' + t('settings.dzd') },
    { code: 'USD', label: '$ - ' + t('settings.usd') },
    { code: 'EUR', label: '€ - ' + t('settings.eur') },
    { code: 'GBP', label: '£ - ' + t('settings.gbp') },
    { code: 'JPY', label: '¥ - ' + t('settings.jpy') },
    { code: 'CNY', label: '¥ - ' + t('settings.cny') },
    { code: 'CAD', label: 'C$ - ' + t('settings.cad') },
    { code: 'AUD', label: 'A$ - ' + t('settings.aud') },
    { code: 'CHF', label: 'CHF - ' + t('settings.chf') },
    { code: 'AED', label: 'د.إ - ' + t('settings.aed') },
  ];



  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">{t('settings.title')}</h2>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Language Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-zinc-400" />
                <label className="text-sm font-semibold text-zinc-300">
                  {t('settings.language')}
                </label>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full px-4 py-2.5 rounded text-sm font-semibold uppercase tracking-wider transition-all border ${
                      language === lang.code
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-zinc-400" />
                <label className="text-sm font-semibold text-zinc-300">
                  {t('settings.currency')}
                </label>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {currencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    className={`w-full px-4 py-2.5 rounded text-sm font-semibold uppercase tracking-wider transition-all border text-left ${
                      currency === curr.code
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                    }`}
                  >
                    {curr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User Management Section (admin only) */}
            {onOpenUserManagement && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <label className="text-sm font-semibold text-zinc-300">
                    User Accounts
                  </label>
                </div>
                <button
                  onClick={onOpenUserManagement}
                  className="w-full px-4 py-2.5 rounded text-sm font-semibold uppercase tracking-wider transition-all border bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 flex items-center justify-center gap-2"
                >
                  <UserCog className="w-4 h-4" />
                  Manage Users & Permissions
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 p-6 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded font-semibold uppercase tracking-wider transition-all"
            >
              {t('modal.cancel')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
