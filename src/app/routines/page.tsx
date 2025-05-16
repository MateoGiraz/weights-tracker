'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchRoutines } from '../../redux/slices/routineSlice';
import { Header } from '../../components/Header';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function RoutinesPage() {
  const dispatch = useAppDispatch();
  const { routines, loading, error } = useAppSelector((state) => state.routines);

  useEffect(() => {
    dispatch(fetchRoutines());
  }, [dispatch]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tus Rutinas</h1>
            <Link href="/routines/create">
              <Button>
                Añadir Rutina
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <p>Cargando rutinas...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          ) : routines.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Aún no tienes ninguna rutina</p>
                  <Link href="/routines/create">
                    <Button>Crear tu primera rutina</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routines.map((routine) => (
                <Link key={routine.id} href={`/routines/${routine.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle>{routine.name}</CardTitle>
                      <CardDescription>
                        {routine.days.length} día{routine.days.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {routine.days.map((day) => (
                          <span
                            key={day.id}
                            className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 rounded-md"
                          >
                            {day.weekday === 'MONDAY' && 'LUNES'}
                            {day.weekday === 'TUESDAY' && 'MARTES'}
                            {day.weekday === 'WEDNESDAY' && 'MIÉRCOLES'}
                            {day.weekday === 'THURSDAY' && 'JUEVES'}
                            {day.weekday === 'FRIDAY' && 'VIERNES'}
                            {day.weekday === 'SATURDAY' && 'SÁBADO'}
                            {day.weekday === 'SUNDAY' && 'DOMINGO'}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
} 