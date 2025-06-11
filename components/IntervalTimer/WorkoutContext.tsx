"use client";

import { saveAs } from 'file-saver';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { WorkoutConfig, WorkoutState } from './types';
import { DEFAULT_SETTINGS, isValidSettings, STORAGE_KEY as SETTINGS_STORAGE_KEY } from '../Settings/types';

const LOCAL_STORAGE_KEY = 'workout_configurations';

interface WorkoutContextType {
  configs: WorkoutConfig[];
  currentConfig: WorkoutConfig | null;
  addConfig: (config: Omit<WorkoutConfig, 'id'>) => void;
  updateConfig: (config: WorkoutConfig) => void;
  deleteConfig: (id: string) => void;
  setCurrentConfig: (id: string) => void;
  exportWorkouts: () => void;
  importWorkouts: (file: File) => Promise<void>;
  loadDefaultConfig: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

interface ExportedData {
  version: string;
  timestamp: string;
  data: WorkoutState;
}

function isExportedData(value: unknown): value is ExportedData {
  if (typeof value !== 'object' || value === null) return false;
  
  const data = value as Partial<ExportedData>;
  return (
    typeof data.version === 'string' &&
    typeof data.timestamp === 'string' &&
    typeof data.data === 'object' &&
    data.data !== null &&
    isValidWorkoutState(data.data)
  );
}

function isValidWorkoutState(value: unknown): value is WorkoutState {
  if (typeof value !== 'object' || value === null) return false;
  
  const state = value as Partial<WorkoutState>;
  if (typeof state.currentConfigId !== 'string' && state.currentConfigId !== null) return false;
  if (!Array.isArray(state.configs)) return false;
  
  return state.configs.every(config => 
    typeof config === 'object' && 
    config !== null &&
    typeof config.id === 'string' &&
    typeof config.name === 'string' &&
    Array.isArray(config.sets) &&
    config.sets.every(set => 
      typeof set === 'object' &&
      set !== null &&
      typeof set.name === 'string' &&
      typeof set.preparation === 'number' &&
      typeof set.repetitions === 'number' &&
      Array.isArray(set.intervals) &&
      set.intervals.every(interval =>
        typeof interval === 'object' &&
        interval !== null &&
        typeof interval.name === 'string' &&
        typeof interval.duration === 'number' &&
        typeof interval.endSound === 'string'
      )
    )
  );
}

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WorkoutState>({
    currentConfigId: null,
    configs: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Function to load default workout configuration
  const loadDefaultConfig = async () => {
    try {
      // Get settings from localStorage or use defaults
      let defaultWorkoutConfigUrl = DEFAULT_SETTINGS.defaultWorkoutConfigUrl;
      
      const settingsStored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (settingsStored) {
        try {
          const parsedSettings = JSON.parse(settingsStored);
          if (isValidSettings(parsedSettings)) {
            defaultWorkoutConfigUrl = parsedSettings.defaultWorkoutConfigUrl;
          }
        } catch (error) {
          console.error('Error parsing settings:', error);
        }
      }

      const response = await fetch(defaultWorkoutConfigUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch default workout config: ${response.statusText}`);
      }
      
      const defaultConfigData = await response.json();
      
      // Validate the imported data
      if (!isExportedData(defaultConfigData)) {
        throw new Error('Invalid default workout data format');
      }

      setState(defaultConfigData.data);
    } catch (error) {
      console.error('Error loading default workout configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          const parsedState = JSON.parse(stored);
          if (isValidWorkoutState(parsedState)) {
            setState(parsedState);
            setIsLoading(false);
            return;
          } else {
            console.error('Invalid stored workout state format');
          }
        } catch (error) {
          console.error('Error parsing stored workout state:', error);
        }
      }
      
      // No valid stored data, load default configuration
      await loadDefaultConfig();
    };

    loadInitialData();
  }, []);

  // Save configurations to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoading]);

  const addConfig = (config: Omit<WorkoutConfig, 'id'>) => {
    const newConfig: WorkoutConfig = {
      ...config,
      id: crypto.randomUUID(),
    };
    setState(prev => ({
      ...prev,
      configs: [...prev.configs, newConfig],
    }));
  };

  const updateConfig = (config: WorkoutConfig) => {
    setState(prev => ({
      ...prev,
      configs: prev.configs.map(c => (c.id === config.id ? config : c)),
    }));
  };

  const deleteConfig = (id: string) => {
    setState(prev => ({
      ...prev,
      configs: prev.configs.filter(c => c.id !== id),
      currentConfigId: prev.currentConfigId === id ? null : prev.currentConfigId,
    }));
  };

  const setCurrentConfig = (id: string) => {
    setState(prev => ({
      ...prev,
      currentConfigId: id,
    }));
  };

  const currentConfig = state.configs.find(c => c.id === state.currentConfigId) || null;

  const exportWorkouts = () => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: state
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    saveAs(blob, `workout-configurations-${new Date().toISOString()}.json`);
  };

  const importWorkouts = async (file: File) => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      // Validate the imported data
      if (!isExportedData(importedData)) {
        throw new Error('Invalid workout data format');
      }

      // Merge existing workouts with imported ones, avoiding duplicates
      const existingIds = new Set(state.configs.map(config => config.id));
      const newConfigs = importedData.data.configs.map((config: WorkoutConfig) => 
        existingIds.has(config.id) ? { ...config, id: crypto.randomUUID() } : config
      );

      setState(prev => ({
        ...prev,
        configs: [...prev.configs, ...newConfigs]
      }));
    } catch (error) {
      console.error('Error importing workouts:', error);
      throw error;
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        configs: state.configs,
        currentConfig,
        addConfig,
        updateConfig,
        deleteConfig,
        setCurrentConfig,
        exportWorkouts,
        importWorkouts,
        loadDefaultConfig,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}; 