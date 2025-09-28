import BrainwritingRow from "./BrainwritingRow";

interface BrainwritingRow {
  name: string;
  ideas: string[];
}

interface BrainwritingSheetProps {
  brainwritingRows?: BrainwritingRow[];
  onDataChange?: (participantIndex: number, ideaIndex: number, value: string) => void;
  readOnly?: boolean;
  activeRowIndex?: number; // 現在編集可能な行のインデックス（指定しない場合は全行編集可能）
}

export default function BrainwritingSheet({
  brainwritingRows = [],
  onDataChange,
  readOnly = false,
  activeRowIndex,
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
          {brainwritingRows.map((participant, rowIndex) => (
            <BrainwritingRow
              key={rowIndex}
              participantName={participant.name}
              ideas={participant.ideas}
              onIdeaChange={(ideaIndex, value) => onDataChange?.(rowIndex, ideaIndex, value)}
              isHighlighted={rowIndex == activeRowIndex}
              readOnly={readOnly || (activeRowIndex !== undefined && rowIndex !== activeRowIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
