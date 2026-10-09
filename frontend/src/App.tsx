import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { ProfileBanner } from './components/ProfileBanner';
import { ProfileCompletionModal } from './components/ProfileCompletionModal';
import { HomeTab } from './components/Tabs/HomeTab';
import { CalculatorTab } from './components/Tabs/CalculatorTab';
import { CreditScoreTab } from './components/Tabs/CreditScoreTab';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'calculator' | 'credit'>('home');

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#05080e] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#00e599] p-0.5 shadow-neon-md animate-pulse">
            <div className="w-full h-full bg-[#05080e] rounded-[14px] flex items-center justify-center">
              <img src="/ascend-logo.svg" alt="Ascend" className="w-8 h-8" />
            </div>
          </div>
        </div>
        <p className="text-xs font-mono text-[#8b98aa] tracking-widest uppercase">
          Initializing Ascend Platform...
        </p>
      </div>
    );
  }

  // 1. No valid session: show only the login page.
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated: 3-tab application with profile modal & banner
  return (
    <div className="min-h-screen bg-[#05080e] text-[#f1f5f9] flex flex-col relative selection:bg-[#00e599] selection:text-black">
      
      {/* Background ambient lighting matching reference photo */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#00e599]/8 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Profile Completion Banner (shows until finished) */}
        <ProfileBanner />

        {/* 4-Step Profile Completion Popup Modal */}
        <ProfileCompletionModal />

        {/* Tab 1: Home */}
        {activeTab === 'home' && <HomeTab />}

        {/* Tab 2: Interest Calculator */}
        {activeTab === 'calculator' && <CalculatorTab />}

        {/* Tab 3: Credit Score */}
        {activeTab === 'credit' && <CreditScoreTab />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#1c283c] py-6 px-4 bg-[#05080e]/80 text-center text-xs text-[#64748b]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Ascend Financial Technologies Inc. Strictly neutral & fictional demo fixtures.</span>
          <span className="font-mono text-[11px] text-[#8b98aa]">Ascend Core v1.0 • Enterprise Edition</span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
