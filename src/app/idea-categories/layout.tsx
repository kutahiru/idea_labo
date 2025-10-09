import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "アイデアカテゴリ | アイデア研究所",
  description: "アイデアをカテゴリ別に管理",
};

export default function IdeaCategoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="container mx-auto px-4">{children}</div>;
}
