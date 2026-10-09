# Ascend — Intelligent Fintech Platform

Ascend is a modern full-stack fintech web application built from scratch with passwordless email OTP authentication, a sequential 4-step profile completion and KYC flow, and an analytics suite featuring a Credit Card tracker, Loan Liability visualizer, interactive Interest & EMI Calculator, and animated Credit Score & Loan Eligibility engine.

---


## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Helmet, Cookie-Parser |
| **Database** | SQLite via Prisma ORM (production schema ready for PostgreSQL) |
| **Security & Crypto** |  Verhoeff checksum |
| **Document Storage** | Private local filesystem with magic-byte PDF validation (%PDF-) and authenticated streaming |
| **Testing** | Vitest (25 core unit tests covering math, validation, and security) |

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18 or higher recommended; tested on v24)
- npm
- Git

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/RigAgravanshi/ascend-fintech.git
cd <folder-where-you-have-cloned-repo>

# Install backend dependencies

cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```


### 3. Running the Application locally

Follow these steps in order:

#### Step 1: Open a Terminal (1) (Backend API):
```bash
cd backend
npm run dev
```

#### Step 2: Open a Terminal (2) (Frontend Client — Port 5173):
```bash
cd frontend
npm run dev
```

Open your browser ONLY and ONLY AT **`http://localhost:5173`**.

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


NOTE: Since this is a Working Prototype Demo, .env file has also been shared. It contains demo secret keys, that are otherwise vital to be shared for running this system locally
