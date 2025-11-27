"use client";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * トグルスイッチコンポーネント
 *
 * ON/OFF状態を切り替えるためのトグルスイッチUIを提供します。
 * ラベル、スイッチ本体、状態表示（有効/無効）で構成されます。
 * スイッチの色と位置がアニメーションで切り替わり、無効状態もサポートします。
 *
 * @param label - スイッチのラベルテキスト
 * @param checked - 現在のON/OFF状態（true: ON, false: OFF）
 * @param onChange - 状態変更時のコールバック関数
 * @param disabled - スイッチを無効にするかどうか
 */
export default function ToggleSwitch({
  label,
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-muted">{label}：</span>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
          disabled ? "cursor-not-allowed" : ""
        } ${checked ? "bg-primary" : "bg-gray-400"}`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-surface transition-transform duration-300 ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${checked ? "text-primary" : "text-muted-foreground"}`}>
        {checked ? "有効" : "無効"}
      </span>
    </div>
  );
}
