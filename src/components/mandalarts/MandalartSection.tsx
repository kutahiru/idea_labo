"use client";

import MandalartCell from "./MandalartCell";

interface MandalartSectionProps {
  sectionRowIndex: number;
  sectionColumnIndex: number;
  inputs: Map<string, string>;
  onCellChange: (
    sectionRowIndex: number,
    sectionColumnIndex: number,
    rowIndex: number,
    columnIndex: number,
    value: string
  ) => void;
  mandalartTheme: string;
  readOnly?: boolean;
}

/**
 * マンダラートの3×3セクションを表示するコンポーネント
 *
 * 9×9のマンダラートグリッドを構成する3×3のセクション（9個のセル）を表示します。
 *
 * セル値の特別な処理：
 * - 中央セクション（1,1）の中央セル：マンダラートのテーマ名を表示（常に読み取り専用）
 * - 各セクションの中央セル：中央セクションの対応位置の値を自動表示（常に読み取り専用）
 * - その他のセル：通常の入力セル
 *
 * @param sectionRowIndex - セクションの行インデックス（0-2）
 * @param sectionColumnIndex - セクションの列インデックス（0-2）
 * @param inputs - 全セルの入力データを格納したMap
 * @param onCellChange - セルの値変更時のコールバック関数
 * @param mandalartTheme - マンダラートのテーマ名
 * @param readOnly - 読み取り専用モード（全セルに適用）
 */
export default function MandalartSection({
  sectionRowIndex,
  sectionColumnIndex,
  inputs,
  onCellChange,
  mandalartTheme,
  readOnly = false,
}: MandalartSectionProps) {
  const isCenterCell = (rowIndex: number, columnIndex: number): boolean => {
    return rowIndex === 1 && columnIndex === 1;
  };

  // 中央セクションかどうか
  const isSectionCenter = (): boolean => {
    return sectionRowIndex === 1 && sectionColumnIndex === 1;
  };

  const getCellValue = (rowIndex: number, columnIndex: number): string => {
    // 中央セクションの中央セルの場合はテーマを返す
    if (isSectionCenter() && isCenterCell(rowIndex, columnIndex)) {
      return mandalartTheme;
    }

    // 各セクションの中央セルの場合は、中央セクションの対応する位置の値を返す
    if (isCenterCell(rowIndex, columnIndex)) {
      const centerKey = `1-1-${sectionRowIndex}-${sectionColumnIndex}`;
      return inputs.get(centerKey) || "";
    }

    const key = `${sectionRowIndex}-${sectionColumnIndex}-${rowIndex}-${columnIndex}`;
    return inputs.get(key) || "";
  };

  const handleCellChange = (rowIndex: number, columnIndex: number, value: string) => {
    onCellChange(sectionRowIndex, sectionColumnIndex, rowIndex, columnIndex, value);
  };

  const isReadOnly = (rowIndex: number, columnIndex: number): boolean => {
    return readOnly || isCenterCell(rowIndex, columnIndex);
  };

  return (
    <div className="border-primary/30 grid h-full w-full grid-cols-3 gap-1 rounded-lg border-2 bg-surface-hover p-1">
      {[0, 1, 2].map(rowIndex =>
        [0, 1, 2].map(columnIndex => (
          <MandalartCell
            key={`${rowIndex}-${columnIndex}`}
            value={getCellValue(rowIndex, columnIndex)}
            isCenter={isCenterCell(rowIndex, columnIndex)}
            isSectionCenter={isSectionCenter()}
            readOnly={isReadOnly(rowIndex, columnIndex)}
            onChange={value => handleCellChange(rowIndex, columnIndex, value)}
            rowIndex={sectionRowIndex * 3 + rowIndex}
            colIndex={sectionColumnIndex * 3 + columnIndex}
          />
        ))
      )}
    </div>
  );
}
