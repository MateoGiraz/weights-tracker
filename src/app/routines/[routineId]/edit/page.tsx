'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchRoutineById, updateRoutine } from '../../../../redux/slices/routineSlice';
import { Header } from '../../../../components/Header';
import { ProtectedRoute } from '../../../../components/ProtectedRoute';
import { Button } from '../../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../../components/ui/Card';

export default function EditRoutinePage({ params } : any) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentRoutine, loading, error } = useAppSelector((state) => state.routines);
  
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRoutineById(params.routineId));
  }, [dispatch, params.routineId]);

  useEffect(() => {
    if (currentRoutine?.name) {
      setName(currentRoutine.name);
    }
  }, [currentRoutine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setFormError('Routine name is required');
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await dispatch(updateRoutine({ 
        routineId: params.routineId, 
        name 
      })).unwrap();
      
      router.push(`/routines/${params.routineId}`);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update routine');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !currentRoutine) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-center items-center p-8">
              <p>Loading routine...</p>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Edit Routine</h1>
            <Link 
              href={`/routines/${params.routineId}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Routine
            </Link>
          </div>

          <Card className="w-full">
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="routine-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Routine Name
                    </label>
                    <input
                      id="routine-name"
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter routine name"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {(formError || error) && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                      {formError || error}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/routines/${params.routineId}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Routine'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
} 