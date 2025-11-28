"use client";

import { useState } from "react";
import IdeaFrameworkInfo from "@/components/shared/IdeaFrameworkInfo";
import BrainwritingSheet from "./BrainwritingSheet";
import { BrainwritingDetail } from "@/types/brainwriting";
import { USAGE_SCOPE, convertToRowData, sortUsersByFirstRow } from "@/utils/brainwriting";

interface BrainwritingResultsClientProps {
  brainwritingDetail: BrainwritingDetail;
}

/**
 * ブレインライティング結果閲覧ページのクライアントコンポーネント
 *
 * 完了したブレインライティングの全シートを閲覧専用で表示します。
 * 複数シートがある場合はタブで切り替えが可能です。
 *
 * @param brainwritingDetail - ブレインライティングの詳細情報（シート、入力、ユーザー情報を含む）
 */
export default function BrainwritingResultsClient({
  brainwritingDetail,
}: BrainwritingResultsClientProps) {
  const { sheets, inputs, users, ...brainwriting } = brainwritingDetail;
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  // シートIDに対応する入力データを取得する関数を定義
  const getInputsForSheet = (sheetId: number) => {
    return inputs?.filter(input => input.brainwriting_sheet_id === sheetId) || [];
  };

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={brainwriting} />

      {/* シート切り替えタブ（複数シートがある場合のみ表示） */}
      {sheets && sheets.length > 1 && (
        <div className="mt-6 mb-6 flex justify-center gap-2">
          {sheets.map((sheet, index) => (
            <button
              key={sheet.id}
              onClick={() => setActiveSheetIndex(index)}
              className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeSheetIndex === index
                  ? "bg-primary text-white"
                  : "bg-border text-muted hover:bg-border"
              }`}
            >
              シート {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* ブレインライティングシート（閲覧専用） */}
      {sheets &&
        sheets[activeSheetIndex] &&
        (() => {
          const sheet = sheets[activeSheetIndex];
          const sheetInputs = getInputsForSheet(sheet.id);

          // チーム利用版の場合、シートのinputsの1行目のユーザーIDを先頭にusersの配列を変更
          const sortedUsers =
            brainwriting.usageScope === USAGE_SCOPE.TEAM
              ? sortUsersByFirstRow(sheetInputs, users)
              : users;

          const brainwritingRows = convertToRowData(sheetInputs, sortedUsers);

          return (
            <BrainwritingSheet
              key={sheet.id}
              brainwritingRows={brainwritingRows}
              activeRowIndex={undefined}
              isAllReadOnly={true}
              onDataChange={() => {}}
            />
          );
        })()}
    </div>
  );
}
