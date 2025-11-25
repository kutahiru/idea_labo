"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IdeaFrameworkIndex from "@/components/shared/IdeaFrameworkIndex";
import BrainwritingModal from "./BrainwritingModal";
import { BrainwritingListItem } from "@/types/brainwriting";
import { BrainwritingFormData } from "@/schemas/brainwriting";
import { AnimatePresence } from "framer-motion";
import { CreateButton } from "@/components/shared/Button";
import { useResourceSubmit, useResourceDelete } from "@/hooks/useResourceSubmit";
import { getUsageScopeLabel } from "@/utils/brainwriting";
import { IDEA_FRAMEWORK_TYPES, IDEA_FRAMEWORK_NAMES } from "@/schemas/idea-framework";

interface BrainwritingPageClientProps {
  initialData: BrainwritingListItem[];
}

/**
 * ブレインライティング一覧ページのクライアントコンポーネント
 *
 * ブレインライティングの一覧表示、新規作成、編集、削除機能を提供します。
 * モーダルを使用してブレインライティングの作成・編集を行い、
 * 一覧表示には共通のIdeaFrameworkIndexコンポーネントを利用します。
 *
 * @param initialData - サーバーから取得したブレインライティング一覧の初期データ
 */
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
    setEditingData(null);
    setIsModalOpen(false);
  };

  // ブレインライティング作成・更新
  const handleSubmit = useResourceSubmit<BrainwritingFormData>({
    apiPath: "/api/brainwritings",
    resourceName: IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.BRAINWRITING],
    editingData,
    onSuccess: (isEdit, result) => {
      if (isEdit) {
        router.refresh();
        handleCloseModal();
      } else {
        router.push(`/brainwritings/${(result as { id: number }).id}`);
      }
    },
  });

  // ブレインライティング削除
  const handleDelete = useResourceDelete({
    apiPath: "/api/brainwritings",
    resourceName: IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.BRAINWRITING],
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
          frameworkType={IDEA_FRAMEWORK_TYPES.BRAINWRITING}
          initialData={initialData}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          getUsageScopeLabel={item => getUsageScopeLabel(item.usageScope)}
        />
      </div>

      {/* モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <BrainwritingModal
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
