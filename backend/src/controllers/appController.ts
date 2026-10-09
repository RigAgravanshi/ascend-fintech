import { Response } from 'express';
import { HomeService } from '../services/homeService';
import { CreditScoreService } from '../services/creditScoreService';
import { calculateLoanInterest, validateCalculatorInput } from '../../../shared/interestCalculator';
import { loanCardConfig, isLoanConfigEmpty } from '../config/loanCard.config';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AppController {
  constructor(
    private homeService: HomeService,
    private creditScoreService: CreditScoreService
  ) {}

  getHomeSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const summary = await this.homeService.getHomeSummary(userId);
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch home summary.' });
    }
  };

  getCards = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const summary = await this.homeService.getHomeSummary(userId);
      res.json({ card: summary.card });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch card.' });
    }
  };

  getLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Returns the single loan card from config. If empty, null.
      const loan = isLoanConfigEmpty(loanCardConfig) ? null : loanCardConfig;
      res.json({ loan });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch loan information.' });
    }
  };

  getCreditScore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const creditScore = await this.creditScoreService.getCreditScore(userId);
      res.json(creditScore);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch credit score.' });
    }
  };

  calculateEstimate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const input = req.body;
      const validation = validateCalculatorInput(input);
      if (!validation.isValid) {
        res.status(400).json({ error: validation.error });
        return;
      }
      const result = calculateLoanInterest(input);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Interest calculation failed.' });
    }
  };
}
