export type SoundType = 'no_beep' | 'one_beep' | 'two_beeps' | 'three_beeps';

export interface WorkoutInterval {
  name: string;
  duration: number; // in seconds
  endSound: SoundType;
}

export interface WorkoutSet {
  name: string;
  preparation: number; // in seconds
  prepEndSound: SoundType;
  intervals: WorkoutInterval[];
  repetitions: number;
}

export interface WorkoutConfig {
  id: string;
  name: string;
  sets: WorkoutSet[];
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
  currentSet: number;
  totalSets: number;
} 