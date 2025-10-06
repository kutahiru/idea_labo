import type { Metadata } from "next";
import { Geist, Geist_Mono, Zen_Kaku_Gothic_New, Lora } from "next/font/google";
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

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku-gothic-new",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const lora = Lora({
  variable: "--font-lora",
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
  const fontVariables = `${lora.variable} ${zenKakuGothicNew.variable} ${geistSans.variable} ${geistMono.variable}`;

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
