"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import BrainwritingInfo from "./BrainwritingInfo";
import BrainwritingSheet from "./BrainwritingSheet";
import XPostButton from "./XPostButton";
import InviteLinkCopy from "./InviteLinkCopy";
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
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

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

      {/* X投稿ボタン（X投稿版） */}
      {brainwriting.usageScope === USAGE_SCOPE.XPOST && (
        <div className="mb-6 flex justify-center">
          <XPostButton buttonName="Xへ共有" onClick={handleXPost} />
        </div>
      )}

      {/* 招待リンクコピー（チーム利用版） */}
      {brainwriting.usageScope === USAGE_SCOPE.TEAM && (
        <InviteLinkCopy inviteToken={brainwriting.inviteToken} />
      )}

      {/* シート切り替えタブ（複数シートがある場合のみ表示） */}
      {sheets && sheets.length > 1 && (
        <div className="mb-6 flex justify-center gap-2">
          {sheets.map((sheet, index) => (
            <button
              key={sheet.id}
              onClick={() => setActiveSheetIndex(index)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeSheetIndex === index
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              シート {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* ブレインライティングシート */}
      {sheets && sheets[activeSheetIndex] && (() => {
        const sheet = sheets[activeSheetIndex];
        const sheetInputs = getInputsForSheet(sheet.id);
        const brainwritingRows = convertToRowData(sheetInputs, users);
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
      })()}
    </div>
  );
}
