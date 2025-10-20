"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  isLoggedIn: boolean;
  closeMenu?: () => void;
}

function Navigation({ isLoggedIn, closeMenu }: NavigationProps) {
  return (
    <div className="space-y-1 text-right md:flex md:items-center md:space-y-0 md:space-x-4 md:text-left">
      <Link
        href="/guide"
        className="font-lora header-link text-primary block rounded-md px-3 py-2 text-base font-medium md:text-sm md:transition-colors"
        onClick={closeMenu}
      >
        ガイド
      </Link>

      {isLoggedIn ? (
        <>
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
        <button
          className="font-lora bg-primary inline-block cursor-pointer rounded-md px-4 py-2 text-center text-base font-medium text-white transition-colors hover:scale-105 md:text-sm"
          onClick={() => signIn("google", { callbackUrl: "/auth/callback" })}
        >
          Google ログイン
        </button>
      )}
    </div>
  );
}

export default function Header() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="border-primary/20 border-b bg-white shadow-sm">
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
