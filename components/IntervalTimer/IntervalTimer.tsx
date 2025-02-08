"use client";
import React, { useEffect, useRef, useState } from 'react';
import { ConfigurationForm } from './ConfigurationForm';
import { ActiveInterval, WorkoutConfig } from './types';
import { useWorkout } from './WorkoutContext';

const BEEP_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const IntervalTimer: React.FC = () => {
  const { configs, currentConfig, setCurrentConfig } = useWorkout();
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<WorkoutConfig | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);
  const [activeInterval, setActiveInterval] = useState<ActiveInterval | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(BEEP_SOUND_URL);
  }, []);

  const playBeep = async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  const calculateNextInterval = (config: WorkoutConfig, current: ActiveInterval | null = null): ActiveInterval | null => {
    if (!current) {
      // Start with preparation
      return {
        type: 'preparation',
        name: 'Get Ready',
        timeLeft: config.preparation,
        totalTime: config.preparation,
        currentRound: 1,
        totalRounds: config.repetitions,
        currentInterval: 0,
        totalIntervals: config.intervals.length,
      };
    }

    if (current.type === 'preparation') {
      // Move to first interval
      const interval = config.intervals[0];
      if (!interval) return null;
      return {
        type: 'work',
        name: interval.name,
        timeLeft: interval.duration,
        totalTime: interval.duration,
        currentRound: 1,
        totalRounds: config.repetitions,
        currentInterval: 1,
        totalIntervals: config.intervals.length,
      };
    }

    // Move to next interval or round
    const nextIntervalIndex = current.currentInterval % config.intervals.length;
    const completedRound = nextIntervalIndex === 0;
    const nextRound = completedRound ? current.currentRound + 1 : current.currentRound;

    if (nextRound > config.repetitions) {
      return null; // Workout complete
    }

    const interval = config.intervals[nextIntervalIndex];
    if (!interval) return null;
    return {
      type: 'work',
      name: interval.name,
      timeLeft: interval.duration,
      totalTime: interval.duration,
      currentRound: nextRound,
      totalRounds: config.repetitions,
      currentInterval: nextIntervalIndex + 1,
      totalIntervals: config.intervals.length,
    };
  };

  useEffect(() => {
    if (isRunning && currentConfig) {
      intervalRef.current = setInterval(() => {
        setActiveInterval((prev) => {
          if (!prev) return null;
          
          if (prev.timeLeft <= 1) {
            // Play sound when switching intervals
            playBeep();
            
            const next = calculateNextInterval(currentConfig, prev);
            if (!next) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
            }
            return next;
          }
          
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentConfig]);

  const handleStart = () => {
    if (!currentConfig) return;
    
    if (!isRunning) {
      setActiveInterval(calculateNextInterval(currentConfig));
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setActiveInterval(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md space-y-4">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <select
                value={currentConfig?.id || ''}
                onChange={(e) => setCurrentConfig(e.target.value)}
                className="px-4 py-2 border rounded"
              >
                <option value="">Select Workout</option>
                {configs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                {currentConfig && (
                  <button
                    onClick={() => {
                      setEditingConfig(currentConfig);
                      setShowForm(true);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  New Workout
                </button>
              </div>
            </div>

            {currentConfig && (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">{currentConfig.name}</h2>
                {activeInterval && (
                  <>
                    <div className="text-lg">
                      Round {activeInterval.currentRound} of {activeInterval.totalRounds}
                    </div>
                    <div className="text-xl font-semibold">{activeInterval.name}</div>
                    <div className="text-6xl font-bold mb-4">
                      {formatTime(activeInterval.timeLeft)}
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div
                        className="h-full bg-blue-500 rounded transition-all duration-1000"
                        style={{
                          width: `${(activeInterval.timeLeft / activeInterval.totalTime) * 100}%`,
                        }}
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-center space-x-2 mt-4">
                  <button
                    onClick={handleStart}
                    className={`px-6 py-3 rounded text-white ${
                      isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <ConfigurationForm
            onClose={() => {
              setShowForm(false);
              setEditingConfig(undefined);
            }}
            initialConfig={editingConfig}
          />
        )}
      </div>
    </div>
  );
}; 