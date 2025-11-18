import React from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const config = type === 'success' 
    ? {
        bg: 'glass-effect border-green-500/50',
        iconBg: 'bg-green-500/20',
        iconColor: 'text-green-400',
        textColor: 'text-green-100',
        Icon: CheckCircle
      }
    : {
        bg: 'glass-effect border-blue-500/50',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        textColor: 'text-blue-100',
        Icon: Info
      };

  return (
    <div className={`fixed bottom-6 right-6 max-w-md ${config.bg} border rounded-2xl shadow-2xl p-5 flex items-start gap-4 animate-slide-in z-50`}>
      <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <config.Icon className={`w-6 h-6 ${config.iconColor}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm ${config.textColor}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`${config.iconColor} hover:opacity-70 transition-opacity hover:rotate-90 transition-transform duration-300`}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}