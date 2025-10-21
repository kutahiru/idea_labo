"use client";

import { OsbornChecklistDetail } from "@/types/osborn-checklist";
import { OsbornChecklistType } from "@/schemas/osborn-checklist";
import IdeaFrameworkInfo from "../shared/IdeaFrameworkInfo";
import OsbornChecklistGrid from "./OsbornChecklistGrid";

interface OsbornChecklistDetailClientProps {
  osbornChecklistDetail: OsbornChecklistDetail;
  currentUserId: string;
}

export default function OsbornChecklistDetailClient({
  osbornChecklistDetail,
}: OsbornChecklistDetailClientProps) {
  const { inputs, ...osbornChecklist } = osbornChecklistDetail;

  const handleInputChange = async (checklistType: OsbornChecklistType, value: string) => {
    try {
      await fetch("/api/osborn-checklists/inputs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          osbornChecklistId: osbornChecklist.id,
          checklistType,
          content: value,
        }),
      });
    } catch (error) {
      console.error("オズボーンのチェックリスト入力保存エラー:", error);
    }
  };

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={osbornChecklist} />

      <div>
        <OsbornChecklistGrid
          osbornChecklistId={osbornChecklist.id}
          inputs={inputs}
          onInputChange={handleInputChange}
          readOnly={false}
        />
      </div>
    </div>
  );
}
