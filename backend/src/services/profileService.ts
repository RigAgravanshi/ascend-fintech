import { PrismaClient, User } from '@prisma/client';
import { UserProfileDto } from '../../../shared/types';
import { calculateAge, validateIfsc, validateUpi, validatePhone, PINCODE_REGEX } from '../utils/validators';
import { encryptData, decryptData } from '../utils/crypto';
import { validatePdfFile } from '../utils/magicBytes';
import fs from 'fs';

export class ProfileService {
  constructor(private prisma: PrismaClient) {}

  calculateCompletion(user: User): { percentage: number; isCompleted: boolean; stepCompleted: boolean[] } {
    const step1 = Boolean(user.dob && user.age !== null && user.age >= 18);
    const step2 = Boolean(user.digilockerVerified);
    const step3 = Boolean(
      user.fullName &&
      user.phone &&
      user.addressStreet &&
      user.addressCity &&
      user.addressState &&
      user.addressPincode &&
      user.annualIncome !== null &&
      user.annualIncome > 0 &&
      user.incomeProofPath
    );
    const step4 = Boolean(user.bankDetailsSaved && user.encryptedBankDetails);

    const steps = [step1, step2, step3, step4];
    const completedCount = steps.filter(Boolean).length;
    const percentage = completedCount * 25;
    const isCompleted = completedCount === 4;

    return {
      percentage,
      isCompleted,
      stepCompleted: steps,
    };
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const { percentage, isCompleted } = this.calculateCompletion(user);

    let decryptedBank = { bankName: null as string | null, upiId: null as string | null, ifscCode: null as string | null };
    if (user.encryptedBankDetails) {
      try {
        const raw = decryptData(user.encryptedBankDetails);
        decryptedBank = JSON.parse(raw);
      } catch (err) {
        // If decryption fails, do not expose internal error
      }
    }

    return {
      id: user.id,
      email: user.email,
      profileCompleted: user.profileCompleted || isCompleted,
      completionPercentage: percentage,
      currentStep: user.currentStep,
      dob: user.dob,
      age: user.age,
      aadhaarLast4: user.aadhaarLast4,
      digilockerVerified: user.digilockerVerified,
      digilockerRef: user.digilockerRef,
      fullName: user.fullName,
      phone: user.phone,
      addressStreet: user.addressStreet,
      addressCity: user.addressCity,
      addressState: user.addressState,
      addressPincode: user.addressPincode,
      annualIncome: user.annualIncome,
      incomeSource: user.incomeSource,
      hasIncomeProof: Boolean(user.incomeProofPath),
      incomeProofOriginalName: user.incomeProofOriginalName,
      bankName: decryptedBank.bankName,
      upiId: decryptedBank.upiId,
      ifscCode: decryptedBank.ifscCode,
      bankDetailsSaved: user.bankDetailsSaved,
    };
  }

  async updateStep(
    userId: string,
    stepNumber: number,
    body: any,
    file?: Express.Multer.File
  ): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Steps must be completed in order
    // Ensure previous steps are satisfied before updating subsequent steps
    if (stepNumber > 1 && (!user.dob || !user.age || user.age < 18)) {
      throw new Error('Please complete Step 1 (Date of Birth) first.');
    }
    if (stepNumber > 2 && !user.digilockerVerified) {
      throw new Error('Please complete Step 2 (DigiLocker KYC) first.');
    }
    if (
      stepNumber > 3 &&
      (!user.fullName || !user.phone || !user.annualIncome || !user.incomeProofPath)
    ) {
      throw new Error('Please complete Step 3 (Personal & Income Details) first.');
    }

    switch (stepNumber) {
      case 1: {
        const { dob } = body;
        const ageResult = calculateAge(dob);
        if (!ageResult.isValid) {
          throw new Error(ageResult.error || 'Invalid date of birth');
        }

        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: {
            dob,
            age: ageResult.age,
            currentStep: Math.max(user.currentStep, 2),
          },
        });
        return this.getProfile(updated.id);
      }

      case 2: {
        // Step 2 is normally completed via KYC callback, but can be updated here
        const { aadhaarLast4, digilockerVerified, digilockerRef } = body;
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: {
            aadhaarLast4: aadhaarLast4 || user.aadhaarLast4,
            digilockerVerified: digilockerVerified ?? true,
            digilockerRef: digilockerRef || `DL-REF-${Date.now()}`,
            currentStep: Math.max(user.currentStep, 3),
          },
        });
        return this.getProfile(updated.id);
      }

      case 3: {
        const {
          fullName,
          phone,
          addressStreet,
          addressCity,
          addressState,
          addressPincode,
          annualIncome,
          incomeSource,
          consentGiven,
        } = body;

        if (!consentGiven && consentGiven !== 'true' && consentGiven !== true) {
          throw new Error('Consent is required to submit personal and income details.');
        }

        if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
          throw new Error('Full name is required (minimum 2 characters).');
        }

        if (!validatePhone(phone)) {
          throw new Error('Valid 10-digit Indian mobile number is required.');
        }

        if (!addressStreet || !addressCity || !addressState || !addressPincode) {
          throw new Error('Complete address fields (street, city, state, PIN code) are required.');
        }

        if (!PINCODE_REGEX.test(addressPincode.trim())) {
          throw new Error('PIN code must be exactly 6 digits.');
        }

        const parsedIncome = parseFloat(annualIncome);
        if (isNaN(parsedIncome) || parsedIncome <= 0) {
          throw new Error('Annual income must be a positive number in INR.');
        }

        if (!incomeSource || typeof incomeSource !== 'string') {
          throw new Error('Income source is required.');
        }

        // Validate PDF upload
        let incomeProofPath = user.incomeProofPath;
        let incomeProofOriginalName = user.incomeProofOriginalName;

        if (file) {
          const pdfValidation = validatePdfFile(file.path);
          if (!pdfValidation.isValid) {
            // Delete invalid uploaded file
            try {
              fs.unlinkSync(file.path);
            } catch (_) {}
            throw new Error(pdfValidation.error || 'Uploaded file is not a valid PDF.');
          }
          incomeProofPath = file.path;
          incomeProofOriginalName = file.originalname;
        } else if (!user.incomeProofPath) {
          throw new Error('Income proof document (PDF up to 5 MB) is required.');
        }

        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            addressStreet: addressStreet.trim(),
            addressCity: addressCity.trim(),
            addressState: addressState.trim(),
            addressPincode: addressPincode.trim(),
            annualIncome: parsedIncome,
            incomeSource: incomeSource.trim(),
            incomeProofPath,
            incomeProofOriginalName,
            currentStep: Math.max(user.currentStep, 4),
          },
        });

        return this.getProfile(updated.id);
      }

      case 4: {
        const { bankName, upiId, ifscCode, consentGiven } = body;

        if (!consentGiven && consentGiven !== 'true' && consentGiven !== true) {
          throw new Error('Consent is required to submit bank details.');
        }

        if (!bankName || typeof bankName !== 'string' || bankName.trim().length < 2) {
          throw new Error('Bank name is required.');
        }

        if (!validateIfsc(ifscCode)) {
          throw new Error('Invalid IFSC code. Format must be 4 uppercase letters, a zero, and 6 alphanumeric characters (e.g. ABCD0123456).');
        }

        if (!validateUpi(upiId)) {
          throw new Error('Invalid UPI ID. Format must be handle@bank/provider (e.g. user@partner).');
        }

        // Encrypt bank details at rest (AES-256-GCM)
        const bankDataToEncrypt = JSON.stringify({
          bankName: bankName.trim(),
          upiId: upiId.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
        });
        const encryptedBankDetails = encryptData(bankDataToEncrypt);

        // Check if all 4 steps are now done
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: {
            encryptedBankDetails,
            bankDetailsSaved: true,
            currentStep: 4,
            profileCompleted: true, // All 4 steps successfully finished!
          },
        });

        return this.getProfile(updated.id);
      }

      default:
        throw new Error(`Invalid step number: ${stepNumber}`);
    }
  }

  async getIncomeProofFilePath(userId: string): Promise<{ filePath: string; originalName: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.incomeProofPath) {
      throw new Error('No income proof document found for this user.');
    }
    if (!fs.existsSync(user.incomeProofPath)) {
      throw new Error('Income proof document file is missing on server.');
    }
    return {
      filePath: user.incomeProofPath,
      originalName: user.incomeProofOriginalName || 'income-proof.pdf',
    };
  }
}
