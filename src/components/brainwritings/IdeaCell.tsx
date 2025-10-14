"use client";

import { useState, useRef, useEffect } from "react";
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
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 初期値の同期
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 64)}px`; // 最大64px
    }
  }, [localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue !== lastSavedValue) {
      onChange(newValue);
      setLastSavedValue(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur(); // 保存のためにフォーカスを外す

      // 次の入力フィールドにフォーカス移動
      const textareas = document.querySelectorAll("textarea:not([readonly])");
      const currentIndex = Array.from(textareas).indexOf(e.currentTarget);
      const nextTextarea = textareas[currentIndex + 1];

      if (nextTextarea) {
        (nextTextarea as HTMLTextAreaElement).focus();
      }
    }
  };

  // 四方向からランダムに飛んでくるアニメーション
  const directions = [
    { x: -1000, y: 0 }, // 左から
    { x: 1000, y: 0 }, // 右から
    { x: 0, y: -1000 }, // 上から
    { x: 0, y: 1000 }, // 下から
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
        className={`relative flex h-[72px] items-center justify-center rounded-lg transition-all duration-300 ${
          isHighlighted
            ? "border-accent bg-accent/10 shadow-accent/20 border-4 shadow-xl"
            : "border-primary/50 border-2 bg-white shadow-md hover:shadow-lg"
        }`}
      >
        {readOnly && (
          <div className="absolute top-2 left-2">
            <Lock size={16} className="text-primary/50" />
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={readOnly ? "" : "アイデアを入力"}
          rows={1}
          maxLength={50}
          className={`text-primary w-full resize-none overflow-y-auto border-none bg-transparent px-3 py-1 text-center text-sm leading-tight font-medium outline-none ${
            readOnly ? "cursor-default" : "cursor-text"
          }`}
          style={{
            maxHeight: "64px",
          }}
        />
      </div>
    </motion.div>
  );
}
