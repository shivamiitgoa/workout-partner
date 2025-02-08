export interface Settings {
  youtubeUrl: string;
  docsUrl: string;
}

export const DEFAULT_SETTINGS: Settings = {
  youtubeUrl: "https://www.youtube.com/embed/videoseries?list=PLdxbvvtBD8SY1x2cXupdfnX2P_V5iFQ5T",
  docsUrl: "https://docs.google.com/document/d/160SCUKvbiIrDB2Jk5yKusLg5TaLUXVuzExqfGMhOqE4/edit?tab=t.0"
};

export const STORAGE_KEY = 'workout_settings';

export function isValidSettings(value: unknown): value is Settings {
  return (
    typeof value === 'object' && 
    value !== null &&
    'youtubeUrl' in value &&
    'docsUrl' in value &&
    typeof (value as Settings).youtubeUrl === 'string' &&
    typeof (value as Settings).docsUrl === 'string'
  );
} 