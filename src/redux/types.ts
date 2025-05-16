import { Day, Exercise, Routine } from './slices/routineSlice';
import { Weight } from './slices/weightSlice';

// Auth state types
export interface User {
  id: string;
  username: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Routine state types
export interface RoutineState {
  routines: Routine[];
  currentRoutine: Routine | null;
  todayRoutine: Routine | null;
  loading: boolean;
  error: string | null;
}

// Exercise state types
export interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

// Weight state types
export interface WeightHistoryItem {
  exerciseId: string;
  weights: Weight[];
}

export interface WeightState {
  weightHistory: WeightHistoryItem[];
  loading: boolean;
  error: string | null;
}

// Root state type
export interface RootState {
  auth: AuthState;
  routines: RoutineState;
  exercises: ExerciseState;
  weights: WeightState;
} 