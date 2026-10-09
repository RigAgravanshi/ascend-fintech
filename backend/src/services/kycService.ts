import { PrismaClient } from '@prisma/client';

export interface DigiLockerCallbackResult {
  success: boolean;
  referenceId: string;
  aadhaarLast4: string;
  isMock: boolean;
  error?: string;
}

export class KycService {
  constructor(private prisma: PrismaClient) {}

  isMockMode(): boolean {
    // Demo app: never call live DigiLocker / API Setu.
    return true;
  }

  getAuthorizationUrl(userId: string): { url: string; isMock: boolean } {
    const isMock = this.isMockMode();
    const clientId = process.env.DIGILOCKER_CLIENT_ID || 'ASCEND_SANDBOX_CLIENT_ID';
    const redirectUri = process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:5000/api/kyc/digilocker/callback';

    if (isMock) {
      // In mock mode, we direct to our frontend/backend mock authorization simulator
      const mockUrl = `/api/kyc/digilocker/mock-consent?userId=${encodeURIComponent(userId)}`;
      return { url: mockUrl, isMock: true };
    }

    const liveAuthUrl = `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(userId)}`;

    return { url: liveAuthUrl, isMock: false };
  }

  async verifyAadhaarInput(userId: string, aadhaarInput: string): Promise<{ last4: string }> {
    const cleaned = (aadhaarInput || '').replace(/\s+/g, '');
    const last4 = /^\d{4,}$/.test(cleaned) ? cleaned.slice(-4) : '0000';
    
    // Store only the last 4 digits per strict global rules
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        aadhaarLast4: last4,
      },
    });

    return { last4 };
  }

  async processDigiLockerCallback(
    userId: string,
    code: string,
    simulateFailure: boolean = false
  ): Promise<DigiLockerCallbackResult> {
    const isMock = this.isMockMode();

    if (simulateFailure) {
      return {
        success: false,
        referenceId: '',
        aadhaarLast4: '',
        isMock,
        error: 'DigiLocker verification failed or was cancelled by the user.',
      };
    }

    if (isMock) {
      // Simulated DigiLocker verification
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const last4 = user?.aadhaarLast4 || '4921';
      const ref = `DL-MOCK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          digilockerVerified: true,
          digilockerRef: ref,
          aadhaarLast4: last4,
          currentStep: Math.max(user?.currentStep || 1, 3), // Move to step 3
        },
      });

      return {
        success: true,
        referenceId: ref,
        aadhaarLast4: last4,
        isMock: true,
      };
    }

    // In live mode with real API Setu credentials:
    // 1. Exchange authorization code for token: POST to DigiLocker oauth token endpoint
    // 2. Fetch e-document metadata from /public/oauth2/1/xml/eaadhaar
    // 3. Extract last 4 digits from verified XML document signature
    const ref = `DL-LIVE-${Date.now().toString(36).toUpperCase()}`;
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        digilockerVerified: true,
        digilockerRef: ref,
        currentStep: 3,
      },
    });

    return {
      success: true,
      referenceId: ref,
      aadhaarLast4: '****',
      isMock: false,
    };
  }
}
