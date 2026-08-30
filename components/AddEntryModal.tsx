'use client';

import { useState, useEffect } from 'react';
import { createMediaItem } from '@/lib/api-client';
import { MediaType, ReadingStatus } from '@/types';
import { X } from 'lucide-react';
import EntryFormFields from './shared/EntryFormFields';
import { READING_MEDIA_TYPES, COMMON_TAGS } from './shared/constants';
import { modalOverlay, modalContainer, modalHeader, modalTitle, closeButton, formContainer, buttonPrimary, buttonSecondary } from './shared/styles';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEntryModal({
  isOpen,
  onClose,
  onSuccess,
}: AddEntryModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;
    if (!isOngoing && !completedChapters) return;
    if (status === 'reading' && !currentValue) return;

    try {
      setLoading(true);
      await createMediaItem({
        title: title.trim(),
        author: author.trim() || undefined,
        type,
        tags: selectedTags,
        cover_image_url: coverImageUrl.trim() || null,
        completed_chapters: !isOngoing && completedChapters ? parseInt(completedChapters, 10) : null,
        current_value: currentValue ? parseInt(currentValue, 10) : 0,
        is_ongoing: isOngoing,
        status,
      });
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('error creating item:', error);
      alert(error instanceof Error ? error.message : 'could not save this entry, please try again.');
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

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCoverImageUrl('');
    setType('book');
    setSelectedTags([]);
    setCompletedChapters('');
    setCurrentValue('');
    setIsOngoing(false);
    setStatus('reading');
    setCustomTag('');
  };

  // reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={modalOverlay}>
      <div className={modalContainer}>
        <div className={modalHeader}>
          <h2 className={modalTitle}>
            Log New Reading
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
              modalTitle: 'Log New Reading',
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
            onClick={() => {
              resetForm();
              onClose();
            }}
              className={buttonSecondary}
          >
            Cancel
          </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || (!isOngoing && !completedChapters) || (status === 'reading' && !currentValue)}
              className={buttonPrimary}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
