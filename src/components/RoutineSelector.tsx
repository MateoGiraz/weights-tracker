'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchRoutines, fetchRoutineById, Routine } from '../redux/slices/routineSlice';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

interface RoutineSelectorProps {
  onRoutineSelect: (routine: Routine) => void;
  selectedRoutineId?: string;
}

export function RoutineSelector({ onRoutineSelect, selectedRoutineId }: RoutineSelectorProps) {
  const dispatch = useAppDispatch();
  const { routines, loading, error } = useAppSelector((state) => state.routines);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRoutines());
  }, [dispatch]);

  const handleRoutineSelect = async (routineId: string) => {
    try {
      const result = await dispatch(fetchRoutineById(routineId)).unwrap();
      onRoutineSelect(result);
      setIsOpen(false);
    } catch (err) {
      console.error('Error fetching routine details:', err);
    }
  };

  if (loading && routines.length === 0) {
    return <p className="text-sm text-gray-500">Cargando rutinas...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (routines.length === 0) {
    return <p className="text-sm text-gray-500">No hay rutinas disponibles</p>;
  }

  return (
    <div className="mb-4">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center"
      >
        <span>
          {selectedRoutineId 
            ? `Seleccionada: ${routines.find(r => r.id === selectedRoutineId)?.name || 'Cargando...'}`
            : 'Selecciona otra rutina'}
        </span>
        <svg 
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      
      {isOpen && (
        <Card className="mt-2 w-full overflow-hidden">
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium">Tus Rutinas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-60 overflow-y-auto">
              <ul className="divide-y">
                {routines.map((routine) => (
                  <li 
                    key={routine.id}
                    className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 
                      ${routine.id === selectedRoutineId ? 'bg-blue-50' : ''}`}
                    onClick={() => handleRoutineSelect(routine.id)}
                  >
                    <div className="text-sm font-medium">{routine.name}</div>
                    <div className="text-xs text-gray-500">
                      {routine.days?.length || 0} día{routine.days?.length === 1 ? '' : 's'} de entrenamiento
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 