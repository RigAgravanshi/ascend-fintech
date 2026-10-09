import { Request, Response, NextFunction } from 'express';
import { normalizeEmail } from '../utils/validators';

interface RateLimitRecord {
  timestamps: number[];
}

const emailAttempts = new Map<string, RateLimitRecord>();
const ipAttempts = new Map<string, RateLimitRecord>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 3;

function cleanOldTimestamps(record: RateLimitRecord, now: number): void {
  record.timestamps = record.timestamps.filter(ts => now - ts < WINDOW_MS);
}

/**
 * Rate limits /auth/request-code: 3 per 10 min per email and per IP
 */
export function otpRequestRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const email = req.body?.email ? normalizeEmail(req.body.email) : '';

  // Check IP limit
  let ipRecord = ipAttempts.get(ip);
  if (!ipRecord) {
    ipRecord = { timestamps: [] };
    ipAttempts.set(ip, ipRecord);
  }
  cleanOldTimestamps(ipRecord, now);

  if (ipRecord.timestamps.length >= MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many OTP requests from this network. Please wait a few minutes before trying again.',
    });
    return;
  }

  // Check Email limit
  if (email) {
    let emailRecord = emailAttempts.get(email);
    if (!emailRecord) {
      emailRecord = { timestamps: [] };
      emailAttempts.set(email, emailRecord);
    }
    cleanOldTimestamps(emailRecord, now);

    if (emailRecord.timestamps.length >= MAX_REQUESTS) {
      res.status(429).json({
        error: 'Too many OTP requests for this email address. Please wait a few minutes before trying again.',
      });
      return;
    }

    // Record this attempt
    emailRecord.timestamps.push(now);
  }

  ipRecord.timestamps.push(now);
  next();
}
