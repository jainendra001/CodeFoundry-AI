import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

const app = express();
app.use(express.json());

// Add this near the top
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://codefoundry-ai.vercel.app', // Your Vercel URL (update after deployment)
  process.env.FRONTEND_URL || '', // Add via env variable
].filter(Boolean);

// Update CORS middleware
import { Request, Response } from 'express';

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'), false); // Block in production
    }
  },
  credentials: true
}));



// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Template endpoint - determines if project is node or react
app.post("/template", async (req: Request, res: Response) => {
    try {
        const prompt = req.body.prompt;
        
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({ 
                message: "Invalid prompt. Please provide a valid project description." 
            });
        }

        console.log("📥 Received template request:", prompt);

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{
                        text: `You are a project type classifier. Respond with ONLY one word: "react" or "node".

Project Description: "${prompt}"

Rules:
- If it mentions: website, web app, UI, frontend, React, components, design → respond: react
- If it mentions: backend, API, server, Express, Node.js, database → respond: node
- For general web projects or unclear cases → respond: react

Response (one word):`
                    }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 10,
                temperature: 0,
                topP: 1,
                topK: 1,
            },
        });

        const rawAnswer = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log("🤖 Raw AI response:", JSON.stringify(rawAnswer));
        
        // Clean and normalize the answer
        const answer = rawAnswer.trim().toLowerCase().replace(/[^a-z]/g, '');
        console.log("🤖 Cleaned answer:", answer);

        // Determine project type with smart detection
        let projectType: 'react' | 'node' = 'react';
        
        if (answer.includes('node')) {
            projectType = 'node';
        } else if (answer.includes('react')) {
            projectType = 'react';
        } else {
            // Fallback: analyze prompt keywords
            const lowerPrompt = prompt.toLowerCase();
            const nodeKeywords = ['backend', 'api', 'server', 'express', 'database', 'rest', 'graphql'];
            const reactKeywords = ['website', 'web app', 'frontend', 'ui', 'component', 'page'];
            
            const hasNodeKeywords = nodeKeywords.some(keyword => lowerPrompt.includes(keyword));
            const hasReactKeywords = reactKeywords.some(keyword => lowerPrompt.includes(keyword));
            
            if (hasNodeKeywords && !hasReactKeywords) {
                projectType = 'node';
            } else {
                projectType = 'react';
            }
            
            console.log("⚠️ Using keyword-based detection, result:", projectType);
        }

        console.log("✅ Final project type:", projectType);

        const basePromptToUse = projectType === 'react' ? reactBasePrompt : nodeBasePrompt;
        
        res.json({
            prompts: [
                BASE_PROMPT,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${basePromptToUse}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`
            ],
            uiPrompts: [basePromptToUse],
            projectType
        });

    } catch (error: any) {
        console.error("❌ Error in /template:", error);
        res.status(500).json({ 
            message: "Failed to process template request", 
            error: (error as Error).message || "Unknown error"
        });
    }
});

// Chat endpoint - handles conversation with streaming support
app.post("/chat", async (req: Request, res: Response) => {
    try {
        const { messages, stream = false } = req.body;
        
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ 
                message: "Invalid messages. Please provide a valid message array." 
            });
        }

        console.log("💬 Received chat request with", messages.length, "messages");

        const chat = model.startChat({
            history: messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            systemInstruction: { 
                role: 'system', 
                parts: [{ text: getSystemPrompt() }] 
            },
            generationConfig: {
                maxOutputTokens: 8000,
                temperature: 0.7,
            },
        });

        const lastMessage = messages[messages.length - 1].content;
        console.log("📤 Sending to Gemini:", lastMessage.substring(0, 100) + "...");
        
        if (stream) {
            // Streaming response
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const result = await chat.sendMessageStream(lastMessage);
            
            for await (const chunk of result.stream) {
                const text = chunk.text();
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
            
            res.write('data: [DONE]\n\n');
            res.end();
        } else {
            // Regular response
            const chatResponse = await chat.sendMessage(lastMessage);
            const responseText = chatResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            if (!responseText) {
                throw new Error("Empty response from AI");
            }
            
            console.log("✅ Got response from Gemini:", responseText.substring(0, 100) + "...");

            res.json({
                response: responseText,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error: any) {
        console.error("❌ Error in /chat:", error);
        
        if (!res.headersSent) {
            res.status(500).json({ 
                message: "Failed to process chat request", 
                error: (error as Error).message || "Unknown error"
            });
        }
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on http://localhost:" + PORT);
    console.log("📡 Endpoints:");
    console.log("   GET  /health - Health check");
    console.log("   POST /template - Determine project type");
    console.log("   POST /chat - Chat with AI (supports streaming)");
    console.log("✨ Ready to build amazing projects!");
});
