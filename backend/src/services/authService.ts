import { PrismaClient, User } from '@prisma/client';
import { generateOtpCode, hashOtpCode, verifyOtpHash } from '../utils/crypto';
import { isValidEmail, normalizeEmail } from '../utils/validators';
import { sendOtpEmail } from './emailService';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async requestCode(emailRaw: string, ip: string): Promise<{ success: boolean; message: string }> {
    const email = normalizeEmail(emailRaw);
    if (!isValidEmail(email)) {
      // Still return generic safe message or bad request
      return {
        success: true,
        message: 'If the email provided is valid, an Ascend login verification code has been dispatched.',
      };
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(code, email);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Mark prior unused codes for this email as expired to keep cleanly single active code
    await this.prisma.otpCode.updateMany({
      where: {
        email,
        used: false,
      },
      data: {
        used: true,
      },
    });

    await this.prisma.otpCode.create({
      data: {
        email,
        codeHash,
        expiresAt,
        ip,
        attempts: 0,
        used: false,
      },
    });

    // Send email
    await sendOtpEmail(email, code);

    // Return the same generic response whether or not the email exists
    return {
      success: true,
      message: 'If the email provided is valid, an Ascend login verification code has been dispatched.',
    };
  }

  async verifyCode(emailRaw: string, code: string): Promise<{ user: User }> {
    const email = normalizeEmail(emailRaw);
    if (!isValidEmail(email)) {
      throw new Error('Invalid email address.');
    }

    const trimmedCode = (code || '').trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      throw new Error('Verification code must be exactly 6 digits.');
    }

    const activeOtp = await this.prisma.otpCode.findFirst({
      where: {
        email,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activeOtp) {
      throw new Error('Verification code is invalid or has expired. Please request a new one.');
    }

    // Check attempts limit (Max 5 attempts)
    if (activeOtp.attempts >= 5) {
      await this.prisma.otpCode.update({
        where: { id: activeOtp.id },
        data: { used: true },
      });
      throw new Error('Maximum verification attempts exceeded. This code is invalidated.');
    }

    // Increment attempt count
    const updatedAttempts = activeOtp.attempts + 1;
    await this.prisma.otpCode.update({
      where: { id: activeOtp.id },
      data: { attempts: updatedAttempts },
    });

    const isMatch = verifyOtpHash(trimmedCode, email, activeOtp.codeHash);

    if (!isMatch) {
      if (updatedAttempts >= 5) {
        await this.prisma.otpCode.update({
          where: { id: activeOtp.id },
          data: { used: true },
        });
        throw new Error('Incorrect verification code. Maximum attempts reached. Code has been invalidated.');
      }
      throw new Error(`Incorrect verification code. ${5 - updatedAttempts} attempts remaining.`);
    }

    // Code is valid: mark as used
    await this.prisma.otpCode.update({
      where: { id: activeOtp.id },
      data: { used: true },
    });

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          currentStep: 1,
          profileCompleted: false,
        },
      });

      // Seed mock credit card and credit score for this user
      await this.seedUserData(user.id);
    }

    return { user };
  }

  async seedUserData(userId: string): Promise<void> {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 12); // 12 days left to pay -> green

    const statementDate = new Date();
    statementDate.setDate(now.getDate() - 18);

    await this.prisma.creditCard.create({
      data: {
        userId,
        cardholderName: 'Kabir',
        cardName: 'Ascend Credit Card',
        last4: '8821',
        creditLimit: 150000,
        amountSpent: 36000, // 24% utilization -> green (<30%)
        statementDate,
        dueDate,
        minimumDue: 1800,
      },
    });

    await this.prisma.creditScore.create({
      data: {
        userId,
        score: 765, // High band
        bureauName: 'Ascend Credit Analytics',
        fetchedAt: now,
      },
    });
  }
}
