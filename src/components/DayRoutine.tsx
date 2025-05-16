'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchTodayRoutine, Routine, Day } from '../redux/slices/routineSlice';
import { formatDate } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { ExerciseCard } from './ExerciseCard';
import { RoutineSelector } from './RoutineSelector';
import { DaySelector } from './DaySelector';

export function DayRoutine() {
  const dispatch = useAppDispatch();
  const todayRoutine = useAppSelector((state) => state.routines.todayRoutine);
  const loading = useAppSelector((state) => state.routines.loading);
  const error = useAppSelector((state) => state.routines.error);
  
  // State for custom selection
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | undefined>(undefined);

  // Calculate today's weekday
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

  useEffect(() => {
    try {
      dispatch(fetchTodayRoutine());
    } catch (err) {
      console.error('Error fetching today routine:', err);
    }
  }, [dispatch]);

  // Handle routine selection
  const handleRoutineSelect = (routine: Routine) => {
    setSelectedRoutine(routine);
    setSelectedRoutineId(routine.id);
  };

  // Reset selected day when routine changes
  useEffect(() => {
    if (selectedRoutine && selectedRoutine.days) {
      // If there's a day matching today, select it by default
      const todayDay = selectedRoutine.days.find(day => day.weekday === todayWeekday);
      setSelectedDay(todayDay || (selectedRoutine.days.length > 0 ? selectedRoutine.days[0] : null));
    } else {
      setSelectedDay(null);
    }
  }, [selectedRoutine, todayWeekday]);

  // Default to today's routine if none selected
  const displayedRoutine = selectedRoutine || todayRoutine;
  
  if (loading && !displayedRoutine) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Cargando entrenamiento...</p>
      </div>
    );
  }

  if (error && !displayedRoutine) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!displayedRoutine) {
    return (
      <div className="space-y-4">
        <RoutineSelector 
          onRoutineSelect={handleRoutineSelect}
          selectedRoutineId={selectedRoutineId}
        />
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>No hay entrenamiento programado para hoy</CardTitle>
            <CardDescription>
              ¡Selecciona una rutina arriba o crea una nueva para comenzar!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check if days array exists and is not empty
  const hasDays = !!displayedRoutine.days && Array.isArray(displayedRoutine.days) && displayedRoutine.days.length > 0;
  const currentRoutineId = displayedRoutine?.id || '';
  
  // Set the selected routine ID when displayedRoutine changes
  useEffect(() => {
    if (displayedRoutine && displayedRoutine.id) {
      setSelectedRoutineId(displayedRoutine.id);
    }
  }, [displayedRoutine]);
  
  if (!hasDays) {
    return (
      <div className="space-y-4">
        <RoutineSelector 
          onRoutineSelect={handleRoutineSelect}
          selectedRoutineId={selectedRoutineId}
        />
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{displayedRoutine.name || 'Rutina'}</CardTitle>
            <CardDescription>
              No hay días definidos en esta rutina
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Find which day to display
  let displayedDay = selectedDay;
  
  // If using today's default routine and no day is selected, find today's workout
  if (!selectedRoutine && !selectedDay && displayedRoutine === todayRoutine && hasDays) {
    displayedDay = displayedRoutine.days.find(day => day.weekday === todayWeekday) || null;
  }
  
  // If still no day selected, use the first available day
  if (!displayedDay && hasDays) {
    displayedDay = displayedRoutine.days[0];
  }

  const days = hasDays ? displayedRoutine.days : [];
  const dayId = displayedDay?.id || '';

  return (
    <div className="space-y-4">
      <RoutineSelector 
        onRoutineSelect={handleRoutineSelect}
        selectedRoutineId={selectedRoutineId}
      />
      
      {hasDays && (
        <DaySelector 
          days={days}
          selectedDayId={dayId}
          onDaySelect={setSelectedDay}
          todayWeekday={todayWeekday}
        />
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{displayedRoutine.name}</CardTitle>
          <CardDescription>
            {formatDate(new Date())}
            {displayedDay && ` - ${weekdayTranslations[displayedDay.weekday] || displayedDay.weekday}`}
            {displayedDay?.weekday === todayWeekday && ' (Hoy)'}
          </CardDescription>
        </CardHeader>
      </Card>

      {!displayedDay?.exercises || !Array.isArray(displayedDay.exercises) || displayedDay.exercises.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No hay ejercicios programados para {displayedDay ? (weekdayTranslations[displayedDay.weekday] || displayedDay.weekday) : 'este día'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {displayedDay.exercises.map((dayExercise) => (
            <ExerciseCard
              key={dayExercise.exerciseId}
              exercise={dayExercise.exercise}
            />
          ))}
        </div>
      )}
    </div>
  );
} 