'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

interface Exercise {
  id: string;
  name: string;
}

interface Weight {
  id: string;
  amount: number;
  reps: number | null;
  sets: number | null;
  exerciseId: string;
  createdAt: string;
}

export default function DebugWeightsPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWeights, setLoadingWeights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [sets, setSets] = useState<string>('');

  // Fetch exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await api.get('/exercises');
        setExercises(response.data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError('Failed to fetch exercises');
      }
    };

    fetchExercises();
  }, []);

  // Fetch weights when exercise is selected
  useEffect(() => {
    if (!selectedExerciseId) return;

    const fetchWeights = async () => {
      setLoadingWeights(true);
      try {
        const response = await api.get(`/exercises/${selectedExerciseId}/weights`);
        setWeights(response.data);
      } catch (error) {
        console.error('Error fetching weights:', error);
        setError('Failed to fetch weights');
      } finally {
        setLoadingWeights(false);
      }
    };

    fetchWeights();
  }, [selectedExerciseId]);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExerciseId) {
      setError('Please select an exercise');
      return;
    }

    if (!amount) {
      setError('Weight amount is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/exercises/${selectedExerciseId}/weights`, {
        weight: amount,
        reps: reps || null,
        sets: sets || null
      });
      
      // Add new weight to the list
      setWeights(prev => [response.data, ...prev]);
      
      // Clear form
      setAmount('');
      setReps('');
      setSets('');
    } catch (error: any) {
      console.error('Error adding weight:', error);
      setError(error.response?.data?.error || 'Failed to add weight');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeight = async (weightId: string) => {
    if (!selectedExerciseId) return;
    
    try {
      await api.delete(`/exercises/${selectedExerciseId}/weights/${weightId}`);
      setWeights(prev => prev.filter(weight => weight.id !== weightId));
    } catch (error: any) {
      console.error('Error deleting weight:', error);
      setError(error.response?.data?.error || 'Failed to delete weight');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Weights</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Weight Record</CardTitle>
            <CardDescription>
              Track progress for your exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWeight} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Exercise
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select an exercise</option>
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reps (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sets (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  disabled={loading || !selectedExerciseId}
                >
                  {loading ? 'Adding...' : 'Add Weight Record'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {selectedExerciseId && (
          <Card>
            <CardHeader>
              <CardTitle>Weight History</CardTitle>
              <CardDescription>
                {exercises.find(e => e.id === selectedExerciseId)?.name || 'Selected Exercise'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingWeights ? (
                <p className="text-center py-4">Loading weights...</p>
              ) : weights.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No weight records found</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 font-medium text-sm text-gray-600 py-2 border-b">
                    <div>Weight</div>
                    <div>Reps</div>
                    <div>Sets</div>
                    <div>Date</div>
                  </div>
                  {weights.map((weight) => (
                    <div key={weight.id} className="grid grid-cols-4 items-center py-2 border-b text-sm">
                      <div>{weight.amount} lbs</div>
                      <div>{weight.reps || '-'}</div>
                      <div>{weight.sets || '-'}</div>
                      <div className="flex items-center justify-between">
                        {new Date(weight.createdAt).toLocaleDateString()}
                        <button
                          onClick={() => handleDeleteWeight(weight.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <div className="flex space-x-4">
          <Link 
            href="/debug/weights/update"
            className="text-blue-600 hover:text-blue-700"
          >
            Test Weight Update API
          </Link>
          <Link 
            href="/debug"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Debug
          </Link>
        </div>
      </div>
    </div>
  );
} 