// src/components/ui/Button.tsx
import React from "react";
import { motion } from "framer-motion";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
};

export const Button: React.FC<Props> = ({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  type = "button",
  className = "",
}) => {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants: Record<Variant, string> = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600",
    secondary: "bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
    ghost: "bg-transparent text-neutral-300 hover:bg-neutral-800",
  };
  const sizes: Record<Size, string> = {
    sm: "px-2.5 py-1 text-[10px]",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
};
