// ブレインライティング一覧行コンポーネント
import Link from "next/link";
import { formatDate } from "@/utils/date";
import { BrainwritingListItem } from "@/types/brainwriting";

export default function BrainwritingIndexRow({
  id,
  title,
  themeName,
  description,
  createdAt,
}: BrainwritingListItem) {
  return (
    <div className="group relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-blue-300/50">
      <div className="relative">
        {/* ヘッダー部分 */}
        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-gray-900">{title}</h3>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 text-sm font-medium text-blue-800">
                {themeName}
              </span>
              <time className="flex items-center text-sm text-gray-500">
                <svg
                  className="mr-1.5 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatDate(createdAt)}
              </time>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center gap-2">
            <Link
              href={`/brainwriting/${id}`}
              className="bg-primary inline-flex items-center rounded-md px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              詳細
            </Link>
            <Link
              href={`/brainwriting/${id}/edit`}
              className="inline-flex items-center rounded-md bg-gray-500 px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              編集
            </Link>
            <button
              className="inline-flex items-center rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
              onClick={() => {
                if (confirm("本当に削除しますか？")) {
                  // 削除処理を実装
                  console.log(`Delete brainwriting ${id}`);
                }
              }}
            >
              削除
            </button>
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
