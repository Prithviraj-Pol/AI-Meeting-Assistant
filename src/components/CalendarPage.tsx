import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { Meeting } from '../types';

interface CalendarPageProps {
  meetings: Meeting[];
}

export default function CalendarPage({ meetings }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 6)); // July 6, 2026
  const [syncing, setSyncing] = useState(false);
  const [allSynced, setAllSynced] = useState(false);

  // Extract events and deadlines
  const events = meetings.reduce((acc, m) => {
    const meetingEvs = (m.calendarEvents || []).map(e => ({
      ...e,
      meetingTitle: m.title,
      type: 'event' as const
    }));

    const taskEvs = (m.tasks || []).map(t => ({
      id: t.id,
      meetingId: m.id,
      title: `[Deadline] ${t.title}`,
      description: `Assigned owner: ${t.owner} (${t.category})`,
      startTime: `${t.deadline}T23:59:00Z`,
      endTime: `${t.deadline}T23:59:59Z`,
      googleSynced: allSynced,
      meetingTitle: m.title,
      type: 'task' as const
    }));

    return [...acc, ...meetingEvs, ...taskEvs];
  }, [] as any[]);

  const daysInMonth = 31; // July has 31 days
  const startDayOffset = 3; // July 1, 2026 is Wednesday (so offset 3 for Sun-start grid)

  const handleGlobalSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setAllSynced(true);
    }, 1500);
  };

  // Helper to find events on a specific date (July X, 2026)
  const getEventsForDay = (day: number) => {
    const dayStr = `2026-07-${day.toString().padStart(2, '0')}`;
    return events.filter(e => e.startTime.startsWith(dayStr));
  };

  return (
    <div className="space-y-6 pb-12 relative selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-violet-400" />
            <span>Workspace Sync Calendar</span>
          </h2>
          <p className="text-xs text-slate-400">Track deadlines, follow-up events, and sync schedules</p>
        </div>

        <button
          onClick={handleGlobalSync}
          disabled={syncing || allSynced}
          className="glow-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-semibold text-white shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {syncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Connecting Google Workspace...</span>
            </>
          ) : allSynced ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Schedules Synced!</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync All to Google Workspace</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid card */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-display font-bold text-sm text-slate-100">July 2026</h3>
            <div className="flex items-center space-x-2">
              <button className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Sun-Sat Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {/* Empty boxes for offset */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="min-h-[72px] rounded-xl bg-slate-950/20 border border-white/[0.02]" />
            ))}

            {/* Days boxes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === 6; // July 6 is today based on simulated time

              return (
                <div 
                  key={`day-${day}`}
                  className={`min-h-[72px] p-2 rounded-xl border flex flex-col justify-between transition relative ${
                    isToday 
                      ? 'bg-violet-600/10 border-violet-500/40 shadow-sm shadow-violet-500/10' 
                      : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className={`text-[10px] font-bold font-mono ${isToday ? 'text-violet-400' : 'text-slate-500'}`}>
                    {day}
                  </span>

                  {/* Render dot or tiny label for event */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div 
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded text-[8px] truncate leading-none ${
                          ev.type === 'task' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] text-slate-500 block text-right">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel upcoming details */}
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-4">
            <div className="flex items-center space-x-2 shrink-0 border-b border-white/5 pb-2">
              <Clock className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Upcoming Agenda</span>
            </div>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {events.slice(0, 6).map((ev) => (
                <div key={ev.id} className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider ${
                      ev.type === 'task' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {ev.type === 'task' ? 'Deadline' : 'Follow-up Sync'}
                    </span>

                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      ev.googleSynced || allSynced ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {ev.googleSynced || allSynced ? '✓ Google Synced' : 'Offline'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200">{ev.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">{ev.description}</p>
                  
                  <span className="text-[9px] text-violet-400 font-mono block">
                    {new Date(ev.startTime).toLocaleDateString()} at {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {events.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No upcoming deliverables found on agenda.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-violet-950/10 border border-violet-500/15 flex items-start space-x-3 text-xs text-slate-400 leading-relaxed">
            <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">How scheduling works</p>
              <p className="text-[11px]">MeetMind AI extracts deadlines from conversational cues (e.g. "before Friday") and computes actual calendar target dates dynamically.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
