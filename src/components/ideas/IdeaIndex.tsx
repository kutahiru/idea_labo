"use client";

import { IdeaListItem } from "@/types/idea";
import { Search, Loader2 } from "lucide-react";
import SearchBar from "@/components/layout/SearchBar";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useSearch } from "@/hooks/useSearch";
import IdeaIndexRow from "./IdeaIndexRow";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface IdeaIndexProps {
  initialData: IdeaListItem[];
  onEdit?: (item: IdeaListItem) => void;
  onDelete?: (item: IdeaListItem) => void;
}

type SortOrder = "asc" | "desc" | null;

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * アイデア一覧をテーブル形式で表示するコンポーネント
 *
 * アイデア名での検索、重要度によるソート、無限スクロールによる段階的なデータ読み込みを提供します。
 * 重要度カラムのヘッダーをクリックすることで、降順・昇順・ソート解除の3状態を切り替えられます。
 *
 * @param initialData - サーバーから取得したアイデア一覧の初期データ
 * @param onEdit - アイデア編集時のコールバック関数（オプション）
 * @param onDelete - アイデア削除時のコールバック関数（オプション）
 */
export default function IdeaIndex({ initialData, onEdit, onDelete }: IdeaIndexProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // ソート済みデータ
  const sortedData = useMemo(() => {
    if (!sortOrder) return initialData;

    return [...initialData].sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;

      if (sortOrder === "desc") {
        return bPriority - aPriority; // 高→中→低
      } else {
        return aPriority - bPriority; // 低→中→高
      }
    });
  }, [initialData, sortOrder]);

  // 無限スクロール機能
  const { displayedData, loading, observerRef, hasMore } = useInfiniteScroll({
    allData: sortedData,
    itemsPerPage: 20,
    loadingDelay: 300,
  });

  // 検索機能
  const {
    searchTerm,
    setSearchTerm,
    filteredData: searchResults,
  } = useSearch({
    data: sortedData,
    searchFields: ["name"],
  });

  // 検索時は検索結果、通常時は表示データを使用
  const filteredIdeas = searchTerm ? searchResults : displayedData;

  // ソート切り替え
  const handleSortToggle = () => {
    if (sortOrder === null) {
      setSortOrder("desc"); // 高→中→低
    } else if (sortOrder === "desc") {
      setSortOrder("asc"); // 低→中→高
    } else {
      setSortOrder(null); // ソート解除
    }
  };

  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="アイデア名で検索..."
        resultCount={searchTerm ? filteredIdeas.length : undefined}
      />

      {/* 検索結果 */}
      {filteredIdeas.length === 0 && searchTerm ? (
        // 0件の場合
        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">検索結果が見つかりません</h3>
          <p className="mt-2 text-sm text-gray-500">{searchTerm}に一致するアイデアがありません</p>
        </div>
      ) : filteredIdeas.length === 0 ? (
        // データが0件の場合
        <div className="py-12 text-center">
          <h3 className="mt-4 text-sm font-medium text-gray-900">アイデアがまだありません</h3>
          <p className="mt-2 text-sm text-gray-500">新規作成ボタンからアイデアを追加してください</p>
        </div>
      ) : (
        // 0件以外の場合
        <motion.div
          className="overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <table className="min-w-full divide-y-2 divide-gray-400 overflow-hidden rounded-lg border-r-4 border-l-4 border-gray-400 bg-white shadow-md">
            <thead className="bg-primary text-white">
              <tr>
                <th className="w-24 px-3 py-3 text-center text-sm font-medium tracking-wider uppercase">
                  <button
                    onClick={handleSortToggle}
                    className="flex w-full items-center justify-center gap-1 transition-colors hover:text-gray-200"
                  >
                    重要度
                    {sortOrder === "desc" && <span>▼</span>}
                    {sortOrder === "asc" && <span>▲</span>}
                    {sortOrder === null && <span className="text-gray-300">⇅</span>}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium tracking-wider uppercase">
                  アイデア名
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium tracking-wider uppercase">
                  説明
                </th>
                <th className="w-32 px-2 py-3 text-center text-sm font-medium tracking-wider uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-400 bg-white">
              {filteredIdeas.map(idea => (
                <IdeaIndexRow
                  key={idea.id}
                  {...idea}
                  onEdit={onEdit ? () => onEdit(idea) : undefined}
                  onDelete={onDelete ? () => onDelete(idea) : undefined}
                />
              ))}
            </tbody>
          </table>

          {/* 無限スクロール用の監視要素 */}
          {!searchTerm && hasMore && (
            <div ref={observerRef} className="min-h-[50px] py-4 text-center">
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
          {!searchTerm && !hasMore && initialData.length > 20 && (
            <div className="py-4 text-center text-sm text-gray-400">全てのデータを表示しました</div>
          )}

          {/* 検索時の下部余白 */}
          {searchTerm && <div className="py-4"></div>}
        </motion.div>
      )}
    </div>
  );
}
