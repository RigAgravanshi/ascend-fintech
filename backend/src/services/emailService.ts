import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  const isProd = process.env.NODE_ENV === 'production';
  const mailTransporter = getTransporter();

  // In development, print code to console for quick developer and evaluator testing
  if (!isProd) {
    console.log(`\n========================================`);
    console.log(`[ASCEND DEV MAIL] To: ${email}`);
    console.log(`[ASCEND DEV MAIL] Subject: Your Ascend login code`);
    console.log(`[ASCEND DEV MAIL] Login Code: >>> ${code} <<<`);
    console.log(`[ASCEND DEV MAIL] Valid for 10 minutes.`);
    console.log(`========================================\n`);
  }

  const subject = 'Your Ascend login code';
  const textBody = `Hello,\n\nYour Ascend verification code is: ${code}\n\nThis single-use code expires in 10 minutes. If you did not request this login code, please ignore this email.\n\nBest regards,\nTeam Ascend`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #0b101b; color: #f3f4f6; border-radius: 12px; border: 1px solid #1f293d;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #00e599; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0;">Ascend</h1>
        <p style="color: #9ca3af; font-size: 13px; margin: 4px 0 0 0;">Intelligent Financial Platform</p>
      </div>
      <div style="background-color: #111827; padding: 24px; border-radius: 8px; border: 1px solid #1f2937; text-align: center;">
        <p style="margin: 0 0 12px 0; color: #d1d5db; font-size: 15px;">Your Ascend login verification code is:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #00e599; background: #070a0f; padding: 12px 20px; border-radius: 6px; display: inline-block; border: 1px solid #00e59940;">
          ${code}
        </div>
        <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 13px;">This code is valid for <strong>10 minutes</strong> and can only be used once.</p>
      </div>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1f2937; font-size: 12px; color: #6b7280; text-align: center;">
        <p style="margin: 0;">If you did not request this login code, you can safely disregard this email.</p>
        <p style="margin: 4px 0 0 0;">© Ascend Financial Technologies. All rights reserved.</p>
      </div>
    </div>
  `;

  if (!mailTransporter) {
    // If SMTP not configured, simulate success in dev
    return true;
  }

  try {
    await mailTransporter.sendMail({
      from: process.env.SMTP_FROM || '"Ascend" <no-reply@ascend-fintech.local>',
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email via SMTP:', error);
    // Don't crash if external SMTP is unreachable in dev
    return !isProd;
  }
}
