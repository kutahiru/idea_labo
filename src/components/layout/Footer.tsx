"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const [showFooterOnHome, setShowFooterOnHome] = useState(false);

  useEffect(() => {
    // トップページの場合、contentが表示されているかチェック
    if (pathname === "/") {
      const checkContentShown = () => {
        const contentShown = sessionStorage.getItem("homeContentShown");
        setShowFooterOnHome(contentShown === "true");
      };

      checkContentShown();

      // 100msごとにチェック（初回ローディング時のため）
      const interval = setInterval(checkContentShown, 100);

      return () => clearInterval(interval);
    } else {
      setShowFooterOnHome(true);
    }
  }, [pathname]);

  // トップページでコンテンツ未表示の場合はフッタを表示しない
  if (pathname === "/" && !showFooterOnHome) {
    return null;
  }

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
