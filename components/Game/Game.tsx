'use client'

import { useCallback, useEffect, useState } from 'react'
import { playAlarm, playBeep } from './audioUtils'

type GameState = 'setup' | 'countdown' | 'timer' | 'outcome' | 'result'

interface GameData {
  task: string
  hours: number
  minutes: number
  outcome?: 'won' | 'lost' | 'draw'
  startTime?: number
  duration?: number
}

export default function Game() {
  const [state, setState] = useState<GameState>('setup')
  const [gameData, setGameData] = useState<GameData>({
    task: '',
    hours: 0,
    minutes: 25
  })
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [selectedOutcome, setSelectedOutcome] = useState<'won' | 'lost' | 'draw' | null>(null)
  const [countdown, setCountdown] = useState<number>(3)

  // Calculate total seconds for timer
  const calculateTotalSeconds = useCallback(() => {
    return (gameData.hours * 60 + gameData.minutes) * 60
  }, [gameData.hours, gameData.minutes])

  // Calculate time left based on start time and duration
  const calculateTimeLeft = useCallback(() => {
    if (!gameData.startTime || !gameData.duration) return 0
    
    const elapsed = Math.floor((Date.now() - gameData.startTime) / 1000)
    const remaining = gameData.duration - elapsed
    
    return Math.max(0, remaining)
  }, [gameData.startTime, gameData.duration])

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get timer color based on time remaining
  const getTimerColor = (seconds: number): string => {
    const totalSeconds = gameData.duration || calculateTotalSeconds()
    const percentage = seconds / totalSeconds
    
    if (percentage <= 0.1) return 'text-red-500' // Last 10%
    if (percentage <= 0.25) return 'text-yellow-500' // Last 25%
    return 'text-blue-500'
  }

  // Start the game with countdown
  const handleStart = () => {
    if (!gameData.task.trim()) return
    
    const totalSeconds = calculateTotalSeconds()
    const startTime = Date.now()
    
    setGameData(prev => ({
      ...prev,
      startTime,
      duration: totalSeconds
    }))
    setTimeLeft(totalSeconds)
    setCountdown(3)
    setState('countdown')
  }

  // Handle outcome selection
  const handleOutcomeSelect = (outcome: 'won' | 'lost' | 'draw') => {
    setSelectedOutcome(outcome)
    setGameData(prev => ({ ...prev, outcome }))
    setState('result')
  }

  // Reset game to initial state
  const resetGame = () => {
    setState('setup')
    setGameData({
      task: '',
      hours: 0,
      minutes: 25
    })
    setTimeLeft(0)
    setSelectedOutcome(null)
    setCountdown(3)
  }

  // Countdown effect
  useEffect(() => {
    if (state !== 'countdown') return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) {
          // Play countdown sound
          playBeep()
          return prev - 1
        } else {
          // Start the actual timer
          setState('timer')
          return 0
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state])

  // Timer effect - now based on actual elapsed time
  useEffect(() => {
    if (state !== 'timer') return

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      
      if (remaining <= 0) {
        // Play timer end sound
        playAlarm()
        setState('outcome')
        setTimeLeft(0)
      } else {
        setTimeLeft(remaining)
      }
    }, 100) // Update more frequently for smoother countdown

    return () => clearInterval(interval)
  }, [state, calculateTimeLeft])

  // Update page title with timer
  useEffect(() => {
    if (state === 'countdown') {
      document.title = `⏰ ${countdown}... - ${gameData.task}`
    } else if (state === 'timer' && timeLeft > 0) {
      document.title = `⏰ ${formatTime(timeLeft)} - ${gameData.task}`
    } else if (state === 'setup') {
      document.title = '🏆 Gamify Your Task'
    } else if (state === 'outcome') {
      document.title = '⏰ Time\'s up!'
    } else if (state === 'result') {
      const resultText = selectedOutcome === 'won' ? '🎉 YOU WON!' : 
                        selectedOutcome === 'lost' ? '💔 CHALLENGE LOST' : 
                        selectedOutcome === 'draw' ? '🤝 IT\'S A DRAW' : ''
      document.title = resultText
    }
  }, [state, timeLeft, gameData.task, selectedOutcome, countdown])

  // Auto-reset after result animation
  useEffect(() => {
    if (state === 'result') {
      const timer = setTimeout(() => {
        resetGame()
      }, 4000) // 4 seconds for animation

      return () => clearTimeout(timer)
    }
  }, [state])

  // Render setup state
  if (state === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            🏆 Gamify Your Task
          </h1>
          
          <div className="space-y-6">
            {/* Task Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Define Your Winning Outcome:
              </label>
              <textarea
                value={gameData.task}
                onChange={(e) => setGameData(prev => ({ ...prev, task: e.target.value }))}
                placeholder="e.g., Finalize the presentation slides&#10;Complete all sections&#10;Review and polish content"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none overflow-y-auto"
                style={{ minHeight: '80px', maxHeight: '120px' }}
              />
            </div>

            {/* Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Set the Time Limit:
              </label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={gameData.hours}
                    onChange={(e) => setGameData(prev => ({ ...prev, hours: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={gameData.minutes}
                    onChange={(e) => setGameData(prev => ({ ...prev, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={!gameData.task.trim() || (gameData.hours === 0 && gameData.minutes === 0)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render countdown state
  if (state === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-8">
          {/* Task Display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Mission:</h2>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{gameData.task}</div>
          </div>

          {/* Countdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="text-8xl font-mono font-bold text-blue-600 animate-pulse">
              {countdown}
            </div>
            <div className="text-xl text-gray-600 dark:text-gray-400 mt-4">
              Get ready...
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render timer state
  if (state === 'timer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-8">
          {/* Task Display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Mission:</h2>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{gameData.task}</div>
          </div>

          {/* Timer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className={`text-6xl font-mono font-bold ${getTimerColor(timeLeft)} transition-colors duration-300`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="text-gray-600 dark:text-gray-400 text-sm">
            ⏰ No pause or stop - stay focused!
          </div>
        </div>
      </div>
    )
  }

  // Render outcome selection state
  if (state === 'outcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ⏰ Time's up! Did you succeed?
            </h2>
            <div className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-wrap">{gameData.task}</div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleOutcomeSelect('won')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                🏆 Won
              </button>
              <button
                onClick={() => handleOutcomeSelect('draw')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                🤝 Draw
              </button>
              <button
                onClick={() => handleOutcomeSelect('lost')}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                💔 Lost
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render result state
  if (state === 'result') {
    const getResultContent = () => {
      switch (selectedOutcome) {
        case 'won':
          return {
            message: '🎉 YOU WON! 🎉',
            bgClass: 'bg-green-500',
            animation: 'animate-bounce'
          }
        case 'lost':
          return {
            message: '💔 CHALLENGE LOST',
            bgClass: 'bg-red-500',
            animation: 'animate-pulse'
          }
        case 'draw':
          return {
            message: '🤝 IT\'S A DRAW',
            bgClass: 'bg-gray-500',
            animation: 'animate-pulse'
          }
        default:
          return {
            message: '',
            bgClass: '',
            animation: ''
          }
      }
    }

    const result = getResultContent()

    return (
      <div className={`min-h-screen ${result.bgClass} flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className={`text-4xl font-bold text-white ${result.animation}`}>
            {result.message}
          </div>
          <div className="text-white text-lg mt-4 opacity-80">
            Resetting in a few seconds...
          </div>
        </div>
      </div>
    )
  }

  return null
} 