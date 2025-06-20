import React, { useRef } from 'react';
import { useWorkout } from './WorkoutContext';

export const ImportExport: React.FC = () => {
  const { exportWorkouts, importWorkouts, loadDefaultConfig } = useWorkout();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importWorkouts(file);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing workouts:', error);
      alert('Error importing workouts. Please check the file format.');
    }
  };

  const handleLoadDefault = async () => {
    try {
      await loadDefaultConfig();
    } catch (error) {
      console.error('Error loading default workout configuration:', error);
      alert('Error loading default workout configuration.');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleLoadDefault}
        className="rounded-lg bg-purple-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        Load Default
      </button>
      <button
        onClick={exportWorkouts}
        className="rounded-lg bg-green-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Export Workouts
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
        id="import-workouts"
      />
      <label
        htmlFor="import-workouts"
        className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Import Workouts
      </label>
    </div>
  );
}; 