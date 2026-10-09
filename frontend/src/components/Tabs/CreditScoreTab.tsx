import React, { useEffect, useState } from 'react';
import { CreditScoreDto } from '../../../../shared/types';
import { formatINR, formatDate } from '../../utils/formatters';
import {
  Gauge,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Shield,
  ArrowUpRight,
} from 'lucide-react';

export const CreditScoreTab: React.FC = () => {
  const [data, setData] = useState<CreditScoreDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditScore();
  }, []);

  const fetchCreditScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/credit-score');
      if (!res.ok) {
        throw new Error('Failed to load credit score report.');
      }
      const scoreData: CreditScoreDto = await res.json();
      setData(scoreData);
    } catch (err: any) {
      setError(err.message || 'Error fetching credit bureau score.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-[#00e599] border-t-transparent rounded-full animate-spin shadow-neon-sm"></div>
        <p className="text-xs font-mono text-[#8b98aa]">Fetching credit bureau analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-red-950/20 border border-red-500/40 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-base font-semibold text-white">Credit Report Unavailable</h3>
        <p className="text-xs text-[#8b98aa]">{error || 'Unable to retrieve bureau records.'}</p>
        <button
          onClick={fetchCreditScore}
          className="px-4 py-2 bg-[#121a29] hover:bg-[#1c283c] border border-[#1c283c] rounded-xl text-xs text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  // Semicircular Gauge Geometry:
  // Score range: 300 to 900 (span = 600)
  // Angle: -180 deg (left) to 0 deg (right) or -90 to +90
  const minScore = 300;
  const maxScore = 900;
  const clampedScore = Math.max(minScore, Math.min(maxScore, data.score));
  const scoreRatio = (clampedScore - minScore) / (maxScore - minScore); // 0 to 1
  // Needle rotation angle: -90 degrees at 300, 0 degrees at 600, +90 degrees at 900
  const needleAngle = -90 + scoreRatio * 180;

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      
      {/* Title & Bureau Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Credit Bureau Analytics</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#121a29] text-[#00e599] text-[10px] font-semibold uppercase tracking-wider border border-[#00e599]/30">
              Demo data
            </span>
          </div>
          <p className="text-xs text-[#8b98aa] mt-1">
            Provider: <span className="text-white font-medium">{data.bureauName}</span> • Last Updated: {formatDate(data.fetchedAt)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
              data.bandColor === 'green'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-neon-sm'
                : data.bandColor === 'yellow'
                ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                : 'bg-red-950/40 text-red-400 border-red-500/40'
            }`}
          >
            <span>{data.band} Band</span>
          </span>
        </div>
      </div>

      {/* Semicircular Gauge Section */}
      <div className="bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-neon-sm">
        {/* Radial Glow in Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00e599]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Semicircular SVG Gauge */}
        <div className="w-full max-w-[340px] relative">
          <svg viewBox="0 0 200 115" className="w-full overflow-visible">
            <defs>
              {/* Gradient Arc: Red (left), Yellow (middle), Green (right) */}
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ef4444" />
                <stop offset="45%" stop-color="#f59e0b" />
                <stop offset="80%" stop-color="#10b981" />
                <stop offset="100%" stop-color="#00e599" />
              </linearGradient>

              <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Arc Track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#121a29"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Value Gradient Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              filter="url(#gaugeGlow)"
            />

            {/* Threshold Tick Marks */}
            {/* 650 is (650-300)/600 = 350/600 = 58.33% */}
            {/* 750 is (750-300)/600 = 450/600 = 75.0% */}

            {/* Animated Needle */}
            <g
              transform={`rotate(${needleAngle}, 100, 100)`}
              className="transition-transform duration-1000 ease-out"
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="28"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="28" r="3" fill="#00e599" />
            </g>

            {/* Center Pivot Hub */}
            <circle cx="100" cy="100" r="10" fill="#0c121d" stroke="#00e599" strokeWidth="3" />
            <circle cx="100" cy="100" r="4" fill="#ffffff" />
          </svg>

          {/* Scale Endpoint Labels */}
          <div className="flex justify-between text-[11px] font-mono text-[#8b98aa] mt-2 px-3">
            <span>300 (Low)</span>
            <span className="text-amber-400">650</span>
            <span className="text-emerald-400">750</span>
            <span>900 (High)</span>
          </div>
        </div>

        {/* Score Number and Band Label under Gauge */}
        <div className="text-center mt-4 space-y-1">
          <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight flex items-center justify-center">
            {data.score}
            <span className="text-xs text-[#8b98aa] font-sans font-normal ml-2">/ 900</span>
          </div>

          <div className="text-sm font-semibold flex items-center justify-center space-x-1.5">
            <span
              className={
                data.bandColor === 'green'
                  ? 'text-emerald-400'
                  : data.bandColor === 'yellow'
                  ? 'text-amber-300'
                  : 'text-red-400'
              }
            >
              {data.band} Credit Band
            </span>
            <span className="text-[#8b98aa]">•</span>
            <span className="text-xs text-[#8b98aa]">
              {data.score >= 750 ? 'Prime Borrower Tier' : data.score >= 650 ? 'Standard Tier' : 'Subprime Tier'}
            </span>
          </div>
        </div>
      </div>

      {/* LOAN ELIGIBILITY SECTION BELOW GAUGE */}
      <section className="bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c283c] gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center">
              <Sparkles className="w-5 h-5 text-[#00e599] mr-2" />
              Estimated Loan Eligibility
            </h3>
            <p className="text-xs text-[#8b98aa]">
              Determined via FOIR (Fixed Obligation to Income Ratio) based on your income and credit standing.
            </p>
          </div>

          <span className="text-xs font-mono text-[#8b98aa]">
            Band FOIR Cap: <span className="text-white font-semibold">{data.eligibility.foirPercent}%</span>
          </span>
        </div>

        {/* Financial Factors Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#070a10] border border-[#1c283c] space-y-1">
            <span className="text-xs text-[#8b98aa]">Monthly Net Income</span>
            <div className="text-base font-bold text-white font-mono">
              {data.eligibility.monthlyIncome > 0
                ? formatINR(data.eligibility.monthlyIncome)
                : '₹0 (Profile Incomplete)'}
            </div>
            <span className="text-[10px] text-[#64748b]">
              Derived from annual income
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#070a10] border border-[#1c283c] space-y-1">
            <span className="text-xs text-[#8b98aa]">Existing Loan EMIs</span>
            <div className="text-base font-bold text-white font-mono">
              {formatINR(data.eligibility.existingEmis)}
            </div>
            <span className="text-[10px] text-[#64748b]">
              {data.eligibility.existingEmis > 0
                ? 'From active loan config'
                : 'No EMI provided in loan config (0)'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#070a10] border border-[#1c283c] space-y-1">
            <span className="text-xs text-[#8b98aa]">Max Affordable EMI</span>
            <div className="text-base font-bold text-[#00e599] font-mono">
              {formatINR(data.eligibility.maxAffordableEmi)}
            </div>
            <span className="text-[10px] text-[#64748b]">
              {data.eligibility.foirPercent}% FOIR minus active EMIs
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-tr from-emerald-950/40 to-[#0c121d] border border-[#00e599]/40 space-y-1">
            <span className="text-xs text-[#8b98aa]">Eligible Loan Amount</span>
            <div className="text-lg font-bold text-[#00e599] font-mono">
              {formatINR(data.eligibility.eligibleAmount)}
            </div>
            <span className="text-[10px] text-emerald-300">
              PV over {data.eligibility.defaultTenureMonths} mo @ {data.eligibility.indicativeRatePercent}% p.a.
            </span>
          </div>
        </div>

        {/* Required Mandatory Label */}
        <div className="p-3 rounded-xl bg-[#070a10] border border-[#1c283c] text-xs text-[#8b98aa] flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            {data.eligibility.disclaimer}
          </span>
        </div>
      </section>

      {/* THREE BANDS DEFINITION TABLE */}
      <section className="bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Credit Score Tiers & Benchmark Criteria</h3>
          <p className="text-xs text-[#8b98aa]">
            Industry standard underwriting parameters corresponding to each credit band.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#070a10] text-[#8b98aa] border-b border-[#1c283c]">
              <tr>
                <th className="py-2.5 px-3">Band Tier</th>
                <th className="py-2.5 px-3">Score Range</th>
                <th className="py-2.5 px-3">FOIR Cap</th>
                <th className="py-2.5 px-3">Indicative Rate</th>
                <th className="py-2.5 px-3">Typical Market Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c283c]/50">
              <tr className={data.band === 'Low' ? 'bg-red-950/20' : ''}>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-500/40 font-semibold">
                    Low
                  </span>
                </td>
                <td className="py-3 px-3 text-white">300 – 649</td>
                <td className="py-3 px-3 text-white">30%</td>
                <td className="py-3 px-3 text-white">16.0% p.a.</td>
                <td className="py-3 px-3 font-sans text-[#8b98aa]">
                  Elevated default risk. Conservative credit limits with tighter requirements.
                </td>
              </tr>

              <tr className={data.band === 'Medium' ? 'bg-amber-950/20' : ''}>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/40 font-semibold">
                    Medium
                  </span>
                </td>
                <td className="py-3 px-3 text-white">650 – 749</td>
                <td className="py-3 px-3 text-white">45%</td>
                <td className="py-3 px-3 text-white">12.5% p.a.</td>
                <td className="py-3 px-3 font-sans text-[#8b98aa]">
                  Satisfactory track record. Standard competitive pricing and healthy loan sizes.
                </td>
              </tr>

              <tr className={data.band === 'High' ? 'bg-emerald-950/20' : ''}>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 font-semibold">
                    High (Prime)
                  </span>
                </td>
                <td className="py-3 px-3 text-white">750 – 900</td>
                <td className="py-3 px-3 text-white">55%</td>
                <td className="py-3 px-3 text-[#00e599]">10.0% p.a.</td>
                <td className="py-3 px-3 font-sans text-[#8b98aa]">
                  Prime credit tier. Maximum borrowing capacity, priority sanctions, and lowest APRs.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* GENERIC CREDIT SCORE TIPS */}
      <section className="bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Actionable Steps to Build & Maintain High Score</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.eligibility.tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#070a10] border border-[#1c283c] flex items-start space-x-3 text-xs text-[#cbd5e1]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#00e599] flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
