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
