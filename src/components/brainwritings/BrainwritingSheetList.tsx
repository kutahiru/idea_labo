"use client";

import Link from "next/link";
import { BrainwritingTeam } from "@/types/brainwriting";

interface BrainwritingSheetListProps {
  sheets: BrainwritingTeam["sheets"];
  users: BrainwritingTeam["users"];
  currentUserId: string;
}

export default function BrainwritingSheetList({
  sheets,
  users,
  currentUserId,
}: BrainwritingSheetListProps) {
  // ユーザーIDから名前を取得する関数
  const getUserName = (userId: string | null) => {
    if (!userId) return "完了";
    const user = users.find(u => u.user_id === userId);
    return user?.user_name;
  };

  return (
    <div className="mx-auto mb-8 max-w-4xl">
      <h2 className="mb-4 text-xl font-bold text-gray-900">シート一覧</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sheets.map((sheet, index) => {
          const isCurrentUser = sheet.current_user_id === currentUserId;
          const cardContent = (
            <div
              className={`rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md ${
                isCurrentUser ? "bg-primary border-primary text-white" : "border-gray-200 bg-white"
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
