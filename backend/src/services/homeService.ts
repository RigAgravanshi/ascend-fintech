import { PrismaClient } from '@prisma/client';
import { HomeSummaryDto, CreditCardDto } from '../../../shared/types';
import { loanCardConfig, isLoanConfigEmpty } from '../config/loanCard.config';
import { calculateDueStatus, calculateUtilization } from '../utils/creditCardUtils';
import { ProfileService } from './profileService';

export class HomeService {
  constructor(
    private prisma: PrismaClient,
    private profileService: ProfileService
  ) {}

  async getHomeSummary(userId: string): Promise<HomeSummaryDto> {
    const cardRecord = await this.prisma.creditCard.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    let cardDto: CreditCardDto | null = null;
    if (cardRecord) {
      const dueStatus = calculateDueStatus(cardRecord.dueDate);
      const utilization = calculateUtilization(cardRecord.amountSpent, cardRecord.creditLimit);

      cardDto = {
        id: cardRecord.id,
        cardholderName: cardRecord.cardholderName,
        cardName: cardRecord.cardName,
        last4: cardRecord.last4,
        creditLimit: cardRecord.creditLimit,
        amountSpent: cardRecord.amountSpent,
        statementDate: cardRecord.statementDate.toISOString().split('T')[0],
        dueDate: cardRecord.dueDate.toISOString().split('T')[0],
        minimumDue: cardRecord.minimumDue,
        daysLeft: dueStatus.daysLeft,
        isOverdue: dueStatus.isOverdue,
        dueStatusText: dueStatus.dueStatusText,
        dueStatusColor: dueStatus.dueStatusColor,
        utilizationPercent: utilization.utilizationPercent,
        utilizationColor: utilization.utilizationColor,
      };
    }

    const userProfile = await this.profileService.getProfile(userId);

    // B) Active loans and liabilities section
    // If the config is entirely empty, return null so empty state "No active loans" is shown
    const loanDto = isLoanConfigEmpty(loanCardConfig) ? null : loanCardConfig;

    return {
      card: cardDto,
      loan: loanDto,
      profileCompleted: userProfile.profileCompleted,
      completionPercentage: userProfile.completionPercentage,
    };
  }
}
