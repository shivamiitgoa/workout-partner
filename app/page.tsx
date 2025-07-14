"use client"

import { useEffect, useState } from "react"
import { IntervalTimer } from "components/IntervalTimer/IntervalTimer"
import { Settings } from "components/Settings/Settings"
import { DEFAULT_SETTINGS, isValidSettings, Settings as SettingsType, STORAGE_KEY } from "components/Settings/types"
import { YouTubePlayer } from "components/YouTubePlayer/YouTubePlayer"
import { AuthWrapper, ProtectedRoute } from "components/Auth"

export default function Web() {
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        if (isValidSettings(parsedSettings)) {
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  }, []);

  return (
    <ProtectedRoute>
      {/* Auth wrapper for showing user profile or login */}
      <div className="fixed top-4 right-4 z-50">
        <AuthWrapper />
      </div>
      
      <section className="bg-white dark:bg-gray-900">
        <div className="fixed left-0 top-0 h-1/2 w-1/2 border-r border-gray-200 dark:border-gray-700">
          <IntervalTimer />
        </div>
        <div className="fixed left-0 top-1/2 h-1/2 w-1/2 border-r border-gray-200 dark:border-gray-700">
          <YouTubePlayer
            videoUrl={settings.youtubeUrl}
            className="h-full w-full"
          />
        </div>
        <div className="fixed right-0 top-0 h-screen w-1/2">
          <iframe 
            src={settings.docsUrl}
            className="h-full w-full"
            allow="clipboard-write"
          />
        </div>
      </section>
      <Settings />
    </ProtectedRoute>
  )
}
