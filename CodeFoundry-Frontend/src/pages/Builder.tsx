import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { ErrorMessage } from '../components/ErrorMessage';
import { Toast } from '../components/Toast';
import { Step, FileItem, StepType } from '../types';
import axios, { AxiosError } from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';
import { Send, Code2, Home, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TemplateResponse {
  prompts: string[];
  uiPrompts: string[];
  projectType?: string;
}

interface ChatResponse {
  response: string;
  timestamp?: string;
}

const STORAGE_KEY = 'builder_state';

interface StoredState {
  prompt: string;
  messages: ChatMessage[];
  steps: Step[];
  timestamp: string;
}

const saveToLocalStorage = (state: Partial<StoredState>) => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const current = existing ? JSON.parse(existing) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...current,
      ...state,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (promptKey: string): StoredState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.prompt === promptKey) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return null;
};

export function Builder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    const stored = loadFromLocalStorage(prompt);
    if (stored && stored.messages.length > 0) {
      setLlmMessages(stored.messages);
      if (stored.steps) {
        setSteps(stored.steps);
      }
      setToast({ message: 'Previous session restored', type: 'info' });
      setTemplateSet(true);
    }
  }, [prompt]);

  useEffect(() => {
    if (llmMessages.length > 0) {
      saveToLocalStorage({
        prompt,
        messages: llmMessages,
        steps
      });
    }
  }, [llmMessages, steps, prompt]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({status}) => status === "pending").forEach((step) => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
        const finalAnswerRef = currentFileStructure;
  
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          const currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            const file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            const folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }
  
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    })

    if (updateHappened) {
      setFiles(originalFiles)
      setSteps(prevSteps => prevSteps.map((s: Step) => {
        return {
          ...s,
          status: "completed" as const
        }
      }))
    }
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean): any => {  
        if (file.type === 'folder') {
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    const stored = loadFromLocalStorage(prompt);
    if (stored && stored.messages.length > 0) {
      console.log("📦 Using cached data");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🚀 Fetching template for prompt:", prompt.trim());
      
      const response = await axios.post<TemplateResponse>(`${BACKEND_URL}/template`, {
        prompt: prompt.trim()
      });
      
      console.log("✅ Template response:", response.data);
      setTemplateSet(true);
      
      const {prompts, uiPrompts, projectType} = response.data;

      if (projectType) {
        setToast({ 
          message: `Project type detected: ${projectType.toUpperCase()}`, 
          type: 'success' 
        });
      }

      setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending" as const
      })));

      const chatMessages: ChatMessage[] = [
        ...prompts.map((content: string) => ({
          role: "user" as const,
          content
        })),
        {
          role: "user" as const,
          content: prompt
        }
      ];

      console.log("💬 Sending chat request with", chatMessages.length, "messages");

      const stepsResponse = await axios.post<ChatResponse>(`${BACKEND_URL}/chat`, {
        messages: chatMessages
      });

      console.log("✅ Chat response received");
      setLoading(false);

      const newSteps = parseXml(stepsResponse.data.response);
      setSteps(s => [...s, ...newSteps.map((x: Step) => ({
        ...x,
        status: "pending" as const
      }))]);

      const updatedMessages = [
        ...chatMessages,
        {
          role: "assistant" as const,
          content: stepsResponse.data.response
        }
      ];

      setLlmMessages(updatedMessages);
      setToast({ message: 'Project initialized successfully!', type: 'success' });

    } catch (error) {
      console.error("❌ Error in init:", error);
      setLoading(false);
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message 
        : error instanceof Error 
        ? error.message 
        : "Failed to initialize project";
      setError(errorMessage);
    }
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSendMessage = async () => {
    try {
      if (!userPrompt.trim()) {
        setError("Please enter a message");
        return;
      }

      const newMessage: ChatMessage = {
        role: "user",
        content: userPrompt
      };

      setLoading(true);
      setError(null);
      console.log("💬 Sending follow-up message:", newMessage.content);
      
      const stepsResponse = await axios.post<ChatResponse>(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, newMessage]
      });
      
      console.log("✅ Follow-up response received");
      setLoading(false);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: stepsResponse.data.response
      };

      setLlmMessages(x => [...x, newMessage, assistantMessage]);
      
      const newSteps = parseXml(stepsResponse.data.response);
      setSteps(s => [...s, ...newSteps.map((x: Step) => ({
        ...x,
        status: "pending" as const
      }))]);

      setPrompt("");
      setToast({ message: 'Message sent successfully!', type: 'success' });

    } catch (error) {
      console.error("❌ Error sending message:", error);
      setLoading(false);
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message 
        : error instanceof Error 
        ? error.message 
        : "Failed to send message";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Premium Header */}
      <header className="relative z-10 glass-effect border-b border-purple-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass-effect-light border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 group"
            >
              <Home className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-300">Home</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-lg opacity-50"></div>
                <div className="relative bg-gradient-primary p-2 rounded-lg">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold text-gradient">CodeFoundry.AI</h1>
                <p className="text-xs text-gray-500">AI-Powered Builder</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass-effect-light px-4 py-2 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-sm text-gray-400">Building:</span>
                <span className="text-sm font-semibold text-purple-300 max-w-xs truncate">
                  {prompt}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          {/* Left Sidebar - Steps & Chat */}
          <div className="col-span-1 space-y-4 overflow-hidden flex flex-col">
            <div className="glass-effect rounded-2xl border border-purple-500/20 p-4 flex-1 overflow-hidden flex flex-col">
              <h2 className="font-heading text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Build Progress
              </h2>
              <div className="flex-1 overflow-auto mb-4">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>

              {/* Chat Input */}
              <div className="border-t border-purple-500/20 pt-4">
                {(loading || !templateSet) ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader />
                  </div>
                ) : (
                  <div className='flex flex-col gap-3'>
                    <textarea 
                      value={userPrompt} 
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setPrompt(e.target.value)
                      }} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleSendMessage();
                        }
                      }}
                      className='p-3 w-full bg-gray-900/50 text-gray-100 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none placeholder-gray-600 transition-all duration-300'
                      placeholder="Refine your project... (⌘+Enter to send)"
                      rows={3}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={loading || !userPrompt.trim()}
                      className='btn-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm py-3'
                    >
                      <Send className="w-4 h-4" />
                      <span>Send to AI</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Explorer */}
          <div className="col-span-1">
            <div className="glass-effect rounded-2xl border border-purple-500/20 p-4 h-full overflow-hidden flex flex-col">
              <h2 className="font-heading text-lg font-semibold text-gray-200 mb-4">Project Files</h2>
              <div className="flex-1 overflow-auto">
                <FileExplorer 
                  files={files} 
                  onFileSelect={setSelectedFile}
                />
              </div>
            </div>
          </div>

          {/* Code/Preview Area */}
          <div className="col-span-2">
            <div className="glass-effect rounded-2xl border border-purple-500/20 p-4 h-full flex flex-col overflow-hidden">
              <TabView activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="flex-1 mt-4 overflow-hidden rounded-xl border border-purple-500/20">
                {activeTab === 'code' ? (
                  <CodeEditor file={selectedFile} />
                ) : (
                  <PreviewFrame webContainer={webcontainer} files={files} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}