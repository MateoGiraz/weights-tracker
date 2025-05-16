import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import routineReducer from './slices/routineSlice';
import exerciseReducer from './slices/exerciseSlice';
import weightReducer from './slices/weightSlice';
import { RootState } from './types';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    routines: routineReducer,
    exercises: exerciseReducer,
    weights: weightReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch; 