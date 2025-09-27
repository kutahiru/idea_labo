// ブレインライティング一覧行コンポーネント
import Link from "next/link";
import { formatDate } from "@/utils/date";
import { BrainwritingListItem } from "@/types/brainwriting";
import { ClockIcon } from "@/components/layout/Icons";

interface BrainwritingIndexRowProps extends BrainwritingListItem {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function BrainwritingIndexRow({
  id,
  title,
  themeName,
  description,
  createdAt,
  onEdit,
  onDelete,
}: BrainwritingIndexRowProps) {
  return (
    <div className="group relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-blue-300/50">
      <div className="relative">
        {/* ヘッダー部分 */}
        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-gray-900">{title}</h3>
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 text-sm font-medium text-blue-800">
                {themeName}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* アクションボタン */}
            <div className="flex items-center gap-2">
              <Link
                href={`/brainwriting/${id}`}
                className="bg-primary inline-flex items-center rounded-md px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
              >
                詳細
              </Link>
              <button
                onClick={onEdit}
                className="inline-flex items-center rounded-md bg-gray-500 px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
              >
                編集
              </button>
              <button
                className="bg-alert inline-flex cursor-pointer items-center rounded-md px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
                onClick={onDelete}
              >
                削除
              </button>
            </div>

            {/* 時刻を右端に表示 */}
            <time className="flex items-center text-sm text-gray-500">
              <ClockIcon className="mr-1.5 h-3 w-3" />
              {formatDate(createdAt)}
            </time>
          </div>
        </div>

        {/* 説明文 */}
        <div className="mt-4 border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-600">
          {description ? (
            <p className="line-clamp-2">{description}</p>
          ) : (
            <p className="text-gray-400 italic">説明が設定されていません</p>
          )}
        </div>
      </div>
    </div>
  );
}
