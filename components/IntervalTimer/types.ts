export interface WorkoutInterval {
  name: string;
  duration: number; // in seconds
}

export interface WorkoutConfig {
  id: string;
  name: string;
  preparation: number; // in seconds
  intervals: WorkoutInterval[];
  repetitions: number;
}

export interface WorkoutState {
  currentConfigId: string | null;
  configs: WorkoutConfig[];
}

export type IntervalType = 'preparation' | 'work' | 'rest';

export interface ActiveInterval {
  type: IntervalType;
  name: string;
  timeLeft: number;
  totalTime: number;
  currentRound: number;
  totalRounds: number;
  currentInterval: number;
  totalIntervals: number;
} 