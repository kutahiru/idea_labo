"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import BrainwritingIndexRow from "./BrainwritingIndexRow";
import { BrainwritingListItem } from "@/types/brainwriting";
import { SearchIcon, LoadingSpinner } from "@/components/layout/Icons";
import SearchBar from "@/components/layout/SearchBar";

interface BrainwritingIndexProps {
  initialData: BrainwritingListItem[];
}

export default function BrainwritingIndex({ initialData }: BrainwritingIndexProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allData] = useState<BrainwritingListItem[]>(initialData);
  const [displayedData, setDisplayedData] = useState<BrainwritingListItem[]>(
    initialData.slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // ローカルデータから追加読み込み
  const loadMoreData = useCallback(() => {
    if (loading) return;

    const currentLength = displayedData.length;
    const hasMore = currentLength < allData.length;

    if (!hasMore) return;

    setLoading(true);
    // 視覚的に追加されたことが分かるような遅延
    setTimeout(() => {
      const nextData = allData.slice(0, currentLength + 10);
      setDisplayedData(nextData);
      setLoading(false);
    }, 300);
  }, [allData, displayedData.length, loading]);

  // IntersectionObserverは特定の要素が画面に表示されかたどうかを監視(無限スクロール用)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const hasMore = displayedData.length < allData.length;
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
  }, [loadMoreData, displayedData.length, allData.length, loading]);

  // 検索機能（全データから検索）
  const filteredBrainwritings = useMemo(() => {
    if (!searchTerm.trim()) {
      return displayedData;
    }

    return allData.filter(
      brainwriting =>
        brainwriting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brainwriting.themeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allData, displayedData, searchTerm]);

  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="タイトルまたはテーマで検索..."
        resultCount={searchTerm ? filteredBrainwritings.length : undefined}
      />

      {/* 検索結果 */}
      {filteredBrainwritings.length === 0 && searchTerm ? (
        // 0件の場合
        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <SearchIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">検索結果が見つかりません</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm}に一致するブレインライティングがありません
          </p>
        </div>
      ) : (
        // 0件以外の場合
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredBrainwritings.map(brainwriting => (
            <BrainwritingIndexRow key={brainwriting.id} {...brainwriting} />
          ))}

          {/* 無限スクロール用の監視要素 */}
          {!searchTerm && displayedData.length < allData.length && (
            <div ref={observerRef} className="min-h-[50px] py-4 text-center">
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2 text-sm text-gray-500">読み込み中...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-400">スクロールして続きを読み込む</div>
              )}
            </div>
          )}

          {/* 全データ表示完了メッセージ */}
          {!searchTerm && displayedData.length >= allData.length && allData.length > 10 && (
            <div className="py-4 text-center text-sm text-gray-400">全てのデータを表示しました</div>
          )}

          {/* 検索時の下部余白 */}
          {searchTerm && <div className="py-4"></div>}
        </div>
      )}
    </div>
  );
}
