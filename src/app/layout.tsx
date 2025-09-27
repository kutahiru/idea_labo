import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/app/lib/auth";
import ToastProvider from "@/components/shared/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "アイデア研究所",
  description: "アイデア発想・管理アプリケーション",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // フォント変数を優先順位順に結合
  const fontVariables = `${notoSansJP.variable} ${geistSans.variable} ${geistMono.variable}`;

  return (
    <html lang="ja">
      <body className={`${fontVariables} antialiased`}>
        <SessionProvider session={session}>
          <Header />
          <main>{children}</main>
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
