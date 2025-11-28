"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-bold text-alert">エラー</h1>
      <h2 className="mt-6 text-3xl font-semibold text-foreground">問題が発生しました</h2>
      <p className="mt-3 text-center text-foreground/70">
        申し訳ございません。エラーが発生しました。
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-hover hover:shadow-xl"
      >
        <RefreshCw size={20} />
        再試行
      </button>
    </div>
  );
}
