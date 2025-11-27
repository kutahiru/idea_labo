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

/**
 * 確認ダイアログモーダルコンポーネント
 *
 * ユーザーに確認を求める際に使用するシンプルなモーダルダイアログです。
 * タイトル、メッセージ、確認・キャンセルボタンで構成されます。
 * オーバーレイクリックでキャンセル操作が実行されます。
 *
 * @param isOpen - モーダルの表示状態
 * @param title - モーダルのタイトル
 * @param message - 確認メッセージ（改行対応）
 * @param confirmText - 確認ボタンのテキスト（デフォルト: "はい"）
 * @param cancelText - キャンセルボタンのテキスト（デフォルト: "キャンセル"）
 * @param onConfirm - 確認ボタンクリック時のコールバック関数
 * @param onCancel - キャンセルボタン/オーバーレイクリック時のコールバック関数
 */
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
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-foreground">{title}</h2>
        <p className="mb-6 whitespace-pre-line text-muted">{message}</p>

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          {cancelText && (
            <button
              onClick={onCancel}
              className="transform rounded-lg bg-surface-hover px-6 py-3 font-medium text-muted transition-all duration-200 hover:-translate-y-0.5 hover:bg-border hover:shadow-lg"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="bg-primary transform rounded-lg px-8 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
