"use client";

import { useState } from "react";
import BrainwritingInfo from "./BrainwritingInfo";
import BrainwritingSheetList from "./BrainwritingSheetList";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { BrainwritingTeam } from "@/types/brainwriting";

interface BrainwritingTeamClientProps {
  brainwritingTeam: BrainwritingTeam;
  currentUserId: string;
}

export default function BrainwritingTeamClient({
  brainwritingTeam,
  currentUserId,
}: BrainwritingTeamClientProps) {
  const { sheets, users, ...brainwriting } = brainwritingTeam;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleStart = () => {
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
        const data = await response.json();
        alert(data.error || "開始に失敗しました");
        return;
      }

      // 成功したらページをリロードして最新の状態を表示
      window.location.reload();
    } catch (error) {
      console.error("開始処理エラー:", error);
      alert("開始処理中にエラーが発生しました");
    }
  };

  return (
    <div className="">
      <BrainwritingInfo brainwriting={brainwriting} />

      {sheets.length === 0 ? (
        <>
          <div className="mx-auto mb-8 max-w-4xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">参加者一覧</h2>
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

          <div className="mx-auto max-w-4xl text-center">
            <button
              onClick={handleStart}
              className="bg-primary inline-flex items-center rounded-md px-20 py-2 text-base font-medium text-white transition-transform hover:scale-105"
            >
              開始
            </button>
          </div>
        </>
      ) : (
        <BrainwritingSheetList sheets={sheets} users={users} />
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
