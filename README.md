# Ascend — Intelligent Fintech Platform

Ascend is a modern full-stack fintech web application built from scratch with passwordless email OTP authentication, a sequential 4-step profile completion and KYC flow, and an analytics suite featuring a Credit Card tracker, Loan Liability visualizer, interactive Interest & EMI Calculator, and animated Credit Score & Loan Eligibility engine.

---

## 🚀 Live Demo & Visual Theme

- **Design Philosophy**: High-contrast cyber-fintech aesthetic featuring deep obsidian tones (`#05080E`, `#0C121D`), vibrant glowing emerald neon accents (`#00E599`, `#10B981`), glassmorphism card surfaces, and responsive navigation.
- **Strict Compliance**: Zero real bank or lender names; strictly neutral or fictional entities (e.g. `Ascend Credit Card`, `Ascend Credit Analytics`, `ABCD0123456`, `user@partner`). All mock datasets feature prominent **Demo data** badges.
- **Privacy Preservation**: No full Aadhaar or PAN storage; only the last 4 digits are retained with official DigiLocker verification receipts. Sensitive bank coordinates are encrypted at rest with AES-256-GCM.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Helmet, Cookie-Parser |
| **Database** | SQLite via Prisma ORM (production schema ready for PostgreSQL) |
| **Security & Crypto** | AES-256-GCM encryption at rest, SHA-256 OTP hashing, Verhoeff checksum |
| **Document Storage** | Private local filesystem with magic-byte PDF validation (%PDF-) and authenticated streaming |
| **Testing** | Vitest (25 core unit tests covering math, validation, and security) |

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18 or higher recommended; tested on v24)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd ascend-fintech

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 3. Database Initialization & Seeding
```bash
cd backend
# Generate Prisma Client & push schema to SQLite
npx prisma generate
npx prisma db push

# Seed initial fictional credit card and credit score fixtures
npm run prisma:seed
```

### 4. Running the Application

You can run both backend and frontend concurrently or in separate terminals:

#### Terminal 1 (Backend API — Port 5000):
```bash
cd backend
npm run dev
```

#### Terminal 2 (Frontend Client — Port 5173):
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🔐 Authentication & OTP Flow

1. User enters email on the login screen.
2. Frontend calls `POST /auth/request-code`.
3. Backend generates a cryptographic 6-digit code via `crypto.randomInt` (never `Math.random`), computes a SHA-256 hash with a secret salt, and stores it with a 10-minute expiry.
4. **Development Mode**: The OTP code is logged directly to the backend terminal console for instant testing (`[ASCEND DEV MAIL] Login Code: >>> XXXXXX <<<`).
5. User enters the 6-digit code. Max **5 verification attempts** are enforced before the code is permanently invalidated.
6. On success, an `httpOnly`, `SameSite=Strict` session cookie (`ascend_session`) is set.

---

## 📝 4-Step Profile Completion & Verification Flow

Until all 4 steps are completed, a persistent progress banner is displayed and the modal opens automatically on login:

1. **Step 1: Date of Birth**
   - Calendar date picker with age calculation in UI and strictly on backend.
   - Ages under 18 trigger the blocking dialog: *"Sorry, people below 18 are not allowed."*
   - Future dates and ages over 120 are rejected.
2. **Step 2: KYC via DigiLocker**
   - Official OAuth-style partner integration (API Setu / DigiLocker).
   - Operates in **Sandbox Mock Mode** by default with clear UI labeling.
   - Verhoeff checksum validation for optional 12-digit Aadhaar input; only the last 4 digits are stored.
3. **Step 3: Personal & Income Particulars**
   - Full name, 10-digit Indian mobile number, postal address with 6-digit PIN code.
   - Annual income and income source.
   - PDF income proof upload with `%PDF-` magic-byte verification (max 5 MB) stored privately.
4. **Step 4: Bank Details**
   - Bank name (neutral placeholder), UPI ID (`name@handle`), and IFSC (`^[A-Z]{4}0[A-Z0-9]{6}$`).
   - Encrypted at rest via AES-256-GCM.
   - Carries the required label: *"Details saved, not verified"*.

---

## ⚙️ Configuration Guides

### How to Switch DigiLocker from Mock to Real

In `backend/.env`:
```env
# Change from true to false:
DIGILOCKER_MOCK_MODE=false

# Enter your registered API Setu / DigiLocker partner credentials:
DIGILOCKER_CLIENT_ID=your_client_id_from_apisetu
DIGILOCKER_CLIENT_SECRET=your_client_secret_from_apisetu
DIGILOCKER_REDIRECT_URI=https://your-domain.com/api/kyc/digilocker/callback
```

### How to Fill the Loan Card Configuration

Per strict requirements, all loan fields are empty/null by default in `backend/src/config/loanCard.config.ts`. If empty, the UI displays *"No active loans"*.

To populate active loan terms, update `backend/src/config/loanCard.config.ts`:
```typescript
export const loanCardConfig: LoanCardConfig = {
  productName: 'Ascend Personal Loan',
  loanAmount: 350000,           // Sanctioned loan amount in INR
  monthlyEmi: 11450,            // Monthly EMI in INR
  interestRate: 11.25,          // Annual interest rate percentage
  tenureMonths: 36,             // Total tenure in months
  outstandingPrincipal: 280000,// Remaining principal balance in INR
  nextEmiDate: '2026-11-05',     // YYYY-MM-DD
  totalInstallments: 36,        // Total count of EMIs
  installmentsPaid: 8,          // Count of EMIs cleared
};
```
Restart the backend or allow tsx hot-reload, and the loan card will display the configured fields. Any field left `null` will render as *"Not provided"*.

---

## 🧪 Automated Test Suite

Ascend includes a full unit test suite implemented with Vitest in `backend/tests/fintech.test.ts`:
- **OTP Security**: 6-digit cryptographic generation, hash verification, attempt exhaustion.
- **Age Validation**: Rejection of 17 years old, allowance of 18 years old, future date rejection, >120 years check.
- **IFSC & UPI**: Regex format matching using fictional codes (`ABCD0123456`) and handles.
- **File Validation**: PDF `%PDF-` magic bytes header validation and size limits.
- **Interest Calculator**: Reducing balance and Flat balance EMI formulas, itemized GST, effective APR (Newton-Raphson IRR).
- **Credit Card Utilities**: Dynamic "X days left to pay" thresholds (green >7d, yellow 3-7d, red <3d, overdue logic) and utilization bands.
- **Credit Score Analytics**: Band mapping (Low, Medium, High) and FOIR-based borrowing capacity (Present Value).

To run tests:
```bash
cd backend
npm test
```

---

## 🚢 Production Deployment

### Option A: Vercel (Frontend & Fullstack)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login`
3. Deploy frontend:
   ```bash
   cd frontend
   vercel --prod
   ```

### Option B: Unified Full-Stack Node Server (Render / Railway / Fly.io / Docker)
The Express backend is configured to automatically serve the compiled frontend production bundle from `frontend/dist`:
```bash
# 1. Build frontend
npm run build:frontend

# 2. Build backend
npm run build:backend

# 3. Start unified production server
npm run start
```

---

## 📄 License
MIT License. Built for Ascend Fintech.
