import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface WorkoutNote {
  content: string;
  userId: string;
  updatedAt: unknown; // Firestore Timestamp
}

/**
 * Get the workout note for a specific user
 */
export async function getUserWorkoutNote(userId: string): Promise<WorkoutNote | null> {
  try {
    const noteRef = doc(db, 'workoutNotes', userId);
    const noteSnap = await getDoc(noteRef);
    
    if (noteSnap.exists()) {
      return noteSnap.data() as WorkoutNote;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting workout note:', error);
    throw error;
  }
}

/**
 * Save or update the workout note for a user
 */
export async function saveWorkoutNote(userId: string, content: string): Promise<void> {
  try {
    const noteRef = doc(db, 'workoutNotes', userId);
    const noteSnap = await getDoc(noteRef);
    
    if (noteSnap.exists()) {
      // Update existing note
      await updateDoc(noteRef, {
        content,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new note
      await setDoc(noteRef, {
        content,
        userId,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving workout note:', error);
    throw error;
  }
}

/**
 * Create initial workout note for a user (if doesn't exist)
 */
export async function createWorkoutNote(userId: string, content: string = ''): Promise<void> {
  try {
    const noteRef = doc(db, 'workoutNotes', userId);
    await setDoc(noteRef, {
      content,
      userId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating workout note:', error);
    throw error;
  }
} 