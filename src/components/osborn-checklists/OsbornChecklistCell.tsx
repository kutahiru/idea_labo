"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface OsbornChecklistCellProps {
  value?: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
  index?: number;
  title: string;
}

export default function OsbornChecklistCell({
  value = "",
  readOnly = false,
  onChange,
  index = 0,
  title,
}: OsbornChecklistCellProps) {
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
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      // モバイルの場合は150pxまで、デスクトップは300pxまで
      const isMobile = window.innerWidth < 768;
      const maxHeight = isMobile ? 150 : 300;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
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
    // Ctrl/Cmd + Enter で保存してフォーカスを外す
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();

      // 次の入力フィールドにフォーカス移動
      const textarea = document.querySelectorAll("textarea:not([readonly])");
      const currentIndex = Array.from(textarea).indexOf(e.currentTarget);
      const nextTextarea = textarea[currentIndex + 1];

      if (nextTextarea) {
        (nextTextarea as HTMLTextAreaElement).focus();
      }
    }
  };

  const delay = index * 0.08;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay,
      }}
      className="w-full"
    >
      <div className="rounded-xl bg-white/50 p-4 shadow-sm">
        <div className="mb-3">
          <h3 className="text-primary text-xl font-bold">{title}</h3>
        </div>
        <div
          className="border-primary/50 relative flex min-h-[100px] items-start justify-center rounded-lg border-2 bg-white p-3 shadow-md transition-all duration-300 hover:shadow-lg cursor-text"
          onClick={() => textareaRef.current?.focus()}
        >
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            placeholder={readOnly ? "" : `${title}できないか？`}
            rows={4}
            maxLength={500}
            className={
              "text-primary w-full resize-none overflow-y-auto border-none bg-transparent text-base leading-relaxed outline-none " +
              (readOnly ? "cursor-default" : "cursor-text")
            }
            style={{
              minHeight: "80px",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
