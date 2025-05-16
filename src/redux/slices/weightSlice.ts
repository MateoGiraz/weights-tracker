import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface Weight {
  id: string;
  amount: number;
  reps?: number | null;
  sets?: number | null;
  exerciseId: string;
  createdAt: string;
  updatedAt: string;
}

interface WeightHistoryItem {
  exerciseId: string;
  weights: Weight[];
}

interface WeightState {
  weightHistory: WeightHistoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WeightState = {
  weightHistory: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchWeightHistory = createAsyncThunk(
  'weights/fetchHistory',
  async (exerciseId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exercises/${exerciseId}/weights`);
      return { exerciseId, weights: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch weight history'
      );
    }
  }
);

export const addWeight = createAsyncThunk(
  'weights/add',
  async (
    { exerciseId, amount, reps, sets }: { exerciseId: string; amount: number; reps?: number; sets?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/exercises/${exerciseId}/weights`, {
        weight: amount,
        reps,
        sets,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add weight record');
    }
  }
);

export const updateWeight = createAsyncThunk(
  'weights/update',
  async (
    { exerciseId, weightId, amount }: { exerciseId: string; weightId: string; amount: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/exercises/${exerciseId}/weights/${weightId}`, {
        weight: amount,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update weight');
    }
  }
);

export const deleteWeight = createAsyncThunk(
  'weights/delete',
  async (
    { exerciseId, weightId }: { exerciseId: string; weightId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.delete(`/exercises/${exerciseId}/weights/${weightId}`);
      return { exerciseId, weightId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete weight record');
    }
  }
);

// Slice
const weightSlice = createSlice({
  name: 'weights',
  initialState,
  reducers: {
    clearWeightError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch weight history
      .addCase(fetchWeightHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWeightHistory.fulfilled,
        (state, action: PayloadAction<{ exerciseId: string; weights: Weight[] }>) => {
          state.loading = false;
          const { exerciseId, weights } = action.payload;
          
          // Find if we already have weight history for this exercise
          const existingIndex = state.weightHistory.findIndex(
            (item) => item.exerciseId === exerciseId
          );
          
          if (existingIndex >= 0) {
            // Update existing record
            state.weightHistory[existingIndex].weights = weights;
          } else {
            // Add new record
            state.weightHistory.push({ exerciseId, weights });
          }
        }
      )
      .addCase(fetchWeightHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add weight
      .addCase(addWeight.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWeight.fulfilled, (state, action: PayloadAction<Weight>) => {
        state.loading = false;
        const newWeight = action.payload;
        const { exerciseId } = newWeight;
        
        // Find if we already have weight history for this exercise
        const existingIndex = state.weightHistory.findIndex(
          (item) => item.exerciseId === exerciseId
        );
        
        if (existingIndex >= 0) {
          // Add to existing record
          state.weightHistory[existingIndex].weights.push(newWeight);
        } else {
          // Create new record
          state.weightHistory.push({
            exerciseId,
            weights: [newWeight],
          });
        }
      })
      .addCase(addWeight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update weight
      .addCase(updateWeight.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWeight.fulfilled, (state, action: PayloadAction<Weight>) => {
        state.loading = false;
        const updatedWeight = action.payload;
        const { exerciseId, id: weightId } = updatedWeight;
        
        // Find the exercise weight history
        const exerciseIndex = state.weightHistory.findIndex(
          (item) => item.exerciseId === exerciseId
        );
        
        if (exerciseIndex >= 0) {
          // Find and update the specific weight record
          const weightIndex = state.weightHistory[exerciseIndex].weights.findIndex(
            (w) => w.id === weightId
          );
          
          if (weightIndex >= 0) {
            state.weightHistory[exerciseIndex].weights[weightIndex] = updatedWeight;
          }
        }
      })
      .addCase(updateWeight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete weight
      .addCase(deleteWeight.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWeight.fulfilled, (state, action: PayloadAction<{ exerciseId: string; weightId: string }>) => {
        state.loading = false;
        const { exerciseId, weightId } = action.payload;
        
        // Find the exercise weight history
        const exerciseIndex = state.weightHistory.findIndex(
          (item) => item.exerciseId === exerciseId
        );
        
        if (exerciseIndex >= 0) {
          // Remove the weight record
          state.weightHistory[exerciseIndex].weights = state.weightHistory[exerciseIndex].weights.filter(
            (w) => w.id !== weightId
          );
        }
      })
      .addCase(deleteWeight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWeightError } = weightSlice.actions;
export default weightSlice.reducer; 