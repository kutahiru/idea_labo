"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import BrainwritingInfo from "./BrainwritingInfo";
import BrainwritingSheet from "./BrainwritingSheet";
import XPostButton from "./XPostButton";
import { BrainwritingDetail } from "@/types/brainwriting";
import { USAGE_SCOPE, convertToRowData, handleBrainwritingDataChange } from "@/utils/brainwriting";
import { postBrainwritingToX } from "@/lib/x-post";

interface BrainwritingDetailClientProps {
  brainwritingDetail: BrainwritingDetail;
  currentUserId: string;
}

export default function BrainwritingDetailClient({
  brainwritingDetail,
  currentUserId,
}: BrainwritingDetailClientProps) {
  const { sheets, inputs, users, ...brainwriting } = brainwritingDetail;
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [currentInputs, setCurrentInputs] = useState(inputs);

  // シートIDに対応する入力データを取得する関数を定義
  const getInputsForSheet = (sheetId: number) => {
    return currentInputs?.filter(input => input.brainwriting_sheet_id === sheetId) || [];
  };

  const handleDataChange = async (
    rowIndex: number,
    ideaIndex: number,
    value: string,
    sheetId: number
  ) => {
    await handleBrainwritingDataChange(brainwriting.id, rowIndex, ideaIndex, value, sheetId);

    // stateを更新
    setCurrentInputs(prevInputs => {
      return prevInputs.map(input => {
        if (
          input.brainwriting_sheet_id === sheetId &&
          input.row_index === rowIndex &&
          input.column_index === ideaIndex
        ) {
          return { ...input, content: value || null };
        }
        return input;
      });
    });
  };

  // X投稿ボタンのクリックハンドラー
  const handleXPost = () => {
    // アイデアが未入力かチェック（contentがnullまたは空文字列）
    const hasEmptyInput = currentInputs.some(
      input => input.content === null || input.content.trim() === ""
    );

    if (hasEmptyInput) {
      toast.error("すべてのアイデアを入力してください");
      return;
    }

    // X投稿
    postBrainwritingToX(brainwriting);
  };

  return (
    <div>
      <BrainwritingInfo brainwriting={brainwriting} />

      {/* X投稿ボタン */}
      {brainwriting.usageScope === USAGE_SCOPE.XPOST && (
        <div className="mb-6 flex justify-center">
          <XPostButton buttonName="Xへ共有" onClick={handleXPost} />
        </div>
      )}

      {/* ブレインライティングシート */}
      {sheets?.map(sheet => {
        const sheetInputs = getInputsForSheet(sheet.id);
        const brainwritingRows = convertToRowData(sheetInputs, users); // inputsを行データ形式に変換する
        // current_user_idが自身と一致しない場合は読み取り専用
        const isAllReadOnly = sheet.current_user_id !== currentUserId;

        return (
          <BrainwritingSheet
            key={sheet.id}
            brainwritingRows={brainwritingRows}
            activeRowIndex={!isAllReadOnly && activeRowIndex >= 0 ? activeRowIndex : undefined}
            isAllReadOnly={isAllReadOnly}
            onDataChange={(rowIndex, ideaIndex, value) =>
              handleDataChange(rowIndex, ideaIndex, value, sheet.id)
            }
          />
        );
      })}
    </div>
  );
}
