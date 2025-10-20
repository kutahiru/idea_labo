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
  readOnly?: boolean;
}

export default function MandalartSection({
  sectionRowIndex,
  sectionColumnIndex,
  inputs,
  onCellChange,
  readOnly = false,
}: MandalartSectionProps) {
  const getCellValue = (rowIndex: number, columnIndex: number): string => {
    const key = `${sectionRowIndex}-${sectionColumnIndex}-${rowIndex}-${columnIndex}`;
    return inputs.get(key) || "";
  };

  const handleCellChange = (rowIndex: number, columnIndex: number, value: string) => {
    onCellChange(sectionRowIndex, sectionColumnIndex, rowIndex, columnIndex, value);
  };

  const isCenterCell = (rowIndex: number, columnIndex: number): boolean => {
    return rowIndex === 1 && columnIndex === 1;
  };

  return (
    <div className="border-primary/30 grid h-full w-full grid-cols-3 gap-1 rounded-lg border-2 bg-gray-50 p-1">
      {[0, 1, 2].map(rowIndex =>
        [0, 1, 2].map(columnIndex => (
          <MandalartCell
            key={`${rowIndex}-${columnIndex}`}
            value={getCellValue(rowIndex, columnIndex)}
            isCenter={isCenterCell(rowIndex, columnIndex)}
            readOnly={readOnly}
            onChange={value => handleCellChange(rowIndex, columnIndex, value)}
          />
        ))
      )}
    </div>
  );
}
