import { LoanCardConfig } from '../../../shared/types';

/**
 * Ascend Personal Loan Configuration
 *
 * PER STRICT REQUIREMENTS:
 * Every field value here is empty/null by default.
 * Do NOT add, guess, seed or compute any loan figures unless
 * a value is explicitly supplied in this config file by the user.
 * If all fields are null/empty, the UI shows the empty state "No active loans".
 */
export const loanCardConfig: LoanCardConfig = {
  productName: 'Ascend Personal Loan',
  loanAmount: null,
  monthlyEmi: null,
  interestRate: null,
  tenureMonths: null,
  outstandingPrincipal: null,
  nextEmiDate: null,
  totalInstallments: null,
  installmentsPaid: null,
};

export function isLoanConfigEmpty(config: LoanCardConfig): boolean {
  return (
    config.loanAmount == null &&
    config.monthlyEmi == null &&
    config.interestRate == null &&
    config.tenureMonths == null &&
    config.outstandingPrincipal == null &&
    config.nextEmiDate == null &&
    config.totalInstallments == null &&
    config.installmentsPaid == null
  );
}
