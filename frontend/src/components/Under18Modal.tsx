import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface Under18ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Under18Modal: React.FC<Under18ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0c121d] border border-red-500/40 rounded-2xl p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b98aa] hover:text-white p-1 rounded-lg hover:bg-[#121a29]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-500/50 flex items-center justify-center mx-auto mb-4 text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Age Restriction</h3>

        <div className="bg-[#121a29] border border-red-500/20 rounded-xl p-4 my-4">
          <p className="text-red-300 font-medium text-base">
            Sorry, people below 18 are not allowed.
          </p>
        </div>

        <p className="text-sm text-[#8b98aa] mb-6">
          Ascend requires all account holders to be at least 18 years of age in accordance with applicable financial regulations.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-[#121a29] hover:bg-[#1c283c] text-white font-medium text-sm border border-[#1c283c] transition-colors"
        >
          Understood
        </button>
      </div>
    </div>
  );
};
