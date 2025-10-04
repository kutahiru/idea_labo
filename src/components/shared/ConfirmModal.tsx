"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "はい",
  cancelText = "キャンセル",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onCancel} />

      {/* モーダル本体 */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-gray-800">{title}</h2>
        <p className="mb-6 whitespace-pre-line text-gray-600">{message}</p>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
          {cancelText && (
            <button
              onClick={onCancel}
              className="transform rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-200 hover:shadow-lg"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="from-primary to-primary-hover transform rounded-lg bg-gradient-to-r px-8 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
