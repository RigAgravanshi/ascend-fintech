export type InterestMethod = 'reducing' | 'flat';

export interface CalculatorInput {
  loanAmount: number; // Principal in INR
  annualInterestRate: number; // in percentage, e.g. 10.5 for 10.5%
  tenureMonths: number; // e.g. 12, 24, 36
  processingFeePercent: number; // in percentage, e.g. 1.5%
  interestMethod?: InterestMethod; // 'reducing' | 'flat', default 'reducing'
  gstRatePercent?: number; // default 18%
}

export interface AmortizationScheduleRow {
  month: number;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface CalculatorResult {
  principal: number;
  interestRatePercent: number;
  interestMethod: InterestMethod;
  monthlyEmi: number;
  totalInterest: number;
  processingFeePercent: number;
  processingFeeAmount: number;
  gstRatePercent: number;
  gstAmount: number;
  totalPayable: number;
  effectiveAprPercent: number;
  schedule: AmortizationScheduleRow[];
}

export function validateCalculatorInput(input: CalculatorInput): { isValid: boolean; error?: string } {
  if (input.loanAmount <= 0 || isNaN(input.loanAmount)) {
    return { isValid: false, error: 'Loan amount must be a positive number' };
  }
  if (input.annualInterestRate < 0 || input.annualInterestRate > 100 || isNaN(input.annualInterestRate)) {
    return { isValid: false, error: 'Annual interest rate must be between 0% and 100%' };
  }
  if (input.tenureMonths <= 0 || !Number.isInteger(input.tenureMonths) || input.tenureMonths > 360) {
    return { isValid: false, error: 'Tenure must be between 1 and 360 months' };
  }
  if (input.processingFeePercent < 0 || input.processingFeePercent > 20 || isNaN(input.processingFeePercent)) {
    return { isValid: false, error: 'Processing fee percent must be between 0% and 20%' };
  }
  return { isValid: true };
}

/**
 * Calculates Effective APR including upfront processing fee and GST
 * Uses Newton-Raphson approximation for IRR
 */
export function calculateEffectiveApr(
  netDisbursal: number,
  monthlyEmi: number,
  tenureMonths: number,
  nominalAnnualRate: number
): number {
  if (netDisbursal <= 0 || monthlyEmi <= 0 || tenureMonths <= 0) {
    return nominalAnnualRate;
  }

  // Initial guess for monthly rate
  let r = (nominalAnnualRate / 100) / 12;
  if (r <= 0) r = 0.01;

  for (let i = 0; i < 50; i++) {
    // f(r) = netDisbursal - monthlyEmi * (1 - (1+r)^(-n)) / r
    const factor = Math.pow(1 + r, -tenureMonths);
    const f = netDisbursal - (monthlyEmi * (1 - factor)) / r;

    // Derivative f'(r):
    // d/dr [ (1 - (1+r)^-n) / r ] = [ r * n*(1+r)^(-n-1) - (1 - (1+r)^-n) ] / r^2
    const numerator = r * tenureMonths * Math.pow(1 + r, -tenureMonths - 1) - (1 - factor);
    const df = -(monthlyEmi * numerator) / (r * r);

    if (Math.abs(df) < 1e-12) break;
    const nextR = r - f / df;
    if (Math.abs(nextR - r) < 1e-7) {
      r = nextR;
      break;
    }
    r = nextR > 0 ? nextR : r / 2;
  }

  const annualizedApr = r * 12 * 100;
  return Math.max(0, Math.round(annualizedApr * 100) / 100);
}

export function calculateLoanInterest(input: CalculatorInput): CalculatorResult {
  const validation = validateCalculatorInput(input);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid loan input parameters');
  }

  const P = Math.round(input.loanAmount);
  const annualRate = input.annualInterestRate;
  const n = Math.round(input.tenureMonths);
  const method: InterestMethod = input.interestMethod || 'reducing';
  const feePercent = input.processingFeePercent || 0;
  const gstPercent = input.gstRatePercent !== undefined ? input.gstRatePercent : 18;

  const feeAmount = Math.round((P * feePercent) / 100);
  const gstAmount = Math.round((feeAmount * gstPercent) / 100);

  let monthlyEmi = 0;
  let totalInterest = 0;
  const schedule: AmortizationScheduleRow[] = [];

  if (method === 'flat') {
    // Flat method: interest = P * (rate / 100) * (n / 12)
    totalInterest = Math.round((P * (annualRate / 100) * n) / 12);
    const totalRepayment = P + totalInterest;
    monthlyEmi = Math.round(totalRepayment / n);

    let currentBalance = P;
    const monthlyPrincipal = Math.round(P / n);
    const monthlyInterest = Math.round(totalInterest / n);

    for (let month = 1; month <= n; month++) {
      const isLast = month === n;
      const principalForMonth = isLast ? currentBalance : Math.min(currentBalance, monthlyPrincipal);
      const interestForMonth = isLast ? Math.max(0, totalInterest - monthlyInterest * (n - 1)) : monthlyInterest;
      const closing = Math.max(0, currentBalance - principalForMonth);

      schedule.push({
        month,
        openingBalance: currentBalance,
        emi: principalForMonth + interestForMonth,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        closingBalance: closing,
      });

      currentBalance = closing;
    }
  } else {
    // Reducing balance method:
    // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const r = annualRate / 12 / 100;

    if (r === 0) {
      monthlyEmi = Math.round(P / n);
      totalInterest = 0;
      let balance = P;
      for (let month = 1; month <= n; month++) {
        const principalPaid = month === n ? balance : Math.round(P / n);
        const closing = Math.max(0, balance - principalPaid);
        schedule.push({
          month,
          openingBalance: balance,
          emi: principalPaid,
          principalPaid,
          interestPaid: 0,
          closingBalance: closing,
        });
        balance = closing;
      }
    } else {
      const powFactor = Math.pow(1 + r, n);
      monthlyEmi = Math.round((P * r * powFactor) / (powFactor - 1));

      let balance = P;
      let accumInterest = 0;

      for (let month = 1; month <= n; month++) {
        const interestForMonth = Math.round(balance * r);
        let principalForMonth = monthlyEmi - interestForMonth;

        if (month === n || balance - principalForMonth < 0) {
          principalForMonth = balance;
        }

        const closing = Math.max(0, balance - principalForMonth);
        accumInterest += interestForMonth;

        schedule.push({
          month,
          openingBalance: balance,
          emi: principalForMonth + interestForMonth,
          principalPaid: principalForMonth,
          interestPaid: interestForMonth,
          closingBalance: closing,
        });

        balance = closing;
      }

      totalInterest = accumInterest;
    }
  }

  const totalPayable = P + totalInterest + feeAmount + gstAmount;
  const netDisbursal = P - feeAmount - gstAmount;
  const effectiveApr = calculateEffectiveApr(netDisbursal, monthlyEmi, n, annualRate);

  return {
    principal: P,
    interestRatePercent: annualRate,
    interestMethod: method,
    monthlyEmi,
    totalInterest,
    processingFeePercent: feePercent,
    processingFeeAmount: feeAmount,
    gstRatePercent: gstPercent,
    gstAmount,
    totalPayable,
    effectiveAprPercent: effectiveApr,
    schedule,
  };
}
