'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchMedia } from '@/lib/api-client';
import { MediaType, SearchResult } from '@/types';

interface MediaSearchProps {
  query: string;
  onSelectResult: (result: SearchResult) => void;
  mediaType: MediaType | string;
  className?: string;
}

export default function MediaSearch({
  query,
  onSelectResult,
  mediaType,
  className = '',
}: MediaSearchProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search when query changes
  useEffect(() => {
    // clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // dont search if query is too short
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // wait 300ms after typing before searching
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchMedia(
          query,
          mediaType as MediaType
        );
        setResults(searchResults);
        setShowResults(searchResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    // cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, mediaType]);

  // close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result);
    setShowResults(false);
  };

  if (!showResults && !isSearching && query.trim().length < 2) {
    return null;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* search dropdown */}
      {(showResults || isSearching) && (
        <div className="absolute z-50 w-full mt-1 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Searching...
              </span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
              No results found. Try a different search term.
            </div>
          ) : (
            <ul className="py-1">
              {results.map((result, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-light-border dark:hover:bg-dark-border transition-colors text-left"
                  >
                    {result.coverImageUrl ? (
                      <img
                        src={result.coverImageUrl}
                        alt={result.title}
                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          // hide image if it fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-16 bg-light-border dark:bg-dark-border rounded flex-shrink-0 flex items-center justify-center">
                        <Search className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-light-text dark:text-dark-text truncate">
                        {result.title}
                      </div>
                      {result.author && (
                        <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
                          {result.author}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary capitalize">
                      {result.type}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

