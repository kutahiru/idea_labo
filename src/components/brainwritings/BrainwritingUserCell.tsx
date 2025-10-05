"use client";

import { motion } from "framer-motion";

interface BrainwritingUserCellProps {
  userName: string;
  rowIndex?: number;
}

export default function BrainwritingUserCell({ userName, rowIndex = 0 }: BrainwritingUserCellProps) {
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
      <div className="flex h-16 items-center justify-center rounded-lg border-2 border-primary/50 bg-white shadow-md transition-all duration-300 hover:shadow-lg">
        <span className="text-primary font-medium">{userName}</span>
      </div>
    </motion.div>
  );
}