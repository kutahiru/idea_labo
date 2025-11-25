"use client";

import {
  OSBORN_CHECKLIST_TYPES,
  OSBORN_CHECKLIST_NAMES,
  OSBORN_CHECKLIST_DESCRIPTIONS,
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

/**
 * オズボーンのチェックリスト全体を表示するグリッドコンポーネント
 *
 * 9つの視点（転用、応用、変更、拡大、縮小、代用、置換、逆転、結合）から
 * アイデアを発想するためのチェックリストを表示します。
 * 各視点はOsbornChecklistCellコンポーネントで構成され、縦に並びます。
 *
 * @param osbornChecklistId - オズボーンのチェックリストID
 * @param inputs - 各チェックリスト項目の入力データ配列
 * @param onInputChange - チェックリスト項目の値変更時のコールバック関数
 * @param readOnly - 読み取り専用モード（結果閲覧時など）
 */
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
            description={OSBORN_CHECKLIST_DESCRIPTIONS[type]}
          />
        ))}
      </div>
    </div>
  );
}
