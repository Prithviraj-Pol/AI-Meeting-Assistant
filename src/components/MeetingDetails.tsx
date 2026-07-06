import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Clock, 
  User, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Mail, 
  Brain, 
  MessageSquare, 
  Search, 
  Check, 
  ChevronRight, 
  Download, 
  Send, 
  Edit3, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Meeting, TranscriptSegment, Speaker, MeetingTask } from '../types';

interface MeetingDetailsProps {
  meeting: Meeting;
  onBack: () => void;
  onUpdateMeeting: (meeting: Meeting) => void;
}

export default function MeetingDetails({ meeting, onBack, onUpdateMeeting }: MeetingDetailsProps) {
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'tasks' | 'calendar' | 'email' | 'coach'>('transcript');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  
  // Audio playback simulator
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Speaker rename / merge state
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [newSpeakerName, setNewSpeakerName] = useState('');

  // AI Chat Sidebar states
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Email state
  const [emailDraft, setEmailDraft] = useState({ subject: '', body: '', recipient: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Google Calendar Sync state
  const [calendarSyncing, setCalendarSyncing] = useState(false);

  // Sync initial email draft
  useEffect(() => {
    if (meeting.emails && meeting.emails.length > 0) {
      setEmailDraft({
        subject: meeting.emails[0].subject,
        body: meeting.emails[0].body,
        recipient: meeting.emails[0].recipient
      });
    } else {
      setEmailDraft({
        subject: `Follow-up & recap: ${meeting.title}`,
        body: `Hi team,\n\nHere is a short summary of our "${meeting.title}" discussion:\n\nSummary: ${meeting.summary?.short || ''}\n\nPlease review your assigned tasks in the Workspace Kanban.\n\nBest,\nMeetMind AI`,
        recipient: 'team@company.com'
      });
    }
  }, [meeting]);

  // Audio Playback simulation
  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= meeting.duration) {
            setIsPlaying(false);
            if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    }
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, meeting.duration]);

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Speaker label management
  const startEditingSpeaker = (speaker: Speaker) => {
    setEditingSpeakerId(speaker.id);
    setNewSpeakerName(speaker.name);
  };

  const saveSpeakerName = () => {
    if (!editingSpeakerId || !newSpeakerName.trim()) return;

    // Update speakers
    const updatedSpeakers = meeting.speakers.map((s) => {
      if (s.id === editingSpeakerId) {
        return { ...s, name: newSpeakerName };
      }
      return s;
    });

    // Update transcript segments
    const updatedTranscript = meeting.transcript.map((t) => {
      if (t.speakerId === editingSpeakerId) {
        return { ...t, speakerName: newSpeakerName };
      }
      return t;
    });

    onUpdateMeeting({
      ...meeting,
      speakers: updatedSpeakers,
      transcript: updatedTranscript
    });

    setEditingSpeakerId(null);
  };

  // Toggle task statuses
  const toggleTaskStatus = (taskId: string) => {
    const updatedTasks: MeetingTask[] = meeting.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, status: t.status === 'completed' ? 'pending' : 'completed' };
      }
      return t;
    });

    onUpdateMeeting({
      ...meeting,
      tasks: updatedTasks
    });
  };

  // Ask Copilot (RAG Chat)
  const handleAskCopilot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userText = chatMessage;
    setChatMessage('');
    setChatHistory((prev) => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: meeting.transcript,
          history: chatHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'model', text: h.text })),
          message: userText
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setChatHistory((prev) => [...prev, { role: 'model', text: data.response || 'No reply generated' }]);
    } catch (err: any) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: 'model', text: `Failed to connect with Copilot. Here is a simulated response based on your question about the meeting: "The team agreed that deployment keys are needed by Friday."` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Sync events to Google Calendar
  const handleCalendarSync = () => {
    setCalendarSyncing(true);
    setTimeout(() => {
      const updatedEvents = meeting.calendarEvents.map((c) => ({
        ...c,
        googleSynced: true
      }));

      onUpdateMeeting({
        ...meeting,
        calendarEvents: updatedEvents
      });
      setCalendarSyncing(false);
    }, 1500);
  };

  // Send follow-up emails
  const handleSendEmail = async () => {
    setEmailLoading(true);
    try {
      // Simulate real mailing network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      const updatedEmails = meeting.emails.map((em) => ({
        ...em,
        sent: true
      }));

      onUpdateMeeting({
        ...meeting,
        emails: updatedEmails
      });
      setEmailSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setEmailLoading(false);
    }
  };

  // Search filter transcript
  const filteredTranscript = meeting.transcript.filter((t) =>
    t.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
    t.speakerName.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Back to list and Title controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center space-x-2">
              <span>{meeting.title}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Recorded on {new Date(meeting.date).toLocaleDateString()} at {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center space-x-2.5">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            Status: Fully Diarized
          </span>
        </div>
      </div>

      {/* Audio Wave Player Section */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition shadow-lg shadow-violet-600/10 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <div>
            <p className="text-sm font-bold text-slate-200">Meeting Audio Recording</p>
            <p className="text-[10px] text-slate-400 font-mono">
              {formatAudioTime(currentTime)} / {formatAudioTime(meeting.duration)}
            </p>
          </div>
        </div>

        {/* Scrubbing slider */}
        <div className="flex-1 px-4">
          <input
            type="range"
            min={0}
            max={meeting.duration}
            value={currentTime}
            onChange={handleAudioSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>

        {/* Speed controls */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Speed:</span>
          {[1, 1.25, 1.5, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 rounded font-semibold font-mono ${
                playbackSpeed === speed ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Two Columns: Content Tabs and AI Assistant Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Tabs Column (Left / Middle) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs header list */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-1">
            {[
              { id: 'transcript', label: 'Transcript & Diarization', icon: FileText },
              { id: 'summary', label: 'AI Summaries', icon: Brain },
              { id: 'tasks', label: 'Action Items', icon: CheckSquare },
              { id: 'calendar', label: 'Calendar Sync', icon: Calendar },
              { id: 'email', label: 'Draft Email', icon: Mail },
              { id: 'coach', label: 'Meeting Coach', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-violet-400 border-violet-500' 
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="min-h-[400px]">
            {activeTab === 'transcript' && (
              <div className="space-y-6">
                
                {/* Search & Speakers lists */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Speakers Side panel */}
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Speaker Directory</span>
                    </div>

                    <div className="space-y-3">
                      {meeting.speakers.map((speaker) => (
                        <div key={speaker.id} className="p-3 rounded-lg bg-slate-950/50 border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            {editingSpeakerId === speaker.id ? (
                              <div className="flex items-center space-x-1">
                                <input
                                  type="text"
                                  value={newSpeakerName}
                                  onChange={(e) => setNewSpeakerName(e.target.value)}
                                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-white border border-white/10 w-28 focus:outline-none"
                                />
                                <button onClick={saveSpeakerName} className="p-1 rounded bg-green-600 hover:bg-green-500 text-white">
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-200">{speaker.name}</span>
                                <span className="text-[9px] text-slate-500 block font-mono">Originally: {speaker.originalName}</span>
                              </div>
                            )}
                            
                            {editingSpeakerId !== speaker.id && (
                              <button 
                                onClick={() => startEditingSpeaker(speaker)}
                                className="p-1 text-slate-500 hover:text-white transition"
                                title="Edit Label"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-1 text-[10px] text-slate-400 font-mono">
                            <div className="flex justify-between">
                              <span>Speaking time:</span>
                              <span className="text-slate-300 font-semibold">{speaker.speakingTime}s ({speaker.percentage}%)</span>
                            </div>
                            {speaker.emotion && (
                              <div className="flex justify-between">
                                <span>Sentiment Tone:</span>
                                <span className="text-violet-400 font-semibold">{speaker.emotion}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transcript Content Area */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search keywords or speakers..."
                        value={transcriptSearch}
                        onChange={(e) => setTranscriptSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                      {filteredTranscript.map((seg) => {
                        const isActive = currentTime >= seg.startTime && currentTime <= seg.endTime;
                        return (
                          <div 
                            key={seg.id}
                            onClick={() => setCurrentTime(seg.startTime)}
                            className={`p-3.5 rounded-xl border transition cursor-pointer ${
                              isActive 
                                ? 'bg-violet-600/10 border-violet-500/50 shadow-sm shadow-violet-500/10' 
                                : 'bg-slate-900/30 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-violet-400">{seg.speakerName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                [{formatAudioTime(seg.startTime)} - {formatAudioTime(seg.endTime)}]
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{seg.text}</p>
                          </div>
                        );
                      })}

                      {filteredTranscript.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500">
                          No lines found matching query.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'summary' && meeting.summary && (
              <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Short Recap</h3>
                  <p className="text-base text-slate-100 font-semibold leading-relaxed">
                    "{meeting.summary.short}"
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Executive Summary</h3>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {meeting.summary.detailed}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span>Meeting Highlights</span>
                    </h3>
                    <ul className="space-y-2">
                      {meeting.summary.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-1.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Decisions Logged</span>
                    </h3>
                    <ul className="space-y-2">
                      {meeting.summary.decisions.map((d, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Action Items Extracted ({meeting.tasks.length})</span>
                  <span className="text-[10px] text-slate-500">Click checkboxes to mark progress</span>
                </div>

                <div className="space-y-3">
                  {meeting.tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3.5">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition shrink-0 mt-0.5 cursor-pointer ${
                            task.status === 'completed' 
                              ? 'bg-violet-600 border-violet-500 text-white' 
                              : 'border-white/20 hover:border-white/40 bg-slate-950/40'
                          }`}
                        >
                          {task.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div className="space-y-1">
                          <p className={`text-sm font-semibold leading-none ${
                            task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}>
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                            <span>Assignee: <strong className="text-slate-300">{task.owner}</strong></span>
                            <span>•</span>
                            <span>Deadline: <strong className="text-slate-300">{task.deadline}</strong></span>
                            <span>•</span>
                            <span>Group: <strong className="text-violet-400">{task.category}</strong></span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider shrink-0 ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/5'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}

                  {meeting.tasks.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No action items extracted for this meeting.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">Google Calendar Integrations</h3>
                    <p className="text-xs text-slate-400">Sync meeting dates and action item deadlines directly</p>
                  </div>

                  <button
                    onClick={handleCalendarSync}
                    disabled={calendarSyncing}
                    className="glow-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-semibold text-white shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {calendarSyncing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing Reminders...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Sync All to Google Calendar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  {meeting.calendarEvents.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-200">{ev.title}</h4>
                        <p className="text-xs text-slate-400">{ev.description}</p>
                        <span className="text-[10px] text-violet-400 block font-mono">
                          Scheduled: {new Date(ev.startTime).toLocaleDateString()} at {new Date(ev.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        ev.googleSynced ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-white/5'
                      }`}>
                        {ev.googleSynced ? '✓ Synced' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">Generate Follow-up Recaps</h3>
                    <p className="text-xs text-slate-400">Review, edit, and send the professional meeting summaries</p>
                  </div>

                  <button
                    onClick={handleSendEmail}
                    disabled={emailLoading || emailSent}
                    className="glow-btn px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 shadow hover:bg-slate-700 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Mail...</span>
                      </>
                    ) : emailSent ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sent successfully</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send Recap Email</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To Recipient</label>
                    <input
                      type="text"
                      value={emailDraft.recipient}
                      onChange={(e) => setEmailDraft({ ...emailDraft, recipient: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</label>
                    <input
                      type="text"
                      value={emailDraft.subject}
                      onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-200 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Body Draft</label>
                    <textarea
                      rows={8}
                      value={emailDraft.body}
                      onChange={(e) => setEmailDraft({ ...emailDraft, body: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 leading-relaxed font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'coach' && meeting.analytics && (
              <div className="space-y-6">
                
                {/* Sentiment & Productivity grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Productivity Score</span>
                    <span className="text-4xl font-display font-bold text-violet-400 block">{meeting.analytics.productivityScore}%</span>
                    <span className="text-[9px] font-semibold text-slate-500 block">Analyzed meeting cadence</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">General Sentiment</span>
                    <span className="text-4xl font-display font-bold text-emerald-400 block">{meeting.analytics.sentiment}</span>
                    <span className="text-[9px] font-semibold text-slate-500 block">Tone & language indices</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Silence Duration</span>
                    <span className="text-4xl font-display font-bold text-blue-400 block">{meeting.analytics.silenceDuration}s</span>
                    <span className="text-[9px] font-semibold text-slate-500 block">Interruption density</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/30 border border-white/5 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Coaching Critiques</span>
                  </div>

                  <ul className="space-y-3.5">
                    {meeting.analytics.coachFeedback.map((fb, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2.5">
                        <ChevronRight className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <span>{fb}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/30 border border-white/5 space-y-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">Identified Risks</span>
                  </div>

                  <ul className="space-y-3.5">
                    {meeting.analytics.risks.map((risk, i) => (
                      <li key={i} className="text-xs text-amber-400/90 flex items-start space-x-2.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Copilot Side panel (Always Visible when detail open) */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between h-[580px]">
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 shrink-0">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">AI Transcript Copilot</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/40 border border-white/5">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Hi! I'm your RAG Assistant. Ask me anything about this meeting's timeline, decisions, or individual statements!
                </p>
                {/* Suggestions triggers */}
                <div className="mt-2 flex flex-col space-y-1 text-[10px]">
                  {[
                    "What were the core action items?",
                    "Were there any risks outlined?",
                    "What did Sarah mention regarding dates?"
                  ].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setChatMessage(s);
                      }}
                      className="text-left px-2.5 py-1.5 rounded-md bg-slate-800 text-violet-300 hover:text-white hover:bg-slate-700/80 font-semibold transition cursor-pointer truncate"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {chatHistory.map((h, i) => (
                <div key={i} className={`p-2.5 rounded-lg border ${
                  h.role === 'user' 
                    ? 'bg-slate-800 border-white/5 text-right text-slate-200 self-end' 
                    : 'bg-violet-950/20 border-violet-500/15 text-left text-slate-300'
                }`}>
                  <span className="text-[9px] uppercase tracking-wider font-bold block mb-1 text-slate-400">
                    {h.role === 'user' ? 'Me' : 'Copilot'}
                  </span>
                  <p className="leading-relaxed whitespace-pre-wrap">{h.text}</p>
                </div>
              ))}

              {chatLoading && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-slate-500 flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                  <span>Generating response...</span>
                </div>
              )}
            </div>
          </div>

          {/* Form input messaging */}
          <form onSubmit={handleAskCopilot} className="mt-4 shrink-0 relative flex items-center">
            <input
              type="text"
              placeholder="Ask Copilot..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="absolute right-1.5 p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
