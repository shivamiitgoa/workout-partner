"use client"

import React, { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../contexts/AuthContext';
import { getUserWorkoutNote, saveWorkoutNote } from '../../lib/workoutNotes';

interface MarkdownEditorProps {
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load user's workout note
  useEffect(() => {
    if (user?.uid) {
      loadWorkoutNote();
    }
  }, [user?.uid]);

  const loadWorkoutNote = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const note = await getUserWorkoutNote(user.uid);
      if (note) {
        setContent(note.content || '');
        setOriginalContent(note.content || '');
      } else {
        // Create empty note if none exists
        setContent('');
        setOriginalContent('');
      }
    } catch (error) {
      console.error('Error loading workout note:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!isEditMode || !user?.uid || content === originalContent) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        setSaving(true);
        await saveWorkoutNote(user.uid, content);
        setOriginalContent(content);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [content, isEditMode, user?.uid, originalContent]);

  const handleSave = async () => {
    if (!user?.uid) return;
    
    try {
      setSaving(true);
      await saveWorkoutNote(user.uid, content);
      setOriginalContent(content);
      setLastSaved(new Date());
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving workout note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(originalContent);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">Loading workout note...</div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Workout Notes
        </h2>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {saving && (
            <span className="text-xs text-blue-500">Saving...</span>
          )}
          {isEditMode ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {isEditMode ? (
          <div className="h-full" data-color-mode="auto">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height="100%"
              preview="edit"
              className="h-full"
              style={{ border: 'none' }}
            />
          </div>
        ) : (
          <div className="h-full overflow-auto p-4">
            {content ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p className="mb-2">No workout notes yet</p>
                  <p className="text-sm">Click "Edit" to start writing your workout plan</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 