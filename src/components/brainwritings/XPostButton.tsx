"use client";

import { XIcon } from "@/components/layout/Icons";

interface XPostButtonProps {
  buttonName: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function XPostButton({ buttonName, onClick, disabled = false }: XPostButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-md px-6 py-2 text-white transition-all ${
        disabled
          ? "cursor-not-allowed bg-gray-400"
          : "bg-black hover:scale-105"
      }`}
    >
      <XIcon />
      {buttonName}
    </button>
  );
}
