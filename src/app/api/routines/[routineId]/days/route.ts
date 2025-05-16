import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Weekday } from '@/generated/prisma';

// Create a new day for a routine
export const POST = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { routineId: string } }
) => {
  try {
    const routineId = params.routineId;
    const { weekday } = await request.json();

    if (!weekday || !Object.values(Weekday).includes(weekday as Weekday)) {
      return NextResponse.json(
        { error: 'Valid weekday is required (MONDAY, TUESDAY, etc.)', validOptions: Object.values(Weekday) },
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

    // Check if day with this weekday already exists in this routine
    const existingDay = await prisma.day.findFirst({
      where: {
        weekday: weekday as Weekday,
        routineId,
      },
    });

    if (existingDay) {
      return NextResponse.json(
        { error: `${weekday} is already configured in this routine` },
        { status: 409 }
      );
    }

    const day = await prisma.day.create({
      data: {
        weekday: weekday as Weekday,
        routineId,
      },
    });

    return NextResponse.json(day, { status: 201 });
  } catch (error) {
    console.error('Create day error:', error);
    return NextResponse.json(
      { error: 'Failed to create day' },
      { status: 500 }
    );
  }
});

// Get all days for a routine
export const GET = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { routineId: string } }
) => {
  try {
    const routineId = params.routineId;

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

    const days = await prisma.day.findMany({
      where: {
        routineId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: {
        weekday: 'asc',
      },
    });

    return NextResponse.json(days);
  } catch (error) {
    console.error('Get days error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch days' },
      { status: 500 }
    );
  }
}); 