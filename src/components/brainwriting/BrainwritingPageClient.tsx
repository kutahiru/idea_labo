"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrainwritingIndex from "./BrainwritingIndex";
import BrainwritingModal from "./BrainwritingModal";
import { BrainwritingListItem, BrainwritingFormData } from "@/types/brainwriting";
import toast from "react-hot-toast";

interface BrainwritingPageClientProps {
  initialData: BrainwritingListItem[];
}

export default function BrainwritingPageClient({ initialData }: BrainwritingPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<BrainwritingListItem | null>(null);
  const router = useRouter();

  // 新規作成モーダルを開く
  const handleOpenCreateModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  // 編集モーダルを開く
  const handleOpenEditModal = (item: BrainwritingListItem) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  // ブレインライティング作成・更新
  const handleSubmit = async (data: BrainwritingFormData) => {
    try {
      const url = editingData ? `/api/brainwriting/${editingData.id}` : "/api/brainwriting";
      const method = editingData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `${editingData ? "更新" : "作成"}に失敗しました`);
      }

      const result = await response.json();

      // 成功メッセージを表示
      toast.success(`ブレインライティングが${editingData ? "更新" : "作成"}されました`);

      // 新規作成時は詳細ページに遷移、編集時は一覧を更新
      if (editingData) {
        router.refresh();
      } else {
        router.push(`/brainwriting/${result.id}`);
      }
    } catch (error) {
      console.error(`ブレインライティング${editingData ? "更新" : "作成"}エラー:`, error);
      toast.error(
        `エラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`
      );
    }
  };

  // ブレインライティング削除
  const handleDelete = async (item: BrainwritingListItem) => {
    if (!confirm("本当に削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/brainwriting/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "削除に失敗しました");
      }

      // 成功時は一覧を更新
      router.refresh();

      // 成功メッセージを表示
      toast.success("ブレインライティングが削除されました");
    } catch (error) {
      console.error("ブレインライティング削除エラー:", error);
      toast.error(
        `エラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`
      );
    }
  };

  return (
    <div>
      {/* 新規作成ボタン */}
      <div className="flex justify-center">
        <button
          onClick={handleOpenCreateModal}
          className="group bg-primary inline-flex items-center rounded-md px-25 py-2 text-base font-medium text-white hover:scale-105"
        >
          <svg
            className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規作成
        </button>
      </div>

      {/* 一覧表示 */}
      <div className="mt-4">
        <BrainwritingIndex
          initialData={initialData}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>

      {/* モーダル */}
      <BrainwritingModal
        key={editingData?.id || "create"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingData || undefined}
        mode={editingData ? "edit" : "create"}
      />
    </div>
  );
}
