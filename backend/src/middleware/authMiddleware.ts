import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';

export const JWT_SECRET = process.env.JWT_SECRET || 'ascend_jwt_production_secret_key_2026';
export const SESSION_COOKIE_NAME = 'ascend_session';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateSessionToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

export function setSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd, // Allow non-Secure cookie in local dev only
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
  });
}

export function createAuthMiddleware(prisma: PrismaClient) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token = req.cookies?.[SESSION_COOKIE_NAME];

      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        res.status(401).json({ error: 'Authentication required. No session found.' });
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        clearSessionCookie(res);
        res.status(401).json({ error: 'Session user does not exist.' });
        return;
      }

      req.user = user;
      next();
    } catch (err) {
      clearSessionCookie(res);
      res.status(401).json({ error: 'Invalid or expired session.' });
    }
  };
}
