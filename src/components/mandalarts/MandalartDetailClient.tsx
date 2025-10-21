"use client";

import { MandalartDetail } from "@/types/mandalart";
import IdeaFrameworkInfo from "../shared/IdeaFrameworkInfo";
import MandalartGrid from "./MandalartGrid";

interface MandalartDetailClientProps {
  mandalartDetail: MandalartDetail;
  currentUserId: string;
}

export default function MandalartDetailClient({ mandalartDetail }: MandalartDetailClientProps) {
  const { inputs, ...mandalart } = mandalartDetail;

  const handleInputChange = async (
    sectionRowIndex: number,
    sectionColumnIndex: number,
    rowIndex: number,
    columnIndex: number,
    value: string
  ) => {
    try {
      await fetch("/api/mandalarts/inputs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mandalartId: mandalart.id,
          sectionRowIndex,
          sectionColumnIndex,
          rowIndex,
          columnIndex,
          content: value,
        }),
      });
    } catch (error) {
      console.error("マンダラート入力保存エラー:", error);
    }
  };

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={mandalart} />

      <div>
        <MandalartGrid
          themeName={mandalart.themeName}
          inputs={inputs}
          onInputChange={handleInputChange}
          readOnly={false}
        />
      </div>
    </div>
  );
}
