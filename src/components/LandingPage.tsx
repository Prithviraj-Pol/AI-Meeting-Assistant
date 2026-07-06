import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Mic, 
  Search, 
  MessageSquare, 
  Calendar, 
  CheckSquare, 
  ArrowRight, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Check, 
  Shield, 
  Coins 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How accurate is the transcription and speaker diarization?",
      a: "Our advanced speech models achieve up to 98% transcription accuracy and automatically identify and split distinct speakers, even in noisy meeting environments or complex multi-speaker startup syncs."
    },
    {
      q: "Does it support languages other than English?",
      a: "Yes, we support over 40 languages, including Spanish, French, German, Mandarin, Hindi, and Japanese. The AI can also translate foreign language meetings directly into English summaries."
    },
    {
      q: "Can I connect my Google Calendar to sync action items?",
      a: "Absolutely! MeetMind AI integrates seamlessly with Google Calendar. It automatically identifies deadline dates during the meeting and creates structured event reminders or syncs meetings directly."
    },
    {
      q: "Is my meeting audio and data secure?",
      a: "Security is our highest priority. All data is encrypted both in transit and at rest. We utilize enterprise-grade GCP infrastructure and Firestore security rules to ensure only authorized users have access."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 overflow-x-hidden selection:bg-violet-500/30 selection:text-violet-200">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              MeetMind AI
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="glow-btn px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition cursor-pointer"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 shadow-sm shadow-violet-500/5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Intelligent Workspace</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-white">
            Your meetings,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
              fully structured
            </span>{' '}
            by AI.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Record, transcribe, identify speakers, and extract bullet summaries, task timelines, and calendar reminders in real-time. Power your team syncs with a unified intelligent assistant.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-base font-semibold text-white shadow-xl shadow-violet-600/25 hover:opacity-95 transition flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <span>Get Started - It's Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/5 text-base font-semibold text-slate-200 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-blue-400" />
              <span>Watch Demo</span>
            </button>
          </div>
        </motion.div>


      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
            Designed for high-velocity teams
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Everything you need to capture, organize, and capitalize on business discussions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition group">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit group-hover:scale-110 transition">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 mt-4 mb-2">Real-Time Audio Capture</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Record live meetings directly in browser or upload WAV/MP3 files. Live audio wave visualizers provide neat recording feedback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition group">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 w-fit group-hover:scale-110 transition">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 mt-4 mb-2">Speaker Diarization</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Identify multiple speakers automatically. Instantly edit speaker labels, merge voices, and view participation stats in dashboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition group">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit group-hover:scale-110 transition">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 mt-4 mb-2">Interactive AI Copilot</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Chat directly with transcripts. Ask suggested questions or prompt the AI to rewrite summary reports, find blockers, or draft summaries.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition group">
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 w-fit group-hover:scale-110 transition">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 mt-4 mb-2">Kanban Task Board</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Convert meeting action items automatically into active tasks. Set status pipelines, prioritize delivery, and assign stakeholders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition group">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-110 transition">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 mt-4 mb-2">Calendar Synchronization</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Durable deadline detection maps vague dates like "Friday" into actual calendar reminders. Sync effortlessly to Google Calendar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition group">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit group-hover:scale-110 transition">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 mt-4 mb-2">Semantic AI Search</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Search meetings conceptually rather than just by keyword matching. AI locates discussions about budgets, API configs, or design issues.
            </p>
          </div>
        </div>
      </section>



      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 mb-16 flex flex-col items-center justify-center">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 via-white/5 to-emerald-500/10 border border-orange-500/20 text-xs text-orange-300 mb-2 tracking-wide">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span>🇮🇳 Tailored for Indian Developers & Teams</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Transparent, value-driven pricing</h2>
          <p className="text-slate-400 max-w-xl">
            Scale as your workspace expands. Cancel anytime. Crafted with ❤️ by <span className="text-orange-400 font-semibold">Prithviraj POL</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Tier 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Starter</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold text-white">₹0</span>
                <span className="text-sm text-slate-400">/mo</span>
              </div>
              <p className="text-xs text-slate-400">For freelancers and quick, casual transcriptions.</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>3 Free Meetings</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Basic Audio Transcription</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Markdown Summary export</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={onGetStarted}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Tier 2 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-orange-950/15 via-slate-900/40 to-emerald-950/15 border border-orange-500/20 space-y-6 relative flex flex-col justify-between shadow-xl shadow-orange-500/5">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-600 to-emerald-600 text-[10px] font-bold text-white uppercase tracking-widest shadow-md shadow-orange-500/10">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-wider text-orange-300 uppercase">Growth Pro</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold text-white">₹1,599</span>
                <span className="text-sm text-slate-400">/mo</span>
              </div>
              <p className="text-xs text-slate-400">For fast-growing startups and product teams.</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>Unlimited audio transcripts</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>Speaker Diarization & Rename</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>Full Kanban Task board syncing</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Google Calendar syncer</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Real-time AI Transcript Chat</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={onGetStarted}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-emerald-600 hover:opacity-95 text-sm font-semibold text-white shadow-md shadow-orange-500/15 transition cursor-pointer"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Tier 3 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Enterprise</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold text-white">₹3,999</span>
                <span className="text-sm text-slate-400">/mo</span>
              </div>
              <p className="text-xs text-slate-400">For security-focused enterprise operations.</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Everything in Growth Pro</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Advanced sentiment & risk models</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>SLA uptime & dedicated support</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Role Based Access Logs</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={onGetStarted}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>

        {/* Developer Attribution Footer */}
        <div className="mt-16 flex flex-col items-center justify-center space-y-2">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <span className="text-[11px] text-slate-500 tracking-widest uppercase">
            Created by <span className="text-slate-400 font-semibold tracking-normal hover:text-orange-400 transition-colors duration-300">Prithviraj POL</span>
          </span>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto border-t border-white/5">
        <h2 className="font-display text-3xl font-bold text-center text-white mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden transition"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left font-medium text-slate-200 hover:text-white transition"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/5 bg-slate-950/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs">
        <div className="flex items-center space-x-2.5 mb-4 md:mb-0">
          <div className="p-1.5 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-semibold text-slate-300">MeetMind AI</span>
        </div>
        <p>© 2026 MeetMind AI Inc. All rights reserved. Powered securely by Gemini 2.5 Flash.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-slate-300">Security</a>
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Use</a>
        </div>
      </footer>
    </div>
  );
}
