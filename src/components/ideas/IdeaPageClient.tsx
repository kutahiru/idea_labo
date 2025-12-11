"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IdeaIndex from "./IdeaIndex";
import IdeaModal from "./IdeaModal";
import { IdeaListItem } from "@/types/idea";
import { AnimatePresence } from "framer-motion";
import { CreateButton } from "@/components/shared/Button";
import { useResourceSubmit, useResourceDelete } from "@/hooks/useResourceSubmit";
import { IdeaFormData } from "@/schemas/idea";

interface IdeaPageClientProps {
  initialData: IdeaListItem[];
  categoryId: number;
  categoryName: string;
}

/**
 * 特定カテゴリのアイデア一覧ページのクライアントコンポーネント
 *
 * 指定されたカテゴリに属するアイデアの一覧表示、新規作成、編集、削除機能を提供します。
 * モーダルを使用してアイデアの作成・編集を行い、カテゴリIDは固定されているため
 * カテゴリ選択フィールドは表示されません。
 * 一覧表示には検索、ソート、無限スクロール機能を持つIdeaIndexコンポーネントを利用します。
 *
 * @param initialData - サーバーから取得したアイデア一覧の初期データ
 * @param categoryId - 固定されたカテゴリID（新規作成時に自動設定される）
 */
export default function IdeaPageClient({
  initialData,
  categoryId,
  categoryName,
}: IdeaPageClientProps) {
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
  };

  // アイデア作成・更新
  const handleSubmit = useResourceSubmit<IdeaFormData & { categoryId: number }>({
    apiPath: "/api/ideas",
    resourceName: "アイデア",
    editingData: editingData,
    onSuccess: () => {
      router.refresh();
      handleCloseModal();
    },
  });

  // アイデア削除
  const handleDelete = useResourceDelete({
    apiPath: "/api/ideas",
    resourceName: "アイデア",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-primary mb-4 text-center text-3xl font-bold">アイデア一覧</h1>
      <p className="text-primary mb-4 text-center text-3xl font-bold">{categoryName}</p>

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
            onSubmit={handleSubmit}
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
