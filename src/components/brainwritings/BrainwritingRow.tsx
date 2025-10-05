import BrainwritingUserCell from "./BrainwritingUserCell";
import IdeaCell from "./IdeaCell";

interface BrainwritingRowProps {
  userName: string; // 参加者名
  ideas: string[]; // アイデア配列（3つのアイデア）
  isHighlighted?: boolean; // 行全体をハイライトするか
  readOnly?: boolean; // 読み取り専用モード
  onIdeaChange?: (ideaIndex: number, value: string) => void; // アイデア変更時のコールバック
  rowIndex?: number; // 行のインデックス（アニメーション用）
}

export default function BrainwritingRow({
  userName,
  ideas,
  isHighlighted = false,
  readOnly = false,
  onIdeaChange,
  rowIndex = 0,
}: BrainwritingRowProps) {
  return (
    <div className="mb-0 flex">
      <BrainwritingUserCell userName={userName} rowIndex={rowIndex} />

      {Array.from({ length: 3 }, (_, colIndex) => (
        <IdeaCell
          key={colIndex}
          value={ideas[colIndex]}
          isHighlighted={isHighlighted}
          onChange={value => onIdeaChange?.(colIndex, value)}
          readOnly={readOnly}
          rowIndex={rowIndex}
          colIndex={colIndex}
        />
      ))}
    </div>
  );
}
