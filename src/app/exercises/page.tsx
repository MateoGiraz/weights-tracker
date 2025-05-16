'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchExercises, createExercise, deleteExercise } from '../../redux/slices/exerciseSlice';
import { Header } from '../../components/Header';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ExercisesPage() {
  const dispatch = useAppDispatch();
  const { exercises, loading, error } = useAppSelector((state) => state.exercises);
  
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);
  
  useEffect(() => {
    dispatch(fetchExercises());
  }, [dispatch]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newExerciseName.trim()) {
      dispatch(createExercise({ name: newExerciseName.trim() }));
      setNewExerciseName('');
      setShowAddForm(false);
    }
  };
  
  const handleDeleteExercise = async (exerciseId: string) => {
    setDeletingExerciseId(exerciseId);
    try {
      await dispatch(deleteExercise(exerciseId)).unwrap();
    } catch (error) {
      console.error('Error al eliminar ejercicio:', error);
    } finally {
      setDeletingExerciseId(null);
    }
  };
  
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Ejercicios</h1>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                Añadir Ejercicio
              </Button>
            )}
          </div>
          
          {/* Add Exercise Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Añadir Nuevo Ejercicio</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <div className="space-y-2">
                    <label 
                      htmlFor="exerciseName" 
                      className="text-sm font-medium text-gray-700"
                    >
                      Nombre del Ejercicio
                    </label>
                    <Input
                      id="exerciseName"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      placeholder="ej., Press de Banca"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Guardar
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
          
          {loading && !exercises.length ? (
            <div className="flex justify-center py-8">
              <p>Cargando ejercicios...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <>
              {exercises.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Aún no tienes ejercicios</p>
                      <Button onClick={() => setShowAddForm(true)}>
                        Añade tu Primer Ejercicio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exercises.map((exercise) => (
                    <Card key={exercise.id} className="flex flex-col relative">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteExercise(exercise.id)}
                        disabled={deletingExerciseId === exercise.id}
                      >
                        {deletingExerciseId === exercise.id ? (
                          <span className="block w-5 h-5 rounded-full border-2 border-red-600 border-t-transparent animate-spin"></span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </Button>
                      <CardHeader>
                        <CardTitle className="truncate">{exercise.name}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}