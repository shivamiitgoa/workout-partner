"use client"

import { useEffect, useState } from "react"
import { IntervalTimer } from "../../components/IntervalTimer/IntervalTimer"
import { Settings } from "../../components/Settings/Settings"
import { DEFAULT_SETTINGS, isValidSettings, Settings as SettingsType, STORAGE_KEY } from "../../components/Settings/types"
import { YouTubePlayer } from "../../components/YouTubePlayer/YouTubePlayer"

export default function WorkoutPage() {
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
    <div className="h-full relative">
      <section className="bg-white dark:bg-gray-900 h-full grid grid-cols-2 grid-rows-2">
        {/* Timer - Top Left */}
        <div className="border-r border-b border-gray-200 dark:border-gray-700">
          <IntervalTimer />
        </div>
        
        {/* Docs - Top Right (spans 2 rows) */}
        <div className="row-span-2 border-b border-gray-200 dark:border-gray-700">
          <iframe 
            src={settings.docsUrl}
            className="h-full w-full"
            allow="clipboard-write"
          />
        </div>
        
        {/* YouTube Player - Bottom Left */}
        <div className="border-r border-gray-200 dark:border-gray-700">
          <YouTubePlayer
            videoUrl={settings.youtubeUrl}
            className="h-full w-full"
          />
        </div>
      </section>
      <Settings />
    </div>
  )
} 