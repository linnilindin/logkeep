'use client';

import { MediaItem } from '@/types';
import { X } from 'lucide-react';
import {
  modalOverlay,
  modalContainer,
  modalHeader,
  modalTitle,
  closeButton,
  formContainer,
  input,
} from './shared/styles';

interface MediaDetailsProps{
  isOpen: boolean;
  item: MediaItem;
  updateValue: string;
  setUpdateValue: (value: string) => void;
  loading: boolean;
  isComplete: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onEdit: () => void;
}

export default function MediaDetails({
  isOpen,
  item,
  updateValue,
  setUpdateValue,
  loading,
  isComplete,
  onClose,
  onUpdate,
  onEdit,
}: MediaDetailsProps) {
  if (!isOpen) return null;

  const statusLabel =
    item.status === 'to-read'
      ? 'To-Read'
      : item.status === 'finished'
      ? 'Finished'
      : item.status === 'dropped'
      ? 'Dropped'
      : item.status;

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate();
  };

  return (
    <div className={modalOverlay} onClick={onClose}>
      <div className={modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={modalHeader}>
          <h2 className={modalTitle}>{item.title}</h2>
          <button
            onClick={onClose}
            className={closeButton}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className={formContainer}>
          {/* large cover */}
          <div className="w-1/2 mx-auto aspect-[2/3] bg-light-border dark:bg-dark-border rounded-lg overflow-hidden mb-4 flex flex-col">
            {item.cover_image_url ? (
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="flex-1 flex items-center justify-center px-3 pt-3">
                  <p className="text-sm leading-tight font-semibold text-light-text-primary dark:text-dark-text-primary text-center line-clamp-6">
                    {item.title}
                  </p>
                </div>
                <div className="flex-1" />
              </>
            )}
          </div>

          {/* meta */}
          <div className="mb-4 space-y-1">
            {item.author && (
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Author: <span className="font-medium">{item.author}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-xs text-light-text-secondary dark:text-dark-text-secondary">
              <span>Status: {statusLabel}</span>
              <span>•</span>
              <span>
                {item.is_ongoing ? 'Ongoing series' : 'Completed series'}
              </span>
            </div>
          </div>

          {/* progress + quick update */}
          <div className="mb-4 space-y-2">
            <div className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
              Current Progress
            </div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Chapter {item.current_value}
            </div>

            {!isComplete && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={updateValue}
                  onChange={(e) => setUpdateValue(e.target.value)}
                  placeholder="New chapter"
                  min={item.current_value}
                  className={`flex-1 px-2 py-1.5 text-xs ${input} no-spinner`}
                />
                <button
                  onClick={handleUpdate}
                  disabled={
                    loading ||
                    !updateValue ||
                    isNaN(parseInt(updateValue, 10)) ||
                    parseInt(updateValue, 10) < item.current_value
                  }
                  className="px-3 py-1.5 bg-accent text-light-bg dark:text-dark-bg rounded text-xs font-sans font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
            )}
          </div>

          {/* tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-light-border dark:bg-dark-border text-xs font-sans text-light-text-secondary dark:text-dark-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-sans text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="px-3 py-1.5 text-xs font-sans font-medium bg-accent text-light-bg dark:text-dark-bg rounded hover:opacity-90 transition-opacity"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

