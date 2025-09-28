"use client";

import { useState } from "react";
import { BrainwritingListItem } from "@/types/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";
import BrainwritingInfo from "./BrainwritingInfo";
import BrainwritingSheet from "./BrainwritingSheet";

interface BrainwritingDetailClientProps {
  brainwriting: BrainwritingListItem;
  sheets?: Array<{
    id: number;
    brainwriting_id: number;
    current_user_id: string;
    lock_expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }>;
  inputs?: Array<{
    id: number;
    brainwriting_id: number;
    brainwriting_sheet_id: number;
    input_user_id: string;
    input_user_name: string | null;
    row_index: number;
    column_index: number;
    content: string | null;
    created_at: Date;
    updated_at: Date;
  }>;
}

export default function BrainwritingDetailClient({
  brainwriting,
  sheets,
  inputs,
}: BrainwritingDetailClientProps) {
  const [activeRowIndex, setActiveRowIndex] = useState(0);

  // シートIDに対応する入力データを取得する関数
  const getInputsForSheet = (sheetId: number) => {
    return inputs?.filter(input => input.brainwriting_sheet_id === sheetId) || [];
  };

  // 入力データを行データ形式に変換する関数
  const convertToRowData = (sheetInputs: typeof inputs) => {
    const rowsMap = new Map<number, { name: string; ideas: string[] }>();

    // 入力データがある場合は既存の処理
    sheetInputs?.forEach(input => {
      if (input.row_index >= 0 && input.column_index >= 0 && input.column_index < 3) {
        // 行が存在しない場合は新規作成
        if (!rowsMap.has(input.row_index)) {
          rowsMap.set(input.row_index, {
            name: input.input_user_name || "",
            ideas: ["", "", ""],
          });
        }

        const row = rowsMap.get(input.row_index)!;
        // アイデアを設定
        row.ideas[input.column_index] = input.content || "";
      }
    });

    // 6行全体を常に表示するため、不足している行を追加
    for (let i = 0; i < 6; i++) {
      if (!rowsMap.has(i)) {
        rowsMap.set(i, {
          name: `参加者${i + 1}`,
          ideas: ["", "", ""],
        });
      }
    }

    // Map を配列に変換（row_index順でソート）
    return Array.from(rowsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([_rowIndex, row]) => row);
  };

  const handleNextParticipant = () => {
    setActiveRowIndex(prev => (prev + 1) % 6);
  };

  const handleDataChange = async (
    participantIndex: number,
    ideaIndex: number,
    value: string,
    sheetId: number
  ) => {
    try {
      const response = await fetch(`/api/brainwriting/${brainwriting.id}/input`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brainwritingSheetId: sheetId,
          rowIndex: participantIndex,
          columnIndex: ideaIndex,
          content: value,
        }),
      });

      if (!response.ok) {
        throw new Error("保存に失敗しました");
      }

      // 保存成功 - リロードしない（楽観的UI更新により既にUIは更新済み）
      console.log(`保存成功: 参加者${participantIndex + 1}, アイデア${ideaIndex + 1}: ${value}`);
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました。再度お試しください。");
    }
  };

  return (
    <div>
      <BrainwritingInfo brainwriting={brainwriting} />

      {/* X投稿ボタン */}
      {brainwriting.usageScope === USAGE_SCOPE.XPOST && (
        <div className="mb-6 flex justify-center">
          <button className="group bg-primary inline-flex items-center rounded-md px-20 py-2 text-base font-medium text-white hover:scale-105">
            Xへ投稿
          </button>
        </div>
      )}

      {/* ブレインライティングシート */}
      {sheets?.map(sheet => {
        const sheetInputs = getInputsForSheet(sheet.id);
        const brainwritingRows = convertToRowData(sheetInputs);

        return (
          <BrainwritingSheet
            key={sheet.id}
            brainwritingRows={brainwritingRows}
            activeRowIndex={activeRowIndex}
            onDataChange={(participantIndex, ideaIndex, value) =>
              handleDataChange(participantIndex, ideaIndex, value, sheet.id)
            }
          />
        );
      })}
    </div>
  );
}
