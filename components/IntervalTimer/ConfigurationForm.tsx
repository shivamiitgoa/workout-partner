"use client";

import React, { useState } from 'react';
import { SoundType, WorkoutConfig, WorkoutInterval, WorkoutSet } from './types';
import { useWorkout } from './WorkoutContext';

const SOUND_OPTIONS: { value: SoundType; label: string }[] = [
  { value: 'no_beep', label: 'No Sound' },
  { value: 'one_beep', label: 'One Beep' },
  { value: 'two_beeps', label: 'Two Beeps' },
  { value: 'three_beeps', label: 'Three Beeps' },
];

interface ConfigurationFormProps {
  onClose: () => void;
  initialConfig?: WorkoutConfig;
}

const DEFAULT_SET: WorkoutSet = {
  name: 'New Set',
  preparation: 30,
  prepEndSound: 'three_beeps',
  intervals: [
    { name: 'Work', duration: 30, endSound: 'one_beep' },
    { name: 'Rest', duration: 10, endSound: 'two_beeps' },
  ],
  repetitions: 3,
};

// Helper function to create a deep copy of a set
const deepCopySet = (set: WorkoutSet): WorkoutSet => ({
  name: set.name,
  preparation: set.preparation,
  prepEndSound: set.prepEndSound,
  intervals: set.intervals.map(interval => ({
    name: interval.name,
    duration: interval.duration,
    endSound: interval.endSound,
  })),
  repetitions: set.repetitions,
});

const NEW_INTERVAL: WorkoutInterval = {
  name: 'New Interval',
  duration: 30,
  endSound: 'no_beep' as SoundType,
};

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onClose, initialConfig }) => {
  const { addConfig, updateConfig, deleteConfig } = useWorkout();
  const [name, setName] = useState(initialConfig?.name || '');
  const [sets, setSets] = useState<WorkoutSet[]>(
    initialConfig?.sets 
      ? initialConfig.sets.map(deepCopySet)
      : [deepCopySet(DEFAULT_SET)]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: Omit<WorkoutConfig, 'id'> = {
      name,
      sets: sets.map(set => ({
        name: set.name,
        preparation: set.preparation,
        prepEndSound: set.prepEndSound,
        intervals: set.intervals,
        repetitions: set.repetitions,
      })),
    };

    if (initialConfig) {
      updateConfig({ ...config, id: initialConfig.id });
    } else {
      addConfig(config);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!initialConfig) return;
    if (window.confirm('Are you sure you want to delete this workout?')) {
      deleteConfig(initialConfig.id);
      onClose();
    }
  };

  const addSet = () => {
    setSets([
      ...sets,
      deepCopySet({ 
        ...DEFAULT_SET, 
        name: `Set ${sets.length + 1}` 
      })
    ]);
  };

  const removeSet = (setIndex: number) => {
    setSets(sets.filter((_, i) => i !== setIndex));
  };

  const updateSet = (setIndex: number, field: keyof WorkoutSet, value: string | number) => {
    const newSets = sets.map((set, i) => 
      i === setIndex
        ? { ...set, [field]: value }
        : set
    );
    setSets(newSets);
  };

  const addInterval = (setIndex: number) => {
    const newSets = sets.map((set, i) => {
      if (i !== setIndex) return set;
      return {
        ...set,
        intervals: [
          ...set.intervals,
          { ...NEW_INTERVAL }
        ]
      };
    });
    setSets(newSets);
  };

  const updateInterval = (setIndex: number, intervalIndex: number, field: keyof WorkoutInterval, value: string | number) => {
    const newSets = sets.map((set, i) => {
      if (i !== setIndex) return set;
      
      const newIntervals = set.intervals.map((interval, j) => {
        if (j !== intervalIndex) return interval;
        
        let parsedValue: string | number = value;
        if (field === 'duration') {
          const parsed = parseInt(value.toString());
          parsedValue = isNaN(parsed) ? 0 : parsed;
        }
        
        return { ...interval, [field]: parsedValue };
      });
      
      return { ...set, intervals: newIntervals };
    });
    
    setSets(newSets);
  };

  const removeInterval = (setIndex: number, intervalIndex: number) => {
    const newSets = sets.map((set, i) => {
      if (i !== setIndex) return set;
      return {
        ...set,
        intervals: set.intervals.filter((_, j) => j !== intervalIndex)
      };
    });
    setSets(newSets);
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-hidden">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[95%] flex flex-col mt-4"
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialConfig ? 'Edit Workout' : 'Create New Workout'}
          </h2>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">Configuration Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-6">
            {sets.map((set, setIndex) => (
              <div key={setIndex} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Set {setIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeSet(setIndex)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Remove Set
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Set Name</label>
                    <input
                      type="text"
                      value={set.name}
                      onChange={(e) => updateSet(setIndex, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preparation Time (seconds)</label>
                    <input
                      type="number"
                      value={set.preparation}
                      onChange={(e) => updateSet(setIndex, 'preparation', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preparation End Sound</label>
                    <select
                      value={set.prepEndSound}
                      onChange={(e) => updateSet(setIndex, 'prepEndSound', e.target.value as SoundType)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {SOUND_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Rounds</label>
                    <input
                      type="number"
                      value={set.repetitions}
                      onChange={(e) => updateSet(setIndex, 'repetitions', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intervals</label>
                  <div className="space-y-3">
                    {set.intervals.map((interval, intervalIndex) => (
                      <div key={intervalIndex} className="flex flex-col gap-2 p-3 border rounded bg-white">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={interval.name}
                            onChange={(e) => updateInterval(setIndex, intervalIndex, 'name', e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Interval name"
                            required
                          />
                          <input
                            type="number"
                            value={interval.duration}
                            onChange={(e) => updateInterval(setIndex, intervalIndex, 'duration', e.target.value)}
                            className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            min="1"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeInterval(setIndex, intervalIndex)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">End Sound</label>
                          <select
                            value={interval.endSound}
                            onChange={(e) => updateInterval(setIndex, intervalIndex, 'endSound', e.target.value as SoundType)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            {SOUND_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addInterval(setIndex)}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Add Interval
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSet}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Set
          </button>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          {initialConfig && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {initialConfig ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}; 