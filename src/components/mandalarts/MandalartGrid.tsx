"use client";

import MandalartSection from "./MandalartSection";
import { MandalartInputData } from "@/types/mandalart";

interface MandalartGridProps {
  themeName: string;
  inputs: MandalartInputData[];
  onInputChange: (
    sectionRowIndex: number,
    sectionColumnIndex: number,
    rowIndex: number,
    columnIndex: number,
    value: string
  ) => void;
  readOnly?: boolean;
}

/**
 * マンダラートの9×9グリッド全体を表示するコンポーネント
 *
 * 3×3のセクションを9個配置し、合計81個のセルで構成される9×9グリッドを形成します。
 * 入力データをpropsから直接計算し、セルの変更を効率的に処理します。
 * 各セクションはMandalartSectionコンポーネントで構成されます。
 *
 * @param themeName - マンダラートのテーマ名（中心セルに表示）
 * @param inputs - 全セルの入力データ配列
 * @param onInputChange - セルの値変更時のコールバック関数
 * @param readOnly - 読み取り専用モード（結果閲覧時など）
 */
export default function MandalartGrid({
  themeName,
  inputs,
  onInputChange,
  readOnly = false,
}: MandalartGridProps) {
  // propsから直接inputsMapを計算（オズボーンと同じ方式）
  const inputsMap = inputs.reduce(
    (acc, input) => {
      if (input.content) {
        const key = `${input.section_row_index}-${input.section_column_index}-${input.row_index}-${input.column_index}`;
        acc[key] = input.content;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <div className="mx-auto max-w-[1200px] overflow-x-auto">
      <div
        className="mx-auto grid grid-cols-3 gap-1 rounded-xl bg-surface p-4 shadow-lg"
        style={{ width: "1106px", height: "736px" }}
      >
        {[0, 1, 2].map(sectionRowIndex =>
          [0, 1, 2].map(sectionColumnIndex => (
            <MandalartSection
              key={`${sectionRowIndex}-${sectionColumnIndex}`}
              sectionRowIndex={sectionRowIndex}
              sectionColumnIndex={sectionColumnIndex}
              inputs={inputsMap}
              onCellChange={onInputChange}
              mandalartTheme={themeName}
              readOnly={readOnly}
            />
          ))
        )}
      </div>
    </div>
  );
}
