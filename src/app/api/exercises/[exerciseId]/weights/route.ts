import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Add a weight record for an exercise
export const POST = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { exerciseId: string } }
) => {
  try {
    const exerciseId = params.exerciseId;
    
    // Parse request body
    const body = await request.json();
    const { weight, reps, sets } = body;

    if (weight === undefined || weight === null) {
      return NextResponse.json(
        { error: 'Weight amount is required' },
        { status: 400 }
      );
    }

    // Validate weight is a positive number
    const weightAmount = parseFloat(weight);
    if (isNaN(weightAmount) || weightAmount <= 0) {
      return NextResponse.json(
        { error: 'Weight must be a positive number' },
        { status: 400 }
      );
    }

    // Validate reps if provided
    let repsValue = null;
    if (reps !== undefined && reps !== null) {
      repsValue = parseInt(reps);
      if (isNaN(repsValue) || repsValue <= 0) {
        return NextResponse.json(
          { error: 'Reps must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Validate sets if provided
    let setsValue = null;
    if (sets !== undefined && sets !== null) {
      setsValue = parseInt(sets);
      if (isNaN(setsValue) || setsValue <= 0) {
        return NextResponse.json(
          { error: 'Sets must be a positive number' },
          { status: 400 }
        );
      }
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

    // Create the weight record
    const weightRecord = await prisma.weight.create({
      data: {
        amount: weightAmount,
        reps: repsValue,
        sets: setsValue,
        exerciseId,
      },
    });

    return NextResponse.json(weightRecord, { status: 201 });
  } catch (error) {
    console.error('Add weight error:', error);
    return NextResponse.json(
      { error: 'Failed to add weight' },
      { status: 500 }
    );
  }
});

// Get all weights for an exercise
export const GET = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { exerciseId: string } }
) => {
  try {
    const exerciseId = params.exerciseId;

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

    // Get all weights for the exercise
    const weights = await prisma.weight.findMany({
      where: {
        exerciseId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(weights);
  } catch (error) {
    console.error('Get weights error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weights' },
      { status: 500 }
    );
  }
}); 