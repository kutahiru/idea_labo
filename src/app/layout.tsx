import type { Metadata } from "next";
import { Geist, Geist_Mono, Zen_Kaku_Gothic_New, Lora, WDXL_Lubrifont_JP_N } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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

const wdxlLubrifontJpN = WDXL_Lubrifont_JP_N({
  variable: "--font-wdxl-lubrifont",
  subsets: ["latin"],
  weight: ["400"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "アイデア研究所",
  description: "アイデア発想・管理アプリケーション",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "アイデア研究所",
    description: "発想を抽出しアイデアを結晶化する - ブレインライティング、マンダラート、オズボーンのチェックリストでアイデアを創出",
    images: [
      {
        url: "/top-ogp.png",
        width: 1200,
        height: 630,
        alt: "アイデア研究所",
      },
    ],
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "アイデア研究所",
    description: "発想を抽出しアイデアを結晶化する",
    images: ["/top-ogp.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // フォント変数を結合（loraとwdxlは明示的に指定する箇所でのみ使用）
  const fontVariables = `${zenKakuGothicNew.variable} ${geistSans.variable} ${geistMono.variable} ${lora.variable} ${wdxlLubrifontJpN.variable}`;

  return (
    <html lang="ja">
      <body className={`${fontVariables} antialiased`}>
        <SessionProvider session={session}>
          <Header />
          <main>{children}</main>
          <Footer />
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
