import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-xl animate-pulse"></div>
        <div className="relative">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
          <Sparkles className="w-5 h-5 text-yellow-400 absolute top-0 right-0 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-purple-300 mb-1">AI is crafting your project...</p>
        <p className="text-xs text-gray-500">This might take a moment</p>
      </div>
    </div>
  );
}