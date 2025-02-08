"use client";

import React, { useState } from 'react';
import { WorkoutConfig, WorkoutInterval } from './types';
import { useWorkout } from './WorkoutContext';

interface ConfigurationFormProps {
  onClose: () => void;
  initialConfig?: WorkoutConfig;
}

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onClose, initialConfig }) => {
  const { addConfig, updateConfig } = useWorkout();
  const [name, setName] = useState(initialConfig?.name || '');
  const [preparation, setPreparation] = useState(initialConfig?.preparation.toString() || '30');
  const [repetitions, setRepetitions] = useState(initialConfig?.repetitions.toString() || '3');
  const [intervals, setIntervals] = useState<WorkoutInterval[]>(
    initialConfig?.intervals || [
      { name: 'Work', duration: 30 },
      { name: 'Rest', duration: 10 },
    ]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      name,
      preparation: parseInt(preparation),
      repetitions: parseInt(repetitions),
      intervals,
    };

    if (initialConfig) {
      updateConfig({ ...config, id: initialConfig.id });
    } else {
      addConfig(config);
    }
    onClose();
  };

  const addInterval = () => {
    setIntervals([...intervals, { name: 'New Interval', duration: 30 }]);
  };

  const updateInterval = (index: number, field: keyof WorkoutInterval, value: string | number) => {
    const newIntervals = [...intervals];
    newIntervals[index] = {
      ...newIntervals[index],
      [field]: field === 'duration' ? parseInt(value as string) : value,
    };
    setIntervals(newIntervals);
  };

  const removeInterval = (index: number) => {
    setIntervals(intervals.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Preparation Time (seconds)</label>
        <input
          type="number"
          value={preparation}
          onChange={(e) => setPreparation(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Number of Rounds</label>
        <input
          type="number"
          value={repetitions}
          onChange={(e) => setRepetitions(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intervals</label>
        {intervals.map((interval, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={interval.name}
              onChange={(e) => updateInterval(index, 'name', e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Interval name"
              required
            />
            <input
              type="number"
              value={interval.duration}
              onChange={(e) => updateInterval(index, 'duration', e.target.value)}
              className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              required
            />
            <button
              type="button"
              onClick={() => removeInterval(index)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addInterval}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Interval
        </button>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {initialConfig ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}; 