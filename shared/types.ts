export interface UserProfileDto {
  id: string;
  email: string;
  profileCompleted: boolean;
  completionPercentage: number;
  currentStep: number;
  
  // Step 1
  dob?: string | null;
  age?: number | null;
  
  // Step 2
  aadhaarLast4?: string | null;
  digilockerVerified?: boolean;
  digilockerRef?: string | null;
  
  // Step 3
  fullName?: string | null;
  phone?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPincode?: string | null;
  annualIncome?: number | null;
  incomeSource?: string | null;
  hasIncomeProof?: boolean;
  incomeProofOriginalName?: string | null;
  
  // Step 4
  bankName?: string | null;
  upiId?: string | null;
  ifscCode?: string | null;
  bankDetailsSaved?: boolean;
}

export interface CreditCardDto {
  id: string;
  cardholderName: string;
  cardName: string;
  last4: string;
  creditLimit: number;
  amountSpent: number;
  statementDate: string;
  dueDate: string;
  minimumDue: number;
  daysLeft: number;
  isOverdue: boolean;
  dueStatusText: string;
  dueStatusColor: 'green' | 'yellow' | 'red';
  utilizationPercent: number;
  utilizationColor: 'green' | 'yellow' | 'red';
}

export interface LoanCardConfig {
  productName: string;
  loanAmount?: number | null;
  monthlyEmi?: number | null;
  interestRate?: number | null;
  tenureMonths?: number | null;
  outstandingPrincipal?: number | null;
  nextEmiDate?: string | null;
  totalInstallments?: number | null;
  installmentsPaid?: number | null;
}

export type ScoreBand = 'Low' | 'Medium' | 'High';

export interface CreditScoreDto {
  score: number;
  bureauName: string;
  fetchedAt: string;
  band: ScoreBand;
  bandColor: 'red' | 'yellow' | 'green';
  minScore: number;
  maxScore: number;
  
  eligibility: {
    annualIncome: number | null;
    monthlyIncome: number;
    foirPercent: number;
    existingEmis: number;
    maxAffordableEmi: number;
    indicativeRatePercent: number;
    defaultTenureMonths: number;
    eligibleAmount: number;
    disclaimer: string;
    tips: string[];
  };
}

export interface HomeSummaryDto {
  card: CreditCardDto | null;
  loan: LoanCardConfig | null;
  profileCompleted: boolean;
  completionPercentage: number;
}
