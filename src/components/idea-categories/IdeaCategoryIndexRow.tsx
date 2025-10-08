"use client";

// アイデアカテゴリ一覧行コンポーネント
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
      className="group hover:ring-primary/30 relative rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <div className="relative">
        {/* ヘッダー部分 */}
        <div className="mb-4">
          <div className="flex items-start justify-between">
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

            <div className="flex flex-col items-end gap-2">
              {/* アクションボタン */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/idea-categories/${id}`}
                  className="bg-primary inline-flex items-center rounded-md px-3 py-1 text-sm font-medium text-white transition-transform hover:scale-105"
                >
                  アイデア一覧
                </Link>
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
            </div>
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
    </motion.div>
  );
}
