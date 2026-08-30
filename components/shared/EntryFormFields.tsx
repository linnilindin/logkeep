'use client';

import { useState, useRef, useEffect } from 'react';
import { MediaType, ReadingStatus, SearchResult } from '@/types';
import { X } from 'lucide-react';
import { STATUS_OPTIONS } from './constants';
import { label, input, buttonStatusActive, buttonStatusInactive } from './styles';
import MediaSearch from '../MediaSearch';

export interface EntryFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  author: string;
  setAuthor: (value: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (value: string) => void;
  type: MediaType | string;
  setType: (value: MediaType | string) => void;
  selectedTags: string[];
  setSelectedTags: (value: string[] | ((prev: string[]) => string[])) => void;
  completedChapters: string;
  setCompletedChapters: (value: string) => void;
  currentValue: string;
  setCurrentValue: (value: string) => void;
  isOngoing: boolean;
  setIsOngoing: (value: boolean) => void;
  status: ReadingStatus;
  setStatus: (value: ReadingStatus) => void;
  customTag: string;
  setCustomTag: (value: string) => void;
  
  // config
  mediaTypes: Array<{ value: string; label: string }>;
  mode: 'reading' | 'watching';
  labels: {
    modalTitle: string;
    currentProgressLabel: string;
    completedLabel: string;
  };
  
  // tags
  toggleTag: (tag: string) => void;
  addCustomTag: () => void;
  removeTag: (tag: string) => void;
  commonTags: string[];
}

export default function EntryFormFields({
  title,
  setTitle,
  author,
  setAuthor,
  coverImageUrl,
  setCoverImageUrl,
  type,
  setType,
  selectedTags,
  completedChapters,
  setCompletedChapters,
  currentValue,
  setCurrentValue,
  isOngoing,
  setIsOngoing,
  status,
  setStatus,
  customTag,
  setCustomTag,
  mediaTypes,
  mode,
  labels,
  toggleTag,
  addCustomTag,
  removeTag,
  commonTags,
}: EntryFormFieldsProps) {
  const showProgressFields = mode === 'reading' || (mode === 'watching' && type !== 'movie');
  const showCurrentProgress = mode === 'reading' ? status === 'reading' : showProgressFields;
  
  // Track original title to detect if user has manually edited it
  const originalTitleRef = useRef<string>(title);
  const [hasTitleBeenEdited, setHasTitleBeenEdited] = useState(false);
  const lastTitleRef = useRef<string>(title);
  const isUserTypingRef = useRef<boolean>(false);
  
  // When title prop changes, check if it was from user typing or parent setting it
  useEffect(() => {
    // If user wasn't typing and title changed, parent set it (like modal opening)
    if (!isUserTypingRef.current && title !== lastTitleRef.current) {
      originalTitleRef.current = title;
      setHasTitleBeenEdited(false);
    }
    lastTitleRef.current = title;
    isUserTypingRef.current = false;
  }, [title]);

  const handleTitleChange = (value: string) => {
    isUserTypingRef.current = true; // Mark that user is typing
    setTitle(value);
    // Mark as edited if value differs from original
    if (value !== originalTitleRef.current) {
      setHasTitleBeenEdited(true);
    } else {
      setHasTitleBeenEdited(false);
    }
  };

  const handleSearchResult = (result: SearchResult) => {
    isUserTypingRef.current = true; // User selected from search, treat as user edit
    setTitle(result.title);
    setHasTitleBeenEdited(true);
    if (result.author) {
      setAuthor(result.author);
    }
    if (result.coverImageUrl) {
      setCoverImageUrl(result.coverImageUrl);
    }
  };

    return (
    <>
      <div className="relative">
        <label className={label}>
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className={input}
          placeholder="Type title to search..."
        />
        {hasTitleBeenEdited && (
          <MediaSearch
            query={title}
            onSelectResult={handleSearchResult}
            mediaType={type}
            className="mt-1"
          />
        )}
      </div>

      <div>
        <label className={label}>
          Author
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className={input}
          placeholder="Author"
        />
      </div>

      <div>
        <label className={label}>
          Cover image url
        </label>
        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          className={input}
          placeholder="Paste link here."
        />
      </div>

      <div>
        <label className={label}>
          Type *
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className={`${input} pr-16`}
        >
          {mediaTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-lg font-sans text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-accent text-light-bg dark:text-dark-bg'
                  : 'bg-light-border dark:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:border-accent border border-transparent'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTag();
              }
            }}
            className={`${input} text-sm`}
            placeholder="Add custom tag"
          />
          <button
            type="button"
            onClick={addCustomTag}
            className="px-4 py-2 bg-accent text-light-bg dark:text-dark-bg rounded-lg font-sans text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </div>
        {selectedTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-accent/20 dark:bg-accent/20 border border-accent text-accent rounded text-xs font-sans"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-accent/70 transition-colors focus:outline-none"
                  aria-label={`Remove ${tag}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={label}>
          Status *
        </label>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={status === option.value ? buttonStatusActive : buttonStatusInactive}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={label}>
          Series Status *
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOngoing(true)}
            className={isOngoing ? buttonStatusActive : buttonStatusInactive}
          >
            Ongoing
          </button>
          <button
            type="button"
            onClick={() => setIsOngoing(false)}
            className={!isOngoing ? buttonStatusActive : buttonStatusInactive}
          >
            Completed
          </button>
        </div>
      </div>

      {showCurrentProgress && (
        <div>
          <label className={label}>
            {labels.currentProgressLabel} *
          </label>
          <input
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            required={mode === 'reading' && status === 'reading'}
            min="0"
            className={input}
            placeholder={mode === 'reading' ? '60' : '10'}
          />
        </div>
      )}

      {showProgressFields && !isOngoing && (
        <div>
          <label className={label}>
            {labels.completedLabel} *
          </label>
          <input
            type="number"
            value={completedChapters}
            onChange={(e) => setCompletedChapters(e.target.value)}
            required
            min="1"
            className={input}
            placeholder={mode === 'reading' ? '1100' : '24'}
          />
        </div>
      )}
    </>
  );
}

