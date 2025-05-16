import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentWeekday, formatDate } from '@/lib/utils';

// Get routine for the current day
export const GET = withAuth(async (
  request: NextRequest,
  user: { id: string; username: string }
) => {
  try {
    // Get current day of week as Weekday enum
    const today = getCurrentWeekday();
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    
    // Find routines that have a day matching today
    const routine = await prisma.routine.findFirst({
      where: {
        userId: user.id,
        days: {
          some: {
            weekday: today,
          }
        }
      },
      include: {
        days: {
          where: {
            weekday: today,
          },
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    if (!routine) {
      return NextResponse.json(null);
    }

    return NextResponse.json(routine);
  } catch (error) {
    console.error('Get today\'s routine error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s routine' },
      { status: 500 }
    );
  }
}); 