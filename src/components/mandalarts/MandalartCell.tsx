"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MandalartCellProps {
  value?: string;
  isCenter?: boolean;
  isSectionCenter?: boolean;
  readOnly?: boolean;
  onChange: (value: string) => void;
  rowIndex?: number;
  colIndex?: number;
}

/**
 * マンダラートの1つのセルを表示するコンポーネント
 *
 * 9×9のマンダラートグリッドの各セルで、テキスト入力、表示、アニメーション効果を提供します。
 * メインテーマセル、セクション中央セル、通常セルで異なるスタイルを適用します。
 * テキスト長に応じてフォントサイズを自動調整し、Enterキーで次のセルにフォーカス移動できます。
 *
 * セルの種類：
 * - メインテーマセル（全体の中心）：強調表示（アクセントカラー）
 * - セクション中央セル/中央セクションの周囲：中程度の強調（プライマリカラー）
 * - 通常セル：標準表示
 *
 * @param value - セルの値
 * @param isCenter - セクション内の中心セルかどうか
 * @param isSectionCenter - 中央セクション（3×3のセクション）かどうか
 * @param readOnly - 読み取り専用モード
 * @param onChange - 値変更時のコールバック関数（blurまたはEnter時に発火）
 * @param rowIndex - 行インデックス（アニメーション計算用）
 * @param colIndex - 列インデックス（アニメーション計算用）
 */
export default function MandalartCell({
  value = "",
  isCenter = false,
  isSectionCenter = false,
  readOnly = false,
  onChange,
  rowIndex = 0,
  colIndex = 0,
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
    if (length > 40) return "text-[8.5px]";
    if (length > 24) return "text-[10px]";
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
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
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

  // 四方向からランダムに飛んでくるアニメーション
  const directions = [
    { x: -1000, y: 0 }, // 左から
    { x: 1000, y: 0 }, // 右から
    { x: 0, y: -1000 }, // 上から
    { x: 0, y: 1000 }, // 下から
  ];

  const direction = directions[(rowIndex + colIndex) % 4];
  const delay = (rowIndex * 3 + colIndex) * 0.05;

  // セルのスタイル判定
  const isMainThemeCell = isSectionCenter && isCenter; // 全体の中心（メインテーマ）
  const isHighlightCell = (!isSectionCenter && isCenter) || (isSectionCenter && !isCenter); // 各セクション中央 or 中央セクションの周囲

  const getCellStyle = () => {
    if (isMainThemeCell) {
      return "border-accent bg-accent/10 shadow-accent/10 border-4 shadow-xl";
    }
    if (isHighlightCell) {
      return "border-primary bg-primary/10 shadow-primary/10 border-2 shadow-xl";
    }
    return "border-primary/50 border-2 bg-white shadow-md hover:shadow-lg";
  };

  return (
    <motion.div
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
        className={
          "relative flex h-[72px] items-center justify-center rounded-lg transition-all duration-300 " +
          getCellStyle()
        }
      >
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder=""
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
    </motion.div>
  );
}
