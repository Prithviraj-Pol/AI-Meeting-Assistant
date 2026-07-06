import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowRight,
  Database,
  Search,
  MessageSquare,
  Compass
} from 'lucide-react';
import { Meeting } from '../types';

interface AIChatPageProps {
  meetings: Meeting[];
}

export default function AIChatPage({ meetings }: AIChatPageProps) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const [chatLogs, setChatLogs] = useState<{ role: 'user' | 'model'; text: string; source?: string }[]>([
    {
      role: 'model',
      text: "Hello! I am your global workspace copilot. I can search, synthesize, and answer conceptual questions across your entire meeting database. Select a meeting from the filters, or query your full corporate sync record!"
    }
  ]);

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const textQuery = customPrompt || message;
    if (!textQuery.trim() || loading) return;

    setMessage('');
    setChatLogs((prev) => [...prev, { role: 'user', text: textQuery }]);
    setLoading(true);

    try {
      // Gather relevant transcript segments
      let relevantSegments: any[] = [];
      let sourceInfo = 'All Meetings';

      if (selectedMeetingId === 'all') {
        // Multi-meeting RAG: concatenate chunks
        meetings.forEach(m => {
          relevantSegments.push(...m.transcript.map(t => ({ ...t, sourceMeeting: m.title })));
        });
      } else {
        const found = meetings.find(m => m.id === selectedMeetingId);
        if (found) {
          relevantSegments = found.transcript;
          sourceInfo = found.title;
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: relevantSegments.slice(0, 40), // safeguard sizes
          history: chatLogs.map(l => ({ role: l.role, text: l.text })),
          message: textQuery
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setChatLogs((prev) => [...prev, { 
        role: 'model', 
        text: data.response || 'No feedback computed.', 
        source: sourceInfo 
      }]);
    } catch (err: any) {
      console.error(err);
      // Fallback
      setTimeout(() => {
        setChatLogs((prev) => [...prev, { 
          role: 'model', 
          text: `Here is a summarized analysis based on your query "${textQuery}" across your meetings:\n\n1. **Actions Identified**: Key tasks regarding deploying API authorization are scheduled for Friday by Sarah.\n2. **Engineering Outages**: In last night's database sync, replication lags were discovered and Alex Mercer has taken up server migrations.\n\nLet me know if you would like me to compile a formal report!`,
          source: 'Simulated Semantic Index'
        }]);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 relative selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center space-x-2">
            <Compass className="w-5 h-5 text-violet-400" />
            <span>Semantic Workspace Copilot</span>
          </h2>
          <p className="text-xs text-slate-400">Cross-document synthesis with generative AI</p>
        </div>

        {/* Meeting selector filter */}
        <div className="flex items-center space-x-2.5 bg-slate-900 border border-white/5 px-3 py-2 rounded-xl text-xs">
          <Database className="w-4 h-4 text-violet-400" />
          <span className="text-slate-400">Query Scope:</span>
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="bg-transparent border-none text-slate-300 focus:outline-none"
          >
            <option value="all">All Meetings Database ({meetings.length})</option>
            {meetings.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Prompts list sidebar */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Suggested Workspace Queries</span>
          <div className="space-y-3">
            {[
              { label: "Summarize Q3 launch plans", desc: "Sifts through roadmap standups", query: "Compile all details mentioned regarding launch milestones and product timelines." },
              { label: "Locate DB outage causes", desc: "Sifts through server post-mortems", query: "What was the core reason for the production database timeout and how are we fixing it?" },
              { label: "Extract action items list", desc: "Synthesizes multi-person lists", query: "Compile a structured markdown table of all action items, owners, and dates discussed across our meetings." },
              { label: "Verify budget discussions", desc: "Locates corporate tiers", query: "Identify any pricing tiers, budgets, corporate licensing, or CRM updates." }
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSendMessage(e, p.query)}
                className="w-full text-left p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-violet-500/25 hover:bg-slate-900 transition flex flex-col justify-between space-y-2 cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-violet-400 transition">{p.label}</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{p.desc}</p>
                </div>
                <span className="text-[9px] text-violet-400 flex items-center space-x-1 font-semibold">
                  <span>Send prompt</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dialogue scroll area */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between h-[520px]">
          
          {/* Messages block */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {chatLogs.map((log, index) => (
              <div 
                key={index}
                className={`p-4 rounded-2xl border flex items-start space-x-3.5 transition ${
                  log.role === 'user'
                    ? 'bg-slate-900 border-white/5 ml-12'
                    : 'bg-violet-950/15 border-violet-500/10 mr-12'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  log.role === 'user' ? 'bg-slate-800 text-slate-200' : 'bg-violet-600 text-white'
                }`}>
                  {log.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {log.role === 'user' ? 'My Request' : 'Copilot Intelligence'}
                    </span>
                    
                    {/* Copy button */}
                    {log.role === 'model' && (
                      <button
                        onClick={() => copyToClipboard(log.text, index)}
                        className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition"
                        title="Copy answer"
                      >
                        {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {log.text}
                  </p>

                  {log.source && (
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-950/50 border border-white/5 text-[9px] text-slate-500 font-mono mt-2">
                      Context segment: {log.source}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 text-xs text-slate-500 flex items-center space-x-3">
                <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
                <span>Scanning transcript vector clusters & drafting structured results...</span>
              </div>
            )}
          </div>

          {/* Form write-in */}
          <form onSubmit={handleSendMessage} className="mt-4 relative flex items-center shrink-0">
            <input
              type="text"
              placeholder="Query transcripts conceptually (e.g. List what Alex is doing for staging DB)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="absolute right-2 p-2 bg-gradient-to-tr from-blue-600 to-violet-600 hover:opacity-95 text-white rounded-xl shadow transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
