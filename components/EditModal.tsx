'use client';

import { useState, useEffect } from 'react';
import { updateMediaItem, deleteMediaItem } from '@/lib/api-client';
import { MediaItem, MediaType, ReadingStatus } from '@/types';
import { X, Trash2 } from 'lucide-react';
import EntryFormFields from './shared/EntryFormFields';
import { READING_MEDIA_TYPES, COMMON_TAGS } from './shared/constants';
import { modalOverlay, modalContainer, modalHeader, modalTitle, closeButton, formContainer, buttonPrimary, buttonSecondary } from './shared/styles';

interface EditModalProps {
  isOpen: boolean;
  item: MediaItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditModal({
  isOpen,
  item,
  onClose,
  onSuccess,
}: EditModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<MediaType>('book');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [completedChapters, setCompletedChapters] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [isOngoing, setIsOngoing] = useState(false);
  const [status, setStatus] = useState<ReadingStatus>('reading');
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setAuthor(item.author || '');
      setType(item.type);
      setCoverImageUrl(item.cover_image_url || '');
      setSelectedTags(item.tags || []);
      setCompletedChapters(item.completed_chapters?.toString() || '');
      setCurrentValue(item.current_value.toString());
      setIsOngoing(item.is_ongoing);
      setStatus(item.status);
      setCustomTag('');
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item || !title.trim()) return;
    if (!isOngoing && !completedChapters) return;

    try {
      setLoading(true);
      // The chapter field is hidden for some statuses, so only send it when set.
      const parsedCurrentValue = parseInt(currentValue, 10);

      await updateMediaItem(item.id, {
        title: title.trim(),
        author: author.trim() || undefined,
        type,
        tags: selectedTags,
        cover_image_url: coverImageUrl.trim() || null,
        ...(Number.isFinite(parsedCurrentValue) ? { current_value: parsedCurrentValue } : {}),
        completed_chapters: isOngoing ? null : (completedChapters ? parseInt(completedChapters, 10) : null),
        is_ongoing: isOngoing,
        status,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('error updating item:', error);
      alert(error instanceof Error ? error.message : 'could not update this entry, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    const confirmed = window.confirm(
      'Confirm delete?'
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteMediaItem(item.id);
      onSuccess(); // refresh lib
      onClose();
    } catch (error) {
      console.error('error deleting item:', error);
      alert(error instanceof Error ? error.message : 'could not delete this entry, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  if (!isOpen || !item) return null;

  return (
    <div className={modalOverlay}>
      <div className={modalContainer}>
        <div className={modalHeader}>
          <h2 className={modalTitle}>
            Edit Entry
          </h2>
          <button
            onClick={onClose}
            className={closeButton}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={formContainer}>
          <EntryFormFields
            title={title}
            setTitle={setTitle}
            author={author}
            setAuthor={setAuthor}
            coverImageUrl={coverImageUrl}
            setCoverImageUrl={setCoverImageUrl}
            type={type}
            setType={(value) => setType(value as MediaType)}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            completedChapters={completedChapters}
            setCompletedChapters={setCompletedChapters}
            currentValue={currentValue}
            setCurrentValue={setCurrentValue}
            isOngoing={isOngoing}
            setIsOngoing={setIsOngoing}
            status={status}
            setStatus={setStatus}
            customTag={customTag}
            setCustomTag={setCustomTag}
            mediaTypes={READING_MEDIA_TYPES}
            mode="reading"
            labels={{
              modalTitle: 'Edit Entry',
              currentProgressLabel: 'Current Chapter',
              completedLabel: 'Completed Chapters',
            }}
            toggleTag={toggleTag}
            addCustomTag={addCustomTag}
            removeTag={removeTag}
            commonTags={COMMON_TAGS}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white
               disabled:opacity-50 disabled:cursor-not-allowed transition-colors
               inline-flex items-center justify-center shrink-0"
              disabled={loading}
            >
              <Trash2 size={16} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={buttonSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || (!isOngoing && !completedChapters)}
              className={buttonPrimary}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
