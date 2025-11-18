import React from 'react';
import { Code, Eye } from 'lucide-react';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex gap-2 border-b border-purple-500/20 pb-3">
      <button
        onClick={() => onTabChange('code')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          activeTab === 'code'
            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50 shadow-lg'
            : 'text-gray-400 hover:text-purple-300 hover:bg-purple-600/10'
        }`}
      >
        <Code className="w-4 h-4" />
        <span>Code</span>
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          activeTab === 'preview'
            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50 shadow-lg'
            : 'text-gray-400 hover:text-purple-300 hover:bg-purple-600/10'
        }`}
      >
        <Eye className="w-4 h-4" />
        <span>Preview</span>
      </button>
    </div>
  );
}