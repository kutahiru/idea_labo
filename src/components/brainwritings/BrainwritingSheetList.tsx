"use client";

import { BrainwritingTeam } from "@/types/brainwriting";

interface BrainwritingSheetListProps {
  sheets: BrainwritingTeam["sheets"];
  users: BrainwritingTeam["users"];
}

export default function BrainwritingSheetList({
  sheets,
  users,
}: BrainwritingSheetListProps) {
  // ユーザーIDから名前を取得する関数
  const getUserName = (userId: string | null) => {
    if (!userId) return "未割当";
    const user = users.find((u) => u.user_id === userId);
    return user?.user_name || "Anonymous";
  };

  return (
    <div className="mx-auto mb-8 max-w-4xl">
      <h2 className="mb-4 text-xl font-bold text-gray-900">シート一覧</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sheets.map((sheet, index) => (
          <div
            key={sheet.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-2">
              <span className="text-lg font-semibold text-gray-900">
                シート {index + 1}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">現在のユーザー:</span>
              <br />
              <span className="text-gray-900">{getUserName(sheet.current_user_id)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
