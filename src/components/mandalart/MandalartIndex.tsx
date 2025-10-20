"use client";

import { Loader2, Search } from "lucide-react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { MandalartListItem } from "@/types/mandalart";
import SearchBar from "@/components/layout/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import MandalartIndexRow from "./MandalartIndexRow";

interface MandalartIndexProps {
  initialData: MandalartListItem[];
  onEdit?: (item: MandalartListItem) => void;
  onDelete?: (item: MandalartListItem) => void;
}

export default function MandalartIndex({ initialData, onEdit, onDelete }: MandalartIndexProps) {
  // 無限スクロール機能
  const { displayedData, loading, observerRef, hasMore } = useInfiniteScroll({
    allData: initialData,
    itemsPerPage: 10,
    loadingDelay: 300,
  });

  const {
    searchTerm,
    setSearchTerm,
    filteredData: searchResults,
  } = useSearch({
    data: initialData,
    searchFields: ["title", "themeName"],
  });

  // 検索機能
  const filterMandalarts = searchTerm ? searchResults : displayedData;

  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="タイトルまたはテーマで検索..."
        resultCount={searchTerm ? filterMandalarts.length : undefined}
      />

      {/* 検索結果 */}
      {filterMandalarts.length === 0 && searchTerm ? (
        // 0件の場合
        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">検索結果が見つかりません</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm}に一致するブレインライティングがありません
          </p>
        </div>
      ) : (
        // 0件以外の場合
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filterMandalarts.map((mandalart, index) => (
            <MandalartIndexRow
              key={mandalart.id}
              {...mandalart}
              onEdit={onEdit ? () => onEdit(mandalart) : undefined}
              onDelete={onDelete ? () => onDelete(mandalart) : undefined}
              index={index}
            />
          ))}

          {/* 無限スクロール用の監視要素 */}
          {!searchTerm && hasMore && (
            <div
              ref={observerRef}
              className="col-span-1 min-h-[50px] py-4 text-center lg:col-span-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-500">読み込み中...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-400">スクロールして続きを読み込む</div>
              )}
            </div>
          )}

          {/* 全データ表示完了メッセージ */}
          {!searchTerm && !hasMore && initialData.length > 10 && (
            <div className="col-span-1 py-4 text-center text-sm text-gray-400 lg:col-span-2">
              全てのデータを表示しました
            </div>
          )}

          {/* 検索時の下部余白 */}
          {searchTerm && <div className="py-4"></div>}
        </div>
      )}
    </div>
  );
}
