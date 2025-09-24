"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import BrainwritingIndexRow from "./BrainwritingIndexRow";
import { BrainwritingListItem } from "@/types/brainwriting";

interface BrainwritingIndexProps {
  initialData: BrainwritingListItem[];
}

export default function BrainwritingIndex({ initialData }: BrainwritingIndexProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allData] = useState<BrainwritingListItem[]>(initialData); // 全データ
  const [displayedData, setDisplayedData] = useState<BrainwritingListItem[]>(
    initialData.slice(0, 10)
  ); // 表示データ
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

  // Intersection Observer の設定
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
      {/* 検索バー */}
      <div className="mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="タイトルまたはテーマで検索..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 pl-10 leading-5 placeholder-gray-500 transition-colors focus:border-blue-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            {searchTerm}の検索結果: {filteredBrainwritings.length}件
          </p>
        )}
      </div>

      {/* 検索結果 */}
      {filteredBrainwritings.length === 0 && searchTerm ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">検索結果が見つかりません</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm}に一致するブレインライティングがありません
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBrainwritings.map(brainwriting => (
            <BrainwritingIndexRow key={brainwriting.id} {...brainwriting} />
          ))}

          {/* 無限スクロール用の監視要素 */}
          {!searchTerm && displayedData.length < allData.length && (
            <div ref={observerRef} className="min-h-[50px] py-4 text-center">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
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
          {searchTerm && (
            <div className="py-4"></div>
          )}
        </div>
      )}
    </div>
  );
}
