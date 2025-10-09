// モーダルのアクションボタンコンポーネント

interface ModalActionsProps {
  onClose: () => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
  submitLabel?: { create: string; edit: string };
}

export function ModalActions({
  onClose,
  isSubmitting,
  mode,
  submitLabel = { create: "確定", edit: "更新" },
}: ModalActionsProps) {
  return (
    <div className="flex justify-end space-x-3 border-t border-gray-100 pt-6">
      <button
        type="button"
        onClick={onClose}
        className="font-noto-sans-jp transform rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-200 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSubmitting}
      >
        キャンセル
      </button>
      <button
        type="submit"
        className="bg-primary hover:bg-primary/90 font-noto-sans-jp transform rounded-lg px-8 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
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
