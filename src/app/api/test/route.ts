import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check if database is accessible
    const userCount = await prisma.user.count();
    
    // Get a list of users (without passwords)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount,
        users,
      },
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to database',
      details: (error as Error).message,
    }, { status: 500 });
  }
} 