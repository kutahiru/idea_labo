"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OsbornChecklistListItem } from "@/types/osborn-checklist";
import { OsbornChecklistFormData } from "@/schemas/osborn-checklist";
import { CreateButton } from "@/components/shared/Button";
import { useResourceDelete, useResourceSubmit } from "@/hooks/useResourceSubmit";
import IdeaFrameworkIndex from "@/components/shared/IdeaFrameworkIndex";
import OsbornChecklistModal from "./OsbornChecklistModal";
import { AnimatePresence } from "framer-motion";
import { IDEA_FRAMEWORK_TYPES, IDEA_FRAMEWORK_NAMES } from "@/schemas/idea-framework";

interface OsbornChecklistPageClientProps {
  initialData: OsbornChecklistListItem[];
}

/**
 * オズボーンのチェックリスト一覧ページのクライアントコンポーネント
 * チェックリストの作成・編集・削除を管理し、一覧表示とモーダルの開閉を制御する
 * @param props.initialData - 初期表示するオズボーンのチェックリスト一覧データ
 */
export default function OsbornChecklistPageClient({ initialData }: OsbornChecklistPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<OsbornChecklistListItem | null>(null);
  const router = useRouter();

  // 新規作成モーダルを開く
  const handleOpenCreateModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  // 編集モーダルを開く
  const handleOpenEditModal = (item: OsbornChecklistListItem) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  // 削除モーダルを開く
  const handleCloseModal = () => {
    setEditingData(null);
    setIsModalOpen(false);
  };

  // 確定処理
  const handleSubmit = useResourceSubmit<OsbornChecklistFormData>({
    apiPath: "/api/osborn-checklists",
    resourceName: IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.OSBORN_CHECKLIST],
    editingData,
    onSuccess: (isEdit, result) => {
      if (isEdit) {
        // 編集時はモーダルを閉じて更新
        router.refresh();
        handleCloseModal();
      } else {
        // 新規作成時は詳細画面に遷移
        const resultWithId = result as { id: number };
        router.push("/osborn-checklists/" + resultWithId.id.toString());
      }
    },
  });

  // 削除処理
  const handleDelete = useResourceDelete({
    apiPath: "/api/osborn-checklists",
    resourceName: IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.OSBORN_CHECKLIST],
  });

  return (
    <div>
      <div className="flex justify-center">
        <CreateButton onClick={handleOpenCreateModal} />
      </div>

      <div className="mt-4">
        <IdeaFrameworkIndex
          frameworkType={IDEA_FRAMEWORK_TYPES.OSBORN_CHECKLIST}
          initialData={initialData}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <OsbornChecklistModal
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
