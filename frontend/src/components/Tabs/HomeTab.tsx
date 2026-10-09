import React, { useEffect, useState } from 'react';
import { CreditCardDto, LoanCardConfig, HomeSummaryDto } from '../../../../shared/types';
import { formatINR, formatDate, formatPercent } from '../../utils/formatters';
import { CreditCard as CardIcon, AlertTriangle, Clock, ShieldCheck, Info } from 'lucide-react';

export const HomeTab: React.FC = () => {
  const [summary, setSummary] = useState<HomeSummaryDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHomeSummary();
  }, []);

  const fetchHomeSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/home/summary');
      if (!res.ok) {
        throw new Error('Failed to load financial summary.');
      }
      const data: HomeSummaryDto = await res.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-[#00e599] border-t-transparent rounded-full animate-spin shadow-neon-sm"></div>
        <p className="text-xs font-mono text-[#8b98aa]">Loading financial profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-red-950/20 border border-red-500/40 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-base font-semibold text-white">Unable to Load Financial Overview</h3>
        <p className="text-xs text-[#8b98aa]">{error}</p>
        <button
          onClick={fetchHomeSummary}
          className="px-4 py-2 bg-[#121a29] hover:bg-[#1c283c] border border-[#1c283c] rounded-xl text-xs text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const card = summary?.card;
  const loan = summary?.loan;

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      
      {/* SECTION A: CREDIT CARD */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Credit Card Overview</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#121a29] text-[#00e599] text-[10px] font-semibold uppercase tracking-wider border border-[#00e599]/30">
              Demo data
            </span>
          </div>
          {card && (
            <span className="text-xs font-mono text-[#8b98aa]">
              Card ending in •••• {card.last4}
            </span>
          )}
        </div>

        {!card ? (
          /* Empty state */
          <div className="p-8 rounded-2xl bg-[#0c121d] border border-[#1c283c] text-center space-y-2">
            <CardIcon className="w-10 h-10 text-[#8b98aa] mx-auto opacity-50" />
            <h3 className="text-sm font-semibold text-white">No credit card linked</h3>
            <p className="text-xs text-[#8b98aa]">You do not currently have any active credit cards registered.</p>
          </div>
        ) : (
          /* Credit Card Visual & Metrics Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Card Visual */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="w-full h-56 rounded-2xl p-6 bg-gradient-to-tr from-[#070b12] via-[#0d1624] to-[#122238] border border-[#00e599]/30 shadow-neon-md relative overflow-hidden flex flex-col justify-between">
                {/* Background decorative glow arcs */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-[#00e599]/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Top Row: Card name & Chip */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-2">
                    <img src="/ascend-logo.svg" alt="Ascend" className="w-6 h-6" />
                    <span className="text-sm font-bold tracking-wider text-white">
                      {card.cardName}
                    </span>
                  </div>
                  {/* Metallic Chip Visual */}
                  <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-yellow-600 border border-amber-300/60 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-4 border border-black/30 rounded-sm"></div>
                  </div>
                </div>

                {/* Middle: Masked Card Number */}
                <div className="relative z-10 py-2">
                  <span className="text-lg sm:text-xl font-mono tracking-[4px] text-white/90 drop-shadow">
                    •••• •••• •••• {card.last4}
                  </span>
                </div>

                {/* Bottom Row: Cardholder name & Limit */}
                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-[#8b98aa] font-mono">
                      Cardholder
                    </span>
                    <span className="text-sm font-bold text-white tracking-wide">
                      {card.cardholderName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[9px] uppercase tracking-widest text-[#8b98aa] font-mono">
                      Sanctioned Limit
                    </span>
                    <span className="text-sm font-bold text-[#00e599] font-mono">
                      {formatINR(card.creditLimit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Metrics & Due Indicator */}
            <div className="lg:col-span-7 bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 flex flex-col justify-between space-y-6">
              
              {/* Due Date Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1c283c]">
                <div>
                  <span className="text-xs text-[#8b98aa]">Payment Due Date</span>
                  <div className="text-base font-bold text-white mt-0.5">
                    {formatDate(card.dueDate)}
                  </div>
                </div>

                {/* Due Indicator Badge */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                      card.dueStatusColor === 'green'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                        : card.dueStatusColor === 'yellow'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                        : 'bg-red-950/40 text-red-400 border-red-500/40'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{card.dueStatusText}</span>
                  </div>
                </div>
              </div>

              {/* Amount Spent & Credit Limit */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-[#8b98aa]">Amount Spent</span>
                  <div className="text-lg font-bold text-white font-mono">
                    {formatINR(card.amountSpent)}
                  </div>
                  <span className="text-[10px] text-[#64748b]">This billing cycle</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-[#8b98aa]">Available Limit</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {formatINR(card.creditLimit - card.amountSpent)}
                  </div>
                  <span className="text-[10px] text-[#64748b]">Of {formatINR(card.creditLimit)}</span>
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-xs text-[#8b98aa]">Minimum Due</span>
                  <div className="text-lg font-bold text-amber-300 font-mono">
                    {formatINR(card.minimumDue)}
                  </div>
                  <span className="text-[10px] text-[#64748b]">Due before cutoff</span>
                </div>
              </div>

              {/* Utilization Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#8b98aa]">Credit Utilization</span>
                    <span
                      className={`font-semibold ${
                        card.utilizationColor === 'green'
                          ? 'text-emerald-400'
                          : card.utilizationColor === 'yellow'
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      ({card.utilizationColor.toUpperCase()} BAND)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white text-sm">
                    {card.utilizationPercent}%
                  </span>
                </div>

                {/* Bar */}
                <div className="w-full h-2.5 bg-[#121a29] rounded-full overflow-hidden border border-[#1c283c]">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${
                      card.utilizationColor === 'green'
                        ? 'bg-emerald-500 shadow-neon-sm'
                        : card.utilizationColor === 'yellow'
                        ? 'bg-amber-400'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, card.utilizationPercent)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] text-[#64748b]">
                  <span>Optimal (&lt;30%)</span>
                  <span>Moderate (30-60%)</span>
                  <span>High (&gt;60%)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION B: ACTIVE LOANS AND LIABILITIES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Active Loans & Liabilities</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#121a29] text-[#8b98aa] text-[10px] font-semibold uppercase tracking-wider border border-[#1c283c]">
              Config Driven
            </span>
          </div>
        </div>

        {!loan ? (
          /* Empty state if config is entirely empty */
          <div className="p-8 rounded-2xl bg-[#0c121d] border border-[#1c283c] text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-[#8b98aa] mx-auto opacity-50" />
            <h3 className="text-sm font-semibold text-white">No active loans</h3>
            <p className="text-xs text-[#8b98aa]">
              You currently have no outstanding loan liabilities registered in your Ascend profile.
            </p>
          </div>
        ) : (
          /* Exactly ONE simple card-style component titled "Ascend Personal Loan" */
          <div className="bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1c283c]">
              <div>
                <h3 className="text-base font-bold text-white">
                  {loan.productName || 'Ascend Personal Loan'}
                </h3>
                <span className="text-xs text-[#8b98aa]">Active Liability Facility</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                Active
              </span>
            </div>

            {/* Grid of detail fields: Render each field ONLY if provided; otherwise show 'Not provided' */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-[#8b98aa]">Sanctioned Loan Amount</span>
                <div className="text-sm font-semibold text-white font-mono">
                  {loan.loanAmount !== null && loan.loanAmount !== undefined
                    ? formatINR(loan.loanAmount)
                    : 'Not provided'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b98aa]">Monthly EMI</span>
                <div className="text-sm font-semibold text-white font-mono">
                  {loan.monthlyEmi !== null && loan.monthlyEmi !== undefined
                    ? formatINR(loan.monthlyEmi)
                    : 'Not provided'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b98aa]">Interest Rate</span>
                <div className="text-sm font-semibold text-white font-mono">
                  {loan.interestRate !== null && loan.interestRate !== undefined
                    ? formatPercent(loan.interestRate)
                    : 'Not provided'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b98aa]">Tenure</span>
                <div className="text-sm font-semibold text-white font-mono">
                  {loan.tenureMonths !== null && loan.tenureMonths !== undefined
                    ? `${loan.tenureMonths} Months`
                    : 'Not provided'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b98aa]">Outstanding Principal</span>
                <div className="text-sm font-semibold text-white font-mono">
                  {loan.outstandingPrincipal !== null && loan.outstandingPrincipal !== undefined
                    ? formatINR(loan.outstandingPrincipal)
                    : 'Not provided'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b98aa]">Next EMI Date</span>
                <div className="text-sm font-semibold text-white font-mono">
                  {loan.nextEmiDate ? formatDate(loan.nextEmiDate) : 'Not provided'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b98aa]">Total Installments</span>
                <div className="text-sm font-semibold text-white font-mono">
                  {loan.totalInstallments !== null && loan.totalInstallments !== undefined
                    ? `${loan.totalInstallments} EMIs`
                    : 'Not provided'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#8b98aa]">Installments Paid</span>
                <div className="text-sm font-semibold text-white font-mono">
                  {loan.installmentsPaid !== null && loan.installmentsPaid !== undefined
                    ? `${loan.installmentsPaid} EMIs`
                    : 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
