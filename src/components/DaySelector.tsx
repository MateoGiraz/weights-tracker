'use client';

import { useState } from 'react';
import { Day } from '../redux/slices/routineSlice';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

interface DaySelectorProps {
  days: Day[];
  selectedDayId?: string;
  onDaySelect: (day: Day) => void;
  todayWeekday?: string;
}

export function DaySelector({ days, selectedDayId, onDaySelect, todayWeekday }: DaySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!days || days.length === 0) {
    return null;
  }

  const selectedDay = days.find(day => day.id === selectedDayId);
  
  // Sort days of the week in a logical order
  const sortedDays = [...days].sort((a, b) => {
    const weekdayOrder = {
      'MONDAY': 1,
      'TUESDAY': 2,
      'WEDNESDAY': 3,
      'THURSDAY': 4,
      'FRIDAY': 5,
      'SATURDAY': 6,
      'SUNDAY': 7
    };
    return (weekdayOrder[a.weekday as keyof typeof weekdayOrder] || 0) - 
           (weekdayOrder[b.weekday as keyof typeof weekdayOrder] || 0);
  });

  // Traducción de los días de la semana
  const weekdayTranslations: Record<string, string> = {
    "MONDAY": "LUNES",
    "TUESDAY": "MARTES",
    "WEDNESDAY": "MIÉRCOLES",
    "THURSDAY": "JUEVES",
    "FRIDAY": "VIERNES",
    "SATURDAY": "SÁBADO",
    "SUNDAY": "DOMINGO"
  };

  return (
    <div className="mb-4">
      <Button 
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center"
      >
        <span>
          {selectedDay 
            ? (
              <span>
                {weekdayTranslations[selectedDay.weekday] || selectedDay.weekday} 
                {selectedDay.weekday === todayWeekday && ' (Hoy)'}
              </span>
            ) 
            : 'Selecciona un día de entrenamiento'}
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
          <CardContent className="p-0">
            <ul className="divide-y">
              {sortedDays.map((day) => (
                <li 
                  key={day.id}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 
                    ${day.id === selectedDayId ? 'bg-blue-50' : ''}
                    ${day.weekday === todayWeekday ? 'border-l-4 border-blue-500' : ''}`}
                  onClick={() => {
                    onDaySelect(day);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      {weekdayTranslations[day.weekday] || day.weekday}
                      {day.weekday === todayWeekday && (
                        <span className="ml-2 text-xs text-blue-600 font-semibold">HOY</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {day.exercises?.length || 0} ejercicio{day.exercises?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 