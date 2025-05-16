import api from '../utils/api';
import tokenStorage from '../utils/tokenStorage';

export interface User {
  id: string;
  username: string;
  email?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Register a new user
const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', userData);
  const data = response.data;
  
  // Store token in localStorage
  if (data.token) {
    tokenStorage.setToken(data.token, data.user);
  }
  
  return data;
};

// Login an existing user
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  const data = response.data;
  
  // Store token in localStorage
  if (data.token) {
    tokenStorage.setToken(data.token, data.user);
  }
  
  return data;
};

// Logout the user
const logout = (): void => {
  tokenStorage.clearToken();
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  return tokenStorage.hasToken();
};

// Get authentication header
const getAuthHeader = (): { Authorization?: string } => {
  const token = tokenStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const authService = {
  register,
  login,
  logout,
  isAuthenticated,
  getAuthHeader
};

export default authService; 