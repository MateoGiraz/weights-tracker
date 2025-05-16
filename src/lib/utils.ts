import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Weekday } from '../generated/prisma';

/**
 * Converts JavaScript's getDay() result to Prisma Weekday enum
 * @returns Current weekday as Prisma Weekday enum
 */
export function getCurrentWeekday(): Weekday {
  const days: Weekday[] = [Weekday.SUNDAY, Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY, Weekday.THURSDAY, Weekday.FRIDAY, Weekday.SATURDAY];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
}

/**
 * Formats a date as a readable string
 */
export function formatDate(date: Date): string {
  // Nombres de los días en español
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Nombres de los meses en español
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  const diaSemana = diasSemana[date.getDay()];
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  const anio = date.getFullYear();
  
  return `${diaSemana}, ${dia} de ${mes} de ${anio}`;
}

// Merges className utility for Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to increment/decrement weight by 2.5
export function adjustWeight(currentWeight: number, increment: boolean): number {
  const step = 2.5;
  return increment ? currentWeight + step : Math.max(0, currentWeight - step);
} 