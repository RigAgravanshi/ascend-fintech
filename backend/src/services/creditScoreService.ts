import { PrismaClient } from '@prisma/client';
import { CreditScoreDto, ScoreBand } from '../../../shared/types';
import { getScoreBand, calculateEligibleAmount, GENERIC_CREDIT_TIPS } from '../config/creditBands.config';
import { loanCardConfig } from '../config/loanCard.config';

export class CreditScoreService {
  constructor(private prisma: PrismaClient) {}

  async getCreditScore(userId: string): Promise<CreditScoreDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        creditScores: {
          orderBy: { fetchedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const latestScore = user.creditScores[0] || {
      score: 750,
      bureauName: 'Ascend Credit Analytics',
      fetchedAt: new Date(),
    };

    const bandConfig = getScoreBand(latestScore.score);
    const annualIncome = user.annualIncome || null;
    const monthlyIncome = annualIncome ? Math.round(annualIncome / 12) : 0;

    // Existing EMIs come ONLY from the loan card config; if EMI not provided, treat as 0
    const existingEmis = loanCardConfig.monthlyEmi || 0;

    // maxAffordableEmi = (FOIR% of monthlyIncome) minus existing EMIs
    const foirMultiplier = bandConfig.foirPercent / 100;
    const maxEmiBeforeLiabilities = Math.round(monthlyIncome * foirMultiplier);
    const maxAffordableEmi = Math.max(0, maxEmiBeforeLiabilities - existingEmis);

    // eligibleAmount = present value of maxAffordableEmi over default tenure at indicative rate
    const eligibleAmount = calculateEligibleAmount(
      maxAffordableEmi,
      bandConfig.indicativeRatePercent,
      bandConfig.defaultTenureMonths
    );

    const tips = [...GENERIC_CREDIT_TIPS];
    if (bandConfig.name === 'Low') {
      tips.unshift(
        'Action for Low band: Prioritize resolving outstanding balance obligations and clear any payment defaults.'
      );
    }

    return {
      score: latestScore.score,
      bureauName: latestScore.bureauName,
      fetchedAt: latestScore.fetchedAt.toISOString(),
      band: bandConfig.name,
      bandColor: bandConfig.color,
      minScore: 300,
      maxScore: 900,
      eligibility: {
        annualIncome,
        monthlyIncome,
        foirPercent: bandConfig.foirPercent,
        existingEmis,
        maxAffordableEmi,
        indicativeRatePercent: bandConfig.indicativeRatePercent,
        defaultTenureMonths: bandConfig.defaultTenureMonths,
        eligibleAmount,
        disclaimer: 'Estimated eligibility, not a loan offer. Lender decisions may differ.',
        tips,
      },
    };
  }
}
