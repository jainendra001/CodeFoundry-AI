import React, { useState } from 'react';
import { FileItem } from '../types';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (items: FileItem[], level: number = 0) => {
    return items.map((item) => {
      const isExpanded = expandedFolders.has(item.path);
      const isFolder = item.type === 'folder';

      return (
        <div key={item.path}>
          <div
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.path);
              } else {
                onFileSelect(item);
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group ${
              isFolder
                ? 'hover:bg-purple-600/10'
                : 'hover:bg-purple-600/20 hover:border-l-2 hover:border-purple-500'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {isFolder && (
              <span className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </span>
            )}

            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-purple-400 flex-shrink-0" />
              )
            ) : (
              <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
            )}

            <span
              className={`text-sm truncate ${
                isFolder
                  ? 'text-gray-300 font-medium'
                  : 'text-gray-400 group-hover:text-purple-300'
              }`}
            >
              {item.name}
            </span>
          </div>

          {isFolder && isExpanded && item.children && (
            <div className="ml-2">
              {renderFileTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No files yet</p>
        <p className="text-xs mt-1">AI will generate files shortly</p>
      </div>
    );
  }

  return <div className="space-y-1">{renderFileTree(files)}</div>;
}