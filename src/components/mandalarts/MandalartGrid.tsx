"use client";

import { useState } from "react";
import MandalartSection from "./MandalartSection";
import { MandalartInputData } from "@/types/mandalart";

interface MandalartGridProps {
  mandalartId: number;
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

export default function MandalartGrid({
  mandalartId,
  themeName,
  inputs,
  onInputChange,
  readOnly = false,
}: MandalartGridProps) {
  const [inputsMap, setInputsMap] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>();
    inputs.forEach(input => {
      if (input.content) {
        const key = `${input.section_row_index}-${input.section_column_index}-${input.row_index}-${input.column_index}`;
        map.set(key, input.content);
      }
    });
    return map;
  });

  const handleCellChange = (
    sectionRowIndex: number,
    sectionColumnIndex: number,
    rowIndex: number,
    columnIndex: number,
    value: string
  ) => {
    const key = `${sectionRowIndex}-${sectionColumnIndex}-${rowIndex}-${columnIndex}`;
    setInputsMap(prev => {
      const newMap = new Map(prev);
      if (value) {
        newMap.set(key, value);
      } else {
        newMap.delete(key);
      }
      return newMap;
    });

    onInputChange(sectionRowIndex, sectionColumnIndex, rowIndex, columnIndex, value);
  };

  return (
    <div className="mx-auto max-w-[1200px] overflow-x-auto">
      <div
        className="grid grid-cols-3 gap-1 rounded-xl bg-white p-4 shadow-lg"
        style={{ width: "1106px", height: "736px" }}
      >
        {[0, 1, 2].map(sectionRowIndex =>
          [0, 1, 2].map(sectionColumnIndex => (
            <MandalartSection
              key={`${sectionRowIndex}-${sectionColumnIndex}`}
              sectionRowIndex={sectionRowIndex}
              sectionColumnIndex={sectionColumnIndex}
              inputs={inputsMap}
              onCellChange={handleCellChange}
              mandalartTheme={themeName}
              readOnly={readOnly}
            />
          ))
        )}
      </div>
    </div>
  );
}
