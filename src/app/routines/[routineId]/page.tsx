'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchRoutineById } from '../../../redux/slices/routineSlice';
import { Header } from '../../../components/Header';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ExerciseCard } from '../../../components/ExerciseCard';
import api from '@/lib/api';

export default function RoutineDetailPage({ params }: { params: { routineId: string } }) {
  const routineId = params.routineId;
  const dispatch = useAppDispatch();
  const { currentRoutine, loading, error } = useAppSelector((state) => state.routines);
  const [deletingExercise, setDeletingExercise] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRoutineById(routineId));
  }, [dispatch, routineId]);

  // Find what day of the week it is today
  const today = new Date();
  const weekdays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const todayWeekday = weekdays[today.getDay()];

  // Mapeo de días de la semana a español
  const weekdayTranslations: Record<string, string> = {
    "MONDAY": "LUNES",
    "TUESDAY": "MARTES",
    "WEDNESDAY": "MIÉRCOLES",
    "THURSDAY": "JUEVES",
    "FRIDAY": "VIERNES",
    "SATURDAY": "SÁBADO",
    "SUNDAY": "DOMINGO"
  };

  // Función para eliminar un ejercicio de un día
  const handleDeleteExercise = async (dayId: string, exerciseId: string) => {
    // Guardar el ID del ejercicio que se está eliminando
    setDeletingExercise(exerciseId);
    
    try {
      // Llamar a la API para eliminar el ejercicio
      await api.delete(`/routines/${routineId}/days/${dayId}/exercises/${exerciseId}`);
      
      // Recargar la rutina para mostrar los cambios
      dispatch(fetchRoutineById(routineId));
    } catch (error) {
      console.error('Error al eliminar ejercicio:', error);
    } finally {
      // Limpiar el estado de eliminación
      setDeletingExercise(null);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Cargando rutina...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          ) : !currentRoutine ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              Rutina no encontrada
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{currentRoutine.name}</h1>
                <Link href={`/routines/${routineId}/edit`}>
                  <Button variant="outline">Editar Rutina</Button>
                </Link>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Días de Entrenamiento</h2>
              
              {currentRoutine.days.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Esta rutina no tiene días configurados</p>
                      <Link href={`/routines/${routineId}/days/add`}>
                        <Button>Añadir Día de Entrenamiento</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {currentRoutine.days.map((day) => (
                    <Card 
                      key={day.id} 
                      className={`border ${day.weekday === todayWeekday ? 'border-primary-500' : ''}`}
                    >
                      <CardHeader>
                        <CardTitle className="flex justify-between">
                          <span>{weekdayTranslations[day.weekday] || day.weekday}</span>
                          {day.weekday === todayWeekday && (
                            <span className="text-sm font-medium text-primary-600">Hoy</span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {day.exercises.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-500 mb-2">No hay ejercicios para este día</p>
                            <Link href={`/routines/${routineId}/days/${day.id}/exercises/add`}>
                              <Button variant="outline" size="sm">Añadir Ejercicio</Button>
                            </Link>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 gap-3">
                              {day.exercises.map((dayExercise) => (
                                <div key={dayExercise.exerciseId} className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="font-medium">{dayExercise.exercise.name}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteExercise(day.id, dayExercise.exerciseId)}
                                    disabled={deletingExercise === dayExercise.exerciseId}
                                  >
                                    {deletingExercise === dayExercise.exerciseId ? (
                                      <span className="block w-5 h-5 rounded-full border-2 border-red-600 border-t-transparent animate-spin"></span>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-end mt-4">
                              <Link href={`/routines/${routineId}/days/${day.id}/exercises/add`}>
                                <Button variant="outline" size="sm">Añadir Ejercicio</Button>
                              </Link>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="mt-8 flex justify-center">
                <Link href={`/routines/${routineId}/days/add`}>
                  <Button>Añadir Día de Entrenamiento</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
} 