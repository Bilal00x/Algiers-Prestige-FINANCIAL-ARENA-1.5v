// src/components/ui/MoneyAdjuster.tsx
import React, { useState } from "react";
import { useFinancial } from "../../contexts/FinancialContext";
import { useSettings } from "../../contexts/SettingsContext";
import { Button } from "./Button";

/**
 * Simple widget to quickly increase or decrease funds.
 * It creates a deposit or withdrawal transaction for the first available gate.
 */
export const MoneyAdjuster: React.FC = () => {
  const { t } = useSettings();
  const { gates, createTransaction, showToast } = useFinancial();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (type: "deposit" | "withdrawal") => {
    if (!amount) return;
    const numeric = parseFloat(amount);
    if (isNaN(numeric) || numeric <= 0) return;
    if (gates.length === 0) {
      showToast("No gate available to apply transaction.", "error");
      return;
    }
    setLoading(true);
    const success = await createTransaction({
      gate_id: gates[0].id,
      recipient: "Quick Adjust",
      amount: type === "withdrawal" ? -Math.abs(numeric) : Math.abs(numeric),
      type,
      status: "Accepted",
      comments: "Adjusted via quick widget",
      verified: true,
    });
    setLoading(false);
    if (success) {
      setAmount("");
      showToast(`تم ${type === "deposit" ? t('moneyAdjuster.increase') : t('moneyAdjuster.decrease')} مبلغ ${numeric} بنجاح.`, "success");
    }
  };

  return (
    <div className="bg-[#0F0F0F] border border-zinc-800 rounded-lg p-5 mb-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">{t('moneyAdjuster.title')}</h3>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          placeholder={t('moneyAdjuster.placeholder')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
        />
        <Button
          variant="primary"
          onClick={() => handleAction("deposit")}
          disabled={loading}
        >
{t('moneyAdjuster.increase')}
        </Button>
        <Button
          variant="danger"
          onClick={() => handleAction("withdrawal")}
          disabled={loading}
        >
          {t('moneyAdjuster.decrease')}
        </Button>
      </div>
    </div>
  );
};
