import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Under18Modal } from './Under18Modal';
import { DigiLockerSimModal } from './DigiLockerSimModal';
import {
  Check,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  UserCheck,
  Building2,
  Upload,
  AlertCircle,
  X,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const ProfileCompletionModal: React.FC = () => {
  const {
    profile,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateStep,
    refreshProfile,
  } = useAuth();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Step 1 State
  const [dob, setDob] = useState('');
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [isUnder18ModalOpen, setIsUnder18ModalOpen] = useState(false);

  // Step 2 State
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [kycConsent, setKycConsent] = useState(false);
  const [isDigiLockerSimOpen, setIsDigiLockerSimOpen] = useState(false);

  // Step 3 State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressPincode, setAddressPincode] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [incomeSource, setIncomeSource] = useState('Salaried Professional');
  const [incomeProofFile, setIncomeProofFile] = useState<File | null>(null);
  const [step3Consent, setStep3Consent] = useState(false);

  // Step 4 State
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [step4Consent, setStep4Consent] = useState(false);

  // Populate from existing profile
  useEffect(() => {
    if (profile) {
      if (profile.dob) {
        setDob(profile.dob);
        setCalculatedAge(profile.age || null);
      }
      if (profile.fullName) setFullName(profile.fullName);
      if (profile.phone) setPhone(profile.phone);
      if (profile.addressStreet) setAddressStreet(profile.addressStreet);
      if (profile.addressCity) setAddressCity(profile.addressCity);
      if (profile.addressState) setAddressState(profile.addressState);
      if (profile.addressPincode) setAddressPincode(profile.addressPincode);
      if (profile.annualIncome) setAnnualIncome(profile.annualIncome.toString());
      if (profile.incomeSource) setIncomeSource(profile.incomeSource);
      if (profile.bankName) setBankName(profile.bankName);
      if (profile.upiId) setUpiId(profile.upiId);
      if (profile.ifscCode) setIfscCode(profile.ifscCode);

      // Set initial active step based on progress
      if (!profile.dob || !profile.age || profile.age < 18) {
        setActiveStep(1);
      } else if (!profile.digilockerVerified) {
        setActiveStep(2);
      } else if (!profile.hasIncomeProof || !profile.annualIncome) {
        setActiveStep(3);
      } else if (!profile.bankDetailsSaved) {
        setActiveStep(4);
      }
    }
  }, [profile]);

  if (!isProfileModalOpen || !profile) return null;

  // Determine step completion status
  const isStep1Done = Boolean(profile.dob && profile.age && profile.age >= 18);
  const isStep2Done = Boolean(profile.digilockerVerified);
  const isStep3Done = Boolean(
    profile.fullName && profile.phone && profile.annualIncome && profile.hasIncomeProof
  );
  const isStep4Done = Boolean(profile.bankDetailsSaved);

  const stepStatusList = [
    { num: 1, title: 'Date of Birth', done: isStep1Done },
    { num: 2, title: 'KYC via DigiLocker', done: isStep2Done },
    { num: 3, title: 'Personal & Income', done: isStep3Done },
    { num: 4, title: 'Bank Details', done: isStep4Done },
  ];

  // Age calculation helper in UI
  const handleDobChange = (value: string) => {
    setDob(value);
    setErrorMessage('');
    if (!value) {
      setCalculatedAge(null);
      return;
    }
    const birth = new Date(value + 'T00:00:00Z');
    const today = new Date();
    if (birth > today) {
      setErrorMessage('Date of birth cannot be in the future.');
      setCalculatedAge(null);
      return;
    }
    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    const m = today.getUTCMonth() - birth.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) {
      age--;
    }
    setCalculatedAge(age);
  };

  // STEP 1 SUBMISSION
  const submitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!dob) {
      setErrorMessage('Please select your date of birth.');
      return;
    }

    if (calculatedAge === null || calculatedAge < 18) {
      setIsUnder18ModalOpen(true);
      return;
    }

    if (calculatedAge > 120) {
      setErrorMessage('Please enter a realistic date of birth.');
      return;
    }

    setSubmitting(true);
    try {
      await updateStep(1, { dob });
      setSuccessMessage('Date of birth verified and saved.');
      setActiveStep(2);
    } catch (err: any) {
      if (err.message && err.message.includes('below 18')) {
        setIsUnder18ModalOpen(true);
      } else {
        setErrorMessage(err.message || 'Failed to save date of birth.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 2 SUBMISSION (DigiLocker)
  const startDigiLockerKyc = async () => {
    if (!kycConsent) {
      setErrorMessage('Please accept the consent checkbox to begin DigiLocker KYC.');
      return;
    }
    setErrorMessage('');

    // If user entered Aadhaar number, validate format and checksum first
    if (aadhaarInput.trim()) {
      try {
        const res = await fetch('/kyc/digilocker/verify-aadhaar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aadhaarNumber: aadhaarInput }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Aadhaar validation failed');
        }
      } catch (err: any) {
        setErrorMessage(err.message);
        return;
      }
    }

    // Launch DigiLocker simulation modal
    setIsDigiLockerSimOpen(true);
  };

  const handleDigiLockerSuccess = async (code: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/kyc/digilocker/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'DigiLocker verification failed.');
      }
      await refreshProfile();
      setSuccessMessage('DigiLocker KYC successfully verified!');
      setActiveStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'KYC callback error.');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 3 SUBMISSION (Personal & Income Details)
  const submitStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!step3Consent) {
      setErrorMessage('Consent is required to submit your personal and income details.');
      return;
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!addressStreet.trim() || !addressCity.trim() || !addressState.trim() || !addressPincode.trim()) {
      setErrorMessage('Please complete all address fields.');
      return;
    }
    if (!/^\d{6}$/.test(addressPincode.trim())) {
      setErrorMessage('PIN code must be exactly 6 digits.');
      return;
    }
    const incomeNum = parseFloat(annualIncome);
    if (isNaN(incomeNum) || incomeNum <= 0) {
      setErrorMessage('Please enter a valid annual income in INR.');
      return;
    }
    if (!incomeProofFile && !profile.hasIncomeProof) {
      setErrorMessage('Please upload your income proof document (PDF up to 5 MB).');
      return;
    }

    setSubmitting(true);
    try {
      await updateStep(
        3,
        {
          fullName,
          phone,
          addressStreet,
          addressCity,
          addressState,
          addressPincode,
          annualIncome,
          incomeSource,
          consentGiven: true,
        },
        incomeProofFile || undefined
      );
      setSuccessMessage('Personal and income details saved successfully.');
      setActiveStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save personal and income details.');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 4 SUBMISSION (Bank Details)
  const submitStep4 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!step4Consent) {
      setErrorMessage('Consent is required to submit your bank details.');
      return;
    }
    if (!bankName.trim()) {
      setErrorMessage('Please enter your bank name.');
      return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.trim().toUpperCase())) {
      setErrorMessage('IFSC code must be in the format ABCD0123456 (4 letters, 0, 6 characters).');
      return;
    }
    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
      setErrorMessage('UPI ID must be in the format username@provider (e.g. name@handle).');
      return;
    }

    setSubmitting(true);
    try {
      await updateStep(4, {
        bankName: bankName.trim(),
        upiId: upiId.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        consentGiven: true,
      });
      setSuccessMessage('All 4 steps complete! Profile has been finalized.');
      setIsProfileModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save bank details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Under18Modal
        isOpen={isUnder18ModalOpen}
        onClose={() => setIsUnder18ModalOpen(false)}
      />

      <DigiLockerSimModal
        isOpen={isDigiLockerSimOpen}
        onClose={() => setIsDigiLockerSimOpen(false)}
        onSuccess={handleDigiLockerSuccess}
        onFailure={() => setErrorMessage('DigiLocker authentication was declined or cancelled.')}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-4xl bg-[#0c121d] border border-[#1c283c] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto">
          
          {/* LEFT SIDE: 4-Step Checklist */}
          <div className="w-full md:w-80 bg-[#070a10] border-b md:border-b-0 md:border-r border-[#1c283c] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#00e599]/20 border border-[#00e599]/40 flex items-center justify-center">
                  <img src="/ascend-logo.svg" alt="Ascend" className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">Complete your Ascend profile</h2>
                  <p className="text-[11px] text-[#8b98aa]">Step-by-step verification</p>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {stepStatusList.map((step) => {
                  const isCurrent = activeStep === step.num;
                  const canSelect = step.done || step.num <= (profile.currentStep || 1);

                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => {
                        if (canSelect) {
                          setActiveStep(step.num);
                          setErrorMessage('');
                          setSuccessMessage('');
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[#121a29] border-[#00e599]/50 shadow-neon-sm'
                          : 'bg-[#0a0f19] border-[#1c283c] hover:border-[#2a3c57]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Checkbox Icon */}
                        {step.done ? (
                          <div className="w-6 h-6 rounded-md bg-emerald-500 border border-emerald-400 flex items-center justify-center text-black font-bold shadow-neon-sm flex-shrink-0">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs font-mono flex-shrink-0 ${
                              isCurrent
                                ? 'border-[#00e599] text-[#00e599] bg-[#00e599]/10'
                                : 'border-[#2a3c57] text-[#8b98aa]'
                            }`}
                          >
                            {step.num}
                          </div>
                        )}

                        <div>
                          <div
                            className={`text-xs font-semibold ${
                              isCurrent ? 'text-white' : 'text-[#cbd5e1]'
                            }`}
                          >
                            {step.title}
                          </div>
                          {/* Text status: NEVER color alone */}
                          <div className="text-[10px] font-medium">
                            {step.done ? (
                              <span className="text-emerald-400 font-semibold">Completed</span>
                            ) : isCurrent ? (
                              <span className="text-[#00e599]">In Progress</span>
                            ) : (
                              <span className="text-[#64748b]">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="w-2 h-2 rounded-full bg-[#00e599] shadow-neon-sm animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note & Close button */}
            <div className="mt-6 pt-4 border-t border-[#1c283c] flex items-center justify-between">
              <span className="text-[11px] text-[#8b98aa]">You can close and resume anytime</span>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-xs text-[#8b98aa] hover:text-white px-2 py-1 rounded bg-[#121a29]"
              >
                Close
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Step Form Details */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1c283c]">
                <div>
                  <span className="text-xs font-mono text-[#00e599] font-medium uppercase tracking-wider">
                    Step {activeStep} of 4
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {activeStep === 1 && 'Date of Birth Verification'}
                    {activeStep === 2 && 'Identity Verification via DigiLocker'}
                    {activeStep === 3 && 'Personal & Income Particulars'}
                    {activeStep === 4 && 'Disbursal Bank Details'}
                  </h3>
                </div>

                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-[#8b98aa] hover:text-white p-1 rounded-lg hover:bg-[#121a29]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status messages */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* STEP 1: Date of Birth */}
              {activeStep === 1 && (
                <form onSubmit={submitStep1} className="space-y-5">
                  <p className="text-xs text-[#8b98aa]">
                    Please select your date of birth. You must be at least 18 years old to operate an Ascend account.
                  </p>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#8b98aa]">Date of Birth</label>
                    <div className="relative max-w-sm">
                      <input
                        type="date"
                        value={dob}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleDobChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#090e18] border border-[#1c283c] text-white focus:outline-none focus:border-[#00e599] text-sm"
                        required
                      />
                    </div>
                  </div>

                  {calculatedAge !== null && (
                    <div className="p-3 rounded-xl bg-[#121a29] border border-[#1c283c] text-xs flex items-center justify-between max-w-sm">
                      <span className="text-[#8b98aa]">Calculated Age:</span>
                      <span
                        className={`font-semibold ${
                          calculatedAge >= 18 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {calculatedAge} years old {calculatedAge < 18 ? '(Under 18)' : '(Eligible)'}
                      </span>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-[#00e599] hover:bg-[#10b981] text-black font-semibold text-xs transition-all shadow-neon-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      <span>{submitting ? 'Verifying...' : 'Save & Proceed to Step 2'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: DigiLocker KYC */}
              {activeStep === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
                      Sandbox Mock Mode
                    </span>
                    <span className="text-xs text-[#8b98aa]">Official OAuth Partner Flow</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#090e18] border border-[#1c283c] space-y-3">
                    <h4 className="text-xs font-semibold text-white flex items-center">
                      <Lock className="w-3.5 h-3.5 mr-1.5 text-[#00e599]" />
                      Privacy & Aadhaar Protection Notice
                    </h4>
                    <p className="text-[11px] text-[#8b98aa] leading-relaxed">
                      Ascend does NOT collect your Aadhaar OTP or password. You will authenticate exclusively on DigiLocker's secure portal. In accordance with UIDAI regulations, Ascend only stores the last 4 digits and digital document reference.
                    </p>
                  </div>

                  {/* Optional Aadhaar Number Format Test */}
                  <div className="space-y-2 max-w-sm">
                    <label className="block text-xs font-medium text-[#8b98aa]">
                      Aadhaar Number (Optional Verification - 12 digits, Verhoeff Checksum)
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={aadhaarInput}
                      onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 543210987654"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090e18] border border-[#1c283c] text-white tracking-widest font-mono text-sm focus:outline-none focus:border-[#00e599]"
                    />
                    <span className="text-[10px] text-[#64748b]">
                      * Full number is never stored. Only last 4 digits are recorded.
                    </span>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="flex items-start space-x-3 pt-2">
                    <input
                      type="checkbox"
                      id="kycConsent"
                      checked={kycConsent}
                      onChange={(e) => setKycConsent(e.target.checked)}
                      className="mt-0.5 rounded border-[#1c283c] bg-[#090e18] text-[#00e599] focus:ring-0"
                    />
                    <label htmlFor="kycConsent" className="text-xs text-[#cbd5e1] leading-relaxed cursor-pointer">
                      I give voluntary consent to authenticate my identity via DigiLocker / API Setu and permit Ascend to verify my Aadhaar e-document.
                    </label>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={startDigiLockerKyc}
                      className="px-6 py-2.5 rounded-xl bg-[#00e599] hover:bg-[#10b981] text-black font-semibold text-xs transition-all shadow-neon-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Launch DigiLocker Authentication</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Personal & Income Details */}
              {activeStep === 3 && (
                <form onSubmit={submitStep3} className="space-y-4">
                  {/* Privacy notice */}
                  <div className="p-3 rounded-xl bg-[#090e18] border border-[#1c283c] text-[11px] text-[#8b98aa]">
                    <span className="text-white font-medium">Income Privacy Notice:</span> Your financial information is encrypted and utilized solely to determine credit eligibility and personal borrowing capacity.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#8b98aa]">Full Legal Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Kabir Sharma"
                        className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white text-xs focus:outline-none focus:border-[#00e599]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#8b98aa]">10-Digit Mobile Number</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white font-mono text-xs focus:outline-none focus:border-[#00e599]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#8b98aa]">Street Address</label>
                    <input
                      type="text"
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      placeholder="Flat 402, Green Meadows"
                      className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white text-xs focus:outline-none focus:border-[#00e599]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#8b98aa]">City</label>
                      <input
                        type="text"
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        placeholder="Bengaluru"
                        className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white text-xs focus:outline-none focus:border-[#00e599]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#8b98aa]">State</label>
                      <input
                        type="text"
                        value={addressState}
                        onChange={(e) => setAddressState(e.target.value)}
                        placeholder="Karnataka"
                        className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white text-xs focus:outline-none focus:border-[#00e599]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#8b98aa]">PIN Code (6 digits)</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={addressPincode}
                        onChange={(e) => setAddressPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="560001"
                        className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white font-mono text-xs focus:outline-none focus:border-[#00e599]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#8b98aa]">Annual Income (INR)</label>
                      <input
                        type="number"
                        min="1"
                        value={annualIncome}
                        onChange={(e) => setAnnualIncome(e.target.value)}
                        placeholder="1450000"
                        className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white font-mono text-xs focus:outline-none focus:border-[#00e599]"
                        required
                      />
                      {annualIncome && !isNaN(Number(annualIncome)) && (
                        <span className="text-[10px] text-[#00e599]">
                          {formatINR(Number(annualIncome))} per annum
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#8b98aa]">Income Source</label>
                      <select
                        value={incomeSource}
                        onChange={(e) => setIncomeSource(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white text-xs focus:outline-none focus:border-[#00e599]"
                      >
                        <option value="Salaried Professional">Salaried Professional</option>
                        <option value="Self-Employed Business">Self-Employed Business</option>
                        <option value="Independent Consultant">Independent Consultant</option>
                        <option value="Other">Other Verified Source</option>
                      </select>
                    </div>
                  </div>

                  {/* PDF Upload */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-medium text-[#8b98aa]">
                      Upload Income Proof (PDF Only, Magic Bytes Verified, Max 5 MB)
                    </label>
                    <div className="border border-dashed border-[#1c283c] hover:border-[#00e599]/50 rounded-xl p-4 bg-[#090e18] text-center cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setIncomeProofFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-6 h-6 mx-auto mb-1 text-[#00e599]" />
                      <p className="text-xs text-white font-medium">
                        {incomeProofFile
                          ? incomeProofFile.name
                          : profile.hasIncomeProof
                          ? `Previously uploaded: ${profile.incomeProofOriginalName || 'Verified Document'}`
                          : 'Click to select or drag PDF file'}
                      </p>
                      <span className="text-[10px] text-[#8b98aa]">PDF format up to 5 MB</span>
                    </div>
                  </div>

                  {/* Consent checkbox */}
                  <div className="flex items-start space-x-3 pt-2">
                    <input
                      type="checkbox"
                      id="step3Consent"
                      checked={step3Consent}
                      onChange={(e) => setStep3Consent(e.target.checked)}
                      className="mt-0.5 rounded border-[#1c283c] bg-[#090e18] text-[#00e599] focus:ring-0"
                    />
                    <label htmlFor="step3Consent" className="text-xs text-[#cbd5e1] cursor-pointer">
                      I declare that the personal and income particulars provided above are accurate and consent to their processing.
                    </label>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-[#00e599] hover:bg-[#10b981] text-black font-semibold text-xs transition-all shadow-neon-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      <span>{submitting ? 'Saving...' : 'Save & Proceed to Step 4'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Bank Details */}
              {activeStep === 4 && (
                <form onSubmit={submitStep4} className="space-y-4">
                  {/* Status Note & Encryption */}
                  <div className="p-3 rounded-xl bg-[#090e18] border border-[#1c283c] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1 text-[#00e599]" />
                        Encrypted At Rest (AES-256-GCM)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                        Details saved, not verified
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8b98aa]">
                      Ascend does NOT claim account is verified. Details are stored in encrypted format for future disbursal processing.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#8b98aa]">
                      Bank Name (Neutral Partner Bank)
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Regional Partner Bank"
                      className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white text-xs focus:outline-none focus:border-[#00e599]"
                      required
                    />
                    <span className="text-[10px] text-[#64748b]">
                      Enter any neutral financial partner name
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#8b98aa]">
                        IFSC Code (format: ABCD0123456)
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="ABCD0123456"
                        className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white font-mono text-xs focus:outline-none focus:border-[#00e599]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[#8b98aa]">
                        UPI ID (format: handle@provider)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="kabir@partner"
                        className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-[#1c283c] text-white font-mono text-xs focus:outline-none focus:border-[#00e599]"
                        required
                      />
                    </div>
                  </div>

                  {/* Consent checkbox */}
                  <div className="flex items-start space-x-3 pt-2">
                    <input
                      type="checkbox"
                      id="step4Consent"
                      checked={step4Consent}
                      onChange={(e) => setStep4Consent(e.target.checked)}
                      className="mt-0.5 rounded border-[#1c283c] bg-[#090e18] text-[#00e599] focus:ring-0"
                    />
                    <label htmlFor="step4Consent" className="text-xs text-[#cbd5e1] cursor-pointer">
                      I consent to securely storing these bank coordinates for payment transactions on Ascend.
                    </label>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-[#00e599] hover:bg-[#10b981] text-black font-semibold text-xs transition-all shadow-neon-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      <span>{submitting ? 'Encrypting & Saving...' : 'Complete Profile & Finish'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
