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

export default function UpdateWeightPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [weights, setWeights] = useState<Weight[]>([]);
  const [selectedWeightId, setSelectedWeightId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

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
    if (!selectedExerciseId) {
      setWeights([]);
      setSelectedWeightId('');
      return;
    }

    const fetchWeights = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/exercises/${selectedExerciseId}/weights`);
        setWeights(response.data);
        if (response.data.length > 0) {
          setSelectedWeightId(response.data[0].id);
          setAmount(response.data[0].amount.toString());
        }
      } catch (error) {
        console.error('Error fetching weights:', error);
        setError('Failed to fetch weights');
      } finally {
        setLoading(false);
      }
    };

    fetchWeights();
  }, [selectedExerciseId]);

  // Update amount when weight is selected
  useEffect(() => {
    if (!selectedWeightId) return;

    const selectedWeight = weights.find(w => w.id === selectedWeightId);
    if (selectedWeight) {
      setAmount(selectedWeight.amount.toString());
    }
  }, [selectedWeightId, weights]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExerciseId || !selectedWeightId) {
      setError('Please select an exercise and weight record');
      return;
    }

    if (!amount) {
      setError('Weight amount is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.put(`/exercises/${selectedExerciseId}/weights/${selectedWeightId}`, {
        weight: parseFloat(amount)
      });
      
      setResult({
        success: true,
        data: response.data
      });
      
      // Update the weight in the local list
      setWeights(prev => prev.map(weight => 
        weight.id === selectedWeightId 
          ? { ...weight, amount: parseFloat(amount) } 
          : weight
      ));
    } catch (error: any) {
      console.error('Error updating weight:', error);
      setResult({
        success: false,
        error: error.response?.data?.error || 'Failed to update weight'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Weight Update API</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Update Weight Record</CardTitle>
          <CardDescription>
            Test the PUT endpoint for weight updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            {selectedExerciseId && weights.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Weight Record
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedWeightId}
                  onChange={(e) => setSelectedWeightId(e.target.value)}
                  disabled={loading}
                >
                  {weights.map((weight) => (
                    <option key={weight.id} value={weight.id}>
                      {weight.amount} lbs - {new Date(weight.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Weight (lbs)
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

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                {error}
              </div>
            )}

            {result && (
              <div className={`p-3 rounded-md text-sm border ${result.success ? 'bg-green-50 text-green-500 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                {result.success ? 'Weight updated successfully!' : result.error}
                {result.success && result.data && (
                  <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                disabled={loading || !selectedExerciseId || !selectedWeightId}
              >
                {loading ? 'Updating...' : 'Update Weight'}
              </button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between">
            <Link 
              href="/debug/weights"
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Weights Debug
            </Link>
            <Link 
              href="/debug"
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Debug Home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 