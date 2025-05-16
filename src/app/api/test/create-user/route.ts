import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    // Create a test user with hardcoded credentials
    const username = 'testuser';
    const password = 'password123';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Test user already exists',
        user: {
          id: existingUser.id,
          username: existingUser.username
        }
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: user.id,
        username: user.username,
        rawPassword: password // Only for testing!
      },
    });
  } catch (error) {
    console.error('Create test user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test user',
      details: (error as Error).message,
    }, { status: 500 });
  }
} 