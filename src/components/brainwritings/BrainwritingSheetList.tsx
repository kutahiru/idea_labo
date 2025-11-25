"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BrainwritingSheetData,
  BrainwritingInputData,
  BrainwritingUserData,
} from "@/types/brainwriting";
import BrainwritingSheet from "./BrainwritingSheet";
import { convertToRowData, sortUsersByFirstRow } from "@/utils/brainwriting";

interface BrainwritingSheetListProps {
  sheets: BrainwritingSheetData[];
  inputs: BrainwritingInputData[];
  users: BrainwritingUserData[];
  currentUserId: string;
}

/**
 * ブレインライティングのシート一覧を表示するコンポーネント（チーム版用）
 *
 * 未完了の場合：各シートをカード形式で表示し、現在編集中のユーザーを表示します。
 * 自分が編集可能なシートはリンクになり、クリックで入力ページに遷移できます。
 *
 * 全員完了の場合：タブ切り替えで全シートの結果を閲覧できる画面を表示します。
 *
 * @param sheets - シート一覧データ
 * @param inputs - 全シートの入力データ
 * @param users - 参加ユーザー一覧
 * @param currentUserId - 現在ログイン中のユーザーID
 */
export default function BrainwritingSheetList({
  sheets,
  inputs,
  users,
  currentUserId,
}: BrainwritingSheetListProps) {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  // ユーザーIDから名前を取得する関数
  const getUserName = (userId: string | null) => {
    if (!userId) return "完了";
    const user = users.find(u => u.user_id === userId);
    return user?.user_name;
  };

  // シートIDに対応する入力データを取得
  const getInputsForSheet = (sheetId: number) => {
    return inputs?.filter(input => input.brainwriting_sheet_id === sheetId) || [];
  };

  // 全員完了しているかチェック
  const allCompleted = sheets.every(sheet => sheet.current_user_id === null);

  if (!allCompleted) {
    return (
      <div className="mx-auto mb-8 max-w-4xl">
        <h2 className="text-primary mb-4 text-xl font-bold">シート一覧</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sheets.map((sheet, index) => {
            const isCurrentUser = sheet.current_user_id === currentUserId;
            const cardContent = (
              <div
                className={`rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md ${
                  isCurrentUser
                    ? "bg-primary border-primary text-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="mb-2">
                  <span
                    className={`text-lg font-semibold ${isCurrentUser ? "text-white" : "text-gray-900"}`}
                  >
                    シート {index + 1}
                  </span>
                </div>
                <div className={`text-sm ${isCurrentUser ? "text-white/90" : "text-gray-600"}`}>
                  <span className="font-medium">現在のユーザー:</span>
                  <br />
                  <span className={isCurrentUser ? "text-white" : "text-gray-900"}>
                    {getUserName(sheet.current_user_id)}
                  </span>
                </div>
              </div>
            );

            return isCurrentUser ? (
              <Link key={sheet.id} href={`/brainwritings/sheet/${sheet.id}/input`}>
                {cardContent}
              </Link>
            ) : (
              <div key={sheet.id}>{cardContent}</div>
            );
          })}
        </div>
      </div>
    );
  }

  // 完了モード：結果確認画面（タブ切り替え）
  return (
    <div className="mb-8">
      <h2 className="text-primary mb-6 text-center text-2xl font-bold">結果確認</h2>

      {/* シート切り替えタブ */}
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
      {sheets &&
        sheets[activeSheetIndex] &&
        (() => {
          const sheet = sheets[activeSheetIndex];
          const sheetInputs = getInputsForSheet(sheet.id);

          // シートのinputsの1行目のユーザーIDを先頭にusersの配列を変更
          const sortedUsers = sortUsersByFirstRow(sheetInputs, users);

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
