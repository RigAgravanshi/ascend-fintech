import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

import { AuthService } from './services/authService';
import { ProfileService } from './services/profileService';
import { KycService } from './services/kycService';
import { HomeService } from './services/homeService';
import { CreditScoreService } from './services/creditScoreService';

import { AuthController } from './controllers/authController';
import { ProfileController } from './controllers/profileController';
import { KycController } from './controllers/kycController';
import { AppController } from './controllers/appController';

import { otpRequestRateLimiter } from './middleware/rateLimiter';
import { createAuthMiddleware } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// Ensure private uploads directory exists
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Private file storage with random UUID filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const randomName = `${crypto.randomUUID()}${ext}`;
    cb(null, randomName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// Security & Parsing Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline resources in SPA if needed
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // In development, allow localhost or requests without origin (like curl)
      if (!origin || origin.startsWith('http://localhost:') || origin === FRONTEND_ORIGIN) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for preview/sandbox environments while maintaining credentials
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Services
const authService = new AuthService(prisma);
const profileService = new ProfileService(prisma);
const kycService = new KycService(prisma);
const homeService = new HomeService(prisma, profileService);
const creditScoreService = new CreditScoreService(prisma);

// Initialize Controllers
const authController = new AuthController(authService);
const profileController = new ProfileController(profileService);
const kycController = new KycController(kycService);
const appController = new AppController(homeService, creditScoreService);

const requireAuth = createAuthMiddleware(prisma);

// ========================
// AUTH ROUTES
// ========================
app.post('/auth/request-code', otpRequestRateLimiter, authController.requestCode);
app.post('/auth/verify-code', authController.verifyCode);
app.post('/auth/demo-login', authController.demoLogin);
app.post('/auth/logout', authController.logout);
app.get('/auth/me', requireAuth, authController.me);

// ========================
// PROFILE COMPLETION ROUTES
// ========================
app.get('/profile', requireAuth, profileController.getProfile);
app.patch('/profile/step/:n', requireAuth, upload.single('incomeProof'), profileController.updateStep);
app.get('/profile/income-proof', requireAuth, profileController.downloadIncomeProof);

// ========================
// KYC / DIGILOCKER ROUTES
// ========================
app.get('/kyc/digilocker/start', requireAuth, kycController.startDigiLocker);
app.post('/kyc/digilocker/verify-aadhaar', requireAuth, kycController.validateAadhaar);
app.post('/kyc/digilocker/callback', requireAuth, kycController.callbackDigiLocker);

// ========================
// APP / DASHBOARD ROUTES
// ========================
app.get('/home/summary', requireAuth, appController.getHomeSummary);
app.get('/cards', requireAuth, appController.getCards);
app.get('/loans', requireAuth, appController.getLoans);
app.get('/credit-score', requireAuth, appController.getCreditScore);
app.post('/calculator/estimate', appController.calculateEstimate);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Ascend Fintech API',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend build in production if available
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Development: port 5000 is API-only. Visiting / used to 404 with a blank page.
  app.get('/', (_req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ascend API</title>
  <style>
    body { font-family: Segoe UI, system-ui, sans-serif; background: #05080e; color: #e2e8f0; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; }
    .card { max-width: 480px; padding: 32px; border: 1px solid #1c283c; border-radius: 16px; background: #0c121d; }
    a { color: #00e599; }
    code { background: #070a10; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Ascend backend is running</h1>
    <p>Port <code>5000</code> is the API, not the website. Open the demo app at:</p>
    <p><a href="http://localhost:5173">http://localhost:5173</a></p>
    <p>Health check: <a href="/api/health">/api/health</a></p>
  </div>
</body>
</html>`);
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File size exceeds the 5 MB limit.' });
      return;
    }
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }
  res.status(500).json({ error: err.message || 'An unexpected internal error occurred.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Ascend Backend] Server listening on port ${PORT}`);
    console.log(`[Ascend Backend] Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
