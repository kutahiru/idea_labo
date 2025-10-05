
'use client';

import { useState } from 'react';
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

interface NavigationProps {
  isLoggedIn: boolean;
  closeMenu?: () => void;
}

function Navigation({ isLoggedIn, closeMenu }: NavigationProps) {
  return (
    <div className="space-y-1 text-right md:text-left md:space-y-0 md:flex md:items-center md:space-x-4">
      <Link
        href="/guide"
        className="header-link text-primary block px-3 py-2 rounded-md text-base font-medium md:text-sm md:transition-colors"
        onClick={closeMenu}
      >
        使い方
      </Link>

      {isLoggedIn ? (
        <>
          <Link
            href="/mypage"
            className="header-link text-primary block px-3 py-2 rounded-md text-base font-medium md:text-sm md:transition-colors"
            onClick={closeMenu}
          >
            マイページ
          </Link>
          <button
            className="header-link text-primary block w-full text-left px-3 py-2 rounded-md text-base font-medium md:w-auto md:text-sm md:transition-colors cursor-pointer"
            onClick={() => {
              signOut({ callbackUrl: '/' });
              closeMenu?.();
            }}
          >
            ログアウト
          </button>
        </>
      ) : (
        <button
          className="bg-primary text-white inline-block text-center px-4 py-2 rounded-md text-base font-medium transition-colors md:text-sm cursor-pointer hover:scale-105"
          onClick={() => signIn('google', { callbackUrl: '/' })}
        >
          Googleアカウントでログイン
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
    <header className="bg-white shadow-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側：タイトル */}
          <div className="flex-shrink-0">
            <Link href="/" className="header-link text-xl font-bold text-primary transition-colors px-2 py-1 rounded-md">
              アイデア研究所
            </Link>
          </div>

          {/* 右側：デスクトップナビゲーション */}
          <nav className="hidden md:block">
            <Navigation isLoggedIn={isLoggedIn} />
          </nav>

          {/* モバイル：ハンバーガーメニューボタン */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">メニューを開く</span>
            <svg
              className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 sm:px-3 bg-gray-50 border-t border-gray-200">
            <Navigation
              isLoggedIn={isLoggedIn}
              closeMenu={closeMobileMenu}
            />
          </div>
        </div>
      )}
    </header>
  );
}
