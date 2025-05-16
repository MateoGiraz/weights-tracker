'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '../../redux/hooks';
import { login } from '../../redux/slices/authSlice';

export default function DebugPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [createUserResult, setCreateUserResult] = useState<any>(null);
  const [loginResult, setLoginResult] = useState<any>(null);
  const [loginReduxResult, setLoginReduxResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('password123');

  // Test database connection
  const testDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      setDbStatus({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  // Create test user
  const createTestUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/create-user', {
        method: 'POST',
      });
      const data = await response.json();
      setCreateUserResult(data);
    } catch (error) {
      setCreateUserResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  // Test login
  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const data = await response.json();
      setLoginResult({
        status: response.status,
        data,
      });
    } catch (error) {
      setLoginResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  // Test Redux login
  const testReduxLogin = async () => {
    setLoading(true);
    try {
      const result = await dispatch(login({ username, password })).unwrap();
      setLoginReduxResult({ success: true, user: result });
      router.push('/'); // This should redirect to home page
    } catch (error) {
      setLoginReduxResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="space-y-6">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Debug Tools</h2>
          <div className="space-y-2">
            <Link href="/debug/weights" className="block p-2 bg-purple-600 text-white text-center rounded">
              Test Weights API
            </Link>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Database Status</h2>
          <button 
            onClick={testDatabase}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Test Database
          </button>
          {dbStatus && (
            <pre className="mt-4 p-2 bg-gray-100 rounded overflow-auto text-sm">
              {JSON.stringify(dbStatus, null, 2)}
            </pre>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Create Test User</h2>
          <button 
            onClick={createTestUser}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Create Test User
          </button>
          {createUserResult && (
            <pre className="mt-4 p-2 bg-gray-100 rounded overflow-auto text-sm">
              {JSON.stringify(createUserResult, null, 2)}
            </pre>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Test Login</h2>
          <div className="space-y-3 mb-3">
            <div>
              <label className="block text-sm text-gray-600">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={testLogin}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              Test API Login
            </button>
            <button 
              onClick={testReduxLogin}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded"
            >
              Test Redux Login
            </button>
          </div>
          {loginResult && (
            <div>
              <h3 className="text-sm font-semibold mt-4">API Login Result:</h3>
              <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto text-sm">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </div>
          )}
          {loginReduxResult && (
            <div>
              <h3 className="text-sm font-semibold mt-4">Redux Login Result:</h3>
              <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto text-sm">
                {JSON.stringify(loginReduxResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 