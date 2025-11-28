"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import MandalartGuideModal from "@/components/mandalarts/MandalartGuideModal";

export default function MandalartHelpButton() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      {/* 右下のヘルプボタン */}
      <button
        onClick={() => setIsGuideOpen(true)}
        className="bg-primary hover:bg-primary-hover fixed right-6 bottom-10 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110"
        aria-label="使い方を見る"
      >
        <HelpCircle className="h-7 w-7" />
      </button>

      {/* ガイドモーダル */}
      <MandalartGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}
