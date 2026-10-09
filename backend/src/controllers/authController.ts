import { Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, setSessionCookie, clearSessionCookie, generateSessionToken } from '../middleware/authMiddleware';

export class AuthController {
  constructor(private authService: AuthService) {}

  requestCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const result = await this.authService.requestCode(email, ip);
      res.json(result);
    } catch (err: any) {
      // In case of unexpected error, return 500
      res.status(500).json({ error: err.message || 'Failed to process OTP request.' });
    }
  };

  verifyCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;
      const { user } = await this.authService.verifyCode(email, code);

      const token = generateSessionToken(user.id, user.email);
      setSessionCookie(res, token);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          profileCompleted: user.profileCompleted,
          currentStep: user.currentStep,
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Verification failed.' });
    }
  };

  demoLogin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const { user } = await this.authService.demoLogin(email);

      const token = generateSessionToken(user.id, user.email);
      setSessionCookie(res, token);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          profileCompleted: user.profileCompleted,
          currentStep: user.currentStep,
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Demo login failed.' });
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    clearSessionCookie(res);
    res.json({ success: true, message: 'Logged out successfully.' });
  };

  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        profileCompleted: req.user.profileCompleted,
        currentStep: req.user.currentStep,
      },
    });
  };
}
