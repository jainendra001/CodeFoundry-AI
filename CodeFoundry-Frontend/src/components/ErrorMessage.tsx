import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return (
    <div className="fixed top-4 right-4 max-w-md bg-red-900/90 border border-red-700 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in z-50">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-red-100 mb-1">Error</h3>
        <p className="text-sm text-red-200">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-red-400 hover:text-red-300 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
