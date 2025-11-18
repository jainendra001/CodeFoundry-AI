import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return (
    <div className="fixed top-6 right-6 max-w-md glass-effect border border-red-500/50 rounded-2xl shadow-2xl p-5 flex items-start gap-4 animate-slide-in z-50 glow-effect">
      <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-red-100 mb-1 font-heading">Error Occurred</h3>
        <p className="text-sm text-red-200/90">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-red-400 hover:text-red-300 transition-colors hover:rotate-90 transition-transform duration-300"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}