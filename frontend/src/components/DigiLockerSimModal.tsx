import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, X, Lock, CheckCircle2 } from 'lucide-react';

interface DigiLockerSimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (code: string) => Promise<void>;
  onFailure: () => void;
}

export const DigiLockerSimModal: React.FC<DigiLockerSimModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFailure,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [digiPin, setDigiPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      // Simulate OAuth redirect exchange code
      await onSuccess('MOCK_AUTH_CODE_DL_' + Math.random().toString(36).substring(2, 9));
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateFailure = () => {
    onFailure();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0e1524] border border-[#1c283c] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* DigiLocker Official Partner Header Simulation */}
        <div className="bg-[#141f33] px-6 py-4 border-b border-[#1c283c] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              DL
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">DigiLocker Gateway</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold uppercase tracking-wider border border-amber-500/40">
                  Mock Mode
                </span>
              </div>
              <span className="text-[11px] text-[#8b98aa]">API Setu • Simulated OAuth2 Identity Verification</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b98aa] hover:text-white p-1 rounded-lg hover:bg-[#1a263d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-[#090e18] p-4 rounded-xl border border-[#1c283c] text-xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <Lock className="w-4 h-4" />
              <span>Official Government Portal Simulation</span>
            </div>
            <p className="text-[#8b98aa]">
              In accordance with regulatory specifications, the Ascend application does not collect your Aadhaar OTP or password directly. You authenticate strictly on the official DigiLocker server.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-[#8b98aa]">
              Simulated DigiLocker 6-Digit Security PIN (any 6 digits for testing)
            </label>
            <input
              type="password"
              maxLength={6}
              value={digiPin}
              onChange={(e) => setDigiPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-[#090e18] border border-[#1c283c] text-white tracking-widest text-center text-lg focus:outline-none focus:border-[#00e599]"
            />
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300">
            <p className="font-semibold mb-1 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Consent for Aadhaar e-Document Issuance:
            </p>
            <p className="text-[11px] text-emerald-300/80">
              I hereby authorize DigiLocker / API Setu to share my Aadhaar XML identity record with Ascend for KYC compliance purposes.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-[#141f33] px-6 py-4 border-t border-[#1c283c] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleSimulateFailure}
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/30 border border-red-500/30 transition-colors"
          >
            Simulate User Reject / Error
          </button>

          <button
            onClick={handleApprove}
            disabled={submitting}
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00e599] hover:bg-[#10b981] text-black font-semibold text-xs transition-all shadow-neon-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Consent & Complete KYC</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
