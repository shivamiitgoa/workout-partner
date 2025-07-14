"use client";

import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoUrl: string;
  className?: string;
}

interface YouTubePlayer {
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

  // Extract playlist ID from URL
  const getPlaylistId = (url: string): string | null => {
    // Handle different URL formats:
    // 1. Regular with playlist: https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
    // 2. Embed with playlist: https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID
    // 3. Just playlist ID: PLdxbvvtBD8SahRABv0it1KpIOrJSH_ORK
    
    // First check if it's just a playlist ID (starts with PL, UC, etc.)
    if (/^(PL|UC|UU|FL|RD)[a-zA-Z0-9_-]+$/.test(url.trim())) {
      return url.trim();
    }
    
    // Extract from URL parameters
    const match = url.match(/[?&]list=([^&]+)/);
    return match && match[1] ? match[1] : null;
  };

  const getVideoId = (url: string): string | null => {
    // Don't try to extract video ID if it's just a playlist ID
    if (/^(PL|UC|UU|FL|RD)[a-zA-Z0-9_-]+$/.test(url.trim())) {
      return null;
    }
    
    // Handle different YouTube URL formats
    // Regular: https://www.youtube.com/watch?v=VIDEO_ID
    // Embed: https://www.youtube.com/embed/VIDEO_ID
    // Short: https://youtu.be/VIDEO_ID
    
    // Check for embed URL first
    const embedMatch = url.match(/\/embed\/([^?&/]+)/);
    if (embedMatch && embedMatch[1] && embedMatch[1] !== 'videoseries') {
      return embedMatch[1];
    }
    
    // Check for regular watch URL
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }
    
    // Check for short URL
    const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
    if (shortMatch && shortMatch[1]) {
      return shortMatch[1];
    }
    
    return null;
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
      const config: YouTubePlayerConfig = {
        height: '100%',
        width: '100%',
        playerVars,
        events: {
          onReady: () => {
            // Player is ready
          },
          onError: (error: { data: number }) => {
            console.error('YouTube Player Error:', error);
          },
        },
      };

      // Only add videoId if we have one and no playlist, or if we have both
      if (videoId && !playlistId) {
        config.videoId = videoId;
      }

      playerInstanceRef.current = new window.YT.Player(playerRef.current, config);
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={playerRef} className="w-full h-full" />
    </div>
  );
}; 