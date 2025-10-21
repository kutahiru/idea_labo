// ボタンの共通コンポーネント

"use client";

import { Plus } from "lucide-react";
import { signIn } from "next-auth/react";

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

export function GoogleLoginButton() {
  return (
    <button
      className="font-lora menu-link bg-primary inline-block cursor-pointer rounded-md px-4 py-2 text-center text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl md:text-sm"
      onClick={() => signIn("google", { callbackUrl: "/auth/callback" })}
    >
      Google ログイン
    </button>
  );
}
