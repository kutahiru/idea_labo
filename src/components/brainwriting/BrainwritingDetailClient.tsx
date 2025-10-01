"use client";

import { useState } from "react";
import BrainwritingInfo from "./BrainwritingInfo";
import BrainwritingSheet from "./BrainwritingSheet";
import { BrainwritingDetail } from "@/types/brainwriting";
import { USAGE_SCOPE, convertToRowData, handleBrainwritingDataChange } from "@/utils/brainwriting";
import { postBrainwritingToX } from "@/lib/x-post";

interface BrainwritingDetailClientProps {
  brainwritingDetail: BrainwritingDetail;
}

export default function BrainwritingDetailClient({
  brainwritingDetail,
}: BrainwritingDetailClientProps) {
  const { sheets, inputs, users, ...brainwriting } = brainwritingDetail;
  const [activeRowIndex, setActiveRowIndex] = useState(0);

  // シートIDに対応する入力データを取得する関数を定義
  const getInputsForSheet = (sheetId: number) => {
    return inputs?.filter(input => input.brainwriting_sheet_id === sheetId) || [];
  };

  const handleDataChange = async (
    rowIndex: number,
    ideaIndex: number,
    value: string,
    sheetId: number
  ) => {
    await handleBrainwritingDataChange(brainwriting.id, rowIndex, ideaIndex, value, sheetId);
  };

  // X投稿ボタンのクリックハンドラー
  const handleXPost = () => {
    postBrainwritingToX(brainwriting, inputs);
  };

  return (
    <div>
      <BrainwritingInfo brainwriting={brainwriting} />

      {/* X投稿ボタン */}
      {brainwriting.usageScope === USAGE_SCOPE.XPOST && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleXPost}
            className="group bg-primary inline-flex items-center rounded-md px-20 py-2 text-base font-medium text-white transition-transform hover:scale-105"
          >
            Xへ投稿
          </button>
        </div>
      )}

      {/* ブレインライティングシート */}
      {sheets?.map(sheet => {
        const sheetInputs = getInputsForSheet(sheet.id);
        const brainwritingRows = convertToRowData(sheetInputs, users); // inputsを行データ形式に変換する

        return (
          <BrainwritingSheet
            key={sheet.id}
            brainwritingRows={brainwritingRows}
            activeRowIndex={activeRowIndex}
            isAllReadOnly={false}
            onDataChange={(rowIndex, ideaIndex, value) =>
              handleDataChange(rowIndex, ideaIndex, value, sheet.id)
            }
          />
        );
      })}
    </div>
  );
}
