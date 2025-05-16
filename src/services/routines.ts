import axios from 'axios';

const API_URL = '/api/routines/';

// Define the types
export interface Routine {
  id: string;
  name: string;
  days: Day[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Day {
  id: string;
  weekday: string;
  routineId: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  dayId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutineData {
  name: string;
}

export interface UpdateRoutineData {
  name: string;
}

export interface CreateDayData {
  weekday: string;
}

// Set up axios config with auth token
const axiosConfig = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Routines API calls
const getAllRoutines = async (token: string): Promise<Routine[]> => {
  const response = await axios.get(API_URL, axiosConfig(token));
  return response.data;
};

const getRoutineById = async (routineId: string, token: string): Promise<Routine> => {
  const response = await axios.get(`${API_URL}${routineId}`, axiosConfig(token));
  return response.data;
};

const getTodayRoutine = async (token: string): Promise<Routine | null> => {
  try {
    const response = await axios.get(`${API_URL}today`, axiosConfig(token));
    return response.data;
  } catch (error) {
    // If no routine is found for today, return null
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

const createRoutine = async (routineData: CreateRoutineData, token: string): Promise<Routine> => {
  const response = await axios.post(API_URL, routineData, axiosConfig(token));
  return response.data;
};

const updateRoutine = async (
  routineId: string,
  routineData: UpdateRoutineData,
  token: string
): Promise<Routine> => {
  const response = await axios.put(
    `${API_URL}${routineId}`,
    routineData,
    axiosConfig(token)
  );
  return response.data;
};

const deleteRoutine = async (routineId: string, token: string): Promise<void> => {
  await axios.delete(`${API_URL}${routineId}`, axiosConfig(token));
};

// Days API calls
const addDay = async (
  routineId: string,
  dayData: CreateDayData,
  token: string
): Promise<Day> => {
  const response = await axios.post(
    `${API_URL}${routineId}/days`,
    dayData,
    axiosConfig(token)
  );
  return response.data;
};

const deleteDay = async (
  routineId: string,
  dayId: string,
  token: string
): Promise<void> => {
  await axios.delete(
    `${API_URL}${routineId}/days/${dayId}`,
    axiosConfig(token)
  );
};

const routineService = {
  getAllRoutines,
  getRoutineById,
  getTodayRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  addDay,
  deleteDay,
};

export default routineService; 