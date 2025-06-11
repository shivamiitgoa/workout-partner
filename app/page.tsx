"use client"

import { useEffect, useRef, useState } from "react"
import { IntervalTimer } from "components/IntervalTimer/IntervalTimer"
import { Settings } from "components/Settings/Settings"
import { DEFAULT_SETTINGS, isValidSettings, Settings as SettingsType, STORAGE_KEY } from "components/Settings/types"

type TabType = 'timer' | 'music' | 'workout';

export default function Web() {
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabType>('timer');
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const tabs = [
    { id: 'timer' as TabType, label: '⏱️ Timer', icon: '⏱️' },
    { id: 'music' as TabType, label: '🎵 Music', icon: '🎵' },
    { id: 'workout' as TabType, label: '📋 Workout', icon: '📋' },
  ];

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

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force landscape orientation on mobile
  useEffect(() => {
    if (isMobile && 'screen' in window && 'orientation' in window.screen) {
      try {
        // @ts-expect-error - orientation API might not be fully typed
        window.screen.orientation.lock('landscape').catch(() => {
          // Silently fail if orientation lock is not supported
        });
      } catch {
        // Silently fail if orientation API is not supported
      }
    }
  }, [isMobile]);

  // Handle swipe gestures for tab switching
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches[0]) {
      touchStartX.current = e.targetTouches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches[0]) {
      touchEndX.current = e.targetTouches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    
    if (isLeftSwipe && currentIndex >= 0 && currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      if (nextTab) {
        setActiveTab(nextTab.id);
      }
    } else if (isRightSwipe && currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      if (prevTab) {
        setActiveTab(prevTab.id);
      }
    }

    // Reset touch values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (isMobile) {
    return (
      <>
        <div className="mobile-fullscreen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          {/* Landscape orientation hint */}
          <div className="md:hidden portrait:flex portrait:items-center portrait:justify-center portrait:h-full portrait:bg-black portrait:text-white portrait:text-center portrait:p-8 portrait-message">
            <div className="max-w-sm">
              <div className="text-6xl mb-4">📱➡️</div>
              <h2 className="text-2xl font-bold mb-4">Please Rotate Your Device</h2>
              <p className="text-lg opacity-80">
                This app works best in landscape mode for the optimal workout experience.
              </p>
              <div className="mt-6 text-sm opacity-60">
                Turn your phone sideways for the full experience!
              </div>
              <div className="mt-4 text-xs opacity-50">
                • Swipe left/right to switch between Timer, Music, and Workout<br/>
                • Tap the tabs at the top to navigate<br/>
                • Full-screen landscape mode for best experience
              </div>
            </div>
          </div>

          {/* Mobile landscape layout */}
          <div className="landscape:flex landscape:flex-col landscape:h-full portrait:hidden">
            {/* Tab Navigation */}
            <div className="flex bg-white shadow-lg z-20 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-2 text-center font-medium transition-all duration-200 border-b-4 active:scale-95 ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-500 shadow-sm'
                      : 'bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <div className="text-lg mb-1">{tab.icon}</div>
                  <div className="text-xs font-semibold">{tab.label.split(' ')[1]}</div>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div 
              className="flex-1 relative overflow-hidden hide-scrollbar"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Timer Tab */}
              <div
                className={`absolute inset-0 tab-content transition-all duration-300 ${
                  activeTab === 'timer' 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-full pointer-events-none'
                }`}
              >
                <IntervalTimer />
              </div>

              {/* Music Tab */}
              <div
                className={`absolute inset-0 tab-content transition-all duration-300 ${
                  activeTab === 'music' 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-full pointer-events-none'
                }`}
              >
                <iframe 
                  src={settings.youtubeUrl}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Workout Tab */}
              <div
                className={`absolute inset-0 tab-content transition-all duration-300 ${
                  activeTab === 'workout' 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-full pointer-events-none'
                }`}
              >
                <iframe 
                  src={settings.docsUrl}
                  className="h-full w-full border-0"
                  allow="clipboard-write"
                />
              </div>

              {/* Swipe indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                                 {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      activeTab === tab.id ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings button for mobile */}
        <div className="landscape:block portrait:hidden">
          <Settings />
        </div>
      </>
    );
  }

  // Desktop layout (original)
  return (
    <>
      <section className="bg-white dark:bg-gray-900">
        <div className="fixed left-0 top-0 h-1/2 w-1/2 border-r border-gray-200 dark:border-gray-700">
          <IntervalTimer />
        </div>
        <div className="fixed left-0 top-1/2 h-1/2 w-1/2 border-r border-gray-200 dark:border-gray-700">
          <iframe 
            src={settings.youtubeUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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
    </>
  )
}
