import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Get a specific routine with details
export const GET = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { routineId: string } }
) => {
  try {
    const routineId = params.routineId;

    if (!routineId) {
      return NextResponse.json(
        { error: 'Routine ID is required' },
        { status: 400 }
      );
    }

    const routine = await prisma.routine.findUnique({
      where: {
        id: routineId,
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
          orderBy: {
            weekday: 'asc',
          },
        },
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

    return NextResponse.json(routine);
  } catch (error) {
    console.error('Get routine error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routine' },
      { status: 500 }
    );
  }
});

// Update a routine
export const PUT = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { routineId: string } }
) => {
  try {
    const routineId = params.routineId;
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Verify the routine exists and belongs to this user
    const existingRoutine = await prisma.routine.findUnique({
      where: { id: routineId }
    });

    if (!existingRoutine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    if (existingRoutine.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this routine' },
        { status: 403 }
      );
    }

    const updatedRoutine = await prisma.routine.update({
      where: { id: routineId },
      data: { name }
    });

    return NextResponse.json(updatedRoutine);
  } catch (error) {
    console.error('Error updating routine:', error);
    return NextResponse.json(
      { error: 'Failed to update routine' },
      { status: 500 }
    );
  }
});

// Delete a routine
export const DELETE = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { routineId: string } }
) => {
  try {
    const routineId = params.routineId;

    // Verify the routine exists and belongs to this user
    const existingRoutine = await prisma.routine.findUnique({
      where: { id: routineId }
    });

    if (!existingRoutine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    if (existingRoutine.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this routine' },
        { status: 403 }
      );
    }

    // Delete related days first (cascade should handle this but just to be safe)
    await prisma.day.deleteMany({
      where: { routineId }
    });

    // Then delete the routine
    await prisma.routine.delete({
      where: { id: routineId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting routine:', error);
    return NextResponse.json(
      { error: 'Failed to delete routine' },
      { status: 500 }
    );
  }
}); 