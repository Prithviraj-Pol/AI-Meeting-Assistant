import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Clock, 
  Video, 
  CheckCircle2, 
  ListTodo, 
  Calendar, 
  Activity, 
  ArrowUpRight,
  TrendingUp,
  Brain,
  MessageSquareOff
} from 'lucide-react';
import { Meeting, MeetingTask } from '../types';

interface DashboardProps {
  meetings: Meeting[];
  onNavigateToTab: (tab: string) => void;
  onSelectMeeting: (meeting: Meeting) => void;
}

export default function Dashboard({ meetings, onNavigateToTab, onSelectMeeting }: DashboardProps) {
  // Compute metrics
  const totalMeetings = meetings.length;
  const totalDurationMin = Math.round(meetings.reduce((sum, m) => sum + m.duration, 0) / 60);
  
  // Aggregate tasks across all meetings
  const allTasks: MeetingTask[] = meetings.reduce((acc, m) => {
    return [...acc, ...(m.tasks || [])];
  }, [] as MeetingTask[]);
  
  const pendingTasks = allTasks.filter(t => t.status === 'pending');
  const completedTasks = allTasks.filter(t => t.status === 'completed');

  // Compute average productivity score
  const meetingsWithScores = meetings.filter(m => m.analytics?.productivityScore);
  const avgProductivity = meetingsWithScores.length > 0 
    ? Math.round(meetingsWithScores.reduce((sum, m) => sum + (m.analytics?.productivityScore || 0), 0) / meetingsWithScores.length)
    : 85;

  // Last 5 meetings for chart
  const barChartData = meetings.slice(0, 5).reverse().map(m => ({
    name: m.title.length > 15 ? m.title.substring(0, 15) + '...' : m.title,
    minutes: Math.round(m.duration / 60),
    productivity: m.analytics?.productivityScore || 80
  }));

  // Speaking time of most recent meeting
  const lastMeeting = meetings[0];
  const colors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
  
  const speakingData = lastMeeting && lastMeeting.speakers
    ? lastMeeting.speakers.map(s => ({
        name: s.name,
        value: s.speakingTime
      }))
    : [
        { name: 'Sarah', value: 300 },
        { name: 'Alex', value: 240 },
        { name: 'David', value: 180 }
      ];

  const recentTimeline = [
    { title: "Q3 Strategy Post-Mortem analyzed", desc: "Transcribed 18 mins audio, extracted 4 action items", time: "1 hour ago", icon: Brain, color: "text-violet-400 bg-violet-500/10" },
    { title: "Google Calendar synced", desc: "Added 2 meeting deadline reminders", time: "3 hours ago", icon: Calendar, color: "text-blue-400 bg-blue-500/10" },
    { title: "Team Follow-up Email drafted", desc: "Generated summary email ready to edit", time: "Yesterday", icon: Clock, color: "text-emerald-400 bg-emerald-500/10" }
  ];

  return (
    <div className="space-y-8 pb-12 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
            Workspace Insights
          </h1>
          <p className="text-sm text-slate-400">
            Real-time meeting transcriptions, productivity scores, and auto-generated action items.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigateToTab('meetings')}
            className="glow-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition flex items-center space-x-2 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Process New Meeting</span>
          </button>
        </div>
      </div>

      {/* Stats cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Meetings</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-display text-white">{totalMeetings}</span>
            <div className="flex items-center space-x-1 text-[10px] text-green-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% from last month</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration Recorded</span>
            <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-display text-white">{totalDurationMin} <span className="text-sm font-normal text-slate-400">mins</span></span>
            <p className="text-[10px] text-slate-400 mt-1">Across all workspace sessions</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Actions</span>
            <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-display text-white">{pendingTasks.length}</span>
            <div className="flex items-center space-x-1 text-[10px] text-green-400 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{completedTasks.length} tasks completed</span>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Productivity</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-display text-white">{avgProductivity}%</span>
            <p className="text-[10px] text-slate-400 mt-1">Extracted from Gemini analysis</p>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting Durations & Productivity chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <h3 className="font-display font-bold text-sm text-white">Recent Meeting Durations</h3>
              <p className="text-[10px] text-slate-400">Total length of discussions in minutes</p>
            </div>
            <span className="text-xs font-semibold text-violet-400 flex items-center space-x-1 cursor-pointer" onClick={() => onNavigateToTab('meetings')}>
              <span>All Meetings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="h-64 w-full text-xs font-semibold">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#111827' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Bar dataKey="minutes" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                <Clock className="w-8 h-8" />
                <p>No meeting statistics available. Create a meeting to start.</p>
              </div>
            )}
          </div>
        </div>

        {/* Speaking share of last meeting */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <h3 className="font-display font-bold text-sm text-white">Voice Diarization Share</h3>
              <p className="text-[10px] text-slate-400">{lastMeeting ? `"${lastMeeting.title}"` : 'Sample Data Overview'}</p>
            </div>
          </div>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speakingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {speakingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#111827' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-300">
            {speakingData.map((s, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className="truncate">{s.name} ({s.value}s)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two column lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Meetings widget */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="font-display font-bold text-sm text-white">Recent Meetings Activity</h3>
            <span className="text-xs text-slate-400">Total: {meetings.length}</span>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {meetings.length > 0 ? (
              meetings.slice(0, 4).map((meeting) => (
                <div 
                  key={meeting.id}
                  onClick={() => onSelectMeeting(meeting)}
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">{meeting.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      {new Date(meeting.date).toLocaleDateString()} • {Math.round(meeting.duration / 60)} mins • {meeting.speakers?.length || 0} Speakers
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {meeting.analytics?.sentiment && (
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        meeting.analytics.sentiment === 'Positive' ? 'bg-green-500/10 text-green-400' :
                        meeting.analytics.sentiment === 'Critical' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {meeting.analytics.sentiment}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono">Open →</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No recent meetings. Try uploading or generating sample meeting.
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="font-display font-bold text-sm text-white">System Activity</h3>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-4">
            {recentTimeline.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg shrink-0 ${item.color}`}>
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                  <span className="text-[9px] text-slate-500 block font-mono">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
