"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { GoogleLoginButton } from "@/components/shared/Button";

interface NavigationProps {
  isLoggedIn: boolean;
  closeMenu?: () => void;
}

function Navigation({ isLoggedIn, closeMenu }: NavigationProps) {
  const [isFrameworkOpen, setIsFrameworkOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFrameworkOpen(false);
      }
    };

    if (isFrameworkOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFrameworkOpen]);

  return (
    <div className="space-y-1 text-right md:flex md:items-center md:space-y-0 md:space-x-4 md:text-left">
      <Link
        href="/guide"
        className="font-lora header-link text-primary block rounded-md px-3 py-2 text-base font-medium md:text-sm md:transition-colors"
        onClick={closeMenu}
      >
        ガイド
      </Link>

      {/* フレームワークドロップダウン */}
      {isLoggedIn && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsFrameworkOpen(!isFrameworkOpen)}
            className="font-lora header-link text-primary flex w-full items-center justify-end gap-1 rounded-md px-3 py-2 text-base font-medium transition-all md:justify-start md:text-sm"
          >
            フレームワーク
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isFrameworkOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* デスクトップ用ドロップダウン */}
          <div
            className={`hidden md:block md:absolute md:left-0 md:top-full md:mt-1 md:w-56 md:origin-top md:transition-all md:duration-200 ${
              isFrameworkOpen
                ? "md:scale-100 md:opacity-100"
                : "md:pointer-events-none md:scale-95 md:opacity-0"
            }`}
          >
            <div className="rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="py-1">
                <Link
                  href="/brainwritings"
                  className="font-lora header-link text-primary block rounded-md px-3 py-2 text-base font-medium md:text-sm md:transition-colors"
                  onClick={() => {
                    setIsFrameworkOpen(false);
                    closeMenu?.();
                  }}
                >
                  ブレインライティング
                </Link>
                <Link
                  href="/mandalarts"
                  className="font-lora header-link text-primary block rounded-md px-3 py-2 text-base font-medium md:text-sm md:transition-colors"
                  onClick={() => {
                    setIsFrameworkOpen(false);
                    closeMenu?.();
                  }}
                >
                  マンダラート
                </Link>
                <Link
                  href="/osborn-checklists"
                  className="font-lora header-link text-primary block rounded-md px-3 py-2 text-base font-medium md:text-sm md:transition-colors"
                  onClick={() => {
                    setIsFrameworkOpen(false);
                    closeMenu?.();
                  }}
                >
                  オズボーンのチェックリスト
                </Link>
              </div>
            </div>
          </div>

          {/* モバイル用展開リスト */}
          {isFrameworkOpen && (
            <div className="mt-1 space-y-1 md:hidden">
              <Link
                href="/brainwritings"
                className="font-lora text-primary block rounded-md py-2 pl-6 pr-3 text-base font-medium transition-colors hover:bg-gray-100"
                onClick={() => {
                  setIsFrameworkOpen(false);
                  closeMenu?.();
                }}
              >
                ブレインライティング
              </Link>
              <Link
                href="/mandalarts"
                className="font-lora text-primary block rounded-md py-2 pl-6 pr-3 text-base font-medium transition-colors hover:bg-gray-100"
                onClick={() => {
                  setIsFrameworkOpen(false);
                  closeMenu?.();
                }}
              >
                マンダラート
              </Link>
              <Link
                href="/osborn-checklists"
                className="font-lora text-primary block rounded-md py-2 pl-6 pr-3 text-base font-medium transition-colors hover:bg-gray-100"
                onClick={() => {
                  setIsFrameworkOpen(false);
                  closeMenu?.();
                }}
              >
                オズボーンのチェックリスト
              </Link>
            </div>
          )}
        </div>
      )}

      {isLoggedIn ? (
        <>
          <Link
            href="/idea-categories"
            className="font-lora header-link text-primary block rounded-md px-3 py-2 text-base font-medium md:text-sm md:transition-colors"
            onClick={closeMenu}
          >
            アイデア一覧
          </Link>
          <Link
            href="/mypage"
            className="font-lora header-link text-primary block rounded-md px-3 py-2 text-base font-medium md:text-sm md:transition-colors"
            onClick={closeMenu}
          >
            マイページ
          </Link>
          <button
            className="font-lora header-link text-primary block w-full cursor-pointer rounded-md px-3 py-2 text-right text-base font-medium md:w-auto md:text-sm md:transition-colors"
            onClick={() => {
              signOut({ callbackUrl: "/" });
              closeMenu?.();
            }}
          >
            ログアウト
          </button>
        </>
      ) : (
        <GoogleLoginButton />
      )}
    </div>
  );
}

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isLoggedIn = Boolean(session);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHeaderOnHome, setShowHeaderOnHome] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    // トップページの場合、contentが表示されているかチェック
    if (pathname === "/") {
      const checkContentShown = () => {
        const contentShown = sessionStorage.getItem("homeContentShown");
        setShowHeaderOnHome(contentShown === "true");
      };

      checkContentShown();

      // 100msごとにチェック（初回ローディング時のため）
      const interval = setInterval(checkContentShown, 100);

      return () => clearInterval(interval);
    } else {
      setShowHeaderOnHome(true);
    }
  }, [pathname]);

  // トップページでコンテンツ未表示の場合はヘッダーを表示しない
  if (pathname === "/" && !showHeaderOnHome) {
    return null;
  }

  return (
    <header className="border-primary/20 relative z-50 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 左側：ロゴ */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="inline-block rounded-md px-2 py-1 transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo.png"
                alt="アイデア研究所"
                width={180}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* 右側：デスクトップナビゲーション */}
          <nav className="hidden md:block">
            <Navigation isLoggedIn={isLoggedIn} />
          </nav>

          {/* モバイル：ハンバーガーメニューボタン */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset md:hidden"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">メニューを開く</span>
            <Menu className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`} />
            <X className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`} />
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="border-t border-gray-200 bg-gray-50 px-2 pt-2 pb-3 sm:px-3">
            <Navigation isLoggedIn={isLoggedIn} closeMenu={closeMobileMenu} />
          </div>
        </div>
      )}
    </header>
  );
}
