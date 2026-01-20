'use client';

import { useState } from 'react';
import { quickUpdateMediaItem, updateMediaItem } from '@/lib/supabase-client';
import { MediaItem } from '@/types';
import { Plus, Edit, Clock, CheckCircle2, Save, ChevronUp, User } from 'lucide-react';
import EditModal from './EditModal';

import {
  card,
  statusBadge,
  buttonIcon,
  buttonUpdate,
  input,
} from './shared/styles';

interface MediaCardProps {
  item: MediaItem;
  onUpdate: () => void;
  isCollapsed?: boolean;
}

export default function MediaCard({ item, onUpdate, isCollapsed = false }: MediaCardProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [updateValue, setUpdateValue] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleUpdate = async () => {
    if (!updateValue || isNaN(parseInt(updateValue, 10))) return;
    
    const newValue = parseInt(updateValue, 10);
    if (newValue < item.current_value) {
      alert('New value must be greater than current value');
      return;
    }

    try {
      setLoading(true);
      if (item.status === 'to-read') {
        // If the item was in the to-read list, bump it into active reading
        await updateMediaItem(item.id, {
          current_value: newValue,
          status: 'reading',
        });
      } else {
        await quickUpdateMediaItem(item.id, newValue);
      }
      setUpdateValue('');
      setExpanded(false);
      onUpdate();
    } catch (error) {
      console.error('error updating item:', error);
      alert('could not update this entry, try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = item.is_ongoing || !item.completed_chapters
    ? null
    : Math.min((item.current_value / item.completed_chapters) * 100, 100);

  const isComplete = !item.is_ongoing && item.completed_chapters && item.current_value >= item.completed_chapters;

  // Collapsed view
  if (isCollapsed) {
    const statusLabel = item.status === 'to-read' 
      ? 'To-Read' 
      : item.status === 'finished' 
      ? 'Finished' 
      : item.status === 'dropped'
      ? 'Dropped'
      : item.status;
    
    const subtitle = item.status === 'reading' 
      ? `Chapter ${item.current_value}`
      : statusLabel;

    return (
      <>
        <div
          className="relative rounded-lg hover:bg-light-border/40 dark:hover:bg-dark-border/40 transition-colors cursor-pointer"
          onClick={() => setIsDetailsOpen(true)}
        >
          {/* cover image */}
          <div className="w-full aspect-[2/3] rounded-lg mb-2 flex items-center justify-center p-1.5">
            {item.cover_image_url ? (
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full flex flex-col rounded bg-light-border dark:bg-dark-border">
                <div className="flex-1 flex items-center justify-center px-2 pt-2">
                  <p className="text-xs leading-tight font-semibold text-light-text-primary dark:text-dark-text-primary text-center line-clamp-4">
                    {item.title}
                  </p>
                </div>
                <div className="flex-1" />
              </div>
            )}
          </div>

          {/* title */}
          <div className="px-1 pb-1">
            <h3 className="font-sans text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 line-clamp-2">
              {item.title}
            </h3>
            {/* subtitle: chapter or status */}
            <div className="font-sans text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {subtitle}
            </div>
          </div>
        </div>

        <EditModal
          isOpen={isEditModalOpen}
          item={item}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            onUpdate();
          }}
        />
      </>
    );
  }

  // Expanded view
  return (
    <>
      <div 
        className={`${card} cursor-pointer`}
        onClick={() => setIsDetailsOpen(true)}
      >
        {/* edit icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditModalOpen(true);
          }}
          className={`absolute top-3 right-3 ${buttonIcon}`}
          aria-label="Edit entry"
        >
          <Edit size={16} />
        </button>

        {/* card content */}
        <div className="flex gap-4">
          {/* image placeholder */}
          <div className="flex-shrink-0 w-24 h-36 bg-light-border dark:bg-dark-border rounded border border-light-border dark:border-dark-border overflow-hidden transition-colors flex flex-col">
            {item.cover_image_url ? (
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <>
                <div className="flex-1 flex items-center justify-center px-2 pt-1">
                  <p className="text-xs leading-tight font-semibold text-light-text-primary dark:text-dark-text-primary text-center line-clamp-4">
                    {item.title}
                  </p>
                </div>
                <div className="flex-1" />
              </>
            )}
          </div>

          {/* content */}
          <div className="flex-1 min-w-0">
            {/* title */}
            <h3 className="font-sans text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 pr-8 line-clamp-2">
              {item.title}
            </h3>

            {/* status */}
            <div className="mb-2">
              <span className={statusBadge}>
                {item.status === 'to-read' ? 'To-Read' : item.status}
              </span>
            </div>

            {/* sbutitle */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {item.author && (
                <div className="flex items-center gap-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  <User size={12} />
                  <span className="truncate">{item.author}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {isComplete || (!item.is_ongoing && item.completed_chapters) ? (
                  <>
                    <CheckCircle2 size={12} />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Clock size={12} />
                    <span>Ongoing</span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-2">
              <div className="font-sans text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Chapter {item.current_value}
              </div>
            </div>

            {/* progress bar */}
            {progress !== null ? (
              <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5 overflow-hidden mb-3 transition-colors">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : (
              <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5 overflow-hidden mb-3 transition-colors">
                <div className="h-full bg-accent/30" />
              </div>
            )}

            {/* update button or input */}
            {!isComplete && (
              <div onClick={(e) => e.stopPropagation()}>
                {!expanded ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(true);
                    }}
                    className={buttonUpdate}
                  >
                    <Plus size={12} />
                    Update Chapter
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      placeholder="Chapter number"
                      min={item.current_value}
                      className={`flex-1 px-2 py-1.5 text-xs ${input} no-spinner`}
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdate();
                      }}
                      disabled={loading || !updateValue || isNaN(parseInt(updateValue, 10)) || parseInt(updateValue, 10) < item.current_value}
                      className="p-1.5 bg-accent text-light-bg dark:text-dark-bg rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Save"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(false);
                        setUpdateValue('');
                      }}
                      className="p-1.5 bg-light-border dark:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary rounded hover:bg-light-border/80 dark:hover:bg-dark-border/80 transition-colors"
                      aria-label="Cancel"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {isComplete && (
              <div className="w-full py-1.5 bg-green-900/20 border border-green-700 text-green-400 rounded text-xs font-sans font-medium text-center">
                Completed
              </div>
            )}
          </div>
        </div>
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        item={item}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          onUpdate();
        }}
      />
    </>
  );
}
