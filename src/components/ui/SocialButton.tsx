// src/components/ui/SocialButton.tsx
import React from "react";
import { motion } from "framer-motion";

type Provider = "google" | "microsoft" | "apple";

type Props = {
  provider: Provider;
  onClick?: () => void;
  disabled?: boolean;
};

const icons: Record<Provider, React.ReactNode> = {
  google: (
    <svg viewBox="0 0 533.5 544.3" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M533.5 278.4c0-17.5-1.5-35-4.6-51.9H272v98.2h147.1c-6.4 34.9-25 64.5-53.4 84.3v70.1h86.3c50.5-46.5 78.3-115.2 78.3-200.7z" />
      <path fill="#34A853" d="M272 544.3c71.9 0 132.2-23.7 176.3-64.5l-86.3-70.1c-24 16.1-55 25.5-90 25.5-69.3 0-128-46.7-149.1-109.4H33.8v68.6c44.3 86.8 135.2 150.9 238.2 150.9z" />
      <path fill="#FBBC05" d="M122.9 326c-5.5-16.4-8.6-33.8-8.6-51.9s3.1-35.5 8.6-51.9v-68.6H33.8C12.1 190.9 0 239.6 0 274.1s12.1 83.2 33.8 118.5l89.1-66.6z" />
      <path fill="#EA4335" d="M272 107.7c39.2 0 74.5 13.5 102.4 39.9l76.8-76.8C419.9 27.7 357.6 0 272 0 169 0 78.1 64.1 33.8 151.5l89.1 68.6C144 154.7 202.7 107.7 272 107.7z" />
    </svg>
  ),
  microsoft: (
    <svg viewBox="0 0 23 23" className="w-5 h-5" aria-hidden="true">
      <path fill="#F35325" d="M1 1h10v10H1z" />
      <path fill="#81BC06" d="M12 1h10v10H12z" />
      <path fill="#05A6F0" d="M1 12h10v10H1z" />
      <path fill="#FFBA08" d="M12 12h10v10H12z" />
    </svg>
  ),
  apple: (
    <svg viewBox="0 0 14 17" className="w-5 h-5" aria-hidden="true">
      <path fill="#000" d="M13.4 12.2c-.2-1.5.8-2.4.9-2.5-1-.5-1.3-1.6-1.4-1.9-.7-2-2.2-2.2-2.7-2.2-1.1-.1-2.2.7-2.8.7-.5 0-1.4-.7-2.5-.7-1.3 0-2.5.7-3.2 1.8-1.3 2.2-1.3 5.6-.2 7.9.6 1.1 1.8 2.5 3.1 2.5 1.2 0 1.6-.8 3- .8 1.4 0 1.7.8 3.1.8 1.3 0 2.5-1.3 3-2.4-.1-.1-1.3-1.3-1.3-3.1zM10.8 1c.6.7.9 1.7 .9 2.6-.9.1-2-.6-2.6-1.3-.6-.7-.9-1.6-.9-2.5.9-.1 2 .6 2.6 1.2z" />
    </svg>
  ),
};

export const SocialButton: React.FC<Props> = ({ provider, onClick, disabled = false }) => {
  const bg = {
    google: "bg-white text-neutral-900 hover:bg-neutral-100",
    microsoft: "bg-neutral-800 text-neutral-100 hover:bg-neutral-700",
    apple: "bg-neutral-900 text-white hover:bg-neutral-800",
  }[provider];

  const label = {
    google: "Continue with Google",
    microsoft: "Continue with Microsoft",
    apple: "Continue with Apple",
  }[provider];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border ${bg} border-neutral-600 transition-colors disabled:opacity-60`}
    >
      {icons[provider]}
      <span className="font-medium text-sm">{label}</span>
    </motion.button>
  );
};
