'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

interface Exercise {
  id: string;
  name: string;
}

export default function AddExerciseToDay({ 
  params 
}: { 
  params: { routineId: string; dayId: string } 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [routineLoading, setRoutineLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routine, setRoutine] = useState<any>(null);
  const [day, setDay] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [existingExerciseIds, setExistingExerciseIds] = useState<string[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get routine
        const routineResponse = await api.get(`/routines/${params.routineId}`);
        setRoutine(routineResponse.data);
        
        // Get day
        const dayResponse = await api.get(`/routines/${params.routineId}/days/${params.dayId}`);
        setDay(dayResponse.data);
        
        // Get existing exercises for this day
        const dayExercisesResponse = await api.get(`/routines/${params.routineId}/days/${params.dayId}/exercises`);
        setExistingExerciseIds(dayExercisesResponse.data.map((de: any) => de.exerciseId));
        
        // Get all exercises
        const exercisesResponse = await api.get('/exercises');
        setExercises(exercisesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar datos');
      } finally {
        setRoutineLoading(false);
      }
    };

    fetchData();
  }, [params.routineId, params.dayId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExerciseId) {
      setError('Por favor selecciona un ejercicio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/routines/${params.routineId}/days/${params.dayId}/exercises`, {
        exerciseId: selectedExerciseId
      });
      
      router.push(`/routines/${params.routineId}`);
    } catch (error: any) {
      console.error('Error adding exercise:', error);
      setError(error.response?.data?.error || 'Error al añadir ejercicio');
    } finally {
      setLoading(false);
    }
  };

  if (routineLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (!routine || !day) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Error al cargar datos</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href={`/routines/${params.routineId}`} className="text-blue-600 hover:text-blue-700">
              Volver a la Rutina
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const availableExercises = exercises.filter(
    (exercise) => !existingExerciseIds.includes(exercise.id)
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl md:text-2xl">Añadir Ejercicio</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Añadir un ejercicio para {day.weekday} en la rutina "{routine.name}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Seleccionar Ejercicio
              </label>
              {availableExercises.length === 0 ? (
                <p className="text-gray-500 italic">
                  Todos los ejercicios ya están añadidos a este día. Crea un nuevo ejercicio primero.
                </p>
              ) : (
                <select
                  className="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecciona un ejercicio</option>
                  {availableExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:justify-between pt-4">
              <Link 
                href={`/routines/${params.routineId}`}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-center"
              >
                Cancelar
              </Link>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/exercises/create"
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-center"
                >
                  Crear Nuevo Ejercicio
                </Link>
                <button
                  type="submit"
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading || !selectedExerciseId || availableExercises.length === 0}
                >
                  {loading ? 'Añadiendo...' : 'Añadir Ejercicio'}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 