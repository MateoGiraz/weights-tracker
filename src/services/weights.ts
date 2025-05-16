import axios from 'axios';

const API_URL = '/api/exercises/';

export interface Weight {
  id: string;
  amount: number;
  reps?: number | null;
  sets?: number | null;
  exerciseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWeightData {
  weight: number;
  reps?: number;
  sets?: number;
}

// Set up axios config with auth token
const axiosConfig = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Weights API calls
const getWeights = async (exerciseId: string, token: string): Promise<Weight[]> => {
  const response = await axios.get(
    `${API_URL}${exerciseId}/weights`,
    axiosConfig(token)
  );
  return response.data;
};

const addWeight = async (
  exerciseId: string,
  weightData: CreateWeightData,
  token: string
): Promise<Weight> => {
  const response = await axios.post(
    `${API_URL}${exerciseId}/weights`,
    weightData,
    axiosConfig(token)
  );
  return response.data;
};

const deleteWeight = async (
  exerciseId: string,
  weightId: string,
  token: string
): Promise<void> => {
  await axios.delete(
    `${API_URL}${exerciseId}/weights/${weightId}`,
    axiosConfig(token)
  );
};

const weightService = {
  getWeights,
  addWeight,
  deleteWeight,
};

export default weightService; 