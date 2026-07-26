import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Key, DollarSign, Wallet } from 'lucide-react';
import { Button } from './ui/Button';
import { useFinancial } from '../contexts/FinancialContext';
import { useSettings } from '../contexts/SettingsContext';

export const CombinedModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { t } = useSettings();
  const { createGate, showToast } = useFinancial();

  const [gateName, setGateName] = useState('');
  const [gateCode, setGateCode] = useState('');
  const [gateCurrency, setGateCurrency] = useState('DZD');
  const [gateBalance, setGateBalance] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const gateCurrencies = ['DZD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'AED'];

  const handleCreateGate = async () => {
    if (!gateName.trim() || !gateCode.trim()) return;
    setSubmitting(true);
    const success = await createGate({
      name: gateName.trim(),
      code: gateCode.trim().toUpperCase(),
      initial_balance: parseFloat(gateBalance) || 0,
      currency: gateCurrency,
    });
    setSubmitting(false);
    if (success) {
      showToast(t('toast.gateCreated'), 'success');
      setGateName(''); setGateCode(''); setGateBalance('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const field = "w-full pl-9 pr-3 py-2.5 bg-zinc-900/80 border border-zinc-700/50 rounded-lg text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5";
  const iconWrapper = "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg overflow-hidden rounded-xl bg-gradient-to-b from-[#121212] to-[#0A0A0A] border border-zinc-800/80 shadow-2xl shadow-black/50 p-6"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase block">
                {t('modal.addGate')}
              </span>
              <span className="text-sm font-semibold text-zinc-300">
                {t('modal.gateSubtitle')}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className={label}>{t('modal.name')}</span>
              <div className="relative">
                <User className={`${iconWrapper} w-4 h-4 text-zinc-500`} />
                <input className={field} placeholder={t('modal.name')} value={gateName} onChange={e => setGateName(e.target.value)} />
              </div>
            </div>
            <div>
              <span className={label}>{t('modal.code')}</span>
              <div className="relative">
                <Key className={`${iconWrapper} w-4 h-4 text-zinc-500`} />
                <input className={field} placeholder={t('modal.code')} value={gateCode} onChange={e => setGateCode(e.target.value)} />
              </div>
            </div>
            <div>
              <span className={label}>Currency</span>
              <div className="relative">
                <DollarSign className={`${iconWrapper} w-4 h-4 text-zinc-500`} />
                <select className={field} value={gateCurrency} onChange={e => setGateCurrency(e.target.value)}>
                  {gateCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <span className={label}>{t('modal.initialBalance')}</span>
              <div className="relative">
                <Wallet className={`${iconWrapper} w-4 h-4 text-zinc-500`} />
                <input className={field} placeholder="0.00" value={gateBalance} onChange={e => setGateBalance(e.target.value)} type="number" />
              </div>
            </div>
            <Button variant="primary" onClick={handleCreateGate} disabled={submitting} className="w-full mt-2 py-3 text-xs uppercase font-bold tracking-widest shadow-lg shadow-emerald-500/20">
              <Save className="w-4 h-4 mr-2" /> {t('modal.save')}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
