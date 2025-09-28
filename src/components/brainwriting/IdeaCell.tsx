"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";

interface IdeaCellProps {
  value?: string;
  isHighlighted?: boolean;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function IdeaCell({
  value = "",
  isHighlighted = false,
  onChange,
  readOnly = false,
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

  return (
    <div className="w-80">
      <div
        className={`relative flex h-16 items-center justify-center border-2 bg-white ${
          isHighlighted ? "border-accent/30 border-4" : "border-gray-400"
        }`}
      >
        {readOnly && (
          <div className="absolute top-1 left-1">
            <Lock size={16} className="text-gray-500" />
          </div>
        )}

        <input
          type="text"
          defaultValue={value}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={readOnly ? "" : "アイデアを入力"}
          className={`h-full w-full border-none bg-transparent px-2 text-center text-sm outline-none ${
            readOnly ? "cursor-default" : "cursor-text"
          }`}
        />
      </div>
    </div>
  );
}
