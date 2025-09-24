import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブレインライティング | アイデア研究所",
  description: "複数人でのアイデア発想を支援するブレインライティング機能",
};

export default function BrainwritingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">ブレインライティング</h1>
      </div>
      <div className="container mx-auto px-4">{children}</div>
    </div>
  );
}
