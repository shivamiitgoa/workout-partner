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

  // Force landscape orientation and fullscreen on mobile
  useEffect(() => {
    if (isMobile) {
      // Request fullscreen
      const requestFullscreen = async () => {
        try {
          const elem = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
          };
          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }
        } catch {
          console.log('Fullscreen not supported or denied');
        }
      };

      // Lock orientation to landscape
      if ('screen' in window && 'orientation' in window.screen) {
        try {
          // @ts-expect-error - orientation API might not be fully typed
          window.screen.orientation.lock('landscape').catch(() => {
            // Silently fail if orientation lock is not supported
          });
        } catch {
          // Silently fail if orientation API is not supported
        }
      }

      // Hide address bar on mobile Safari
      const hideAddressBar = () => {
        window.scrollTo(0, 1);
        setTimeout(() => window.scrollTo(0, 0), 0);
      };

      // Request fullscreen on first user interaction
      const handleFirstInteraction = () => {
        requestFullscreen();
        hideAddressBar();
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('click', handleFirstInteraction);
      };

      document.addEventListener('touchstart', handleFirstInteraction);
      document.addEventListener('click', handleFirstInteraction);

      // Initial hide address bar attempt
      setTimeout(hideAddressBar, 1000);

      return () => {
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('click', handleFirstInteraction);
      };
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
                • Tap the floating buttons at the top to navigate<br/>
                • Use the fullscreen button (⛶) in the top right<br/>
                • Add to Home Screen for app-like experience<br/>
                • Enable sound by starting the timer
              </div>
            </div>
          </div>

          {/* Mobile landscape layout */}
          <div className="landscape:h-full portrait:hidden relative">
            {/* Floating Navigation Buttons */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 floating-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 active:scale-95 floating-button ${
                    activeTab === tab.id
                      ? 'bg-indigo-500 text-white shadow-indigo-200'
                      : 'bg-white/90 backdrop-blur text-gray-600 hover:bg-white hover:shadow-xl'
                  }`}
                >
                  <div className="text-xl">{tab.icon}</div>
                </button>
              ))}
            </div>

            {/* Floating Fullscreen Button */}
            <button
              onClick={() => {
                const elem = document.documentElement as HTMLElement & {
                  webkitRequestFullscreen?: () => Promise<void>;
                };
                const doc = document as Document & {
                  webkitExitFullscreen?: () => Promise<void>;
                };
                if (!document.fullscreenElement) {
                  if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                  } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                  }
                } else {
                  if (doc.exitFullscreen) {
                    doc.exitFullscreen();
                  } else if (doc.webkitExitFullscreen) {
                    doc.webkitExitFullscreen();
                  }
                }
              }}
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur text-gray-500 hover:text-gray-700 hover:bg-white shadow-lg transition-all duration-200 flex items-center justify-center floating-button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            </button>

            {/* Tab Content - Full Height */}
            <div 
              className="h-full relative overflow-hidden hide-scrollbar"
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

                            {/* Swipe indicators - smaller and more subtle */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      activeTab === tab.id ? 'bg-white/80' : 'bg-white/30'
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
