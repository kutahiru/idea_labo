"use client";

import { useState } from "react";
import BrainwritingIndex from "./BrainwritingIndex";
import BrainwritingModal from "./BrainwritingModal";
import { BrainwritingListItem, BrainwritingFormData } from "@/types/brainwriting";

interface BrainwritingPageClientProps {
  initialData: BrainwritingListItem[];
}

export default function BrainwritingPageClient({ initialData }: BrainwritingPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateBrainwriting = async (data: BrainwritingFormData) => {
    // TODO: ブレインライティング作成のAPIコールを実装
    console.log("Creating brainwriting:", data);
    // 作成後は一覧を再読み込みする必要があるかもしれません
  };

  return (
    <div>
      <div className="flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
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
      <div className="mt-4">
        <BrainwritingIndex initialData={initialData} />
      </div>

      <BrainwritingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBrainwriting}
        mode="create"
      />
    </div>
  );
}
