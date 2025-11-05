"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import IdeaModal from "./IdeaModal";
import { AnimatePresence } from "framer-motion";
import { IdeaCategoryListItem } from "@/types/idea-category";
import toast from "react-hot-toast";

export default function CreateIdeaButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<IdeaCategoryListItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // カテゴリ一覧を取得（初回のみ）
  const fetchCategories = async () => {
    if (categories.length > 0) return; // 既に取得済みならスキップ

    setIsLoadingCategories(true);
    try {
      const response = await fetch("/api/idea-categories");

      if (!response.ok) {
        throw new Error("カテゴリの読み込みに失敗しました");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("カテゴリ取得エラー:", error);
      toast.error(
        error instanceof Error ? error.message : "カテゴリの読み込みに失敗しました"
      );
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleOpenModal = async () => {
    await fetchCategories(); // モーダルを開く前にカテゴリを取得
    setIsModalOpen(true);
  };

  return (
    <>
      {/* 右下のアイデア登録ボタン */}
      <button
        onClick={handleOpenModal}
        className="bg-primary hover:bg-primary-hover text-accent fixed right-6 bottom-28 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110"
        aria-label="アイデアを登録"
        disabled={isLoadingCategories}
      >
        <Lightbulb className="h-7 w-7" />
      </button>

      {/* アイデア登録モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <IdeaModal
            onClose={() => setIsModalOpen(false)}
            categories={categories}
            mode={"create"}
            showCategoryField={true}
          />
        )}
      </AnimatePresence>
    </>
  );
}
