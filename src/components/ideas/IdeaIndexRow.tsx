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

/**
 * アイデア一覧テーブルの1行を表示するコンポーネント
 *
 * アイデアの重要度を色付きバッジで表示し（高：赤、中：黄、低：緑）、
 * アイデア名、説明、操作ボタン（編集・削除）を含むテーブル行を構成します。
 * スマホではカード形式、PC（sm以上）ではテーブル行で表示します。
 *
 * @param name - アイデア名
 * @param description - アイデアの説明
 * @param priority - 重要度（high, medium, low）
 * @param onEdit - 編集ボタンクリック時のコールバック関数（オプション）
 * @param onDelete - 削除ボタンクリック時のコールバック関数（オプション）
 */
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
    <tr className="border-b-2 border-gray-400 transition-colors hover:bg-surface-hover">
      <td className="w-24 px-3 py-4 text-center whitespace-nowrap">
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${priorityColor}`}>
          {priorityLabel}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-foreground">{name}</div>
      </td>
      <td className="px-6 py-4">
        <div className="line-clamp-2 text-sm text-muted">
          {description || <span className="text-muted-foreground italic">説明が設定されていません</span>}
        </div>
      </td>
      <td className="w-32 px-2 py-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex cursor-pointer items-center rounded-md bg-gray-500 px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
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

/**
 * アイデアをカード形式で表示するコンポーネント（モバイル用）
 */
export function IdeaCard({
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
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${priorityColor}`}>
          {priorityLabel}
        </span>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex cursor-pointer items-center rounded-md bg-gray-500 px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
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
      </div>
      <h3 className="mb-2 text-base font-medium text-foreground">{name}</h3>
      <p className="line-clamp-2 text-sm text-muted">
        {description || <span className="text-muted-foreground italic">説明が設定されていません</span>}
      </p>
    </div>
  );
}
