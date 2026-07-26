// src/components/ui/FloatingLabelInput.tsx
import React, { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  showToggle?: boolean;
  error?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
};

export const FloatingLabelInput: React.FC<Props> = ({
  name,
  label,
  type = "text",
  placeholder,
  icon,
  showToggle = false,
  error,
  disabled = false,
  value,
  onChange,
  maxLength,
}) => {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const inputType = showToggle && visible ? "text" : type;

  return (
    <div className="relative mt-6">
      {icon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        id={id}
        name={name}
        type={inputType}
        placeholder={placeholder ?? label}
        className={`
          block w-full rounded-sm border bg-neutral-800 text-neutral-200 placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-accent-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed
          ${icon ? "pl-10" : "pl-3"} pr-10 py-3 text-sm
        `}
        disabled={disabled}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-${icon ? "10" : "3"} top-3 origin-left text-sm text-neutral-500 transition-all
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
          peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-accent-emerald-500
        `}
      >
        {label}
      </label>

      {showToggle && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-200"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
};
