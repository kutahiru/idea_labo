"use client";

import BrainwritingIndexRow from "./BrainwritingIndexRow";
import { BrainwritingListItem } from "@/types/brainwriting";
import { SearchIcon, LoadingSpinner } from "@/components/layout/Icons";
import SearchBar from "@/components/layout/SearchBar";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useSearch } from "@/hooks/useSearch";

interface BrainwritingIndexProps {
  initialData: BrainwritingListItem[];
}

export default function BrainwritingIndex({ initialData }: BrainwritingIndexProps) {
  // 無限スクロール機能
  const { displayedData, loading, observerRef, hasMore } = useInfiniteScroll({
    allData: initialData,
    itemsPerPage: 10,
    loadingDelay: 300
  });

  // 検索機能（全データから検索、通常時は表示データのみ）
  const { searchTerm, setSearchTerm, filteredData: searchResults } = useSearch({
    data: initialData,
    searchFields: ['title', 'themeName']
  });

  // 検索時は検索結果、通常時は表示データを使用
  const filteredBrainwritings = searchTerm ? searchResults : displayedData;

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
          {!searchTerm && hasMore && (
            <div ref={observerRef} className="col-span-1 lg:col-span-2 min-h-[50px] py-4 text-center">
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
          {!searchTerm && !hasMore && initialData.length > 10 && (
            <div className="col-span-1 lg:col-span-2 py-4 text-center text-sm text-gray-400">全てのデータを表示しました</div>
          )}

          {/* 検索時の下部余白 */}
          {searchTerm && <div className="py-4"></div>}
        </div>
      )}
    </div>
  );
}
