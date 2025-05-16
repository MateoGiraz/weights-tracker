import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Create a new exercise
export const POST = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string }
) => {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Exercise name is required' },
        { status: 400 }
      );
    }

    // Check if exercise with this name already exists
    const existingExercise = await prisma.exercise.findUnique({
      where: {
        name,
      },
    });

    if (existingExercise) {
      return NextResponse.json(
        { error: 'Exercise with this name already exists' },
        { status: 409 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Create exercise error:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
});

// Get all exercises
export const GET = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string }
) => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}); 