"use client";
// アイデアカテゴリ一覧のクライアントコンポーネント

import { useState } from "react";
import { useRouter } from "next/navigation";
import IdeaCategoryIndex from "./IdeaCategoryIndex";
import IdeaCategoryModal from "./IdeaCategoryModal";
import { IdeaCategoryListItem } from "@/types/idea-category";
import { IdeaCategoryFormData } from "@/schemas/idea-category";
import { AnimatePresence } from "framer-motion";
import { CreateButton } from "@/components/shared/Button";
import { useResourceSubmit, useResourceDelete } from "@/hooks/useResourceSubmit";

interface IdeaCategoryPageClientProps {
  initialData: IdeaCategoryListItem[];
}

export default function IdeaCategoryPageClient({ initialData }: IdeaCategoryPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<IdeaCategoryListItem | null>(null);
  const router = useRouter();

  // 新規作成モーダルを開く
  const handleOpenCreateModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  // 編集モーダルを開く
  const handleOpenEditModal = (item: IdeaCategoryListItem) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  // アイデアカテゴリ作成・更新
  const handleSubmit = useResourceSubmit<IdeaCategoryFormData>({
    apiPath: "/api/idea-categories",
    resourceName: "アイデアカテゴリ",
    editingData,
    onSuccess: () => {
      router.refresh();
      handleCloseModal();
    },
  });

  // アイデアカテゴリ削除
  const handleDelete = useResourceDelete({
    apiPath: "/api/idea-categories",
    resourceName: "アイデアカテゴリ",
  });

  return (
    <div>
      {/* 新規作成ボタン */}
      <div className="flex justify-center">
        <CreateButton onClick={handleOpenCreateModal} />
      </div>

      {/* 一覧表示 */}
      <div className="mt-4">
        <IdeaCategoryIndex
          initialData={initialData}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>

      {/* モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <IdeaCategoryModal
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            initialData={editingData || undefined}
            mode={editingData ? "edit" : "create"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
