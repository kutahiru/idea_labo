import { Loader2, HelpCircle } from "lucide-react";

interface AIAutoInputButtonProps {
  /** AI生成中かどうか */
  isGenerating: boolean;
  /** AI生成を開始する関数 */
  onGenerate: () => void;
}

/**
 * AI自動入力ボタンコンポーネント
 * マンダラートとオズボーンのチェックリストで共通利用
 * ボタンとヘルプアイコン（ツールチップ付き）を表示
 */
export default function AIAutoInputButton({
  isGenerating,
  onGenerate,
}: AIAutoInputButtonProps) {
  return (
    <div className="mt-8 mb-6 flex justify-center">
      <div className="flex items-center gap-1">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`inline-flex items-center rounded-md px-6 py-2 text-base font-medium text-white shadow-lg transition-all duration-300 ${
            isGenerating
              ? "cursor-not-allowed bg-muted"
              : "menu-link cursor-pointer bg-primary hover:scale-105 hover:shadow-xl"
          }`}
        >
          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isGenerating ? "生成中..." : "AIで自動入力"}
        </button>
        <div className="group relative">
          <HelpCircle className="text-primary/40 hover:text-primary mt-0.5 h-5 w-5 cursor-help transition-colors" />
          <div className="bg-primary invisible absolute top-7 left-0 z-10 w-max max-w-80 rounded-lg p-3 text-sm text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 md:max-w-110">
            <div className="bg-primary absolute -top-1 left-3 h-2 w-2 rotate-45"></div>
            <p className="whitespace-pre-line">
              AIがテーマを元にアイデアを自動生成します。
              {"\n"}
              既に入力済みの項目は上書きされず、
              {"\n"}
              未入力の項目のみが更新されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
