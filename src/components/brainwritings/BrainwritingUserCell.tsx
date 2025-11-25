"use client";

import { motion } from "framer-motion";

interface BrainwritingUserCellProps {
  userName: string;
  rowIndex?: number;
}

/**
 * ブレインライティングシートの参加者名を表示するセルコンポーネント
 *
 * @param userName - 表示する参加者名
 * @param rowIndex - 行のインデックス（アニメーション遅延時間の計算に使用）
 */
export default function BrainwritingUserCell({
  userName,
  rowIndex = 0,
}: BrainwritingUserCellProps) {
  const delay = rowIndex * 0.15;

  return (
    <motion.div
      className="w-60"
      initial={{ x: -1000, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 15,
        delay,
      }}
    >
      <div className="border-primary/50 flex h-[72px] items-center justify-center rounded-lg border-2 bg-white shadow-md transition-all duration-300 hover:shadow-lg">
        <span className="text-primary font-medium">{userName}</span>
      </div>
    </motion.div>
  );
}
