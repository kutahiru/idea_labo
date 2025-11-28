interface ModalActionsProps {
  onClose: () => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
  submitLabel?: { create: string; edit: string };
}

/**
 * モーダルのアクションボタン（キャンセル・送信）を提供する共通コンポーネント
 *
 * キャンセルボタンと送信ボタン（確定/更新）で構成されます。
 * モードに応じて送信ボタンのラベルが変わります（作成: "確定", 編集: "更新"）。
 *
 * @param onClose - キャンセルボタンクリック時のコールバック関数
 * @param isSubmitting - フォーム送信中かどうか
 * @param mode - モーダルのモード（"create": 新規作成, "edit": 編集）
 * @param submitLabel - 送信ボタンのカスタムラベル（デフォルト: { create: "確定", edit: "更新" }）
 */
export function ModalActions({
  onClose,
  isSubmitting,
  mode,
  submitLabel = { create: "確定", edit: "更新" },
}: ModalActionsProps) {
  return (
    <div className="flex justify-end space-x-3 border-t border-border pt-6">
      <button
        type="button"
        onClick={onClose}
        className="font-noto-sans-jp transform cursor-pointer rounded-lg bg-surface-hover px-6 py-3 font-medium text-muted transition-all duration-200 hover:-translate-y-0.5 hover:bg-border hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSubmitting}
      >
        キャンセル
      </button>
      <button
        type="submit"
        className="bg-primary hover:bg-primary/90 font-noto-sans-jp transform cursor-pointer rounded-lg px-8 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span>保存中...</span>
          </div>
        ) : (
          submitLabel[mode]
        )}
      </button>
    </div>
  );
}
