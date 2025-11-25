import BrainwritingUserCell from "./BrainwritingUserCell";
import BrainwritingCell from "./BrainwritingCell";

interface BrainwritingRowProps {
  userName: string; // 参加者名
  ideas: string[]; // アイデア配列（3つのアイデア）
  isHighlighted?: boolean; // 行全体をハイライトするか
  readOnly?: boolean; // 読み取り専用モード
  onIdeaChange?: (ideaIndex: number, value: string) => void; // アイデア変更時のコールバック
  rowIndex?: number; // 行のインデックス（アニメーション用）
}

/**
 * ブレインライティングシートの1行を表示するコンポーネント
 *
 * 参加者名を表示するユーザーセルと、3つのアイデア入力セルで構成されます。
 * 編集中の行のハイライト表示、読み取り専用モード、アニメーション表示に対応します。
 *
 * @param userName - 参加者名
 * @param ideas - アイデア配列（3つのアイデア）
 * @param isHighlighted - 行全体をハイライトするか（編集中の行を強調表示）
 * @param readOnly - 読み取り専用モード（結果閲覧時など）
 * @param onIdeaChange - アイデア変更時のコールバック関数
 * @param rowIndex - 行のインデックス（アニメーション用）
 */
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
        <BrainwritingCell
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
