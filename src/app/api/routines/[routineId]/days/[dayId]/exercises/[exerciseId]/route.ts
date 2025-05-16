import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Remove an exercise from a day
export const DELETE = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { routineId: string; dayId: string; exerciseId: string } }
) => {
  try {
    const routineId = params.routineId;
    const dayId = params.dayId;
    const exerciseId = params.exerciseId;

    // Check if the routine exists and belongs to the user
    const routine = await prisma.routine.findUnique({
      where: {
        id: routineId,
      },
    });

    if (!routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    if (routine.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if the day exists and belongs to the routine
    const day = await prisma.day.findUnique({
      where: {
        id: dayId,
      },
    });

    if (!day) {
      return NextResponse.json(
        { error: 'Day not found' },
        { status: 404 }
      );
    }

    if (day.routineId !== routineId) {
      return NextResponse.json(
        { error: 'Day does not belong to this routine' },
        { status: 400 }
      );
    }

    // Check if the exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Check if the exercise is added to the day
    const dayExercise = await prisma.dayExercise.findUnique({
      where: {
        dayId_exerciseId: {
          dayId,
          exerciseId,
        },
      },
    });

    if (!dayExercise) {
      return NextResponse.json(
        { error: 'Exercise is not added to this day' },
        { status: 404 }
      );
    }

    // Remove the exercise from the day
    await prisma.dayExercise.delete({
      where: {
        dayId_exerciseId: {
          dayId,
          exerciseId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove exercise from day error:', error);
    return NextResponse.json(
      { error: 'Failed to remove exercise from day' },
      { status: 500 }
    );
  }
}); 