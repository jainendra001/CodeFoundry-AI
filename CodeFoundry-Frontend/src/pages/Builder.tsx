import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios, { AxiosError } from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';

const MOCK_FILE_CONTENT = `// This is a sample file content
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TemplateResponse {
  prompts: string[];
  uiPrompts: string[];
}

interface ChatResponse {
  response: string;
}

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

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
            // final file
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
            /// in a folder
            const folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
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
    console.log(files);
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
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    try {
      setLoading(true);
      console.log("🚀 Fetching template for prompt:", prompt.trim());
      
      const response = await axios.post<TemplateResponse>(`${BACKEND_URL}/template`, {
        prompt: prompt.trim()
      });
      
      console.log("✅ Template response:", response.data);
      setTemplateSet(true);
      
      const {prompts, uiPrompts} = response.data;

      // Parse initial UI steps
      setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending" as const
      })));

      // Build proper chat messages - prompts are system/user instructions
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

      // Parse and add new steps from AI response
      const newSteps = parseXml(stepsResponse.data.response);
      setSteps(s => [...s, ...newSteps.map((x: Step) => ({
        ...x,
        status: "pending" as const
      }))]);

      // Update message history
      setLlmMessages([
        ...chatMessages,
        {
          role: "assistant" as const,
          content: stepsResponse.data.response
        }
      ]);

    } catch (error) {
      console.error("❌ Error in init:", error);
      setLoading(false);
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message 
        : error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      alert("Error initializing builder: " + errorMessage);
    }
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>
              <div className="max-h-[75vh] overflow-scroll">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
              <div>
                <div className='flex'>
                  <br />
                  {(loading || !templateSet) && <Loader />}
                  {!(loading || !templateSet) && <div className='flex'>
                    <textarea 
                      value={userPrompt} 
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setPrompt(e.target.value)
                      }} 
                      className='p-2 w-full'
                      placeholder="Enter follow-up instructions..."
                    ></textarea>
                  <button onClick={async () => {
                    try {
                      if (!userPrompt.trim()) {
                        alert("Please enter a message");
                        return;
                      }

                      const newMessage: ChatMessage = {
                        role: "user",
                        content: userPrompt
                      };

                      setLoading(true);
                      console.log("💬 Sending follow-up message:", newMessage.content);
                      
                      const stepsResponse = await axios.post<ChatResponse>(`${BACKEND_URL}/chat`, {
                        messages: [...llmMessages, newMessage]
                      });
                      
                      console.log("✅ Follow-up response received");
                      setLoading(false);

                      // Update messages
                      const assistantMessage: ChatMessage = {
                        role: "assistant",
                        content: stepsResponse.data.response
                      };

                      setLlmMessages(x => [...x, newMessage, assistantMessage]);
                      
                      // Parse and add new steps
                      const newSteps = parseXml(stepsResponse.data.response);
                      setSteps(s => [...s, ...newSteps.map((x: Step) => ({
                        ...x,
                        status: "pending" as const
                      }))]);

                      setPrompt(""); // Clear input after sending

                    } catch (error) {
                      console.error("❌ Error sending message:", error);
                      setLoading(false);
                      const errorMessage = error instanceof AxiosError 
                        ? error.response?.data?.message || error.message 
                        : error instanceof Error 
                        ? error.message 
                        : "Unknown error occurred";
                      alert("Error sending message: " + errorMessage);
                    }
                  }} className='bg-purple-400 px-4 hover:bg-purple-500 transition-colors cursor-pointer'>Send</button>
                  </div>}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1">
              <FileExplorer 
                files={files} 
                onFileSelect={setSelectedFile}
              />
            </div>
          <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
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
  );
}
