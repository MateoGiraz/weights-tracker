import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';
import { Exercise } from './routineSlice';

interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

const initialState: ExerciseState = {
  exercises: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchExercises = createAsyncThunk(
  'exercises/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/exercises');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch exercises'
      );
    }
  }
);

export const createExercise = createAsyncThunk(
  'exercises/create',
  async (exerciseData: { name: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/exercises', exerciseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create exercise'
      );
    }
  }
);

export const deleteExercise = createAsyncThunk(
  'exercises/delete',
  async (exerciseId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/exercises/${exerciseId}`);
      return exerciseId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete exercise'
      );
    }
  }
);

export const fetchDayExercises = createAsyncThunk(
  'exercises/fetchForDay',
  async ({ routineId, dayId }: { routineId: string; dayId: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/routines/${routineId}/days/${dayId}/exercises`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch day exercises'
      );
    }
  }
);

export const addExerciseToDay = createAsyncThunk(
  'exercises/addToDay',
  async (
    { routineId, dayId, exerciseId }: { routineId: string; dayId: string; exerciseId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/routines/${routineId}/days/${dayId}/exercises`, {
        exerciseId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add exercise to day'
      );
    }
  }
);

// Slice
const exerciseSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    clearExerciseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all exercises
      .addCase(fetchExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action: PayloadAction<Exercise[]>) => {
        state.loading = false;
        state.exercises = action.payload;
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create exercise
      .addCase(createExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExercise.fulfilled, (state, action: PayloadAction<Exercise>) => {
        state.loading = false;
        state.exercises.push(action.payload);
      })
      .addCase(createExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete exercise
      .addCase(deleteExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExercise.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.exercises = state.exercises.filter(exercise => exercise.id !== action.payload);
      })
      .addCase(deleteExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearExerciseError } = exerciseSlice.actions;
export default exerciseSlice.reducer; 