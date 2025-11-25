import { Users } from "lucide-react";
import { XIcon } from "@/components/layout/Icons";
import { USAGE_SCOPE, USAGE_SCOPE_LABELS, UsageScope } from "@/utils/brainwriting";

interface UsageScopeSelectorProps {
  value: UsageScope;
  onChange: (value: UsageScope) => void;
  errors?: string;
  disabled?: boolean;
}

/**
 * ブレインライティングの利用方法選択コンポーネント
 *
 * X投稿版とチーム利用版の2つから選択できるラジオボタン形式のセレクターです。
 * アイコン付きのカード型UIで直感的に選択できます。
 * 編集時は変更できないようdisabled状態をサポートします。
 *
 * ブレインライティング固有のフォーム要素のため、IdeaFrameworkModalには追加していません。
 *
 * @param value - 現在選択されている利用方法
 * @param onChange - 利用方法変更時のコールバック関数
 * @param errors - バリデーションエラーメッセージ
 * @param disabled - 選択を無効にするかどうか（編集時など）
 */
export default function UsageScopeSelector({
  value,
  onChange,
  errors,
  disabled = false,
}: UsageScopeSelectorProps) {
  const errorClasses = "mt-1 text-sm text-red-500";

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="block text-sm font-semibold font-noto-sans-jp text-gray-700">利用方法</label>
        {disabled && <span className="text-xs text-gray-500">（編集時は変更できません）</span>}
      </div>
      <div className="flex space-x-4">
        <label className="flex-1 cursor-pointer">
          <input
            type="radio"
            value={USAGE_SCOPE.XPOST}
            checked={value === USAGE_SCOPE.XPOST}
            onChange={e => onChange(e.target.value as UsageScope)}
            className="sr-only"
            disabled={disabled}
          />
          <div
            className={`flex w-full items-center justify-center rounded-lg border-2 px-4 py-3 transition-all duration-200 ${
              value === USAGE_SCOPE.XPOST
                ? "bg-primary border-primary text-white shadow-lg"
                : "hover:border-primary border-gray-200 bg-white text-gray-700 hover:shadow-md"
            }`}
          >
            <div className="text-center">
              <XIcon className="mx-auto mb-1" size={20} />
              <span className="font-noto-sans-jp text-sm font-medium">{USAGE_SCOPE_LABELS[USAGE_SCOPE.XPOST]}</span>
            </div>
          </div>
        </label>
        <label className="flex-1 cursor-pointer">
          <input
            type="radio"
            value={USAGE_SCOPE.TEAM}
            checked={value === USAGE_SCOPE.TEAM}
            onChange={e => onChange(e.target.value as UsageScope)}
            className="sr-only"
            disabled={disabled}
          />
          <div
            className={`flex w-full items-center justify-center rounded-lg border-2 px-4 py-3 transition-all duration-200 ${
              value === USAGE_SCOPE.TEAM
                ? "bg-primary border-primary text-white shadow-lg"
                : "hover:border-primary border-gray-200 bg-white text-gray-700 hover:shadow-md"
            }`}
          >
            <div className="text-center">
              <Users size={20} className="mx-auto mb-1" />
              <span className="font-noto-sans-jp text-sm font-medium">{USAGE_SCOPE_LABELS[USAGE_SCOPE.TEAM]}</span>
            </div>
          </div>
        </label>
      </div>
      {errors && <p className={errorClasses}>{errors}</p>}
    </div>
  );
}
