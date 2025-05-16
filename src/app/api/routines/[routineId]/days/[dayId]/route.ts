import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Weekday } from '@/generated/prisma';

// Valid weekday values
const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// Get a specific day
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

    const day = await prisma.day.findUnique({
      where: {
        id: dayId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
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

    return NextResponse.json(day);
  } catch (error) {
    console.error('Get day error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch day' },
      { status: 500 }
    );
  }
});

// Update a day
export const PUT = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { routineId: string; dayId: string } }
) => {
  try {
    const routineId = params.routineId;
    const dayId = params.dayId;
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

    // Check if the day exists
    const existingDay = await prisma.day.findUnique({
      where: {
        id: dayId,
      },
    });

    if (!existingDay) {
      return NextResponse.json(
        { error: 'Day not found' },
        { status: 404 }
      );
    }

    if (existingDay.routineId !== routineId) {
      return NextResponse.json(
        { error: 'Day does not belong to this routine' },
        { status: 400 }
      );
    }

    // Check if there's another day with the same weekday in the routine
    const duplicateDay = await prisma.day.findFirst({
      where: {
        weekday: weekday as Weekday,
        routineId,
        NOT: {
          id: dayId,
        },
      },
    });

    if (duplicateDay) {
      return NextResponse.json(
        { error: `${weekday} is already configured in this routine` },
        { status: 409 }
      );
    }

    const updatedDay = await prisma.day.update({
      where: {
        id: dayId,
      },
      data: {
        weekday: weekday as Weekday,
      },
    });

    return NextResponse.json(updatedDay);
  } catch (error) {
    console.error('Update day error:', error);
    return NextResponse.json(
      { error: 'Failed to update day' },
      { status: 500 }
    );
  }
});

// Delete a day
export const DELETE = withAuth(async (
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

    // Check if the day exists
    const existingDay = await prisma.day.findUnique({
      where: {
        id: dayId,
      },
    });

    if (!existingDay) {
      return NextResponse.json(
        { error: 'Day not found' },
        { status: 404 }
      );
    }

    if (existingDay.routineId !== routineId) {
      return NextResponse.json(
        { error: 'Day does not belong to this routine' },
        { status: 400 }
      );
    }

    await prisma.day.delete({
      where: {
        id: dayId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete day error:', error);
    return NextResponse.json(
      { error: 'Failed to delete day' },
      { status: 500 }
    );
  }
}); 