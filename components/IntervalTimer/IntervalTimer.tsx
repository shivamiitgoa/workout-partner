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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-4">
        {!showForm ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <select
                value={currentConfig?.id || ""}
                onChange={(e) => setCurrentConfig(e.target.value)}
                className="rounded border px-4 py-2"
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
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  New Workout
                </button>
              </div>
            </div>

            {currentConfig && (
              <div className="space-y-4 text-center">
                <h2 className="text-2xl font-bold">{currentConfig.name}</h2>
                {activeInterval && (
                  <>
                    <div className="text-lg">
                      Set {activeInterval.currentSet} of {activeInterval.totalSets} - Round {activeInterval.currentRound} of {activeInterval.totalRounds}
                    </div>
                    <div className="text-xl font-semibold">{activeInterval.name}</div>
                    <div className="mb-4 text-6xl font-bold">{formatTime(activeInterval.timeLeft)}</div>
                    <div className="h-2 rounded bg-gray-200">
                      <div
                        className="h-full rounded bg-blue-500 transition-all duration-1000"
                        style={{
                          width: `${(activeInterval.timeLeft / activeInterval.totalTime) * 100}%`,
                        }}
                      />
                    </div>
                  </>
                )}
                <div className="mt-4 flex justify-center space-x-2">
                  <button
                    onClick={handleStart}
                    className={`rounded px-6 py-3 text-white ${
                      isRunning && !isPaused ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {isRunning && !isPaused ? "Pause" : "Start"}
                  </button>
                  <button onClick={handleReset} className="rounded bg-gray-500 px-6 py-3 text-white hover:bg-gray-600">
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
