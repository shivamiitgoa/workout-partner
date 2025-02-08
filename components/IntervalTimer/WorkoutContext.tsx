"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WorkoutConfig, WorkoutState } from './types';

const LOCAL_STORAGE_KEY = 'workout_configurations';

interface WorkoutContextType {
  configs: WorkoutConfig[];
  currentConfig: WorkoutConfig | null;
  addConfig: (config: Omit<WorkoutConfig, 'id'>) => void;
  updateConfig: (config: WorkoutConfig) => void;
  deleteConfig: (id: string) => void;
  setCurrentConfig: (id: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WorkoutState>({
    currentConfigId: null,
    configs: [],
  });

  // Load configurations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setState(JSON.parse(stored));
    }
  }, []);

  // Save configurations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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

  return (
    <WorkoutContext.Provider
      value={{
        configs: state.configs,
        currentConfig,
        addConfig,
        updateConfig,
        deleteConfig,
        setCurrentConfig,
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