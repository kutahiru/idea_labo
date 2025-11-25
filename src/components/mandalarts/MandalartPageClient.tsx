"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MandalartListItem } from "@/types/mandalart";
import { MandalartFormData } from "@/schemas/mandalart";
import { CreateButton } from "@/components/shared/Button";
import { useResourceDelete, useResourceSubmit } from "@/hooks/useResourceSubmit";
import IdeaFrameworkIndex from "@/components/shared/IdeaFrameworkIndex";
import MandalartModal from "./MandalartModal";
import { AnimatePresence } from "framer-motion";
import { IDEA_FRAMEWORK_TYPES, IDEA_FRAMEWORK_NAMES } from "@/schemas/idea-framework";

interface MandalartPageClientProps {
  initialData: MandalartListItem[];
}

/**
 * マンダラート一覧ページのクライアントコンポーネント
 *
 * マンダラートの一覧表示、新規作成、編集、削除機能を提供します。
 * モーダルを使用してマンダラートの作成・編集を行い、
 * 一覧表示には共通のIdeaFrameworkIndexコンポーネントを利用します。
 *
 * @param initialData - サーバーから取得したマンダラート一覧の初期データ
 */
export default function MandalartPageClient({ initialData }: MandalartPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<MandalartListItem | null>(null);
  const router = useRouter();

  const handleOpenCreateModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MandalartListItem) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingData(null);
    setIsModalOpen(false);
  };

  /** マンダラート作成・更新 */
  const handleSubmit = useResourceSubmit<MandalartFormData>({
    apiPath: "api/mandalarts",
    resourceName: IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.MANDALART],
    editingData,
    onSuccess: (isEdit, result) => {
      if (isEdit) {
        router.refresh();
        handleCloseModal();
      } else {
        router.push(`/mandalarts/${(result as { id: number }).id}`);
      }
    },
  });

  /** マンダラート削除 */
  const handleDelete = useResourceDelete({
    apiPath: "/api/mandalarts",
    resourceName: IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.MANDALART],
  });

  return (
    <div>
      {/* 新規作成ボタン */}
      <div className="flex justify-center">
        <CreateButton onClick={handleOpenCreateModal} />
      </div>

      {/* 一覧表示 */}
      <div className="mt-4">
        <IdeaFrameworkIndex
          frameworkType={IDEA_FRAMEWORK_TYPES.MANDALART}
          initialData={initialData}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>

      {/* モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <MandalartModal
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
