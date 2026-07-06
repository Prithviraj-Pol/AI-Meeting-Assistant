import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { spawn } from 'child_process';

dotenv.config();

// Spawn Python FastAPI server running on port 8000
console.log('Spawning Python FastAPI microservice on port 8000...');
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
const pythonServer = spawn(pythonCmd, ['server.py']);

pythonServer.on('error', (err) => {
  console.error('Failed to start Python FastAPI microservice:', err);
});

pythonServer.stdout.on('data', (data) => {
  console.log(`[Python FastAPI]: ${data.toString().trim()}`);
});

pythonServer.stderr.on('data', (data) => {
  console.error(`[Python FastAPI Warning]: ${data.toString().trim()}`);
});

pythonServer.on('close', (code) => {
  console.log(`Python FastAPI microservice exited with code ${code}`);
});

// Clean up child process on exit
process.on('exit', () => {
  pythonServer.kill();
});
process.on('SIGINT', () => {
  pythonServer.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  pythonServer.kill();
  process.exit();
});

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json({ limit: '50mb' }));

// Lazy initialization of Gemini API
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is required for AI features.');
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

// REST APIs
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Proxy and route requests to Python FastAPI microservice
app.all('/api/python/*', async (req, res) => {
  try {
    const targetUrl = `http://127.0.0.1:8000${req.originalUrl}`;
    
    const requestOptions: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      requestOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('Error proxying to Python microservice:', err);
    res.status(502).json({
      error: 'Failed to communicate with Python microservice',
      details: err.message,
    });
  }
});

// Process a meeting (supports real audio transcript or template-based sample meeting)
app.post('/api/process-meeting', async (req, res) => {
  try {
    const { title, template, audioBase64, audioMimeType } = req.body;
    const ai = getAI();

    let systemPrompt = `You are an expert MeetMind AI designed to analyze meeting recordings or produce highly realistic and premium meeting details for SaaS setups.
Your output must be structured strictly as a single valid JSON object.
Do not wrap your JSON in markdown code blocks like \`\`\`json. Return only the raw JSON.

The resulting JSON must match this structure exactly:
{
  "title": "Meeting Title",
  "duration": 300, // duration in seconds
  "transcript": [
    {
      "id": "t1",
      "speakerId": "s1",
      "speakerName": "Sarah (Product)",
      "text": "Speaker text goes here.",
      "startTime": 0.0,
      "endTime": 12.0,
      "confidence": 0.95
    }
  ],
  "speakers": [
    {
      "id": "s1",
      "name": "Sarah (Product)",
      "originalName": "Speaker 1",
      "speakingTime": 120,
      "percentage": 40,
      "emotion": "Confident"
    }
  ],
  "summary": {
    "short": "One-line high level overview",
    "detailed": "A beautiful 2-3 paragraph detailed summary of what was discussed, context, and accomplishments.",
    "highlights": ["Highlight 1", "Highlight 2"],
    "decisions": ["Decision 1", "Decision 2"],
    "keyTopics": ["Topic 1", "Topic 2"]
  },
  "tasks": [
    {
      "id": "task_1",
      "title": "Build user auth components",
      "owner": "Sarah",
      "deadline": "2026-07-10", // ISO date format for tomorrow, Friday, or next week.
      "priority": "high", // low, medium, high
      "status": "pending",
      "category": "Engineering"
    }
  ],
  "calendarEvents": [
    {
      "id": "cal_1",
      "title": "Follow-up Sync on Auth",
      "description": "Discuss progress of the user auth components with Sarah",
      "startTime": "2026-07-12T10:00:00Z",
      "endTime": "2026-07-12T10:30:00Z",
      "googleSynced": false
    }
  ],
  "emails": [
    {
      "id": "email_1",
      "subject": "Action Items & Summary: [Meeting Title]",
      "recipient": "team@startup.com",
      "body": "Hi team,\\n\\nHere is a recap of our discussion on...\\n\\nAction Items:\\n- Sarah: Build user auth components (Due 2026-07-10)\\n\\nBest,\\nMeetMind AI",
      "sent": false
    }
  ],
  "analytics": {
    "speakingTime": { "s1": 120 },
    "keywords": [
      { "text": "Auth", "value": 8 },
      { "text": "Database", "value": 5 }
    ],
    "sentiment": "Positive", // Positive, Neutral, Mixed, Critical
    "productivityScore": 88, // 0-100
    "silenceDuration": 25, // seconds
    "coachFeedback": [
      "Excellent distribution of speaking time among members.",
      "Keep key decisions summarized at the end of the meeting next time to increase alignment."
    ],
    "risks": [
      "Auth module delivery deadline is tight and might delay downstream integration."
    ]
  }
}
`;

    let userPrompt = '';
    let contents: any[] = [];

    if (audioBase64 && audioMimeType) {
      // Real audio processing
      userPrompt = `Please transcribe this audio recording, identify the speakers, diarize the conversation, generate a short/detailed summary, extract key highlights, decisions, action items, deadlines (convert phrases like "by Friday" or "tomorrow" into actual ISO dates based on current time: 2026-07-06), calculate meeting analytics, and write coach feedback. Make the title descriptive based on the discussion: "${title || 'Meeting Audio Recording'}".`;
      
      contents.push({
        inlineData: {
          mimeType: audioMimeType,
          data: audioBase64
        }
      });
      contents.push(userPrompt);
    } else {
      // Template-based dynamic generation (or empty audio fallback)
      let templateDesc = '';
      if (template === 'product_sync') {
        templateDesc = 'A Product Launch Sync meeting for "AI Workspace" SaaS, discussing deployment dates, UI design reviews, and auth API keys.';
      } else if (template === 'marketing_brainstorm') {
        templateDesc = 'A Marketing Strategy session for Q3 SaaS user acquisition, including custom TikTok ads campaigns, SEO keyword tracking, and newsletter scheduling.';
      } else if (template === 'engineering_postmortem') {
        templateDesc = 'An Engineering Post-Mortem on last night\'s production DB timeout, discussing server overload, replication lags, and migration steps.';
      } else if (template === 'sales_review') {
        templateDesc = 'A Sales & Pipeline Weekly Review, evaluating custom corporate tiers, demo conversions, CRM updates, and pricing plans.';
      } else {
        templateDesc = `A general business standup sync discussing general progress, blockers, and next steps titled "${title || 'Weekly Standup'}".`;
      }

      userPrompt = `Please generate an entire realistic meeting data structure for a premium meeting titled "${title || 'Team Sync'}".
The theme is: ${templateDesc}.
Include a beautiful realistic transcript with 3-4 distinct speakers having interactive dialogue back and forth (about 12-16 segments in total), diarized with realistic speech transcripts (including interruptions, collaborative comments).
Include detailed summaries, realistic action items mapped to tomorrow, Friday, or next week (calculate exact ISO dates based on today's current date: 2026-07-06).
Generate rich realistic analytics with keywords, speaking durations, emotion labels, risk detections, and professional coaching critiques.`;

      contents.push(userPrompt);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      }
    });

    const rawText = response.text || '{}';
    const parsedData = JSON.parse(rawText);

    res.json(parsedData);
  } catch (err: any) {
    console.error('Error in /api/process-meeting:', err);
    res.status(500).json({ error: err.message || 'Failed to process meeting data' });
  }
});

// Chat with transcript (RAG)
app.post('/api/chat', async (req, res) => {
  try {
    const { transcript, history, message } = req.body;
    const ai = getAI();

    const formattedTranscript = transcript
      .map((t: any) => `[${t.startTime}s - ${t.endTime}s] ${t.speakerName}: ${t.text}`)
      .join('\n');

    const systemPrompt = `You are "Copilot Chat" inside the MeetMind AI.
Your task is to answer user queries strictly based on the provided meeting transcript.
Support markdown, bold headers, and structured tables.
If the answer cannot be found in the transcript, state that you don't have that information, but answer helpful adjacent questions if possible.
Keep answers professional, elegant, and action-oriented.

Here is the full meeting transcript:
---------------------
${formattedTranscript}
---------------------
`;

    // Map conversation history to the format required by the SDK
    const contents: any[] = [];
    if (history && history.length > 0) {
      for (const turn of history) {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt
      }
    });

    res.json({ response: response.text });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: err.message || 'Failed to generate chat response' });
  }
});

// Generate email draft
app.post('/api/email', async (req, res) => {
  try {
    const { title, summary, tasks } = req.body;
    const ai = getAI();

    const systemPrompt = `You are an expert executive secretary. Generate a professional, highly polished meeting follow-up email draft.
Support standard clean layout, friendly greeting, executive bullet points, action items list with owners/dates, and next sync reminder.
Output only the JSON format:
{
  "subject": "Follow-up email subject line",
  "body": "Formatted email body text with newline characters. Use standard professional greetings and closures."
}
`;

    const userPrompt = `Generate a recap email draft for the meeting: "${title}"
Summary: ${summary.short}
Detailed recap: ${summary.detailed}
Action items: ${JSON.stringify(tasks)}
Today is 2026-07-06. Ensure the tone is extremely clean and respectful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [userPrompt],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      }
    });

    const rawText = response.text || '{}';
    res.json(JSON.parse(rawText));
  } catch (err: any) {
    console.error('Error in /api/email:', err);
    res.status(500).json({ error: err.message || 'Failed to generate email' });
  }
});

// Start dev or production asset serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
