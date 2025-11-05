"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import IdeaFrameworkInfo from "@/components/shared/IdeaFrameworkInfo";
import BrainwritingSheetList from "./BrainwritingSheetList";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { BrainwritingDetail } from "@/types/brainwriting";
import { useBrainwritingRealtime } from "@/hooks/useBrainwritingRealtime";
import { useAutoRefreshOnFocus } from "@/hooks/useAutoRefreshOnFocus";
import { parseJsonSafe } from "@/lib/api/utils";

interface BrainwritingTeamClientProps {
  brainwritingTeam: BrainwritingDetail;
  currentUserId: string;
}

export default function BrainwritingTeamClient({
  brainwritingTeam,
  currentUserId,
}: BrainwritingTeamClientProps) {
  const { sheets: initialSheets, inputs: initialInputs, users: initialUsers, ...brainwriting } = brainwritingTeam;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ブラウザの戻るボタンやタブ切り替えで戻った時に最新データを取得
  useAutoRefreshOnFocus();

  // AppSync Eventsでリアルタイム更新（参加者、シート、入力データ）
  const { users, sheets, inputs } = useBrainwritingRealtime({
    brainwritingId: brainwriting.id,
    initialUsers,
    initialSheets,
    initialInputs,
  });

  // 開始ボタンを表示するのは作成者のみ
  const isCreator = brainwriting.userId === currentUserId;

  const handleStart = () => {
    if (users.length < 2) {
      toast.error("最低でも参加者が2人必要です。");
      return;
    }

    //6人未満の場合は確認メッセージ
    if (users.length < 6) {
      setShowConfirmModal(true);
      return;
    }

    startBrainwriting();
  };

  const startBrainwriting = async () => {
    try {
      const response = await fetch(`/api/brainwritings/${brainwriting.id}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await parseJsonSafe(response, {
          error: "開始に失敗しました",
        });
        toast.error(data.error || "開始に失敗しました");
        return;
      }

      // 成功したらページをリロードして最新の状態を表示
      toast.success("ブレインライティングを開始しました");
      window.location.reload();
    } catch (error) {
      console.error("開始処理エラー:", error);
      toast.error("開始処理中にエラーが発生しました");
    }
  };

  return (
    <div className="">
      <IdeaFrameworkInfo ideaFramework={brainwriting} />

      {sheets.length === 0 ? (
        <>
          <div className="mx-auto mb-8 max-w-4xl">
            <div className="mb-4">
              <h2 className="text-primary text-xl font-bold">参加者一覧</h2>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <ul className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <li key={user.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-3 text-sm font-medium text-gray-500">{index + 1}.</span>
                        <span className="text-gray-900">{user.user_name || "Anonymous"}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {isCreator ? (
            <div className="mx-auto max-w-4xl text-center">
              <button
                onClick={handleStart}
                className="bg-primary inline-flex items-center rounded-md px-20 py-2 text-base font-medium text-white transition-transform hover:scale-105"
              >
                開始
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl text-center">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
                    <div className="bg-primary animation-delay-200 h-2 w-2 animate-pulse rounded-full"></div>
                    <div className="bg-primary animation-delay-400 h-2 w-2 animate-pulse rounded-full"></div>
                  </div>
                  <p className="text-primary text-lg font-medium">
                    作成者が開始するまでお待ちください
                  </p>
                  <p className="text-sm text-gray-600">
                    参加者が揃い次第、ブレインライティングが開始されます
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <BrainwritingSheetList
          sheets={sheets}
          inputs={inputs}
          users={users}
          currentUserId={currentUserId}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="参加者が6人未満です"
        message={`現在の参加者は${users.length}人です。\nブレインライティングを開始しますか？`}
        confirmText="開始する"
        cancelText="キャンセル"
        onConfirm={() => {
          setShowConfirmModal(false);
          startBrainwriting();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
