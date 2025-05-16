// Safe access to localStorage accounting for SSR
const isBrowser = typeof window !== 'undefined';

// User type to store in localStorage
interface User {
  id: string;
  username: string;
}

// Set the JWT token in localStorage
const setToken = (token: string, user: User): void => {
  if (!isBrowser) return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Get the JWT token from localStorage
const getToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem('token');
};

// Get the user from localStorage
const getUser = (): User | null => {
  if (!isBrowser) return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Clear the token and user from localStorage (for logout)
const clearToken = (): void => {
  if (!isBrowser) return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if token exists (for auth status)
const hasToken = (): boolean => {
  if (!isBrowser) return false;
  return !!localStorage.getItem('token');
};

const tokenStorage = {
  setToken,
  getToken,
  getUser,
  clearToken,
  hasToken,
};

export default tokenStorage; 