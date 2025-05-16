import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Add an exercise to a day
export const POST = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { routineId: string; dayId: string } }
) => {
  try {
    const routineId = params.routineId;
    const dayId = params.dayId;
    const { exerciseId } = await request.json();

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 }
      );
    }

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

    // Check if the exercise is already added to the day
    const existingDayExercise = await prisma.dayExercise.findUnique({
      where: {
        dayId_exerciseId: {
          dayId,
          exerciseId,
        },
      },
    });

    if (existingDayExercise) {
      return NextResponse.json(
        { error: 'Exercise is already added to this day' },
        { status: 409 }
      );
    }

    // Add the exercise to the day
    const dayExercise = await prisma.dayExercise.create({
      data: {
        dayId,
        exerciseId,
      },
      include: {
        exercise: true,
      },
    });

    return NextResponse.json(dayExercise, { status: 201 });
  } catch (error) {
    console.error('Add exercise to day error:', error);
    return NextResponse.json(
      { error: 'Failed to add exercise to day' },
      { status: 500 }
    );
  }
});

// Get all exercises for a day
export const GET = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { routineId: string; dayId: string } }
) => {
  try {
    const routineId = params.routineId;
    const dayId = params.dayId;

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

    // Get all exercises for the day
    const dayExercises = await prisma.dayExercise.findMany({
      where: {
        dayId,
      },
      include: {
        exercise: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(dayExercises);
  } catch (error) {
    console.error('Get day exercises error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch day exercises' },
      { status: 500 }
    );
  }
}); 