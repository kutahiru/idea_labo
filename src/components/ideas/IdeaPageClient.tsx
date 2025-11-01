"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IdeaIndex from "./IdeaIndex";
import IdeaModal from "./IdeaModal";
import { IdeaListItem } from "@/types/idea";
import { AnimatePresence } from "framer-motion";
import { CreateButton } from "@/components/shared/Button";
import { useResourceDelete } from "@/hooks/useResourceSubmit";

interface IdeaPageClientProps {
  initialData: IdeaListItem[];
  categoryId: number;
}

export default function IdeaPageClient({ initialData, categoryId }: IdeaPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<IdeaListItem | null>(null);
  const router = useRouter();

  // 新規作成モーダルを開く
  const handleOpenCreateModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  // 編集モーダルを開く
  const handleOpenEditModal = (item: IdeaListItem) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
    router.refresh();
  };

  // アイデア削除
  const handleDelete = useResourceDelete({
    apiPath: "/api/ideas",
    resourceName: "アイデア",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-primary mb-6 text-center text-3xl font-bold">アイデア一覧</h1>

      {/* 新規作成ボタン */}
      <div className="mb-4 flex justify-center">
        <CreateButton onClick={handleOpenCreateModal} />
      </div>

      {/* アイデア一覧 */}
      <IdeaIndex initialData={initialData} onEdit={handleOpenEditModal} onDelete={handleDelete} />

      {/* モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <IdeaModal
            onClose={handleCloseModal}
            initialData={editingData || undefined}
            mode={editingData ? "edit" : "create"}
            fixedCategoryId={categoryId}
            showCategoryField={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
