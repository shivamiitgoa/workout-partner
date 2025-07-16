'use client'

import { db } from '../../lib/firebase'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  updateDoc
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface OngoingGame {
  task: string
  startTime: Timestamp
  timeLimitSeconds: number
}

interface GameStats {
  gamesWon: number
  gamesTotal: number
}

interface GameHistoryItem {
  id: string
  time: Timestamp
  task: string
  timeLimitSeconds: number
  actualTimeSeconds: number
  result: string
  remark: string
}

export default function Game() {
  const { user, loading: authLoading } = useAuth()

  // --- Firestore state ---
  const [ongoingGame, setOngoingGame] = useState<OngoingGame | null>(null)
  const [gameStats, setGameStats] = useState<GameStats | null>(null)
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // --- Modal state ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingGameId, setEditingGameId] = useState<string | null>(null)
  const [editRemark, setEditRemark] = useState('')
  const [savingRemark, setSavingRemark] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoadingData(true)
    const userDocRef = doc(db, 'game', user.uid)

    // Listen to user doc for ongoingGame and gameStats
    const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.data()
      setOngoingGame(data?.ongoingGame || null)
      setGameStats(data?.gameStats || { gamesWon: 0, gamesTotal: 0 })
      setLoadingData(false)
    })

    // Listen to gameHistory subcollection
    const historyQuery = query(
      collection(userDocRef, 'gameHistory'),
      orderBy('time', 'desc')
    )
    const unsubHistory = onSnapshot(historyQuery, (querySnap) => {
      const history: GameHistoryItem[] = []
      querySnap.forEach(doc => history.push({ id: doc.id, ...doc.data() } as GameHistoryItem))
      setGameHistory(history)
    })

    return () => {
      unsubDoc()
      unsubHistory()
    }
  }, [user])

  // --- Local state for setup form ---
  const [setupTask, setSetupTask] = useState('')
  const [setupHours, setSetupHours] = useState(0)
  const [setupMinutes, setSetupMinutes] = useState(25)
  const [starting, setStarting] = useState(false)

  // Start a new game: write to Firestore
  async function handleStartGame() {
    if (!user || !setupTask.trim() || (setupHours === 0 && setupMinutes === 0)) return
    setStarting(true)
    const userDocRef = doc(db, 'game', user.uid)
    const totalSeconds = (setupHours * 60 + setupMinutes) * 60
    const now = Timestamp.now()
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef)
      if (!userDoc.exists()) {
        transaction.set(userDocRef, {
          displayName: user.displayName || '',
          email: user.email || '',
          ongoingGame: {
            task: setupTask,
            startTime: now,
            timeLimitSeconds: totalSeconds
          },
          gameStats: { gamesWon: 0, gamesTotal: 0 }
        })
      } else {
        transaction.update(userDocRef, {
          ongoingGame: {
            task: setupTask,
            startTime: now,
            timeLimitSeconds: totalSeconds
          }
        })
      }
    })
    setStarting(false)
    // The real-time listener will update the UI
  }

  // --- Timer/game state ---
  const [timerState, setTimerState] = useState<'countdown' | 'timer' | 'outcome' | 'result' | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(0)

  // When ongoingGame changes, reset timer state
  useEffect(() => {
    if (ongoingGame) {
      // Calculate elapsed time
      const start = ongoingGame.startTime.toDate()
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000)
      if (elapsed < 0) {
        // Future start time (shouldn't happen), fallback to countdown
        setTimerState('countdown')
        setCountdown(3)
      } else if (elapsed < ongoingGame.timeLimitSeconds) {
        // Timer is running, skip countdown
        setTimerState('timer')
        setCountdown(0)
        setTimeLeft(Math.max(0, ongoingGame.timeLimitSeconds - elapsed))
      } else {
        // Timer expired, go to outcome
        setTimerState('outcome')
        setCountdown(0)
        setTimeLeft(0)
      }
    } else {
      setTimerState(null)
      setCountdown(3)
      setTimeLeft(0)
    }
  }, [ongoingGame])

  // Countdown effect
  useEffect(() => {
    if (timerState !== 'countdown' || !ongoingGame) return
    if (countdown <= 0) {
      setTimerState('timer')
      // Set initial time left
      const start = ongoingGame.startTime.toDate()
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000)
      setTimeLeft(Math.max(0, ongoingGame.timeLimitSeconds - elapsed))
      return
    }
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timerState, countdown, ongoingGame])

  // Timer effect
  useEffect(() => {
    if (timerState !== 'timer' || !ongoingGame) return
    const start = ongoingGame.startTime.toDate()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000)
      const remaining = Math.max(0, ongoingGame.timeLimitSeconds - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        setTimerState('outcome')
      }
    }, 200)
    return () => clearInterval(interval)
  }, [timerState, ongoingGame])

  // --- Game completion handler ---
  async function handleCompleteGame(result: 'Early Win' | 'Won' | 'Loss' | 'Give Up' | 'Draw') {
    if (!user || !ongoingGame) return
    setTimerState('result')
    const userDocRef = doc(db, 'game', user.uid)
    const historyColRef = collection(userDocRef, 'gameHistory')
    const start = ongoingGame.startTime.toDate()
    const now = new Date()
    const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000)
    const timeLimit = ongoingGame.timeLimitSeconds
    let actualTimeSeconds = elapsed
    let finalResult = result
    if (result === 'Loss') {
      actualTimeSeconds = timeLimit
      finalResult = 'Loss'
    } else if (result === 'Early Win') {
      if (elapsed >= timeLimit) {
        finalResult = 'Won'
        actualTimeSeconds = timeLimit
      }
    } else if (result === 'Won') {
      actualTimeSeconds = timeLimit
    } else if (result === 'Give Up') {
      if (elapsed > timeLimit) actualTimeSeconds = timeLimit
    } else if (result === 'Draw') {
      // For draw, use elapsed or timeLimit, as appropriate
      actualTimeSeconds = Math.min(elapsed, timeLimit)
    }
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef)
      const userData = userDoc.data() || {}
      // Add to gameHistory
      await addDoc(historyColRef, {
        time: Timestamp.now(),
        task: ongoingGame.task,
        timeLimitSeconds: timeLimit,
        actualTimeSeconds,
        result: finalResult,
        remark: '',
      })
      // Update gameStats
      const stats = userData.gameStats || { gamesWon: 0, gamesTotal: 0 }
      let gamesWon = stats.gamesWon
      let gamesTotal = stats.gamesTotal
      gamesTotal += 1
      if (finalResult === 'Early Win' || finalResult === 'Won') gamesWon += 1
      transaction.update(userDocRef, {
        gameStats: { gamesWon, gamesTotal },
        ongoingGame: null
      })
    })
    // Show result for a few seconds, then reset
    setTimeout(() => {
      setTimerState(null)
    }, 3000)
  }

  // --- Edit remark functions ---
  function openEditModal(gameId: string, currentRemark: string) {
    setEditingGameId(gameId)
    setEditRemark(currentRemark)
    setIsEditModalOpen(true)
  }

  function closeEditModal() {
    setIsEditModalOpen(false)
    setEditingGameId(null)
    setEditRemark('')
  }

  async function saveRemark() {
    if (!user || !editingGameId) return
    setSavingRemark(true)
    try {
      const userDocRef = doc(db, 'game', user.uid)
      const gameDocRef = doc(userDocRef, 'gameHistory', editingGameId)
      await updateDoc(gameDocRef, {
        remark: editRemark
      })
      closeEditModal()
    } catch (error) {
      console.error('Error updating remark:', error)
    } finally {
      setSavingRemark(false)
    }
  }

  // Early return if not authenticated
  if (authLoading) return <div>Loading...</div>
  if (!user) return <div className="text-center mt-20 text-lg">Please sign in to play the game.</div>

  // Helper to format seconds as HH:MM:SS
  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Pane: Ongoing Game */}
      <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Ongoing Game UI goes here */}
        <div className="flex-1 flex items-center justify-center">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-gray-500 dark:text-gray-300">Loading game...</span>
            </div>
          ) : ongoingGame ? (
            <div className="w-full max-w-md mx-auto">
              {/* Task Display */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Mission:</h2>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ongoingGame.task}</div>
              </div>
              {/* Countdown or Timer */}
              {timerState === 'countdown' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6">
                  <div className="text-8xl font-mono font-bold text-blue-600 animate-pulse">{countdown}</div>
                  <div className="text-xl text-gray-600 dark:text-gray-400 mt-4">Get ready...</div>
                </div>
              ) : timerState === 'timer' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6">
                  <div className="text-6xl font-mono font-bold text-blue-600 transition-colors duration-300">{formatTime(timeLeft)}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">⏰ No pause or stop - stay focused!</div>
                </div>
              ) : timerState === 'outcome' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">⏰ Time's up! Did you succeed?</div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => handleCompleteGame('Won')} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">🏆 Won</button>
                    <button onClick={() => handleCompleteGame('Loss')} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">💔 Lost</button>
                    <button onClick={() => handleCompleteGame('Draw')} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">🤝 Draw</button>
                  </div>
                </div>
              ) : timerState === 'result' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Game Complete!</div>
                </div>
              ) : null}
              {/* Early Win / Give Up Buttons (only during timer) */}
              {timerState === 'timer' && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button onClick={() => handleCompleteGame('Early Win')} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">🎉 Early Win</button>
                  <button onClick={() => handleCompleteGame('Give Up')} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">💔 Give Up</button>
                </div>
              )}
            </div>
          ) : (
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
                    value={setupTask}
                    onChange={e => setSetupTask(e.target.value)}
                    placeholder={`e.g., Finalize the presentation slides
Complete all sections
Review and polish content`}
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
                        value={setupHours}
                        onChange={e => setSetupHours(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={setupMinutes}
                        onChange={e => setSetupMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                {/* Start Button */}
                <button
                  onClick={handleStartGame}
                  disabled={starting || !setupTask.trim() || (setupHours === 0 && setupMinutes === 0)}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {starting ? 'Starting...' : 'Start Challenge'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Right Pane: Game History */}
      <div className="w-full md:w-1/2 flex flex-col p-4 bg-white dark:bg-gray-900">
        <div className="max-w-2xl w-full mx-auto">
          {/* Win/Loss Ratio */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Game History</h2>
            {loadingData ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <div className="text-lg text-blue-700 dark:text-blue-300 font-semibold">
                Wins: {gameStats?.gamesWon ?? 0} / {gameStats?.gamesTotal ?? 0}
              </div>
            )}
          </div>
          {/* Game History Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Time</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Task</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Time Limit</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Actual Time</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Result</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr><td colSpan={6} className="text-center py-4 text-gray-400">Loading...</td></tr>
                ) : gameHistory.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-gray-400">No games played yet.</td></tr>
                ) : (
                  gameHistory.map((g) => (
                    <tr key={g.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{g.time?.toDate ? g.time.toDate().toLocaleString() : ''}</td>
                      <td className="px-3 py-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{g.task}</td>
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{formatTime(g.timeLimitSeconds)}</td>
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{formatTime(g.actualTimeSeconds)}</td>
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{g.result}</td>
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 group relative">
                        <div className="flex items-center justify-between">
                          <span className="truncate max-w-24">{g.remark || ''}</span>
                          <button
                            onClick={() => openEditModal(g.id, g.remark || '')}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 text-gray-400 hover:text-blue-600"
                            title="Edit remark"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Remark Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Remark
            </h3>
            <textarea
              value={editRemark}
              onChange={(e) => setEditRemark(e.target.value)}
              placeholder="Add your thoughts about this game..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                disabled={savingRemark}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={saveRemark}
                disabled={savingRemark}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
              >
                {savingRemark ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 