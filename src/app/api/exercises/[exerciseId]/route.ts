import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get a specific exercise
export const GET = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { exerciseId: string } }
) => {
  try {
    const exerciseId = params.exerciseId;

    const exercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Ejercicio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Get exercise error:', error);
    return NextResponse.json(
      { error: 'Error al obtener ejercicio' },
      { status: 500 }
    );
  }
});

// Delete an exercise
export const DELETE = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { exerciseId: string } }
) => {
  try {
    const exerciseId = params.exerciseId;

    // Verificar si el ejercicio existe
    const exercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Ejercicio no encontrado' },
        { status: 404 }
      );
    }

    // Primero, eliminamos todas las relaciones DayExercise
    await prisma.dayExercise.deleteMany({
      where: {
        exerciseId,
      },
    });

    // Luego, eliminamos todos los registros de pesos asociados
    await prisma.weight.deleteMany({
      where: {
        exerciseId,
      },
    });

    // Finalmente, eliminamos el ejercicio
    await prisma.exercise.delete({
      where: {
        id: exerciseId,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Ejercicio eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete exercise error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar ejercicio' },
      { status: 500 }
    );
  }
}); 