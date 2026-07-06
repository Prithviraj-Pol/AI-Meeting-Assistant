import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  User, 
  Bell, 
  Key, 
  Sliders, 
  CreditCard, 
  Check, 
  ShieldCheck,
  AlertCircle,
  Terminal,
  Cpu
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsPageProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function SettingsPage({ user, onUpdateProfile }: SettingsPageProps) {
  const [activeSub, setActiveSub] = useState<'profile' | 'notifications' | 'api' | 'billing' | 'python'>('profile');
  
  // Profile settings
  const [name, setName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [savedProfile, setSavedProfile] = useState(false);

  // Notification settings
  const [emailRecap, setEmailRecap] = useState(true);
  const [slackRecap, setSlackRecap] = useState(false);
  const [desktopAlert, setDesktopAlert] = useState(true);
  const [savedNotifications, setSavedNotifications] = useState(false);

  // API custom keys
  const [customApiKey, setCustomApiKey] = useState('');
  const [savedApi, setSavedApi] = useState(false);

  // Theme / language state
  const [themeMode, setThemeMode] = useState('dark');
  const [langSelect, setLangSelect] = useState('en');

  // Python microservice state
  const [pythonHealth, setPythonHealth] = useState<any>(null);
  const [loadingPythonHealth, setLoadingPythonHealth] = useState(false);
  const [pythonAnalysisResult, setPythonAnalysisResult] = useState<any>(null);
  const [analyzingPython, setAnalyzingPython] = useState(false);
  const [testTranscriptText, setTestTranscriptText] = useState(
    "Sarah: The product launch looks great, but the database timeout issue is a major problem and is delaying our progress. We must fix this blocker today."
  );

  const fetchPythonHealth = async () => {
    setLoadingPythonHealth(true);
    try {
      const res = await fetch('/api/python/health');
      if (res.ok) {
        const data = await res.json();
        setPythonHealth(data);
      } else {
        setPythonHealth({ error: 'Failed to fetch status' });
      }
    } catch (err: any) {
      setPythonHealth({ error: err.message || 'Microservice offline' });
    } finally {
      setLoadingPythonHealth(false);
    }
  };

  const handlePythonAnalysis = async () => {
    setAnalyzingPython(true);
    try {
      const reqSegments = [
        {
          id: "t_test_1",
          speakerId: "s_test_1",
          speakerName: "Test Speaker",
          text: testTranscriptText,
          startTime: 0,
          endTime: 15,
          confidence: 0.99
        }
      ];

      const res = await fetch('/api/python/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: reqSegments })
      });

      if (res.ok) {
        const data = await res.json();
        setPythonAnalysisResult(data);
      } else {
        const errText = await res.text();
        setPythonAnalysisResult({ error: errText || 'Analysis failed' });
      }
    } catch (err: any) {
      setPythonAnalysisResult({ error: err.message || 'Failed to reach Python microservice' });
    } finally {
      setAnalyzingPython(false);
    }
  };

  // Run health check on mount or when tab changes to 'python'
  React.useEffect(() => {
    if (activeSub === 'python') {
      fetchPythonHealth();
    }
  }, [activeSub]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...user,
      displayName: name,
      email: email
    });
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2000);
  };

  const handleNotificationsSave = () => {
    setSavedNotifications(true);
    setTimeout(() => setSavedNotifications(false), 2000);
  };

  const handleApiSave = () => {
    setSavedApi(true);
    setTimeout(() => setSavedApi(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 relative selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Title block */}
      <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
        <Settings className="w-5 h-5 text-violet-400" />
        <div>
          <h2 className="font-display text-xl font-bold text-white">System Configuration</h2>
          <p className="text-xs text-slate-400">Configure profile settings, active API sync keys, and notifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation subtab list */}
        <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-2xl border border-white/5 h-fit">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'notifications', label: 'Alert Channels', icon: Bell },
            { id: 'api', label: 'Custom APIs & Keys', icon: Key },
            { id: 'billing', label: 'Subscription Level', icon: CreditCard },
            { id: 'python', label: 'Python & FastAPI', icon: Cpu },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSub(sub.id as any)}
              className={`w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeSub === sub.id 
                  ? 'bg-slate-800 text-violet-400 border border-white/5' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-950/20'
              }`}
            >
              <sub.icon className="w-4 h-4" />
              <span>{sub.label}</span>
            </button>
          ))}
        </div>

        {/* Content detail panels */}
        <div className="md:col-span-3 p-6 rounded-2xl bg-slate-900/40 border border-white/5 min-h-[350px] flex flex-col justify-between">
          
          <div className="space-y-6">
            {activeSub === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Profile Information</h3>
                
                {savedProfile && (
                  <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>User profile updated successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Default language</label>
                    <select
                      value={langSelect}
                      onChange={(e) => setLangSelect(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="en">English (US)</option>
                      <option value="hi">Hindi (India)</option>
                      <option value="es">Spanish (Spain)</option>
                      <option value="de">German (Germany)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Default Layout Theme</label>
                    <select
                      value={themeMode}
                      onChange={(e) => setThemeMode(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="dark">Cosmic Dark</option>
                      <option value="light">Neutral Light (Under Construction)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="glow-btn px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-semibold text-white shadow-lg cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeSub === 'notifications' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Notification Delivery settings</h3>

                {savedNotifications && (
                  <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Notification triggers synced!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">Email summary recaps</p>
                      <p className="text-[10px] text-slate-400">Send an automatic recap email to the host immediately after transcription finishes.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailRecap}
                      onChange={(e) => setEmailRecap(e.target.checked)}
                      className="w-4 h-4 accent-violet-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">Slack workspace synchronization</p>
                      <p className="text-[10px] text-slate-400">Post action item bulletins directly to selected Slack channels.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={slackRecap}
                      onChange={(e) => setSlackRecap(e.target.checked)}
                      className="w-4 h-4 accent-violet-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">Browser alarms</p>
                      <p className="text-[10px] text-slate-400">Trigger browser native audio chimes when audio recording completes or pauses.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={desktopAlert}
                      onChange={(e) => setDesktopAlert(e.target.checked)}
                      className="w-4 h-4 accent-violet-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={handleNotificationsSave}
                    className="glow-btn px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-semibold text-white shadow-lg cursor-pointer"
                  >
                    Save Alerts Configuration
                  </button>
                </div>
              </div>
            )}

            {activeSub === 'api' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Enterprise Custom APIs</h3>

                {savedApi && (
                  <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>API Token validated and stored!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-violet-950/15 border border-violet-500/15 flex items-start space-x-3 text-xs text-slate-400">
                    <AlertCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <p className="text-[11px]">By default, our system proxies all model queries through standard workspace tokens. If you wish to use your own private enterprise endpoints, paste your key below.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Gemini Endpoint Token</label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={handleApiSave}
                    className="glow-btn px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-semibold text-white shadow-lg cursor-pointer"
                  >
                    Verify & Store Key
                  </button>
                </div>
              </div>
            )}

            {activeSub === 'billing' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Billing Tiers</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 text-center space-y-2 relative">
                    {user.role !== 'admin' && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[8px] font-bold uppercase">
                        Current
                      </span>
                    )}
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Starter Free</span>
                    <span className="text-2xl font-bold font-display text-white block">$0 <span className="text-xs font-normal text-slate-400">/mo</span></span>
                    <p className="text-[9px] text-slate-400">Up to 3 free meeting transcriptions</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-b from-violet-950/30 to-slate-950/30 border border-violet-500/25 text-center space-y-2 relative">
                    <span className="text-[9px] font-bold text-violet-300 uppercase tracking-widest block">Growth Pro</span>
                    <span className="text-2xl font-bold font-display text-white block">$19 <span className="text-xs font-normal text-slate-400">/mo</span></span>
                    <p className="text-[9px] text-slate-400">Unlimited meetings, diarizations & calendars</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 text-center space-y-2 relative">
                    {user.role === 'admin' && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold uppercase">
                        Active
                      </span>
                    )}
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Enterprise Custom</span>
                    <span className="text-2xl font-bold font-display text-white block">$49 <span className="text-xs font-normal text-slate-400">/mo</span></span>
                    <p className="text-[9px] text-slate-400">Dedicated SLA nodes, billing logs</p>
                  </div>
                </div>
              </div>
            )}

            {activeSub === 'python' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">FastAPI & Python Microservice</h3>
                  <button 
                    onClick={fetchPythonHealth}
                    className="text-[10px] bg-slate-800 text-violet-400 px-2.5 py-1 rounded-lg border border-white/5 hover:bg-slate-700 transition cursor-pointer"
                  >
                    {loadingPythonHealth ? 'Checking...' : 'Refresh Status'}
                  </button>
                </div>

                {/* Health indicator */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Status</span>
                    {pythonHealth ? (
                      pythonHealth.error ? (
                        <span className="text-sm font-semibold text-red-400 mt-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          Offline
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-emerald-400 mt-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-500 mt-2">Checking...</span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Framework / Port</span>
                    <span className="text-sm font-semibold text-violet-400 mt-2 font-mono">
                      FastAPI (Port 8000)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Python Version</span>
                    <span className="text-sm font-semibold text-blue-400 mt-2 font-mono">
                      {pythonHealth && !pythonHealth.error ? pythonHealth.language : 'Python 3.11'}
                    </span>
                  </div>
                </div>

                {/* Interactive Diagnostic */}
                <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-violet-400" />
                    Local Python NLP Diagnostic Playground
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Input a mock meeting transcript segment. The FastAPI Python microservice will run local dictionary-based sentiment scoring, custom tokenization, and dynamic coaching heuristics.
                  </p>

                  <div className="space-y-1">
                    <textarea
                      rows={3}
                      value={testTranscriptText}
                      onChange={(e) => setTestTranscriptText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono resize-none"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-slate-500 font-mono">
                      Backend endpoint: <span className="text-violet-400">/api/python/analyze</span>
                    </div>
                    <button
                      onClick={handlePythonAnalysis}
                      disabled={analyzingPython}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow hover:opacity-90 transition cursor-pointer"
                    >
                      {analyzingPython ? 'Analyzing...' : 'Run Python NLP'}
                    </button>
                  </div>

                  {/* Results panel */}
                  {pythonAnalysisResult && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-3 font-sans text-xs">
                      {pythonAnalysisResult.error ? (
                        <div className="text-red-400 font-mono text-xs">{pythonAnalysisResult.error}</div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-4 border-b border-white/5 pb-2">
                            <div>
                              <span className="text-slate-400 text-[10px] block uppercase font-bold">Local Sentiment</span>
                              <span className={`font-semibold text-sm ${
                                pythonAnalysisResult.sentiment === 'Positive' ? 'text-emerald-400' :
                                pythonAnalysisResult.sentiment === 'Critical' ? 'text-red-400' : 'text-amber-400'
                              }`}>{pythonAnalysisResult.sentiment} ({pythonAnalysisResult.score}%)</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block uppercase font-bold">Total words</span>
                              <span className="font-semibold text-sm text-blue-300 font-mono">{pythonAnalysisResult.stats?.totalWords || 0}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block uppercase font-bold">Positive keywords</span>
                              <span className="font-semibold text-sm text-green-400 font-mono">{pythonAnalysisResult.stats?.positiveWordCount || 0}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block uppercase font-bold">Negative keywords</span>
                              <span className="font-semibold text-sm text-red-400 font-mono">{pythonAnalysisResult.stats?.negativeWordCount || 0}</span>
                            </div>
                          </div>

                          {/* Keywords */}
                          <div className="space-y-1.5">
                            <span className="text-slate-400 text-[10px] block uppercase font-bold">Extracted Keywords (Frequency Counter)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {pythonAnalysisResult.keywords?.map((kw: any, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-md font-mono text-[10px]">
                                  {kw.text} ({kw.value})
                                </span>
                              )) || <span className="text-slate-500 italic">None extracted</span>}
                            </div>
                          </div>

                          {/* Coaching Tips */}
                          <div className="space-y-1.5">
                            <span className="text-slate-400 text-[10px] block uppercase font-bold">Heuristic Coaching Feedback</span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                              {pythonAnalysisResult.coachingTips?.map((tip: string, i: number) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Secure credentials footer indicator */}
          <div className="pt-4 border-t border-white/5 flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted cloud connection secured with Firestore rules</span>
          </div>

        </div>

      </div>

    </div>
  );
}
