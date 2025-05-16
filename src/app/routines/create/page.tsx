'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { createRoutine } from '../../../redux/slices/routineSlice';
import { Header } from '../../../components/Header';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function CreateRoutinePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.routines);
  
  const [routineName, setRoutineName] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (routineName.trim()) {
      try {
        const result = await dispatch(createRoutine({ name: routineName.trim() })).unwrap();
        router.push(`/routines/${result.id}`);
      } catch (error) {
        console.error('Failed to create routine:', error);
      }
    }
  };
  
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Crear  Nueva Rutina</h1>
          </div>
          
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Detalles de la Rutina</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label 
                      htmlFor="routineName" 
                      className="text-sm font-medium text-gray-700"
                    >
                      Nombre de la Rutina
                    </label>
                    <Input
                      id="routineName"
                      value={routineName}
                      onChange={(e) => setRoutineName(e.target.value)}
                      placeholder="e.g., Push Pull Legs"
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => router.push('/routines')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Rutina'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
} 