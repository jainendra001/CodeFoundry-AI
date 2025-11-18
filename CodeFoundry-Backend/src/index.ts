require("dotenv").config();

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

const app = express();
app.use(cors());
app.use(express.json());

// Template endpoint - determines if project is node or react
app.post("/template", async (req, res) => {
    try {
        const prompt = req.body.prompt;
        console.log("📥 Received template request:", prompt);

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{
                        text: `You must respond with ONLY one word: either "react" or "node". No explanation, no punctuation, just the word.

Analyze this project description and determine the type:
"${prompt}"

If it mentions: React, frontend, UI, components, web app, website → respond: react
If it mentions: Express, backend, API, server, Node.js → respond: node
If unclear → respond: react

Your response (one word only):`
                    }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 10,
                temperature: 0,
            },
        });

        // Get the raw response
        const rawAnswer = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log("🤖 Raw AI response:", JSON.stringify(rawAnswer));
        
        // Clean and parse the answer
        const answer = rawAnswer.trim().toLowerCase().replace(/[^a-z]/g, '');
        console.log("🤖 Cleaned answer:", answer);

        // Check if it contains 'react' or 'node'
        let projectType = '';
        if (answer.includes('react')) {
            projectType = 'react';
        } else if (answer.includes('node')) {
            projectType = 'node';
        } else {
            // Default to react if unclear
            console.log("⚠️ Unclear response, defaulting to react");
            projectType = 'react';
        }

        console.log("✅ Final project type:", projectType);

        if (projectType === "react") {
            console.log("📦 Sending React template");
            res.json({
                prompts: [
                    BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`
                ],
                uiPrompts: [reactBasePrompt]
            });
            return;
        } else {
            console.log("📦 Sending Node template");
            res.json({
                prompts: [
                    BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`
                ],
                uiPrompts: [nodeBasePrompt]
            });
            return;
        }
    } catch (error) {
        console.error("❌ Error in /template:", error);
        res.status(500).json({ message: "Internal server error", error: String(error) });
    }
});

// Chat endpoint - handles conversation
app.post("/chat", async (req, res) => {
    try {
        const messages = req.body.messages;
        console.log("💬 Received chat request with", messages.length, "messages");

        const chat = model.startChat({
            history: messages.slice(0, -1).map((msg: any) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            systemInstruction: { role: 'system', parts: [{ text: getSystemPrompt() }] },
            generationConfig: {
                maxOutputTokens: 8000,
            },
        });

        const lastMessage = messages[messages.length - 1].content;
        console.log("📤 Sending to Gemini:", lastMessage.substring(0, 100) + "...");
        
        const chatResponse = await chat.sendMessage(lastMessage);
        const responseText = chatResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        console.log("✅ Got response from Gemini:", responseText.substring(0, 100) + "...");

        res.json({
            response: responseText
        });
    } catch (error) {
        console.error("❌ Error in /chat:", error);
        res.status(500).json({ message: "Internal server error", error: String(error) });
    }
});

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
    console.log("📡 Endpoints:");
    console.log("   POST /template - Determine project type");
    console.log("   POST /chat - Chat with AI");
});
