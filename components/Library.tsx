'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMediaItems } from '@/lib/supabase-client';
import { ReadingStatus, MediaItem } from '@/types';
import MediaCard from './MediaCard';
import AddEntryModal from './AddEntryModal';
import { Plus, Search, Maximize2, Minimize2 } from 'lucide-react';
import { filterButtonActive, filterButtonInactive } from './shared/styles';
import ThemeToggle from './ThemeToggle';

export default function Library() {
  // Main nav tab (Reading/Watching), watching to be implemented 
  const [activeTab, setActiveTab] = useState<'reading' | 'watching'>('reading');
  // Reading status filter (none selected by default)
  const [activeFilter, setActiveFilter] = useState<ReadingStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Always fetch all items for the current section; filtering is done client-side
      const data = await getMediaItems();
      setItems(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    // console.log('library render, items:', items.length, 'tab:', activeTab);
  }, [fetchItems]);

  const mainTabs = [
    { label: 'Reading', value: 'reading' },
    { label: 'Watching', value: 'watching' },
  ];

  const filterTabs: { label: string; value: ReadingStatus | 'all' }[] = [
    { label: 'Reading', value: 'reading' },
    { label: 'To-Read', value: 'to-read' },
    { label: 'Completed', value: 'finished' },
  ];

  const search = searchQuery.trim().toLowerCase();

  // retrieve all items from the db
  let visibleItems = items;

  if (activeFilter) {
    visibleItems = visibleItems.filter((item) => item.status === activeFilter);
  }

  // if search query, match it against the title
  if (search) {
    visibleItems = visibleItems.filter((item) =>
      item.title.toLowerCase().includes(search)
    );
  }

  // keep backend order (updated_at) unless a filter or search
  const filteredItems =
    activeFilter || search
      ? [...visibleItems].sort((a, b) => a.title.localeCompare(b.title))
      : visibleItems;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="font-title text-2xl font-bold text-accent">
                LogKeep
              </h1>
              
              {/* Navigation */}
              <div className="flex gap-1">
                {mainTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      if (tab.value === 'reading') {
                        setActiveTab('reading');
                      }
                    }}
                    className={`px-4 py-2 font-sans text-sm font-medium transition-colors border-b-2 ${
                      tab.value === 'reading'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* search + toggle */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-light-text-secondary dark:text-dark-text-secondary">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setIsTransitioning(true);
                    setSearchQuery(e.target.value);
                    setTimeout(() => setIsTransitioning(false), 150);
                  }}
                  placeholder="Search by title"
                  className="w-64 max-w-xs pl-9 pr-10 py-2 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-secondary dark:placeholder:text-dark-text-secondary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                className="flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:text-accent transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-[73px] z-10 bg-light-bg dark:bg-dark-bg transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setActiveFilter((current) =>
                      current === tab.value ? null : (tab.value as ReadingStatus)
                    );
                    setTimeout(() => setIsTransitioning(false), 50);
                  }, 150);
                }}
                className={activeFilter === tab.value ? filterButtonActive : filterButtonInactive}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
            Loading library...
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-400">
            Error loading library: {error.message}
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
            <p className="mb-4">No items in this category yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-accent text-light-bg dark:text-dark-bg rounded-lg font-sans font-medium hover:opacity-90 transition-opacity"
            >
              Add Your First Entry
            </button>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div 
            className={`grid gap-4 transition-opacity duration-150 ${
              isExpanded 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
            } ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {filteredItems.map((item: MediaItem) => (
              <MediaCard key={item.id} item={item} onUpdate={fetchItems} isCollapsed={!isExpanded} />
            ))}
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-light-bg dark:text-dark-bg rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-20"
        aria-label="Add new entry"
      >
        <Plus size={24} />
      </button>

      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchItems();
        }}
      />
    </div>
  );
}
