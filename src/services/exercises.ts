import axios from 'axios';

const API_URL = '/api/exercises/';
const ROUTINE_API_URL = '/api/routines/';

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  dayId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseData {
  name: string;
  description?: string;
}

export interface UpdateExerciseData {
  name?: string;
  description?: string;
}

// Set up axios config with auth token
const axiosConfig = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Exercises API calls
const getAllExercises = async (token: string): Promise<Exercise[]> => {
  const response = await axios.get(API_URL, axiosConfig(token));
  return response.data;
};

const getExerciseById = async (exerciseId: string, token: string): Promise<Exercise> => {
  const response = await axios.get(`${API_URL}${exerciseId}`, axiosConfig(token));
  return response.data;
};

const addExerciseToDay = async (
  routineId: string,
  dayId: string,
  exerciseData: CreateExerciseData,
  token: string
): Promise<Exercise> => {
  const response = await axios.post(
    `${ROUTINE_API_URL}${routineId}/days/${dayId}/exercises`,
    exerciseData,
    axiosConfig(token)
  );
  return response.data;
};

const updateExercise = async (
  exerciseId: string,
  exerciseData: UpdateExerciseData,
  token: string
): Promise<Exercise> => {
  const response = await axios.put(
    `${API_URL}${exerciseId}`,
    exerciseData,
    axiosConfig(token)
  );
  return response.data;
};

const removeExerciseFromDay = async (
  routineId: string,
  dayId: string,
  exerciseId: string,
  token: string
): Promise<void> => {
  await axios.delete(
    `${ROUTINE_API_URL}${routineId}/days/${dayId}/exercises/${exerciseId}`,
    axiosConfig(token)
  );
};

const exerciseService = {
  getAllExercises,
  getExerciseById,
  addExerciseToDay,
  updateExercise,
  removeExerciseFromDay,
};

export default exerciseService; 