// src/components/ui/LanguageSwitcher.tsx
import React from "react";
import { useSettings } from "../../contexts/SettingsContext";

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useSettings();

  const options: Array<{ code: "ar" | "en" | "fr"; label: string }> = [
    { code: "ar", label: "العربية" },
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
  ];

  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLanguage(opt.code)}
          className={`px-2 py-1 text-xs rounded-md font-medium transition-colors 
            ${language === opt.code ? "bg-emerald-500 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
