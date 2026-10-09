import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const ProfileBanner: React.FC = () => {
  const { profile, setIsProfileModalOpen } = useAuth();

  if (!profile || profile.profileCompleted) {
    return null;
  }

  const percentage = profile.completionPercentage || 0;

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950/40 via-[#0c121d] to-amber-950/30 border-y sm:border sm:rounded-2xl border-[#1c283c] p-4 sm:p-5 mb-8 shadow-neon-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-[#00e599]/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Action Required
            </span>
            <span className="text-xs text-[#8b98aa] font-mono">Profile {percentage}% complete</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
            Complete your Ascend profile to unlock all financial features
          </h3>
          <p className="text-xs sm:text-sm text-[#8b98aa]">
            Finish all 4 verification steps to enable full credit analysis and personalised loan terms.
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-md h-2 bg-[#121a29] rounded-full overflow-hidden mt-2 border border-[#1c283c]">
            <div
              className="h-full bg-gradient-to-r from-[#059669] to-[#00e599] transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00e599] hover:bg-[#10b981] text-black font-semibold text-sm transition-all duration-200 shadow-neon-sm flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Complete Profile</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
