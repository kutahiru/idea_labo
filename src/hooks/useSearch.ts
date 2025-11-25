import { useState, useMemo } from "react";

interface UseSearchProps<T> {
  data: T[];
  searchFields: (keyof T)[];
}

interface UseSearchReturn<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredData: T[];
}

/**
 * 複数フィールドを対象とした検索フィルタリング機能を提供するカスタムフック
 *
 * 指定された複数のフィールドに対して部分一致検索を行い、
 * リアルタイムでフィルタリング結果を返します。
 *
 * 主な機能：
 * - 複数フィールドの横断検索（OR条件）
 * - 大文字小文字を区別しない検索
 * - useMemoによるパフォーマンス最適化
 * - 空の検索語の場合は全データを返却
 * - 文字列型フィールドのみを検索対象とする
 *
 * @param data - 検索対象の全データ配列
 * @param searchFields - 検索対象とするフィールド名の配列（複数指定可能）
 * @returns searchTerm - 現在の検索語, setSearchTerm - 検索語を更新する関数, filteredData - 検索結果のデータ配列
 */
export function useSearch<T>({ data, searchFields }: UseSearchProps<T>): UseSearchReturn<T> {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
}
