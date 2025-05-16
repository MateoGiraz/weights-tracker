import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

type JWTPayload = {
  userId: string;
  username: string;
  iat: number;
  exp: number;
};

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { authorized: false, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return { authorized: false, error: 'User not found' };
    }

    return { 
      authorized: true, 
      user: { 
        id: user.id, 
        username: user.username 
      } 
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { authorized: false, error: 'Invalid token' };
  }
}

export function withAuth(handler: Function) {
  return async (
    request: NextRequest,
    context: { params: any }
  ) => {
    const auth = await verifyAuth(request);
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }
    
    return handler(request, auth.user, context);
  };
} 