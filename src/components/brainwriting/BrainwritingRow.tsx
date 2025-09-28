import ParticipantCell from "./ParticipantCell";
import IdeaCell from "./IdeaCell";

interface BrainwritingRowProps {
  participantName: string; // 参加者名
  ideas: string[]; // アイデア配列（3つのアイデア）
  onIdeaChange?: (ideaIndex: number, value: string) => void; // アイデア変更時のコールバック
  isHighlighted?: boolean; // 行全体をハイライトするか
  readOnly?: boolean; // 読み取り専用モード
}

export default function BrainwritingRow({
  participantName,
  ideas,
  onIdeaChange,
  isHighlighted = false,
  readOnly = false
}: BrainwritingRowProps) {
  return (
    <div className="mb-0 flex">
      <ParticipantCell participantName={participantName} />

      {Array.from({ length: 3 }, (_, colIndex) => (
        <IdeaCell
          key={colIndex}
          value={ideas[colIndex]}
          isHighlighted={isHighlighted}
          onChange={(value) => onIdeaChange?.(colIndex, value)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}