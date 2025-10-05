"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

interface IdeaCellProps {
  value?: string;
  isHighlighted?: boolean;
  readOnly?: boolean;
  onChange: (value: string) => void;
  rowIndex?: number;
  colIndex?: number;
}

export default function IdeaCell({
  value = "",
  isHighlighted = false,
  readOnly = false,
  onChange,
  rowIndex = 0,
  colIndex = 0,
}: IdeaCellProps) {
  const [lastSavedValue, setLastSavedValue] = useState(value);

  // フォーカスアウトイベント
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue !== lastSavedValue) {
      onChange(newValue);
      setLastSavedValue(newValue); // 保存した値を記録
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // 保存のためにフォーカスを外す

      // 次の入力フィールドにフォーカス移動
      const inputs = document.querySelectorAll('input[type="text"]:not([readonly])');
      const currentIndex = Array.from(inputs).indexOf(e.currentTarget);
      const nextInput = inputs[currentIndex + 1];

      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  // 四方向からランダムに飛んでくるアニメーション
  const directions = [
    { x: -1000, y: 0 },   // 左から
    { x: 1000, y: 0 },    // 右から
    { x: 0, y: -1000 },   // 上から
    { x: 0, y: 1000 },    // 下から
  ];

  const direction = directions[(rowIndex + colIndex) % 4];
  const delay = (rowIndex * 3 + colIndex) * 0.05;

  return (
    <motion.div
      className="w-80"
      initial={{ x: direction.x, y: direction.y, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 15,
        delay,
      }}
    >
      <div
        className={`relative flex h-16 items-center justify-center rounded-lg transition-all duration-300 ${
          isHighlighted
            ? "border-4 border-accent bg-accent/10 shadow-xl shadow-accent/20"
            : "border-2 border-primary/50 bg-white shadow-md hover:shadow-lg"
        }`}
      >
        {readOnly && (
          <div className="absolute top-2 left-2">
            <Lock size={16} className="text-primary/50" />
          </div>
        )}

        <input
          type="text"
          defaultValue={value}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={readOnly ? "" : "アイデアを入力"}
          className={`h-full w-full border-none bg-transparent px-3 text-center text-sm outline-none text-primary font-medium ${
            readOnly ? "cursor-default" : "cursor-text"
          }`}
        />
      </div>
    </motion.div>
  );
}
