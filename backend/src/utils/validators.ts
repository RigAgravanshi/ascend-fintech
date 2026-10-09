/**
 * Validation utilities for Ascend
 */

export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export const PINCODE_REGEX = /^\d{6}$/;

export function normalizeEmail(email: string): string {
  return email ? email.trim().toLowerCase() : '';
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function validateIfsc(ifsc: string): boolean {
  if (!ifsc) return false;
  return IFSC_REGEX.test(ifsc.trim().toUpperCase());
}

export function validateUpi(upi: string): boolean {
  if (!upi) return false;
  return UPI_REGEX.test(upi.trim());
}

export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  return INDIAN_PHONE_REGEX.test(phone.trim());
}

export interface AgeValidationResult {
  isValid: boolean;
  age?: number;
  error?: string;
}

export function calculateAge(dobString: string, referenceDate: Date = new Date()): AgeValidationResult {
  if (!dobString) {
    return { isValid: false, error: 'Date of birth is required' };
  }

  const parts = dobString.split('-');
  if (parts.length !== 3) {
    return { isValid: false, error: 'Invalid date format. Expected YYYY-MM-DD' };
  }

  const birthDate = new Date(dobString + 'T00:00:00Z');
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Invalid date value' };
  }

  const today = new Date(referenceDate);
  today.setUTCHours(0, 0, 0, 0);

  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const m = today.getUTCMonth() - birthDate.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
    age--;
  }

  if (age < 18) {
    return {
      isValid: false,
      age,
      error: 'Sorry, people below 18 are not allowed.',
    };
  }

  if (age > 120) {
    return {
      isValid: false,
      age,
      error: 'Unrealistic age. Please enter a valid date of birth.',
    };
  }

  return { isValid: true, age };
}
