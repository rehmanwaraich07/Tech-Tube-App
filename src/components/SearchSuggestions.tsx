"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
}

export default function SearchSuggestions({
  query,
  onSuggestionClick,
  isVisible,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 2 && isVisible) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query, isVisible]);

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-lg shadow-lg z-50 max-h-80 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm"
          onClick={() => onSuggestionClick(suggestion)}
        >
          <Search className="h-4 w-4 text-gray-400" />
          <span className="flex-1">{suggestion}</span>
        </button>
      ))}
    </div>
  );
}
