import { useState, useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollProps<T> {
  allData: T[];
  itemsPerPage?: number;
  loadingDelay?: number;
}

interface UseInfiniteScrollReturn<T> {
  displayedData: T[];
  loading: boolean;
  observerRef: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
}

/**
 * IntersectionObserverを使用した無限スクロール機能を提供するカスタムフック
 *
 * ユーザーが画面下部までスクロールすると自動的に次のデータを読み込み、
 * スムーズな無限スクロール体験を実現します。
 *
 * 主な機能：
 * - IntersectionObserverで監視要素が画面に入ったことを検知（閾値10%）
 * - ローディング遅延（デフォルト300ms）でユーザー体験を向上
 * - データ変更時の自動リセット（検索結果更新時など）
 * - ローディング状態の管理で重複読み込みを防止
 *
 * @param allData - 全データ配列（検索結果やフィルタ済みデータ）
 * @param itemsPerPage - 1回の読み込みで表示する件数（デフォルト: 20件）
 * @param loadingDelay - 読み込み遅延時間（ミリ秒、デフォルト: 300ms）
 * @returns displayedData - 現在表示中のデータ配列, loading - ローディング状態, observerRef - 監視要素への参照, hasMore - さらにデータがあるかどうか
 */
export function useInfiniteScroll<T>({
  allData,
  itemsPerPage = 20,
  loadingDelay = 300,
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> {
  const [displayedData, setDisplayedData] = useState<T[]>(allData.slice(0, itemsPerPage));
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const hasMore = displayedData.length < allData.length;

  // ローカルデータから追加読み込み
  const loadMoreData = useCallback(() => {
    if (loading || !hasMore) return;

    const currentLength = displayedData.length;

    setLoading(true);
    setTimeout(() => {
      const nextData = allData.slice(0, currentLength + itemsPerPage);
      setDisplayedData(nextData);
      setLoading(false);
    }, loadingDelay);
  }, [allData, displayedData.length, loading, hasMore, itemsPerPage, loadingDelay]);

  // IntersectionObserverの設定
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreData();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreData, hasMore, loading]);

  // allDataが変更された時にdisplayedDataをリセット
  useEffect(() => {
    setDisplayedData(allData.slice(0, itemsPerPage));
  }, [allData, itemsPerPage]);

  return {
    displayedData,
    loading,
    observerRef,
    hasMore,
  };
}
