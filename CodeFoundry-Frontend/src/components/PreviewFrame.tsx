import React, { useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { FileItem } from '../types';
import { Loader2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface PreviewFrameProps {
  webContainer: WebContainer | null;
  files: FileItem[];
}

export function PreviewFrame({ webContainer, files }: PreviewFrameProps) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!webContainer || files.length === 0) return;

    let isMounted = true;

    const startDevServer = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🚀 Starting dev server...');

        // Install dependencies
        const installProcess = await webContainer.spawn('npm', ['install']);
        
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('📦 Install:', data);
          }
        }));

        const installExitCode = await installProcess.exit;
        
        if (installExitCode !== 0) {
          throw new Error('Failed to install dependencies');
        }

        console.log('✅ Dependencies installed');

        // Start dev server
        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
        
        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('🔧 Dev server:', data);
          }
        }));

        // Wait for server ready
        webContainer.on('server-ready', (port, url) => {
          if (isMounted) {
            console.log('✅ Server ready at:', url);
            setUrl(url);
            setIsReady(true);
            setLoading(false);
          }
        });

        // Set a timeout for server startup
        setTimeout(() => {
          if (!isReady && isMounted) {
            setError('Server is taking longer than expected. Please refresh.');
            setLoading(false);
          }
        }, 30000);

      } catch (err) {
        console.error('❌ Error starting dev server:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to start preview');
          setLoading(false);
        }
      }
    };

    startDevServer();

    return () => {
      isMounted = false;
    };
  }, [webContainer, files]);

  const handleRefresh = () => {
    if (url) {
      // Force iframe reload
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    }
  };

  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!webContainer) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-950 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Initializing WebContainer...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-950 rounded-xl border border-purple-500/20">
        <div className="text-center px-8">
          <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2 font-heading">
            No Preview Available
          </h3>
          <p className="text-gray-500">
            Wait for AI to generate your project files
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-950 rounded-xl">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-2xl animate-pulse"></div>
            <Loader2 className="relative w-16 h-16 text-purple-400 animate-spin mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-purple-300 mb-2 font-heading">
            Building Preview
          </h3>
          <p className="text-sm text-gray-400">
            Installing dependencies and starting dev server...
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-950 rounded-xl border border-red-500/20">
        <div className="text-center px-8">
          <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-red-300 mb-2 font-heading">
            Preview Error
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-300 font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-950 rounded-xl overflow-hidden border border-purple-500/20">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Live Preview</span>
          </div>
          {url && (
            <span className="text-xs text-gray-600 px-3 py-1 bg-gray-800 rounded-md font-mono">
              {url}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-purple-600/20 rounded-lg transition-colors group"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4 text-gray-400 group-hover:text-purple-400 group-hover:rotate-180 transition-all duration-300" />
          </button>
          <button
            onClick={handleOpenInNewTab}
            className="p-2 hover:bg-purple-600/20 rounded-lg transition-colors group"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 relative">
        {url ? (
          <iframe
            id="preview-iframe"
            src={url}
            className="w-full h-full border-0 bg-white"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}