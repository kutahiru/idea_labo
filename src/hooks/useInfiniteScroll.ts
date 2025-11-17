/**
 * IntersectionObserverを使用した無限スクロール機能を提供するカスタムフック
 */
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
