import ToggleSwitch from "./ToggleSwitch";

interface ResultsPublicToggleProps {
  /** 結果公開の状態 */
  isResultsPublic: boolean;
  /** 更新中かどうか */
  isUpdating: boolean;
  /** 結果公開の状態を更新する関数 */
  onToggle: (newValue: boolean) => void;
}

/**
 * 結果公開トグルコンポーネント（ツールチップ付き）
 * マンダラートとオズボーンのチェックリストで共通利用
 */
export default function ResultsPublicToggle({
  isResultsPublic,
  isUpdating,
  onToggle,
}: ResultsPublicToggleProps) {
  return (
    <div className="group bg-primary/10 relative rounded-lg px-4 py-3">
      <ToggleSwitch
        label="結果公開"
        checked={isResultsPublic}
        onChange={onToggle}
        disabled={isUpdating}
      />
      <div className="bg-primary invisible absolute top-full left-1/2 z-10 mt-2 w-max max-w-80 -translate-x-1/2 rounded-lg p-3 text-sm text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
        <div className="bg-primary absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
        <p className="whitespace-pre-line">
          結果を公開すると、
          <br />
          公開リンクから誰でも結果を閲覧できます
        </p>
      </div>
    </div>
  );
}
