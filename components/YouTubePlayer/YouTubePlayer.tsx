"use client";

import React, { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  videoUrl: string;
  className?: string;
}

interface YouTubePlayer {
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
}

interface YouTubePlayerConstructor {
  new (element: HTMLElement, config: YouTubePlayerConfig): YouTubePlayer;
}

interface YouTubePlayerConfig {
  height: string;
  width: string;
  videoId?: string;
  playerVars: Record<string, unknown>;
  events: {
    onReady: (event: { target: YouTubePlayer }) => void;
    onError: (error: { data: number }) => void;
  };
}

declare global {
  interface Window {
    YT: {
      Player: YouTubePlayerConstructor;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl, className }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<YouTubePlayer | null>(null);
  const [volume, setVolume] = useState(50);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Extract playlist ID from URL
  const getPlaylistId = (url: string): string | null => {
    const match = url.match(/[?&]list=([^&]+)/);
    return match && match[1] ? match[1] : null;
  };

  const getVideoId = (url: string): string | null => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match && match[1] ? match[1] : null;
  };

  useEffect(() => {
    // Load YouTube API script
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else if (window.YT.Player) {
      initializePlayer();
    }

    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.log('Error destroying YouTube player:', error);
        }
      }
    };
  }, [videoUrl]);

  const initializePlayer = () => {
    if (!playerRef.current) return;

    const playlistId = getPlaylistId(videoUrl);
    const videoId = getVideoId(videoUrl);

    const playerVars: Record<string, unknown> = {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      fs: 1,
      cc_load_policy: 0,
      playsinline: 1,
    };

    if (playlistId) {
      playerVars.listType = 'playlist';
      playerVars.list = playlistId;
    }

    try {
      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId || undefined,
        playerVars,
        events: {
          onReady: (event: { target: YouTubePlayer }) => {
            setIsReady(true);
            // Set initial volume to 50%
            event.target.setVolume(50);
            setVolume(50);
          },
          onError: (error: { data: number }) => {
            console.error('YouTube Player Error:', error);
          },
        },
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerInstanceRef.current && isReady) {
      try {
        playerInstanceRef.current.setVolume(newVolume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  };

  const toggleMute = () => {
    if (playerInstanceRef.current && isReady) {
      try {
        if (playerInstanceRef.current.isMuted()) {
          playerInstanceRef.current.unMute();
          setVolume(playerInstanceRef.current.getVolume() || 50);
        } else {
          playerInstanceRef.current.mute();
          setVolume(0);
        }
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  };

  // Auto-hide controls after 3 seconds of no interaction
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const handleInteraction = () => resetTimeout();

    // Set initial timeout
    resetTimeout();

    // Add event listeners for interaction
    document.addEventListener('mousemove', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('click', handleInteraction);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={playerRef} className="w-full h-full" />
      
      {/* Volume Controls Overlay */}
      <div 
        className={`absolute bottom-4 right-4 flex items-center gap-3 bg-black/70 backdrop-blur rounded-lg px-3 py-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onMouseEnter={() => setShowControls(true)}
      >
        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className="text-white hover:text-gray-300 transition-colors"
        >
          {volume === 0 ? (
            // Muted icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : volume < 50 ? (
            // Low volume icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            </svg>
          ) : (
            // High volume icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
          />
          <span className="text-white text-xs font-medium w-8 text-right">
            {Math.round(volume)}%
          </span>
        </div>
      </div>
    </div>
  );
}; 