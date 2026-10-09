import { Response } from 'express';
import { ProfileService } from '../services/profileService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import fs from 'fs';

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.profileService.getProfile(userId);
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch profile' });
    }
  };

  updateStep = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const stepNumber = parseInt(req.params.n, 10);

      if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 4) {
        res.status(400).json({ error: 'Step number must be between 1 and 4.' });
        return;
      }

      const updated = await this.profileService.updateStep(
        userId,
        stepNumber,
        req.body,
        req.file
      );

      res.json({
        success: true,
        message: `Step ${stepNumber} completed successfully.`,
        profile: updated,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update step.' });
    }
  };

  downloadIncomeProof = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { filePath, originalName } = await this.profileService.getIncomeProofFilePath(userId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(originalName)}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (err: any) {
      res.status(404).json({ error: err.message || 'File not found.' });
    }
  };
}
