"use client";

import {
  OSBORN_CHECKLIST_TYPES,
  OSBORN_CHECKLIST_NAMES,
  OsbornChecklistType,
} from "@/schemas/osborn-checklist";
import { OsbornChecklistInputData } from "@/types/osborn-checklist";
import OsbornChecklistCell from "./OsbornChecklistCell";

interface OsbornChecklistGridProps {
  osbornChecklistId: number;
  inputs: OsbornChecklistInputData[];
  onInputChange: (checklistType: OsbornChecklistType, value: string) => void;
  readOnly?: boolean;
}

export default function OsbornChecklistGrid({
  inputs,
  onInputChange,
  readOnly = false,
}: OsbornChecklistGridProps) {
  // チェックリストのタイプ一覧（9つの視点）
  const checklistTypes = Object.values(OSBORN_CHECKLIST_TYPES);

  // 入力データをchecklistTypeでマッピング
  const inputMap = inputs.reduce(
    (acc, input) => {
      acc[input.checklist_type] = input.content || "";
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <div className="mx-auto max-w-4xl">
      {/* チェックリスト項目 */}
      <div className="space-y-6">
        {checklistTypes.map((type, index) => (
          <OsbornChecklistCell
            key={type}
            value={inputMap[type] || ""}
            readOnly={readOnly}
            onChange={value => onInputChange(type, value)}
            index={index}
            title={OSBORN_CHECKLIST_NAMES[type]}
          />
        ))}
      </div>
    </div>
  );
}
