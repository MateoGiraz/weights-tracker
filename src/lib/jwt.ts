import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export type UserData = {
  userId: string;
  username: string;
};

export async function verifyToken(token: string): Promise<UserData | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
      iat: number;
      exp: number;
    };
    
    return {
      userId: decoded.userId,
      username: decoded.username
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
} 