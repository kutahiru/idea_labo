"use client";

import { XIcon } from "@/components/layout/Icons";

interface XPostButtonProps {
  buttonName: string;
  onClick: () => void;
}

export default function XPostButton({ buttonName, onClick }: XPostButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-md bg-black px-6 py-2 text-white transition-transform hover:scale-105"
    >
      <XIcon />
      {buttonName}
    </button>
  );
}
