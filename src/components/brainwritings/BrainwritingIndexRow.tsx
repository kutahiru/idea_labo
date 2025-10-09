// ブレインライティング一覧行コンポーネント
"use client";

import Link from "next/link";
import { formatDate } from "@/utils/date";
import { BrainwritingListItem } from "@/types/brainwriting";
import { ClockIcon } from "@/components/layout/Icons";
import { getUsageScopeLabel } from "@/utils/brainwriting";
import { motion } from "framer-motion";

interface BrainwritingIndexRowProps extends BrainwritingListItem {
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

export default function BrainwritingIndexRow({
  id,
  title,
  themeName,
  description,
  usageScope,
  createdAt,
  onEdit,
  onDelete,
  index = 0,
}: BrainwritingIndexRowProps) {
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
              <h3 className="text-primary decoration-accent truncate text-lg font-semibold underline decoration-4 underline-offset-[-2px]">
                {title}
              </h3>
              <div className="mt-2">
                <span className="text-primary decoration-accent text-lg font-semibold underline decoration-4 underline-offset-[-2px]">
                  {themeName}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* アクションボタン */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/brainwritings/${id}`}
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
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="bg-primary/10 text-primary ring-primary/20 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1">
              {getUsageScopeLabel(usageScope)}
            </span>
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
    </motion.div>
  );
}
