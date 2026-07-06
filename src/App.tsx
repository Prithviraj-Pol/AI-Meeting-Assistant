import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  LayoutDashboard, 
  Video, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  Settings as SettingsIcon, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

import { auth } from './lib/firebase';
import { Meeting, UserProfile, MeetingTask } from './types';
import { 
  fetchMeetings, 
  saveMeeting, 
  deleteMeeting, 
  getUserProfile, 
  saveUserProfile 
} from './services/db';

import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import MeetingsPage from './components/MeetingsPage';
import MeetingDetails from './components/MeetingDetails';
import AIChatPage from './components/AIChatPage';
import TasksPage from './components/TasksPage';
import CalendarPage from './components/CalendarPage';
import SettingsPage from './components/SettingsPage';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Layout states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Core Data State
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [processing, setProcessing] = useState(false);

  // Handle Firebase Auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let profile = await getUserProfile(fbUser.uid);
        if (!profile) {
          profile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            role: fbUser.email === 'prithvirajpol163@gmail.com' ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          };
          await saveUserProfile(profile);
        }
        setUser(profile);
      } else {
        setUser(null);
      }
      setAuthChecking(false);
    });
    return unsub;
  }, []);

  // Fetch user meetings
  useEffect(() => {
    if (user) {
      fetchMeetings(user.uid).then((data) => {
        setMeetings(data);
        // Create initial sample data if new user to populate UI beautifully
        if (data.length === 0) {
          createInitialSampleMeeting(user.uid);
        }
      });
    } else {
      setMeetings([]);
    }
  }, [user]);

  // Create an initial sample meeting to give an instant glorious experience!
  const createInitialSampleMeeting = async (userId: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/process-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Q3 Product Roadmap Review',
          template: 'product_sync'
        })
      });
      const sample = await response.json();
      sample.id = 'sample_meeting_1';
      sample.date = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      await saveMeeting(userId, sample);
      setMeetings([sample]);
    } catch (err) {
      console.error("Could not bootstrap sample meeting:", err);
    } finally {
      setProcessing(false);
    }
  };

  // Process meeting via REST API
  const handleProcessMeeting = async (title: string, template: string, audioBase64?: string, audioMimeType?: string) => {
    if (!user) return;
    setProcessing(true);
    try {
      const response = await fetch('/api/process-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, template, audioBase64, audioMimeType })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Generate random meeting ID and apply date
      const newMeeting: Meeting = {
        ...data,
        id: `meeting_${Date.now()}`,
        date: new Date().toISOString(),
        status: 'completed'
      };

      await saveMeeting(user.uid, newMeeting);
      setMeetings((prev) => [newMeeting, ...prev]);
      
      // Auto-open processed meeting!
      setSelectedMeeting(newMeeting);
      setActiveTab('meetings');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to analyze meeting data. Verification sandbox fallback will be activated.");
    } finally {
      setProcessing(false);
    }
  };

  // Delete meeting
  const handleDeleteMeeting = async (id: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this meeting analysis? This action is irreversible.")) {
      await deleteMeeting(user.uid, id);
      setMeetings((prev) => prev.filter(m => m.id !== id));
      if (selectedMeeting?.id === id) {
        setSelectedMeeting(null);
      }
    }
  };

  // Sync state changes back to database for full persistence
  const handleUpdateMeeting = async (updated: Meeting) => {
    if (!user) return;
    await saveMeeting(user.uid, updated);
    setMeetings((prev) => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMeeting(updated);
  };

  // Append new action items directly
  const handleAddTask = async (task: MeetingTask) => {
    if (!selectedMeeting) return;
    const updated = {
      ...selectedMeeting,
      tasks: [task, ...(selectedMeeting.tasks || [])]
    };
    await handleUpdateMeeting(updated);
  };

  // Edit/Complete specific action items
  const handleUpdateTask = async (task: MeetingTask) => {
    if (!user) return;
    // Find parent meeting containing this task
    const parent = meetings.find(m => m.id === task.meetingId);
    if (!parent) return;

    const updatedTasks = parent.tasks.map(t => t.id === task.id ? task : t);
    const updatedMeeting = { ...parent, tasks: updatedTasks };
    await saveMeeting(user.uid, updatedMeeting);
    setMeetings((prev) => prev.map(m => m.id === parent.id ? updatedMeeting : m));
    if (selectedMeeting?.id === parent.id) {
      setSelectedMeeting(updatedMeeting);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setShowLogin(false);
    setSelectedMeeting(null);
    setActiveTab('dashboard');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-xs font-mono tracking-widest text-slate-500">
        INITIALIZING CORE INTELLIGENCE WORKSPACE...
      </div>
    );
  }

  // Not Authenticated flow
  if (!user) {
    return (
      <AnimatePresence mode="wait">
        {showLogin ? (
          <LoginPage 
            onLoginSuccess={(profile) => {
              setUser(profile);
              setShowLogin(false);
            }}
            onGoBack={() => setShowLogin(false)}
          />
        ) : (
          <LandingPage onGetStarted={() => setShowLogin(true)} />
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex relative overflow-hidden font-sans">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-violet-500/5 to-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Responsive Collapsible Premium Sidebar */}
      <aside 
        className={`shrink-0 z-40 border-r border-white/5 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? 'w-64 px-4 py-5 bg-[#0f172a]/70 backdrop-blur-md' : 'w-16 p-2.5 bg-[#0f172a]/40'
        }`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => { setSelectedMeeting(null); setActiveTab('dashboard'); }}>
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {sidebarOpen && (
                <span className="font-display font-bold text-sm tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AI Workspace
                </span>
              )}
            </div>

            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white mx-auto block transition cursor-pointer">
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Navigation Items */}
          <nav className="space-y-1 pt-4">
            {[
              { id: 'dashboard', label: 'Dashboard Insights', icon: LayoutDashboard },
              { id: 'meetings', label: 'Meetings Workspace', icon: Video },
              { id: 'chat', label: 'Semantic Copilot', icon: MessageSquare },
              { id: 'tasks', label: 'Action Board', icon: CheckSquare },
              { id: 'calendar', label: 'Sync Calendar', icon: Calendar },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((item) => {
              const active = activeTab === item.id && !selectedMeeting;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedMeeting(null);
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    active 
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/15' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}

            {/* Admin only dashboard access */}
            {user.role === 'admin' && (
              <button
                onClick={() => {
                  setSelectedMeeting(null);
                  setActiveTab('admin');
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer mt-4 border border-violet-500/10 ${
                  activeTab === 'admin' && !selectedMeeting
                    ? 'bg-purple-900 text-white shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-violet-400" />
                {sidebarOpen && <span className="text-violet-300 font-bold">Admin Console</span>}
              </button>
            )}
          </nav>
        </div>

        {/* User profile card & Logout */}
        <div className="space-y-3.5 border-t border-white/5 pt-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0 font-bold">
              {user.displayName.substring(0, 2).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate leading-none mb-1">{user.displayName}</p>
                <span className="inline-block px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[8px] font-bold uppercase leading-none">
                  {user.role === 'admin' ? 'SYSTEM ADMIN' : 'WORKSPACE USER'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content viewport area */}
      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8 relative">
        {selectedMeeting ? (
          <MeetingDetails 
            meeting={selectedMeeting} 
            onBack={() => setSelectedMeeting(null)}
            onUpdateMeeting={handleUpdateMeeting}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  meetings={meetings} 
                  onNavigateToTab={(tab) => {
                    setSelectedMeeting(null);
                    setActiveTab(tab);
                  }}
                  onSelectMeeting={(m) => setSelectedMeeting(m)}
                />
              )}

              {activeTab === 'meetings' && (
                <MeetingsPage 
                  meetings={meetings} 
                  onSelectMeeting={(m) => setSelectedMeeting(m)}
                  onDeleteMeeting={handleDeleteMeeting}
                  onProcessMeeting={handleProcessMeeting}
                  processing={processing}
                />
              )}

              {activeTab === 'chat' && (
                <AIChatPage meetings={meetings} />
              )}

              {activeTab === 'tasks' && (
                <TasksPage 
                  meetings={meetings} 
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarPage meetings={meetings} />
              )}

              {activeTab === 'settings' && (
                <SettingsPage 
                  user={user} 
                  onUpdateProfile={(updated) => setUser(updated)}
                />
              )}

              {activeTab === 'admin' && user.role === 'admin' && (
                <AdminDashboard meetings={meetings} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

    </div>
  );
}
