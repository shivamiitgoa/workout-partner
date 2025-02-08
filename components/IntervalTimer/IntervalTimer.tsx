"use client"
import React, { useEffect, useRef, useState } from "react"
import { ConfigurationForm } from "./ConfigurationForm"
import { ActiveInterval, SoundType, WorkoutConfig } from "./types"
import { useWorkout } from "./WorkoutContext"

const BEEP_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"

const playBeepSequence = async (count: number) => {
  for (let i = 0; i < count; i++) {
    await new Promise((resolve) => setTimeout(resolve, i * 500))
    const audio = new Audio(BEEP_SOUND_URL)
    try {
      await audio.play()
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }
}


export const IntervalTimer: React.FC = () => {
  const { configs, currentConfig, setCurrentConfig } = useWorkout()
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<WorkoutConfig | undefined>(undefined)
  const [isRunning, setIsRunning] = useState(false)
  const [activeInterval, setActiveInterval] = useState<ActiveInterval | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateNextInterval = (
    config: WorkoutConfig,
    current: ActiveInterval | null = null
  ): ActiveInterval | null => {
    if (!config.sets.length) return null;

    if (!current) {
      // Start with preparation of first set
      const firstSet = config.sets[0];
      if (!firstSet) return null;

      return {
        type: "preparation",
        name: "Get Ready",
        timeLeft: firstSet.preparation,
        totalTime: firstSet.preparation,
        currentRound: 1,
        totalRounds: firstSet.repetitions,
        currentInterval: 0,
        totalIntervals: firstSet.intervals.length,
        currentSet: 1,
        totalSets: config.sets.length,
      }
    }

    const currentSet = config.sets[current.currentSet - 1];
    if (!currentSet) return null;

    if (current.type === "preparation") {
      // Move to first interval of the set
      const interval = currentSet.intervals[0];
      if (!interval) return null;
      return {
        type: "work",
        name: interval.name,
        timeLeft: interval.duration,
        totalTime: interval.duration,
        currentRound: 1,
        totalRounds: currentSet.repetitions,
        currentInterval: 1,
        totalIntervals: currentSet.intervals.length,
        currentSet: current.currentSet,
        totalSets: config.sets.length,
      }
    }

    // Move to next interval or round
    const nextIntervalIndex = current.currentInterval % currentSet.intervals.length;
    const completedRound = nextIntervalIndex === 0;
    const nextRound = completedRound ? current.currentRound + 1 : current.currentRound;

    if (nextRound > currentSet.repetitions) {
      // Move to next set
      const nextSetIndex = current.currentSet;
      if (nextSetIndex >= config.sets.length) {
        return null; // Workout complete
      }
      
      const nextSet = config.sets[nextSetIndex];
      if (!nextSet) return null;

      return {
        type: "preparation",
        name: "Get Ready",
        timeLeft: nextSet.preparation,
        totalTime: nextSet.preparation,
        currentRound: 1,
        totalRounds: nextSet.repetitions,
        currentInterval: 0,
        totalIntervals: nextSet.intervals.length,
        currentSet: nextSetIndex + 1,
        totalSets: config.sets.length,
      }
    }

    const interval = currentSet.intervals[nextIntervalIndex];
    if (!interval) return null;
    return {
      type: "work",
      name: interval.name,
      timeLeft: interval.duration,
      totalTime: interval.duration,
      currentRound: nextRound,
      totalRounds: currentSet.repetitions,
      currentInterval: nextIntervalIndex + 1,
      totalIntervals: currentSet.intervals.length,
      currentSet: current.currentSet,
      totalSets: config.sets.length,
    }
  }

  useEffect(() => {
    if (isRunning && !isPaused && currentConfig) {
      intervalRef.current = setInterval(() => {
        setActiveInterval((prev) => {
          if (!prev) return null;

          const currentSet = currentConfig.sets[prev.currentSet - 1];
          if (!currentSet) return null;

          // Get the sound type for the current interval
          let soundType: SoundType = 'no_beep';
          if (prev.type === "preparation") {
            soundType = currentSet.prepEndSound;
          } else {
            const currentInterval = currentSet.intervals[prev.currentInterval - 1];
            if (currentInterval) {
              soundType = currentInterval.endSound;
            }
          }

          // Play beeps at specific times based on sound type
          if (prev.timeLeft === 3 && soundType === 'three_beeps') {
            playBeepSequence(1);
          } else if (prev.timeLeft === 2 && soundType === 'three_beeps') {
            playBeepSequence(1);
          } else if (prev.timeLeft === 1) {
            if (soundType === 'three_beeps' || soundType === 'two_beeps') {
              playBeepSequence(1);
            }
          }

          if (prev.timeLeft <= 1) {
            // Play final beep for all sound types except 'no_beep'
            if (soundType !== 'no_beep') {
              playBeepSequence(1);
            }

            const next = calculateNextInterval(currentConfig, prev);
            if (!next) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              setIsPaused(false);
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
  }, [isRunning, isPaused, currentConfig]);

  const handleStart = () => {
    if (!currentConfig) return;

    if (!isRunning && !isPaused) {
      setActiveInterval(calculateNextInterval(currentConfig));
      setIsRunning(true);
    } else if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
    } else {
      setIsPaused(true);
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setIsPaused(false);
    setActiveInterval(null);
  };

  const handlePrevInterval = () => {
    if (!currentConfig || !activeInterval) return;

    const currentSet = currentConfig.sets[activeInterval.currentSet - 1];
    if (!currentSet) return;

    // If we're more than 5 seconds into the current interval, go to start of current interval
    if (activeInterval.totalTime - activeInterval.timeLeft > 5) {
      setActiveInterval({
        ...activeInterval,
        timeLeft: activeInterval.totalTime
      });
      return;
    }

    // Calculate previous interval
    let prevInterval: ActiveInterval | null = null;

    if (activeInterval.type === "work" && activeInterval.currentInterval === 1) {
      // Go to preparation phase if we're at first interval
      prevInterval = {
        type: "preparation",
        name: "Get Ready",
        timeLeft: currentSet.preparation,
        totalTime: currentSet.preparation,
        currentRound: activeInterval.currentRound,
        totalRounds: currentSet.repetitions,
        currentInterval: 0,
        totalIntervals: currentSet.intervals.length,
        currentSet: activeInterval.currentSet,
        totalSets: activeInterval.totalSets
      };
    } else if (activeInterval.type === "preparation" && activeInterval.currentSet > 1) {
      // Go to last interval of previous set
      const prevSet = currentConfig.sets[activeInterval.currentSet - 2];
      if (!prevSet) return;

      const lastInterval = prevSet.intervals[prevSet.intervals.length - 1];
      if (!lastInterval) return;

      prevInterval = {
        type: "work",
        name: lastInterval.name,
        timeLeft: lastInterval.duration,
        totalTime: lastInterval.duration,
        currentRound: prevSet.repetitions,
        totalRounds: prevSet.repetitions,
        currentInterval: prevSet.intervals.length,
        totalIntervals: prevSet.intervals.length,
        currentSet: activeInterval.currentSet - 1,
        totalSets: activeInterval.totalSets
      };
    } else if (activeInterval.type === "work") {
      // Go to previous interval in current set
      const prevIntervalIndex = activeInterval.currentInterval - 2;
      const interval = currentSet.intervals[prevIntervalIndex];
      if (!interval) return;

      prevInterval = {
        type: "work",
        name: interval.name,
        timeLeft: interval.duration,
        totalTime: interval.duration,
        currentRound: activeInterval.currentRound,
        totalRounds: currentSet.repetitions,
        currentInterval: activeInterval.currentInterval - 1,
        totalIntervals: currentSet.intervals.length,
        currentSet: activeInterval.currentSet,
        totalSets: activeInterval.totalSets
      };
    }

    if (prevInterval) {
      setActiveInterval(prevInterval);
    }
  };

  const handleNextInterval = () => {
    if (!currentConfig || !activeInterval) return;
    const next = calculateNextInterval(currentConfig, activeInterval);
    if (next) {
      setActiveInterval(next);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-6xl">
        {!showForm ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <select
                value={currentConfig?.id || ""}
                onChange={(e) => setCurrentConfig(e.target.value)}
                className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-lg bg-green-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  New Workout
                </button>
              </div>
            </div>

            {currentConfig && (
              <div className="flex flex-row items-center justify-between gap-8">
                {/* Left side: Workout details and controls */}
                <div className="flex w-2/5 flex-col space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">{currentConfig.name}</h2>
                    {activeInterval && (
                      <>
                        <div className="text-lg font-medium text-gray-600">
                          Set {activeInterval.currentSet} of {activeInterval.totalSets} - Round {activeInterval.currentRound} of {activeInterval.totalRounds}
                        </div>
                        <div className="text-2xl font-semibold text-gray-800">{activeInterval.name}</div>
                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                            style={{
                              width: `${(activeInterval.timeLeft / activeInterval.totalTime) * 100}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={handleStart}
                      className={`w-full rounded-lg px-8 py-4 text-xl font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isRunning && !isPaused 
                          ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500" 
                          : "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500"
                      }`}
                    >
                      {isRunning && !isPaused ? "Pause" : "Start"}
                    </button>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={handlePrevInterval}
                        disabled={!isRunning}
                        className="rounded-lg bg-gray-600 px-4 py-3 text-2xl text-white shadow-sm transition-colors hover:bg-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        ⏮️
                      </button>
                      <button
                        onClick={handleReset}
                        className="rounded-lg bg-gray-600 px-4 py-3 text-white shadow-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleNextInterval}
                        disabled={!isRunning}
                        className="rounded-lg bg-gray-600 px-4 py-3 text-2xl text-white shadow-sm transition-colors hover:bg-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        ⏭️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side: Timer display */}
                {activeInterval && (
                  <div className="flex w-3/5 items-center justify-center">
                    <div className="relative flex aspect-square w-full max-w-2xl items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-full rounded-full bg-indigo-50" />
                      </div>
                      <div className="relative text-[12rem] font-bold tracking-tighter text-gray-900">
                        {formatTime(activeInterval.timeLeft)}
                      </div>
                    </div>
                  </div>
                )}
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
