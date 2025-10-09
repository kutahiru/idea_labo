// アイデア一覧行コンポーネント
"use client";

import { IdeaListItem } from "@/types/idea";

interface IdeaIndexRowProps extends IdeaListItem {
  onEdit?: () => void;
  onDelete?: () => void;
}

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const priorityLabels = {
  high: "高",
  medium: "中",
  low: "低",
};

export default function IdeaIndexRow({
  name,
  description,
  priority,
  onEdit,
  onDelete,
}: IdeaIndexRowProps) {
  const priorityColor =
    priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
  const priorityLabel = priorityLabels[priority as keyof typeof priorityLabels] || "中";

  return (
    <tr className="border-b-2 border-gray-400 transition-colors hover:bg-gray-100">
      <td className="w-24 px-3 py-4 text-center whitespace-nowrap">
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${priorityColor}`}>
          {priorityLabel}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{name}</div>
      </td>
      <td className="px-6 py-4">
        <div className="line-clamp-2 text-sm text-gray-600">
          {description || <span className="text-gray-400 italic">説明が設定されていません</span>}
        </div>
      </td>
      <td className="w-32 px-2 py-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center rounded-md bg-gray-500 px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              編集
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="bg-alert inline-flex cursor-pointer items-center rounded-md px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              削除
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
