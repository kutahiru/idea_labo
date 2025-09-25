import { SearchIcon, CloseIcon } from "@/components/layout/Icons";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

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
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 pl-10 leading-5 placeholder-gray-500 transition-colors focus:border-blue-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {searchTerm && typeof resultCount === 'number' && (
        <p className="mt-2 text-sm text-gray-600">
          {searchTerm}の検索結果: {resultCount}件
        </p>
      )}
    </div>
  );
}