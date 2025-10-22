/**
 * ブラウザの戻るボタンやタブ切り替えで戻った時に最新データを取得するフック
 */
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const PREV_PATHNAME_KEY = "useAutoRefreshOnFocus_prevPathname";

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
