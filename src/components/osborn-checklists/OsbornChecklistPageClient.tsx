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

export default function OsbornChecklistPageClient({ initialData }: OsbornChecklistPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<OsbornChecklistListItem | null>(null);
  const router = useRouter();

  const handleOpenCreateModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: OsbornChecklistListItem) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingData(null);
    setIsModalOpen(false);
  };

  const handleSubmit = useResourceSubmit<OsbornChecklistFormData>({
    apiPath: "/api/osborn-checklists",
    resourceName: IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.OSBORN_CHECKLIST],
    editingData,
    onSuccess: (isEdit, result) => {
      if (isEdit) {
        router.refresh();
        handleCloseModal();
      } else {
        const resultWithId = result as { id: number };
        router.push("/osborn-checklists/" + resultWithId.id.toString());
      }
    },
  });

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
