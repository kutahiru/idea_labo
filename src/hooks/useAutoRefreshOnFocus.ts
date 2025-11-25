import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const PREV_PATHNAME_KEY = "useAutoRefreshOnFocus_prevPathname";

/**
 * ブラウザの戻るボタンやタブ切り替えで戻った時に自動で最新データを取得するカスタムフック
 *
 * 以下の2つのシナリオでページをリフレッシュします：
 * 1. パスが変わってページに戻ってきた時（ブラウザの戻るボタンなど）
 * 2. タブが非表示から表示に切り替わった時（タブ切り替え、モバイルアプリの復帰など）
 *
 * sessionStorageを使用してパスの変更を検出し、visibilitychangeイベントでタブの表示状態を監視します。
 * React Strict Modeでの二重実行を考慮した実装になっています。
 */
export function useAutoRefreshOnFocus() {
  const router = useRouter();
  const pathname = usePathname();
  const hasRunEffect = useRef(false);

  useEffect(() => {
    // sessionStorageから前回のpathnameを取得
    const prevPathname = sessionStorage.getItem(PREV_PATHNAME_KEY);

    // このコンポーネントインスタンスで初回実行の場合
    if (!hasRunEffect.current) {
      hasRunEffect.current = true;

      // pathnameが変わっている場合はリフレッシュ
      if (prevPathname !== null && prevPathname !== pathname) {
        sessionStorage.setItem(PREV_PATHNAME_KEY, pathname);
        router.refresh();
      } else {
        sessionStorage.setItem(PREV_PATHNAME_KEY, pathname);
      }
      return;
    }

    // 2回目以降の実行（Strict Modeの再実行）はスキップ
    sessionStorage.setItem(PREV_PATHNAME_KEY, pathname);
  }, [pathname, router]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    // タブが表示された時（タブ切り替えで戻る、モバイル対応）
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);
}
