import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Create a new routine
export const POST = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string }
) => {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Routine name is required' },
        { status: 400 }
      );
    }

    // Check if routine with this name already exists for this user
    const existingRoutine = await prisma.routine.findFirst({
      where: {
        name,
        userId: user.id,
      },
    });

    if (existingRoutine) {
      return NextResponse.json(
        { error: 'Routine with this name already exists' },
        { status: 409 }
      );
    }

    const routine = await prisma.routine.create({
      data: {
        name,
        userId: user.id,
      },
    });

    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error('Create routine error:', error);
    return NextResponse.json(
      { error: 'Failed to create routine' },
      { status: 500 }
    );
  }
});

// Get all routines for the authenticated user
export const GET = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string }
) => {
  try {
    const routines = await prisma.routine.findMany({
      where: {
        userId: user.id,
      },
      include: {
        days: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(routines);
  } catch (error) {
    console.error('Get routines error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routines' },
      { status: 500 }
    );
  }
}); 