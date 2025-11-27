import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

/**
 * 検索入力フィールドを提供する共通コンポーネント
 *
 * 検索アイコン、入力フィールド、クリアボタン（×）、検索結果件数表示で構成されます。
 * 入力値がある場合はクリアボタンが表示され、ワンクリックで検索をリセットできます。
 * 検索結果件数が指定されている場合は、件数を表示します。
 *
 * @param searchTerm - 現在の検索キーワード
 * @param onSearchChange - 検索キーワード変更時のコールバック関数
 * @param placeholder - 入力フィールドのプレースホルダー（デフォルト: "検索..."）
 * @param resultCount - 検索結果の件数（指定時のみ件数を表示）
 */
export default function SearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "検索...",
  resultCount
}: SearchBarProps) {
  return (
    <div className="mb-6">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="block w-full rounded-lg border border-border bg-surface py-3 pr-3 pl-10 leading-5 placeholder-muted-foreground transition-colors focus:border-blue-500 focus:placeholder-muted-foreground focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-muted"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {searchTerm && typeof resultCount === 'number' && (
        <p className="mt-2 text-sm text-muted">
          {searchTerm}の検索結果: {resultCount}件
        </p>
      )}
    </div>
  );
}