'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { register } from '../redux/slices/authSlice';

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error when user types
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    
    try {
      const { confirmPassword, ...registerData } = formData;
      await dispatch(register(registerData)).unwrap();
      router.push('/');
    } catch (error) {
      // Error is handled in the Redux state
      console.error('Registration error', error);
    }
  };

  return (
    <div className="mx-auto max-w-md mt-8">
      <div className="bg-gray-50 rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
          <p className="text-gray-600 mt-1">Enter your details to create a new account</p>
        </div>
        
        <div className="px-6 py-4 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="your_username"
                disabled={loading}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {validationError && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                {validationError}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 