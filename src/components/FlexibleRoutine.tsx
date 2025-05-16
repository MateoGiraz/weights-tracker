'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchTodayRoutine, fetchRoutines, fetchRoutineById, Routine, Day } from '../redux/slices/routineSlice';
import { formatDate } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { ExerciseCard } from './ExerciseCard';
import { Button } from './ui/Button';
import Link from 'next/link';

export function FlexibleRoutine() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const routines = useAppSelector(state => state.routines.routines);
  const todayRoutine = useAppSelector(state => state.routines.todayRoutine);
  const loading = useAppSelector(state => state.routines.loading);
  const error = useAppSelector(state => state.routines.error);
  
  // Component state
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [showRoutineSelector, setShowRoutineSelector] = useState(false);
  
  // Calculate today's weekday once
  const today = new Date();
  const weekdays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const todayWeekday = weekdays[today.getDay()];
  
  // Mapping weekdays to Spanish
  const weekdayTranslations: Record<string, string> = {
    "MONDAY": "LUNES",
    "TUESDAY": "MARTES",
    "WEDNESDAY": "MIÉRCOLES",
    "THURSDAY": "JUEVES",
    "FRIDAY": "VIERNES",
    "SATURDAY": "SÁBADO",
    "SUNDAY": "DOMINGO"
  };
  
  // Fetch routines on mount
  useEffect(() => {
    dispatch(fetchRoutines());
    dispatch(fetchTodayRoutine());
  }, [dispatch]);

  // Determine active routine - default to today's routine
  const activeRoutine: Routine | null = selectedRoutineId 
    ? routines.find(r => r.id === selectedRoutineId) || null
    : todayRoutine || null;
  
  // When routine changes, fetch its full details 
  useEffect(() => {
    if (activeRoutine?.id) {
      dispatch(fetchRoutineById(activeRoutine.id));
    }
  }, [dispatch, activeRoutine?.id]);
  
  // Find the day to display
  const getActiveDay = () => {
    if (!activeRoutine || !activeRoutine.days || activeRoutine.days.length === 0) {
      return null;
    }
    
    if (selectedDayId) {
      return activeRoutine.days.find(d => d.id === selectedDayId) || null;
    }
    
    // If today's routine and no day selected, try to find today's day
    if (activeRoutine === todayRoutine || !selectedRoutineId) {
      const todayDay = activeRoutine.days.find(d => d.weekday === todayWeekday);
      if (todayDay) return todayDay;
    }
    
    // Default to first day
    return activeRoutine.days[0];
  };
  
  const activeDay = getActiveDay();
  
  // Get sorted days for display
  const getSortedDays = () => {
    if (!activeRoutine?.days || activeRoutine.days.length === 0) {
      return [];
    }
    
    // Sort days in a logical order
    return [...activeRoutine.days].sort((a, b) => {
      const order = {
        'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 
        'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7
      };
      return (order[a.weekday as keyof typeof order] || 999) - 
             (order[b.weekday as keyof typeof order] || 999);
    });
  };
  
  const sortedDays = getSortedDays();
  
  if (loading && !routines.length && !todayRoutine) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Cargando entrenamiento...</p>
      </div>
    );
  }
  
  // Render routine selector dropdown
  const renderRoutineSelector = () => {
    if (routines.length === 0) return null;
    
    return (
      <div className="relative mb-4">
        <Button 
          variant="outline" 
          onClick={() => setShowRoutineSelector(!showRoutineSelector)}
          className="w-full flex justify-between items-center"
        >
          <span>
            {activeRoutine ? (
              <>
                {activeRoutine.name}
                {activeRoutine.id === todayRoutine?.id && ' (Hoy)'}
              </>
            ) : (
              'Seleccionar rutina'
            )}
          </span>
          <svg 
            className={`h-5 w-5 transition-transform ${showRoutineSelector ? 'rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
        
        {showRoutineSelector && (
          <Card className="absolute z-10 w-full mt-1 shadow-lg">
            <ul className="py-1 divide-y">
              {routines.map(routine => (
                <li 
                  key={routine.id}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    routine.id === activeRoutine?.id ? 'bg-blue-50' : ''
                  } ${routine.id === todayRoutine?.id ? 'border-l-4 border-blue-500' : ''}`}
                  onClick={() => {
                    setSelectedRoutineId(routine.id);
                    setSelectedDayId(null);
                    setShowRoutineSelector(false);
                  }}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">
                      {routine.name}
                      {routine.id === todayRoutine?.id && (
                        <span className="ml-2 text-xs text-blue-600 font-semibold">HOY</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {routine.days?.length || 0} día{routine.days?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  };
  
  // Render days tabs
  const renderDaysTabs = () => {
    if (!sortedDays.length) return null;
    
    return (
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {sortedDays.map(day => (
            <Button
              key={day.id}
              variant={day.id === activeDay?.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedDayId(day.id)}
              className={`px-3 py-1 ${day.weekday === todayWeekday ? 'border-blue-500 border-l-2' : ''}`}
            >
              <span className="whitespace-nowrap">
                {weekdayTranslations[day.weekday] || day.weekday}
                {day.weekday === todayWeekday && (
                  <span className="ml-1 text-xs font-semibold">HOY</span>
                )}
              </span>
            </Button>
          ))}
        </div>
      </div>
    );
  };
  
  // No routines at all
  if (!routines.length && !todayRoutine) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>No hay entrenamientos disponibles</CardTitle>
            <CardDescription>
              <Link href="/routines/create" className="text-blue-600 hover:underline">
                Crea una rutina
              </Link> para comenzar a realizar seguimiento de tus entrenamientos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // No active routine (shouldn't happen but just in case)
  if (!activeRoutine) {
    return (
      <div className="space-y-4">
        {renderRoutineSelector()}
        <Card>
          <CardHeader>
            <CardTitle>No hay rutina seleccionada</CardTitle>
            <CardDescription>
              Por favor visita tu <Link href="/routines" className="text-blue-600 hover:underline">página de rutinas</Link> para ver o crear entrenamientos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // Selected routine but no days defined
  if (!activeRoutine.days || activeRoutine.days.length === 0) {
    return (
      <div className="space-y-4">
        {renderRoutineSelector()}
        <Card>
          <CardHeader>
            <CardTitle>{activeRoutine.name}</CardTitle>
            <CardDescription>
              No hay días de entrenamiento definidos en esta rutina. Visita la <Link href={`/routines/${activeRoutine.id}`} className="text-blue-600 hover:underline">página de rutina</Link> para añadir días de entrenamiento.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // Render the workout
  return (
    <div className="space-y-4">
      {renderRoutineSelector()}
      {renderDaysTabs()}
      
      <Card>
        <CardHeader>
          <CardTitle>{activeRoutine.name}</CardTitle>
          <CardDescription>
            {formatDate(new Date())}
            {activeDay && ` - ${weekdayTranslations[activeDay.weekday] || activeDay.weekday}`}
            {activeDay?.weekday === todayWeekday && ' (Hoy)'}
          </CardDescription>
        </CardHeader>
      </Card>
      
      {!activeDay || !activeDay.exercises || activeDay.exercises.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No hay ejercicios programados para {activeDay ? (weekdayTranslations[activeDay.weekday] || activeDay.weekday) : 'este día'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeDay.exercises.map(exercise => (
            <ExerciseCard
              key={exercise.exerciseId}
              exercise={exercise.exercise}
            />
          ))}
        </div>
      )}
    </div>
  );
} 