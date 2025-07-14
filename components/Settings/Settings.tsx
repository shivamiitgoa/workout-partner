import React, { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, isValidSettings, Settings as SettingsType, STORAGE_KEY } from './types';

export const Settings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [tempSettings, setTempSettings] = useState<SettingsType>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        if (isValidSettings(parsedSettings)) {
          setSettings(parsedSettings);
          setTempSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  }, []);

  const handleSave = () => {
    setSettings(tempSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempSettings));
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempSettings(DEFAULT_SETTINGS);
  };

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  YouTube Playlist URL
                </label>
                <input
                  type="text"
                  value={tempSettings.youtubeUrl}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, youtubeUrl: e.target.value })
                  }
                  placeholder="PLdxbvvtBD8SahRABv0it1KpIOrJSH_ORK or full YouTube URL"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Supports: Playlist ID only, full YouTube URLs, or embed URLs
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Google Docs URL
                </label>
                <input
                  type="text"
                  value={tempSettings.docsUrl}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, docsUrl: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Workout Configuration URL
                </label>
                <input
                  type="text"
                  value={tempSettings.defaultWorkoutConfigUrl}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, defaultWorkoutConfigUrl: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleReset}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 