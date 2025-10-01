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

export default function BrainwritingSheet({
  brainwritingRows = [],
  isAllReadOnly = false,
  activeRowIndex,
  onDataChange,
}: BrainwritingSheetProps) {
  return (
    <div className="mt-8">
      {/* グリッド */}
      <div className="mx-auto max-w-[1200px] overflow-x-auto">
        <div className="relative min-w-[1200px]">
          {/* ヘッダー行 */}
          <div className="mb-2 flex">
            <div className="w-60 text-center">
              <span className="text-3xl font-medium text-gray-400">参加者</span>
            </div>
            <div className="w-80 text-center">
              <span className="text-3xl font-medium text-gray-400">アイデア1</span>
            </div>
            <div className="w-80 text-center">
              <span className="text-3xl font-medium text-gray-400">アイデア2</span>
            </div>
            <div className="w-80 text-center">
              <span className="text-3xl font-medium text-gray-400">アイデア3</span>
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
              readOnly={isAllReadOnly || (activeRowIndex !== undefined && rowIndex !== activeRowIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
