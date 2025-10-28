"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import IdeaFrameworkInfo from "@/components/shared/IdeaFrameworkInfo";
import BrainwritingSheet from "./BrainwritingSheet";
import { XPostButton } from "@/components/shared/Button";
import InviteLinkCopy from "./InviteLinkCopy";
import ToggleSwitch from "@/components/shared/ToggleSwitch";
import { BrainwritingDetail, BrainwritingInputData } from "@/types/brainwriting";
import {
  USAGE_SCOPE,
  convertToRowData,
  handleBrainwritingDataChange,
  sortUsersByFirstRow,
} from "@/utils/brainwriting";
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
  const [currentInputs, setCurrentInputs] = useState(inputs);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [isInviteActive, setIsInviteActive] = useState(brainwriting.isInviteActive ?? true);
  const [isResultsPublic, setIsResultsPublic] = useState(brainwriting.isResultsPublic ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

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
  const handleXPost = async () => {
    // アクティブな要素からフォーカスを外す
    // BrainwritingCellのonBlurが発火し、未保存の入力データを確実に保存する
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // onBlur → handleDataChange（非同期API呼び出し + state更新）の完了を待つ
    await new Promise(resolve => setTimeout(resolve, 500));

    // APIから最新のinputsを取得して検証
    const currentSheet = sheets[activeSheetIndex];
    const response = await fetch(`/api/brainwritings/sheet/${currentSheet.id}/inputs`);
    if (!response.ok) {
      toast.error("データの取得に失敗しました");
      return;
    }
    const latestInputs: BrainwritingInputData[] = await response.json();

    // 1行目のデータのみをチェック（row_index === 0）
    const firstRowInputs = latestInputs.filter(input => input.row_index === 0);
    const hasEmptyInput = firstRowInputs.some(
      input => input.content === null || input.content.trim() === ""
    );

    if (hasEmptyInput) {
      toast.error("すべてのアイデアを入力してください");
      return;
    }

    // X投稿
    postBrainwritingToX({ brainwriting, isOwner: true });
  };

  /** URLの有効無効更新 */
  const handleUpdateIsInviteActive = async (newValue: boolean) => {
    // 更新中は処理をスキップ（連打対策）
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/brainwritings/${brainwriting.id}/invite-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isInviteActive: newValue }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "の状態更新に失敗しました");
        return;
      }

      setIsInviteActive(newValue);
      toast.success(newValue ? "共有リンクを有効にしました" : "共有リンクを無効にしました");
    } catch (error) {
      console.error("共有リンクの状態更新エラー:", error);
      toast.error("共有リンクの状態更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  /** 結果公開の有効無効更新 */
  const handleUpdateIsResultsPublic = async (newValue: boolean) => {
    // 更新中は処理をスキップ（連打対策）
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/brainwritings/${brainwriting.id}/results-public`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isResultsPublic: newValue }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "結果公開の状態更新に失敗しました");
        return;
      }

      setIsResultsPublic(newValue);
      toast.success(newValue ? "結果を公開しました" : "結果を非公開にしました");
    } catch (error) {
      console.error("結果公開の状態更新エラー:", error);
      toast.error("結果公開の状態更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={brainwriting} />

      {/* X投稿ボタン（X投稿版） */}
      {brainwriting.usageScope === USAGE_SCOPE.XPOST && (
        <div className="mt-8 mb-6 flex items-center justify-center gap-6">
          <XPostButton buttonName="共有" onClick={handleXPost} disabled={!isInviteActive} />
          <div className="bg-primary/10 rounded-lg px-4 py-3">
            <ToggleSwitch
              label="共有リンク"
              checked={isInviteActive}
              onChange={handleUpdateIsInviteActive}
              disabled={isUpdating}
            />
          </div>
          <div className="group bg-primary/10 relative rounded-lg px-4 py-3">
            <ToggleSwitch
              label="結果公開"
              checked={isResultsPublic}
              onChange={handleUpdateIsResultsPublic}
              disabled={isUpdating}
            />
            <div className="bg-primary invisible absolute top-full left-1/2 z-10 mt-2 w-max max-w-80 -translate-x-1/2 rounded-lg p-3 text-sm text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              <div className="bg-primary absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
              <p className="whitespace-pre-line">
                結果を公開すると、<br />共有リンクから誰でも結果を閲覧できます
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 招待リンクコピー（チーム利用版） */}
      {brainwriting.usageScope === USAGE_SCOPE.TEAM && brainwriting.inviteToken && (
        <InviteLinkCopy
          inviteToken={brainwriting.inviteToken}
          brainwritingId={brainwriting.id}
          isInviteActive={isInviteActive}
        />
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
          const isAllReadOnly =
            brainwriting.usageScope === USAGE_SCOPE.TEAM || sheet.current_user_id !== currentUserId;

          return (
            <BrainwritingSheet
              key={sheet.id}
              brainwritingRows={brainwritingRows}
              activeRowIndex={!isAllReadOnly ? 0 : undefined}
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
