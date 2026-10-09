import { Response } from 'express';
import { KycService } from '../services/kycService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class KycController {
  constructor(private kycService: KycService) {}

  startDigiLocker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { consent } = req.query;

      if (consent !== 'true' && consent !== '1') {
        res.status(400).json({ error: 'Explicit user consent is mandatory before starting DigiLocker KYC.' });
        return;
      }

      const { url, isMock } = this.kycService.getAuthorizationUrl(userId);
      res.json({
        url,
        isMock,
        message: isMock
          ? 'DigiLocker Sandbox Mock Mode is active. Real UIDAI/DigiLocker calls are simulated.'
          : 'Redirecting to official DigiLocker OAuth portal.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to initialize DigiLocker flow.' });
    }
  };

  validateAadhaar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { aadhaarNumber } = req.body;

      const { last4 } = await this.kycService.verifyAadhaarInput(userId, aadhaarNumber);
      res.json({
        success: true,
        last4,
        message: 'Aadhaar format and Verhoeff checksum verified. Only last 4 digits retained.',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Aadhaar validation failed.' });
    }
  };

  callbackDigiLocker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { code, simulateFailure } = req.body;

      const result = await this.kycService.processDigiLockerCallback(
        userId,
        code || 'mock-code-1234',
        Boolean(simulateFailure)
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        data: result,
        message: 'DigiLocker KYC successfully verified and linked to your Ascend profile.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to process DigiLocker response.' });
    }
  };
}
