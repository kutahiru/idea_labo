import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <h2 className="mt-6 text-3xl font-semibold text-foreground">ページが見つかりません</h2>
      <p className="mt-3 text-center text-foreground/70">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-hover hover:shadow-xl"
      >
        <Home size={20} />
        ホームに戻る
      </Link>
    </div>
  );
}
