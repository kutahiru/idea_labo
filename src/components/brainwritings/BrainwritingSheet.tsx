"use client";

import { useState, useEffect } from "react";
import BrainwritingRow from "./BrainwritingRow";

interface BrainwritingRow {
  name: string;
  ideas: string[];
}

interface BrainwritingSheetProps {
  brainwritingRows?: BrainwritingRow[];
  isAllReadOnly?: boolean;
  activeRowIndex?: number;
  onDataChange?: (rowIndex: number, ideaIndex: number, value: string) => void;
}

/**
 * ブレインライティングのシート全体を表示するコンポーネント
 *
 * 参加者とアイデアのグリッド表示を行います。
 * 編集モードでは特定の行のみ編集可能にし、他の行は読み取り専用になります。
 *
 * @param brainwritingRows - 各行のデータ（参加者名とアイデア配列）
 * @param isAllReadOnly - 全ての行を読み取り専用にするか（結果閲覧時など）
 * @param activeRowIndex - 編集中の行のインデックス（指定された行のみ編集可能）
 * @param onDataChange - データ変更時のコールバック関数
 */
export default function BrainwritingSheet({
  brainwritingRows = [],
  isAllReadOnly = false,
  activeRowIndex,
  onDataChange,
}: BrainwritingSheetProps) {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    // アニメーション完了を待つ（最大遅延時間 + アニメーション時間）
    const timer = setTimeout(() => {
      setShowScroll(true);
    }, 2000); // 2秒後にスクロール有効化

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="md-8 mt-8">
      {/* グリッド */}
      <div
        className={`mx-auto max-w-[1200px] ${showScroll ? "overflow-x-auto" : "overflow-hidden"}`}
      >
        <div className="relative min-w-[1200px]">
          {/* ヘッダー行 */}
          <div className="mb-4 flex">
            <div className="w-60 text-center">
              <span className="text-primary text-2xl font-semibold">参加者</span>
            </div>
            <div className="w-80 text-center">
              <span className="text-primary text-2xl font-semibold">アイデア1</span>
            </div>
            <div className="w-80 text-center">
              <span className="text-primary text-2xl font-semibold">アイデア2</span>
            </div>
            <div className="w-80 text-center">
              <span className="text-primary text-2xl font-semibold">アイデア3</span>
            </div>
          </div>

          {/* データ行 */}
          {brainwritingRows.map((brainwritingUser, rowIndex) => (
            <BrainwritingRow
              key={rowIndex}
              userName={brainwritingUser.name}
              ideas={brainwritingUser.ideas}
              onIdeaChange={(ideaIndex, value) => onDataChange?.(rowIndex, ideaIndex, value)}
              isHighlighted={rowIndex == activeRowIndex}
              readOnly={
                isAllReadOnly || (activeRowIndex !== undefined && rowIndex !== activeRowIndex)
              }
              rowIndex={rowIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
