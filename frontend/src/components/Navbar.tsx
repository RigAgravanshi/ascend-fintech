import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Calculator, Gauge, LogOut, CheckCircle2, UserCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'calculator' | 'credit';
  setActiveTab: (tab: 'home' | 'calculator' | 'credit') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, profile, logout, setIsProfileModalOpen } = useAuth();

  const completion = profile?.completionPercentage ?? 0;
  const isProfileComplete = profile?.profileCompleted ?? false;

  return (
    <>
      {/* Desktop & Tablet Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-[#05080e]/90 backdrop-blur-md border-b border-[#1c283c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#059669] to-[#00e599] p-0.5 flex items-center justify-center shadow-neon-sm">
              <div className="w-full h-full bg-[#05080e] rounded-[10px] flex items-center justify-center">
                <img src="/ascend-logo.svg" alt="Ascend" className="w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
                Ascend
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#00e599] shadow-neon-sm animate-pulse"></span>
              </span>
              <span className="text-[10px] tracking-wider text-[#8b98aa] uppercase font-mono">Fintech Engine</span>
            </div>
          </div>

          {/* Center 3 Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0c121d] p-1.5 rounded-xl border border-[#1c283c]">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-[#121a29] text-[#00e599] border border-[#00e599]/30 shadow-neon-sm'
                  : 'text-[#8b98aa] hover:text-white hover:bg-[#121a29]/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'calculator'
                  ? 'bg-[#121a29] text-[#00e599] border border-[#00e599]/30 shadow-neon-sm'
                  : 'text-[#8b98aa] hover:text-white hover:bg-[#121a29]/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Interest Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('credit')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'credit'
                  ? 'bg-[#121a29] text-[#00e599] border border-[#00e599]/30 shadow-neon-sm'
                  : 'text-[#8b98aa] hover:text-white hover:bg-[#121a29]/50'
              }`}
            >
              <Gauge className="w-4 h-4" />
              <span>Credit Score</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            {/* Profile status pill */}
            {!isProfileComplete ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#121a29] border border-amber-500/40 text-amber-300 text-xs font-medium hover:bg-amber-950/20 transition-colors"
                title="Click to complete profile"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Profile {completion}% complete</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile Verified</span>
              </div>
            )}

            {/* User identity & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#1c283c]">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-medium text-white max-w-[150px] truncate">{user?.email}</span>
                <span className="text-[10px] text-[#8b98aa]">Active Session</span>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-lg bg-[#0c121d] border border-[#1c283c] text-[#8b98aa] hover:text-red-400 hover:border-red-500/40 hover:bg-red-950/20 transition-all flex items-center justify-center"
                title="Logout from Ascend"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05080e]/95 backdrop-blur-lg border-t border-[#1c283c] px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs font-medium ${
            activeTab === 'home' ? 'text-[#00e599]' : 'text-[#8b98aa]'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs font-medium ${
            activeTab === 'calculator' ? 'text-[#00e599]' : 'text-[#8b98aa]'
          }`}
        >
          <Calculator className="w-5 h-5 mb-1" />
          <span>Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('credit')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs font-medium ${
            activeTab === 'credit' ? 'text-[#00e599]' : 'text-[#8b98aa]'
          }`}
        >
          <Gauge className="w-5 h-5 mb-1" />
          <span>Credit</span>
        </button>
      </div>
    </>
  );
};
