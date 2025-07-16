// Audio utility functions using Web Audio API

// Type definition for webkitAudioContext
interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: new () => AudioContext
}

export function createBeepSound(frequency: number = 800, duration: number = 200): HTMLAudioElement {
  const audioContext = new (window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.frequency.value = frequency
  oscillator.type = 'sine'
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration / 1000)
  
  // Create a dummy audio element for compatibility
  const audio = new Audio()
  audio.volume = 0.3
  return audio
}

export function createAlarmSound(): HTMLAudioElement {
  const audioContext = new (window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2)
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3)
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.4)
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.5)
  
  oscillator.type = 'sine'
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.6)
  
  // Create a dummy audio element for compatibility
  const audio = new Audio()
  audio.volume = 0.5
  return audio
}

// Simple beep sound using oscillator
export function playBeep() {
  try {
    const audioContext = new (window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch {
    console.log('Audio not supported or blocked by browser')
  }
}

// Alarm sound using oscillator
export function playAlarm() {
  try {
    const audioContext = new (window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3)
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.4)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.5)
    
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.6)
  } catch {
    console.log('Audio not supported or blocked by browser')
  }
} 