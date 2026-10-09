import { ScoreBand } from '../../../shared/types';

export interface BandConfig {
  name: ScoreBand;
  minScore: number;
  maxScore: number;
  color: 'red' | 'yellow' | 'green';
  foirPercent: number; // Low 30%, Medium 45%, High 55%
  indicativeRatePercent: number; // Indicative annual interest rate
  defaultTenureMonths: number;
  description: string;
}

export const CREDIT_BANDS_CONFIG: Record<ScoreBand, BandConfig> = {
  Low: {
    name: 'Low',
    minScore: 300,
    maxScore: 649,
    color: 'red',
    foirPercent: 30,
    indicativeRatePercent: 16.0,
    defaultTenureMonths: 36,
    description: 'Score reflects elevated credit risk. Eligibility is conservative with higher risk-adjusted rates.',
  },
  Medium: {
    name: 'Medium',
    minScore: 650,
    maxScore: 749,
    color: 'yellow',
    foirPercent: 45,
    indicativeRatePercent: 12.5,
    defaultTenureMonths: 48,
    description: 'Good credit standing. Qualifies for standard market rates and balanced credit lines.',
  },
  High: {
    name: 'High',
    minScore: 750,
    maxScore: 900,
    color: 'green',
    foirPercent: 55,
    indicativeRatePercent: 10.0,
    defaultTenureMonths: 60,
    description: 'Prime credit tier. Qualifies for maximum borrowing headroom and preferential interest rates.',
  },
};

export const GENERIC_CREDIT_TIPS = [
  'Pay credit card statements and loan dues on or before the due date to preserve repayment history.',
  'Keep overall credit card utilization strictly under 30% of your sanctioned credit limit.',
  'Avoid submitting multiple simultaneous credit applications within short time windows.',
  'Maintain a long, stable credit track record and monitor your credit report periodically for discrepancies.',
];

export function getScoreBand(score: number): BandConfig {
  if (score < 650) return CREDIT_BANDS_CONFIG.Low;
  if (score < 750) return CREDIT_BANDS_CONFIG.Medium;
  return CREDIT_BANDS_CONFIG.High;
}

/**
 * Calculates Present Value (PV) of maximum affordable EMI
 * PV = EMI * (1 - (1 + r)^(-n)) / r
 */
export function calculateEligibleAmount(
  monthlyEmi: number,
  annualRatePercent: number,
  tenureMonths: number
): number {
  if (monthlyEmi <= 0 || annualRatePercent <= 0 || tenureMonths <= 0) return 0;
  const r = annualRatePercent / 12 / 100;
  const pv = monthlyEmi * (1 - Math.pow(1 + r, -tenureMonths)) / r;
  return Math.max(0, Math.round(pv));
}
