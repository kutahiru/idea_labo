import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-primary/20 border-t bg-white py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          {/* コピーライト */}
          <div className="text-center">
            <p className="text-xs text-gray-500">&copy; {currentYear} アイデア研究所</p>
          </div>

          {/* リンク */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:gap-6 md:text-sm">
            <Link
              href="/privacy-policy"
              className="hover:text-primary text-gray-600 transition-colors hover:underline"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-primary text-gray-600 transition-colors hover:underline"
            >
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
