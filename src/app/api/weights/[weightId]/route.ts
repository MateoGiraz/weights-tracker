import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get a specific weight record by ID
export const GET = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { weightId: string } }
) => {
  try {
    const weightId = params.weightId;

    // Find the weight record
    const weight = await prisma.weight.findUnique({
      where: {
        id: weightId,
      },
      include: {
        exercise: true,
      },
    });

    if (!weight) {
      return NextResponse.json(
        { error: 'Weight record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(weight);
  } catch (error) {
    console.error('Get weight error:', error);
    return NextResponse.json(
      { error: 'Failed to get weight record' },
      { status: 500 }
    );
  }
});

// Update a weight record
export const PUT = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { weightId: string } }
) => {
  try {
    const weightId = params.weightId;
    
    // Parse request body
    const body = await request.json();
    const { amount, reps, sets } = body;

    // Validate weight amount if provided
    let weightAmount = null;
    if (amount !== undefined && amount !== null) {
      weightAmount = parseFloat(amount);
      if (isNaN(weightAmount) || weightAmount <= 0) {
        return NextResponse.json(
          { error: 'Weight amount must be a positive number' },
          { status: 400 }
        );
      }
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

    // Check if at least one field is provided
    if (weightAmount === null && repsValue === null && setsValue === null) {
      return NextResponse.json(
        { error: 'At least one field must be provided to update' },
        { status: 400 }
      );
    }

    // Find the weight record
    const existingWeight = await prisma.weight.findUnique({
      where: {
        id: weightId,
      },
    });

    if (!existingWeight) {
      return NextResponse.json(
        { error: 'Weight record not found' },
        { status: 404 }
      );
    }

    // Update the weight record
    const updatedWeight = await prisma.weight.update({
      where: {
        id: weightId,
      },
      data: {
        ...(weightAmount !== null && { amount: weightAmount }),
        ...(repsValue !== null && { reps: repsValue }),
        ...(setsValue !== null && { sets: setsValue }),
      },
    });

    return NextResponse.json(updatedWeight);
  } catch (error) {
    console.error('Update weight error:', error);
    return NextResponse.json(
      { error: 'Failed to update weight record' },
      { status: 500 }
    );
  }
});

// Delete a weight record
export const DELETE = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string },
  { params }: { params: { weightId: string } }
) => {
  try {
    const weightId = params.weightId;

    // Find the weight record
    const weight = await prisma.weight.findUnique({
      where: {
        id: weightId,
      },
    });

    if (!weight) {
      return NextResponse.json(
        { error: 'Weight record not found' },
        { status: 404 }
      );
    }

    // Delete the weight record
    await prisma.weight.delete({
      where: {
        id: weightId,
      },
    });

    return NextResponse.json({ message: 'Weight record deleted successfully' });
  } catch (error) {
    console.error('Delete weight error:', error);
    return NextResponse.json(
      { error: 'Failed to delete weight record' },
      { status: 500 }
    );
  }
}); 