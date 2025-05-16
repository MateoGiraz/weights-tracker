import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

// Types
export interface Day {
  id: string;
  weekday: string;
  routineId: string;
  exercises: DayExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface DayExercise {
  dayId: string;
  exerciseId: string;
  exercise: Exercise;
}

export interface Exercise {
  id: string;
  name: string;
}

export interface Routine {
  id: string;
  name: string;
  userId: string;
  days: Day[];
  createdAt: string;
  updatedAt: string;
}

interface RoutineState {
  routines: Routine[];
  currentRoutine: Routine | null;
  todayRoutine: Routine | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoutineState = {
  routines: [],
  currentRoutine: null,
  todayRoutine: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchRoutines = createAsyncThunk('routines/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/routines');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch routines');
  }
});

export const fetchRoutineById = createAsyncThunk(
  'routines/fetchById',
  async (routineId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/routines/${routineId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch routine');
    }
  }
);

export const fetchTodayRoutine = createAsyncThunk('routines/fetchToday', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/routines/today');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s routine');
  }
});

export const createRoutine = createAsyncThunk(
  'routines/create',
  async (routineData: { name: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/routines', routineData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create routine');
    }
  }
);

export const updateRoutine = createAsyncThunk(
  'routines/update',
  async ({ routineId, name }: { routineId: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/routines/${routineId}`, { name });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update routine');
    }
  }
);

// Slice
const routineSlice = createSlice({
  name: 'routines',
  initialState,
  reducers: {
    clearRoutineError: (state) => {
      state.error = null;
    },
    setCurrentRoutine: (state, action: PayloadAction<Routine>) => {
      state.currentRoutine = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all routines
      .addCase(fetchRoutines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutines.fulfilled, (state, action: PayloadAction<Routine[]>) => {
        state.loading = false;
        state.routines = action.payload;
        
        // If we don't have a today's routine yet but have routines, use the first one
        if (!state.todayRoutine && action.payload.length > 0) {
          state.currentRoutine = action.payload[0];
        }
      })
      .addCase(fetchRoutines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch routine by ID
      .addCase(fetchRoutineById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutineById.fulfilled, (state, action: PayloadAction<Routine>) => {
        state.loading = false;
        state.currentRoutine = action.payload;
      })
      .addCase(fetchRoutineById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch today's routine
      .addCase(fetchTodayRoutine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayRoutine.fulfilled, (state, action: PayloadAction<Routine | null>) => {
        state.loading = false;
        state.todayRoutine = action.payload;
        
        // If no routine for today was found but we have routines, use the first one
        if (!action.payload && state.routines.length > 0) {
          state.todayRoutine = state.routines[0];
        }
      })
      .addCase(fetchTodayRoutine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create routine
      .addCase(createRoutine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoutine.fulfilled, (state, action: PayloadAction<Routine>) => {
        state.loading = false;
        state.routines.push(action.payload);
      })
      .addCase(createRoutine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update routine
      .addCase(updateRoutine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoutine.fulfilled, (state, action: PayloadAction<Routine>) => {
        state.loading = false;
        state.routines = state.routines.map((routine) =>
          routine.id === action.payload.id ? action.payload : routine
        );
      })
      .addCase(updateRoutine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRoutineError, setCurrentRoutine } = routineSlice.actions;
export default routineSlice.reducer; 