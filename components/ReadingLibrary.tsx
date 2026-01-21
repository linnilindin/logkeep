'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMediaItems } from '@/lib/supabase-client';
import { ReadingStatus, MediaItem } from '@/types';
import MediaCard from './MediaCard';
import AddEntryModal from './AddEntryModal';
import { Plus, Search, Maximize2, Minimize2 } from 'lucide-react';
import { filterButtonActive, filterButtonInactive } from './shared/styles';
import ThemeToggle from './ThemeToggle';
import WatchingLibrary from './WatchingLibrary';

export default function ReadingLibrary() {
  // Main nav tab (Reading/Watching)
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
      // Always fetch all items for the current section; filtering done client-side
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
  }, [fetchItems]);

  const mainTabs = [
    { label: 'Reading', value: 'reading' as const },
    { label: 'Watching', value: 'watching' as const },
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

  // sort favourites to top
  const filteredItems = [...visibleItems].sort((a, b) => {
    if (a.is_favourite && !b.is_favourite) return -1;
    if (!a.is_favourite && b.is_favourite) return 1;

    // filtering or searching use title
    if (activeFilter || search) {
      return a.title.localeCompare(b.title);
    }

    // otherwise preserve backend ordering
    return 0;
  });

  const isReadingTab = activeTab === 'reading';

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Logo / main nav */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="font-title text-xl font-bold text-accent sm:text-2xl">
                  LogKeep
                </h1>

                {/* Navigation */}
                <div className="flex gap-1">
                  {mainTabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`px-3 py-1.5 font-sans text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                        activeTab === tab.value
                          ? 'border-accent text-accent'
                          : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* expand + theme (mobile only) */}
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary hover:text-accent transition-colors cursor-pointer"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface">
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* search + toggle (same for both tabs) */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
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
                  className="w-full sm:w-64 sm:max-w-xs pl-9 pr-10 py-2 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-secondary dark:placeholder:text-dark-text-secondary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                className="hidden sm:flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:text-accent transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {isReadingTab && (
        <>
          {/* Filters: scroll normally on mobile, sticky only on desktop */}
          <div className="bg-light-bg dark:bg-dark-bg transition-colors sm:sticky sm:top-[73px] sm:z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
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
                    className={`${
                      activeFilter === tab.value ? filterButtonActive : filterButtonInactive
                    } whitespace-nowrap`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reading Library Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="mb-4 font-title text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              Reading Library
            </h2>
            {loading && (
              <div className="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
                Loading reading library...
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
            {/* media cards */}
            {!loading && !error && filteredItems.length > 0 && (
              <div
                className={`grid gap-4 transition-opacity duration-150 ${
                  isExpanded
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
                } ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
              >
                {filteredItems.map((item: MediaItem) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onUpdate={fetchItems}
                    isCollapsed={!isExpanded}
                  />
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
        </>
      )}

      {!isReadingTab && <WatchingLibrary />}
    </div>
  );
}


