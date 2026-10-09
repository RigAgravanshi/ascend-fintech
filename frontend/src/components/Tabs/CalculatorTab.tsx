import React, { useState, useMemo } from 'react';
import {
  calculateLoanInterest,
  CalculatorInput,
  CalculatorResult,
  InterestMethod,
} from '../../../../shared/interestCalculator';
import { formatINR, formatPercent } from '../../utils/formatters';
import {
  Calculator as CalcIcon,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  Percent,
  Calendar,
} from 'lucide-react';

export const CalculatorTab: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [annualRate, setAnnualRate] = useState<number>(11.5);
  const [tenureMonths, setTenureMonths] = useState<number>(36);
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(1.5);
  const [method, setMethod] = useState<InterestMethod>('reducing');
  const [gstRate, setGstRate] = useState<number>(18);
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);

  // Compute live calculation using the shared pure function
  const calculationResult: { result?: CalculatorResult; error?: string } = useMemo(() => {
    try {
      const input: CalculatorInput = {
        loanAmount: Number(loanAmount),
        annualInterestRate: Number(annualRate),
        tenureMonths: Number(tenureMonths),
        processingFeePercent: Number(processingFeePercent),
        interestMethod: method,
        gstRatePercent: Number(gstRate),
      };
      const result = calculateLoanInterest(input);
      return { result };
    } catch (err: any) {
      return { error: err.message || 'Invalid calculation input.' };
    }
  }, [loanAmount, annualRate, tenureMonths, processingFeePercent, method, gstRate]);

  const { result, error } = calculationResult;

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      
      {/* Title & Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Interest & EMI Calculator</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#121a29] text-[#00e599] text-[10px] font-semibold uppercase tracking-wider border border-[#00e599]/30">
            Real-time Engine
          </span>
        </div>
        <p className="text-xs text-[#8b98aa] mt-1">
          Calculate monthly installments, itemized statutory fees, and effective borrowing cost (APR).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INPUT CONTROLS */}
        <div className="lg:col-span-5 bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 space-y-6">
          
          {/* Method Toggle: Reducing Balance vs Flat */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#8b98aa]">
              Interest Calculation Method
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#070a10] rounded-xl border border-[#1c283c]">
              <button
                type="button"
                onClick={() => setMethod('reducing')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  method === 'reducing'
                    ? 'bg-[#121a29] text-[#00e599] border border-[#00e599]/40 shadow-neon-sm'
                    : 'text-[#8b98aa] hover:text-white'
                }`}
              >
                Reducing Balance (Standard)
              </button>
              <button
                type="button"
                onClick={() => setMethod('flat')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  method === 'flat'
                    ? 'bg-[#121a29] text-[#00e599] border border-[#00e599]/40 shadow-neon-sm'
                    : 'text-[#8b98aa] hover:text-white'
                }`}
              >
                Flat Interest
              </button>
            </div>
          </div>

          {/* Loan Amount Input + Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#8b98aa]">Loan Amount (INR)</span>
              <span className="font-mono font-bold text-white text-sm">
                {formatINR(loanAmount)}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-[#121a29] rounded-lg appearance-none cursor-pointer accent-[#00e599]"
            />
            <div className="flex justify-between text-[10px] text-[#64748b] font-mono">
              <span>₹10,000</span>
              <span>₹50,00,000</span>
            </div>
          </div>

          {/* Annual Interest Rate Input + Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#8b98aa]">Annual Interest Rate (%)</span>
              <span className="font-mono font-bold text-white text-sm">{annualRate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="36"
              step="0.25"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full h-2 bg-[#121a29] rounded-lg appearance-none cursor-pointer accent-[#00e599]"
            />
            <div className="flex justify-between text-[10px] text-[#64748b] font-mono">
              <span>5.0%</span>
              <span>36.0%</span>
            </div>
          </div>

          {/* Tenure in Months Input + Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#8b98aa]">Tenure (Months)</span>
              <span className="font-mono font-bold text-white text-sm">{tenureMonths} Months</span>
            </div>
            <input
              type="range"
              min="6"
              max="120"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-[#121a29] rounded-lg appearance-none cursor-pointer accent-[#00e599]"
            />
            <div className="flex justify-between text-[10px] text-[#64748b] font-mono">
              <span>6 Mo (0.5 Yr)</span>
              <span>120 Mo (10 Yrs)</span>
            </div>
          </div>

          {/* Processing Fee (%) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#8b98aa]">Processing Fee (%)</span>
              <span className="font-mono font-bold text-white text-sm">{processingFeePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.25"
              value={processingFeePercent}
              onChange={(e) => setProcessingFeePercent(Number(e.target.value))}
              className="w-full h-2 bg-[#121a29] rounded-lg appearance-none cursor-pointer accent-[#00e599]"
            />
            <div className="flex justify-between text-[10px] text-[#64748b] font-mono">
              <span>0%</span>
              <span>5%</span>
            </div>
          </div>

          {/* GST Config */}
          <div className="pt-2 border-t border-[#1c283c] flex items-center justify-between text-xs">
            <span className="text-[#8b98aa]">GST on Processing Fee</span>
            <span className="font-mono font-semibold text-white">18% (Standard)</span>
          </div>
        </div>

        {/* RIGHT COLUMN: ITEMIZED OUTPUT CHARGES */}
        <div className="lg:col-span-7 space-y-6">
          
          {error ? (
            <div className="p-6 bg-red-950/20 border border-red-500/40 rounded-2xl text-red-300 text-sm">
              {error}
            </div>
          ) : result ? (
            <div className="bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 sm:p-8 space-y-6 shadow-neon-sm">
              
              {/* Highlight EMI Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#070b12] to-[#122238] border border-[#00e599]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#8b98aa] font-mono">
                    Estimated Monthly EMI
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#00e599] font-mono mt-1">
                    {formatINR(result.monthlyEmi)}
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-[#1c283c] sm:pl-6">
                  <span className="text-xs text-[#8b98aa]">Effective Cost (APR)</span>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {result.effectiveAprPercent}%
                  </div>
                  <span className="text-[10px] text-[#64748b]">Includes upfront fees & GST</span>
                </div>
              </div>

              {/* Itemized Output - Each charge on its own line per prompt */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#8b98aa] uppercase tracking-wider pb-2 border-b border-[#1c283c]">
                  Itemized Charge Breakdown
                </h4>

                {/* 1. Principal */}
                <div className="flex items-center justify-between py-2 text-sm border-b border-[#1c283c]/50">
                  <span className="text-white">1. Principal</span>
                  <span className="font-mono font-semibold text-white">{formatINR(result.principal)}</span>
                </div>

                {/* 2. Interest rate (%) and total interest payable */}
                <div className="flex items-center justify-between py-2 text-sm border-b border-[#1c283c]/50">
                  <div className="flex flex-col">
                    <span className="text-white">2. Interest Rate & Total Interest</span>
                    <span className="text-[11px] text-[#8b98aa]">
                      Rate: {result.interestRatePercent}% ({result.interestMethod === 'reducing' ? 'Reducing' : 'Flat'})
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-amber-300">
                    {formatINR(result.totalInterest)}
                  </span>
                </div>

                {/* 3. Processing fee (%) and amount */}
                <div className="flex items-center justify-between py-2 text-sm border-b border-[#1c283c]/50">
                  <div className="flex flex-col">
                    <span className="text-white">3. Processing Fee</span>
                    <span className="text-[11px] text-[#8b98aa]">Fee rate: {result.processingFeePercent}%</span>
                  </div>
                  <span className="font-mono font-semibold text-white">
                    {formatINR(result.processingFeeAmount)}
                  </span>
                </div>

                {/* 4. GST on fee (18%, configurable) */}
                <div className="flex items-center justify-between py-2 text-sm border-b border-[#1c283c]/50">
                  <div className="flex flex-col">
                    <span className="text-white">4. GST on Processing Fee</span>
                    <span className="text-[11px] text-[#8b98aa]">Tax rate: {result.gstRatePercent}%</span>
                  </div>
                  <span className="font-mono font-semibold text-white">{formatINR(result.gstAmount)}</span>
                </div>

                {/* 5. Monthly EMI */}
                <div className="flex items-center justify-between py-2 text-sm border-b border-[#1c283c]/50">
                  <span className="text-white">5. Monthly EMI</span>
                  <span className="font-mono font-semibold text-[#00e599]">
                    {formatINR(result.monthlyEmi)} / mo
                  </span>
                </div>

                {/* 6. TOTAL payable = principal + total interest + fee + GST */}
                <div className="flex items-center justify-between py-2.5 text-base border-b border-[#00e599]/40 bg-[#121a29]/50 px-3 rounded-xl font-bold">
                  <span className="text-white">6. TOTAL Payable</span>
                  <span className="font-mono text-emerald-400">{formatINR(result.totalPayable)}</span>
                </div>

                {/* 7. Effective cost of borrowing (APR) including fee */}
                <div className="flex items-center justify-between py-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-white">7. Effective Cost of Borrowing (APR)</span>
                    <span className="text-[11px] text-[#8b98aa]">Annualized internal rate of return</span>
                  </div>
                  <span className="font-mono font-semibold text-white">{result.effectiveAprPercent}%</span>
                </div>
              </div>

              {/* Mandatory Disclaimers per prompt */}
              <div className="p-4 rounded-xl bg-[#070a10] border border-[#1c283c] space-y-2 text-xs text-[#8b98aa]">
                <p className="flex items-start">
                  <Info className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>All charges are listed above. Any other charge is not included in this estimate.</span>
                </p>
                <p className="flex items-start">
                  <Info className="w-4 h-4 text-[#00e599] mr-2 flex-shrink-0 mt-0.5" />
                  <span>Estimate only. Final terms depend on the lender.</span>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Month-by-month Amortization Table */}
      {result && result.schedule.length > 0 && (
        <div className="bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Month-by-Month Amortization Schedule</h3>
              <p className="text-xs text-[#8b98aa]">
                Principal, interest, and residual balance repayment breakdown over {result.schedule.length} months.
              </p>
            </div>
            <button
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              className="px-3 py-1.5 rounded-lg bg-[#121a29] hover:bg-[#1c283c] text-xs font-semibold text-white flex items-center space-x-1"
            >
              <span>{showFullSchedule ? 'Collapse' : 'View All Months'}</span>
              {showFullSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#070a10] text-[#8b98aa] border-b border-[#1c283c]">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Opening Balance</th>
                  <th className="py-2.5 px-3">Monthly EMI</th>
                  <th className="py-2.5 px-3">Principal Paid</th>
                  <th className="py-2.5 px-3">Interest Paid</th>
                  <th className="py-2.5 px-3 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c283c]/50">
                {(showFullSchedule ? result.schedule : result.schedule.slice(0, 6)).map((row) => (
                  <tr key={row.month} className="hover:bg-[#121a29]/40 transition-colors">
                    <td className="py-2 px-3 text-white font-semibold">#{row.month}</td>
                    <td className="py-2 px-3 text-[#cbd5e1]">{formatINR(row.openingBalance)}</td>
                    <td className="py-2 px-3 text-[#00e599]">{formatINR(row.emi)}</td>
                    <td className="py-2 px-3 text-white">{formatINR(row.principalPaid)}</td>
                    <td className="py-2 px-3 text-amber-300">{formatINR(row.interestPaid)}</td>
                    <td className="py-2 px-3 text-right text-white font-semibold">
                      {formatINR(row.closingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!showFullSchedule && result.schedule.length > 6 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowFullSchedule(true)}
                className="text-xs text-[#00e599] hover:underline"
              >
                Showing first 6 months. Click to expand full {result.schedule.length} months schedule.
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
