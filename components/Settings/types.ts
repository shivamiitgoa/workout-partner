export interface Settings {
  youtubeUrl: string;
  docsUrl: string;
  defaultWorkoutConfigUrl: string;
}

export const DEFAULT_SETTINGS: Settings = {
  youtubeUrl: "https://www.youtube.com/embed/videoseries?list=PLdxbvvtBD8SahRABv0it1KpIOrJSH_ORK",
  docsUrl: "https://docs.google.com/document/d/1gu6XlIV_xya0g-VCK0lLwXLdVWIy8DgifBBdo2Qop6Q/edit?tab=t.0",
  defaultWorkoutConfigUrl: "/workout-configurations-default.json"
};

export const STORAGE_KEY = 'workout_settings';

export function isValidSettings(value: unknown): value is Settings {
  return (
    typeof value === 'object' && 
    value !== null &&
    'youtubeUrl' in value &&
    'docsUrl' in value &&
    'defaultWorkoutConfigUrl' in value &&
    typeof (value as Settings).youtubeUrl === 'string' &&
    typeof (value as Settings).docsUrl === 'string' &&
    typeof (value as Settings).defaultWorkoutConfigUrl === 'string'
  );
} 