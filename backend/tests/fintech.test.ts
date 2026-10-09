import { describe, it, expect, vi } from 'vitest';
import { calculateLoanInterest, validateCalculatorInput } from '../../shared/interestCalculator';
import { calculateAge, validateIfsc, validateUpi, isValidEmail, normalizeEmail } from '../src/utils/validators';
import { isPdfMagicBytes } from '../src/utils/magicBytes';
import { calculateDueStatus, calculateUtilization } from '../src/utils/creditCardUtils';
import { getScoreBand, calculateEligibleAmount } from '../src/config/creditBands.config';
import { generateOtpCode, hashOtpCode, verifyOtpHash, encryptData, decryptData } from '../src/utils/crypto';

describe('Ascend Fintech Core Test Suite', () => {
  // 1. OTP Generation, Expiry, and Attempts
  describe('OTP Security & Crypto', () => {
    it('generates a 6-digit numeric OTP code', () => {
      for (let i = 0; i < 20; i++) {
        const code = generateOtpCode();
        expect(code).toMatch(/^\d{6}$/);
        const num = parseInt(code, 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThanOrEqual(999999);
      }
    });

    it('verifies valid OTP hash correctly', () => {
      const email = 'user@example.com';
      const code = '654321';
      const hash = hashOtpCode(code, email);
      expect(verifyOtpHash(code, email, hash)).toBe(true);
      expect(verifyOtpHash('123456', email, hash)).toBe(false);
      expect(verifyOtpHash(code, 'other@example.com', hash)).toBe(false);
    });

    it('encrypts and decrypts sensitive bank data at rest', () => {
      const payload = JSON.stringify({
        bankName: 'Fictional Apex Vault',
        upiId: 'kabir@partnerpay',
        ifscCode: 'ABCD0123456',
      });
      const cipher = encryptData(payload);
      expect(cipher).toContain(':');
      expect(cipher).not.toContain('ABCD0123456');

      const decrypted = decryptData(cipher);
      expect(decrypted).toBe(payload);
    });
  });

  // 2. Age Check (17, 18, future date, unrealistic age)
  describe('Date of Birth & Age Calculation', () => {
    const fixedToday = new Date('2026-10-09T00:00:00Z');

    it('rejects future dates', () => {
      const result = calculateAge('2027-01-01', fixedToday);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be in the future');
    });

    it('blocks users below 18 with exact dialog requirement', () => {
      // 17 years old
      const result = calculateAge('2009-10-15', fixedToday);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Sorry, people below 18 are not allowed.');
    });

    it('allows users who are exactly 18 years old', () => {
      const result = calculateAge('2008-10-09', fixedToday);
      expect(result.isValid).toBe(true);
      expect(result.age).toBe(18);
    });

    it('allows adults (e.g. 28 years old)', () => {
      const result = calculateAge('1998-05-10', fixedToday);
      expect(result.isValid).toBe(true);
      expect(result.age).toBe(28);
    });

    it('rejects unrealistic ages over 120', () => {
      const result = calculateAge('1900-01-01', fixedToday);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unrealistic age');
    });
  });

  // 3. IFSC and UPI Validation
  describe('IFSC and UPI Validation', () => {
    it('validates IFSC codes per ^[A-Z]{4}0[A-Z0-9]{6}$ with fictional fixtures', () => {
      // Valid fictional IFSCs
      expect(validateIfsc('ABCD0123456')).toBe(true);
      expect(validateIfsc('XYZB0998877')).toBe(true);
      expect(validateIfsc('abcd0123456')).toBe(true); // normalizes to upper

      // Invalid IFSCs
      expect(validateIfsc('ABC0123456')).toBe(false); // only 3 letters
      expect(validateIfsc('ABCD1123456')).toBe(false); // 5th character not 0
      expect(validateIfsc('ABCD012345')).toBe(false); // too short
      expect(validateIfsc('ABCD01234567')).toBe(false); // too long
      expect(validateIfsc('ABCD 123456')).toBe(false);
    });

    it('validates UPI ID format with fictional handles', () => {
      // Valid fictional UPI IDs
      expect(validateUpi('kabir@partner')).toBe(true);
      expect(validateUpi('user.finance@paynet')).toBe(true);
      expect(validateUpi('john_doe12@sandbox')).toBe(true);

      // Invalid UPI IDs
      expect(validateUpi('invalidupi')).toBe(false);
      expect(validateUpi('@sandbox')).toBe(false);
      expect(validateUpi('user@')).toBe(false);
    });

    it('normalizes and validates emails', () => {
      expect(normalizeEmail('  Kabir@Ascend.Test  ')).toBe('kabir@ascend.test');
      expect(isValidEmail('kabir@ascend.test')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });
  });

  // 4. PDF Magic Bytes and File Rules
  describe('PDF File Verification', () => {
    it('verifies authentic PDF magic header %PDF-', () => {
      const validPdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]); // %PDF-1.5
      expect(isPdfMagicBytes(validPdfBuffer)).toBe(true);
    });

    it('rejects spoofed files (e.g. text or image renamed to .pdf)', () => {
      const fakePdfBuffer = Buffer.from('GIF89a Fake Image');
      expect(isPdfMagicBytes(fakePdfBuffer)).toBe(false);

      const htmlBuffer = Buffer.from('<html><body>Fake</body></html>');
      expect(isPdfMagicBytes(htmlBuffer)).toBe(false);
    });
  });

  // 5. Interest Calculator (Reducing & Flat)
  describe('Interest & EMI Calculations', () => {
    it('validates calculator inputs correctly', () => {
      expect(validateCalculatorInput({ loanAmount: -100, annualInterestRate: 10, tenureMonths: 12, processingFeePercent: 1 }).isValid).toBe(false);
      expect(validateCalculatorInput({ loanAmount: 100000, annualInterestRate: 150, tenureMonths: 12, processingFeePercent: 1 }).isValid).toBe(false);
      expect(validateCalculatorInput({ loanAmount: 100000, annualInterestRate: 10, tenureMonths: 400, processingFeePercent: 1 }).isValid).toBe(false);
      expect(validateCalculatorInput({ loanAmount: 100000, annualInterestRate: 12, tenureMonths: 12, processingFeePercent: 1 }).isValid).toBe(true);
    });

    it('calculates reducing balance EMI accurately', () => {
      // P = 100,000, r = 12% p.a. (1% monthly), n = 12 months
      // Standard Reducing EMI = 100000 * 0.01 * (1.01^12) / (1.01^12 - 1) = 8884.88 -> 8885
      const result = calculateLoanInterest({
        loanAmount: 100000,
        annualInterestRate: 12,
        tenureMonths: 12,
        processingFeePercent: 1.5,
        interestMethod: 'reducing',
        gstRatePercent: 18,
      });

      expect(result.monthlyEmi).toBe(8885);
      expect(result.processingFeeAmount).toBe(1500); // 1.5% of 100k
      expect(result.gstAmount).toBe(270); // 18% of 1500
      expect(result.totalInterest).toBeGreaterThan(6000);
      expect(result.totalInterest).toBeLessThan(7000);
      expect(result.totalPayable).toBe(result.principal + result.totalInterest + result.processingFeeAmount + result.gstAmount);
      expect(result.schedule.length).toBe(12);
      expect(result.schedule[11].closingBalance).toBe(0);
      expect(result.effectiveAprPercent).toBeGreaterThan(12); // APR higher than nominal due to fees
    });

    it('calculates flat interest EMI accurately', () => {
      // P = 100,000, r = 10%, n = 12 months (1 year)
      // Flat Interest = 100,000 * 10 * 1 / 100 = 10,000
      // Total = 110,000, monthly EMI = 110,000 / 12 = 9167
      const result = calculateLoanInterest({
        loanAmount: 100000,
        annualInterestRate: 10,
        tenureMonths: 12,
        processingFeePercent: 2,
        interestMethod: 'flat',
        gstRatePercent: 18,
      });

      expect(result.totalInterest).toBe(10000);
      expect(result.monthlyEmi).toBe(9167);
      expect(result.processingFeeAmount).toBe(2000);
      expect(result.gstAmount).toBe(360);
      expect(result.totalPayable).toBe(100000 + 10000 + 2000 + 360);
      expect(result.schedule.length).toBe(12);
    });
  });

  // 6. Credit Card Days Left & Overdue Logic
  describe('Credit Card Days Left & Overdue', () => {
    const fixedNow = new Date('2026-10-09T10:00:00Z');

    it('marks green when more than 7 days left', () => {
      const dueDate = new Date('2026-10-21T00:00:00Z'); // 12 days left
      const status = calculateDueStatus(dueDate, fixedNow);
      expect(status.dueStatusColor).toBe('green');
      expect(status.isOverdue).toBe(false);
      expect(status.dueStatusText).toBe('12 days left to pay');
    });

    it('marks yellow when 3 to 7 days left', () => {
      const dueDate = new Date('2026-10-14T00:00:00Z'); // 5 days left
      const status = calculateDueStatus(dueDate, fixedNow);
      expect(status.dueStatusColor).toBe('yellow');
      expect(status.isOverdue).toBe(false);
      expect(status.dueStatusText).toBe('5 days left to pay');
    });

    it('marks red when under 3 days left', () => {
      const dueDate = new Date('2026-10-10T00:00:00Z'); // 1 day left
      const status = calculateDueStatus(dueDate, fixedNow);
      expect(status.dueStatusColor).toBe('red');
      expect(status.isOverdue).toBe(false);
      expect(status.dueStatusText).toContain('1 day left to pay');
    });

    it('marks red overdue when dueDate is past', () => {
      const dueDate = new Date('2026-10-05T00:00:00Z'); // 4 days past
      const status = calculateDueStatus(dueDate, fixedNow);
      expect(status.dueStatusColor).toBe('red');
      expect(status.isOverdue).toBe(true);
      expect(status.dueStatusText).toBe('Overdue by 4 days');
    });
  });

  // 7. Credit Card Utilization Color Bands
  describe('Credit Card Utilization Color Bands', () => {
    it('under 30% is green', () => {
      const status = calculateUtilization(25000, 100000); // 25%
      expect(status.utilizationPercent).toBe(25);
      expect(status.utilizationColor).toBe('green');
    });

    it('30% to 60% is yellow', () => {
      const statusAt30 = calculateUtilization(30000, 100000); // 30%
      expect(statusAt30.utilizationColor).toBe('yellow');

      const statusAt50 = calculateUtilization(50000, 100000); // 50%
      expect(statusAt50.utilizationColor).toBe('yellow');

      const statusAt60 = calculateUtilization(60000, 100000); // 60%
      expect(statusAt60.utilizationColor).toBe('yellow');
    });

    it('above 60% is red', () => {
      const status = calculateUtilization(65000, 100000); // 65%
      expect(status.utilizationColor).toBe('red');
    });
  });

  // 8. Credit Score Band Mapping & Eligibility Calculation
  describe('Credit Score Bands & Loan Eligibility', () => {
    it('maps scores into Low, Medium, High bands accurately', () => {
      expect(getScoreBand(580).name).toBe('Low');
      expect(getScoreBand(580).color).toBe('red');
      expect(getScoreBand(580).foirPercent).toBe(30);

      expect(getScoreBand(700).name).toBe('Medium');
      expect(getScoreBand(700).color).toBe('yellow');
      expect(getScoreBand(700).foirPercent).toBe(45);

      expect(getScoreBand(820).name).toBe('High');
      expect(getScoreBand(820).color).toBe('green');
      expect(getScoreBand(820).foirPercent).toBe(55);
    });

    it('calculates eligible amount (PV) based on maxAffordableEmi', () => {
      // maxAffordableEmi = 20,000, rate = 10%, tenure = 60 months
      const pv = calculateEligibleAmount(20000, 10, 60);
      expect(pv).toBeGreaterThan(900000);
      expect(pv).toBeLessThan(1000000);
    });
  });
});
