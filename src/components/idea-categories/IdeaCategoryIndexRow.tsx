"use client";

import Link from "next/link";
import { IdeaCategoryListItem } from "@/types/idea-category";
import { motion } from "framer-motion";

interface IdeaCategoryIndexRowProps extends IdeaCategoryListItem {
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number; //アニメーション用
}

const cardVariants = {
  hidden: { opacity: 0 },
  visible: (index: number) => ({
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: index * 0.05,
    },
  }),
};

/**
 * アイデアカテゴリ一覧の1行を表示するカードコンポーネント
 *
 * カテゴリ名、説明、アクションボタン（アイデア一覧、編集、削除）を含むカード形式で表示します。
 *
 * @param id - カテゴリID
 * @param name - カテゴリ名
 * @param description - カテゴリの説明
 * @param onEdit - 編集ボタンクリック時のコールバック関数（オプション）
 * @param onDelete - 削除ボタンクリック時のコールバック関数（オプション）
 * @param index - 行のインデックス（アニメーション遅延時間の計算に使用）
 */
export default function IdeaCategoryIndexRow({
  id,
  name,
  description,
  onEdit,
  onDelete,
  index = 0,
}: IdeaCategoryIndexRowProps) {
  return (
    <motion.div
      className="group hover:ring-primary/30 relative rounded-xl bg-surface p-6 shadow-lg ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <div className="relative">
        {/* ヘッダー部分 */}
        <div className="mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-primary truncate text-lg font-semibold">
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(transparent calc(100% - 8px), var(--accent) calc(100% - 8px), var(--accent) calc(100% - 4px), transparent calc(100% - 4px))",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    display: "inline",
                  }}
                >
                  {name}
                </span>
              </h3>
            </div>

            {/* アクションボタン */}
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href={`/idea-categories/${id}`}
                className="bg-primary inline-flex w-full items-center justify-center rounded-md px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105 sm:w-auto"
              >
                アイデア一覧
              </Link>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-gray-500 px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105 sm:flex-none"
                  >
                    編集
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="bg-alert inline-flex flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105 sm:flex-none"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 説明文 */}
        <div className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted">
          {description ? (
            <p className="line-clamp-2">{description}</p>
          ) : (
            <p className="text-muted-foreground italic">説明が設定されていません</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
