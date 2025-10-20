"use client";

import { useState, useEffect, useRef } from "react";

interface MandalartCellProps {
  value?: string;
  isCenter?: boolean;
  readOnly?: boolean;
  onChange: (value: string) => void;
}

export default function MandalartCell({
  value = "",
  isCenter = false,
  readOnly = false,
  onChange,
}: MandalartCellProps) {
  const [lastSavedValue, setLastSavedValue] = useState(value);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 初期値の同期
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // フォントサイズを動的に計算
  const getFontSize = () => {
    const length = localValue.length;
    if (length > 21) return "text-[10px]";
    if (length > 18) return "text-xs";
    return "text-sm";
  };

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 56)}px`;
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

  return (
    <div
      className={
        "relative flex h-[72px] items-center justify-center rounded-lg transition-all duration-300 " +
        (isCenter
          ? "border-accent bg-accent/10 shadow-accent/20 border-4 shadow-xl"
          : "border-primary/50 border-2 bg-white shadow-md hover:shadow-lg")
      }
    >
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        placeholder={readOnly ? "" : "入力"}
        rows={1}
        maxLength={30}
        className={
          "text-primary w-full resize-none overflow-hidden border-none bg-transparent px-1 py-1 text-center leading-tight font-medium outline-none " +
          getFontSize() +
          " " +
          (readOnly ? "cursor-default" : "cursor-text")
        }
        style={{
          maxHeight: "64px",
        }}
      />
    </div>
  );
}
