// ボタンの共通コンポーネント

import { Plus } from "lucide-react";

interface CreateButtonProps {
  onClick: () => void;
  className?: string;
}

export function CreateButton({ onClick, className = "" }: CreateButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`menu-link group bg-primary inline-flex items-center rounded-md px-25 py-2 text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${className}`}
    >
      <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
      新規作成
    </button>
  );
}
