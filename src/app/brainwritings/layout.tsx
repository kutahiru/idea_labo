"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import BrainwritingGuideModal from "@/components/brainwritings/BrainwritingGuideModal";

export default function BrainwritingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">ブレインライティング</h1>
      </div>
      <div className="container mx-auto px-4">{children}</div>

      {/* 右下のヘルプボタン */}
      <button
        onClick={() => setIsGuideOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary-hover hover:scale-110"
        aria-label="使い方を見る"
      >
        <HelpCircle className="h-7 w-7" />
      </button>

      {/* ガイドモーダル */}
      <BrainwritingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
