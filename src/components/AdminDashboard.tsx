import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Video, 
  HardDrive, 
  Coins, 
  Activity, 
  Terminal, 
  TrendingUp, 
  ShieldAlert,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { Meeting } from '../types';

interface AdminDashboardProps {
  meetings: Meeting[];
}

export default function AdminDashboard({ meetings }: AdminDashboardProps) {
  // Mock enterprise analytics
  const activeUsers = 148;
  const processedMinutes = 5420 + Math.round(meetings.reduce((sum, m) => sum + m.duration, 0) / 60);
  const databaseUsage = (124.5 + (meetings.length * 0.05)).toFixed(2); // MB
  const rawCost = (42.50 + (meetings.length * 0.02)).toFixed(2); // USD

  const enterpriseLogs = [
    { event: "User Sign In", desc: "User prithvirajpol163@gmail.com authenticated via email.", status: "Success", time: "2 mins ago" },
    { event: "Gemini Model Analysis", desc: "Diarized 14 mins meeting recording WAV format.", status: "Completed", time: "12 mins ago" },
    { event: "Calendar Cron job", desc: "Dispatched 2 deadline reminders to Google APIs.", status: "Synced", time: "1 hour ago" },
    { event: "Database Backup", desc: "Executed Firestore daily incremental partition.", status: "Success", time: "3 hours ago" },
    { event: "Token Rotation", desc: "Refreshed OAuth client credentials automatically.", status: "Rotated", time: "6 hours ago" }
  ];

  return (
    <div className="space-y-6 pb-12 relative selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Title block */}
      <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
        <ShieldAlert className="w-5 h-5 text-violet-400 animate-pulse" />
        <div>
          <h2 className="font-display text-xl font-bold text-white">Enterprise Systems Core</h2>
          <p className="text-xs text-slate-400">High-level resource allocations, storage footprints, and estimated Gemini API cost indexes</p>
        </div>
      </div>

      {/* Bento grid of enterprise stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Corporate Users</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-display text-white">{activeUsers}</span>
            <div className="flex items-center space-x-1 text-[10px] text-green-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+8% weekly growth rate</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processed Speech</span>
            <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-display text-white">{processedMinutes} <span className="text-xs font-normal text-slate-400">mins</span></span>
            <p className="text-[10px] text-slate-400 mt-1">Across all workspace tenants</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cloud Storage Footprint</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-display text-white">{databaseUsage} <span className="text-xs font-normal text-slate-400">MB</span></span>
            <p className="text-[10px] text-slate-400 mt-1">Firestore JSON & wav documents</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Model Billing</span>
            <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold font-display text-white">${rawCost}</span>
            <p className="text-[10px] text-slate-400 mt-1">Gemini 2.5 Flash token API cost</p>
          </div>
        </div>
      </div>

      {/* Database logs & System health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Console logs */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-violet-400" />
              <h3 className="font-display font-bold text-sm text-slate-100">Live Infrastructure logs</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold">
              ● All Systems Operational
            </span>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
            {enterpriseLogs.map((log, index) => (
              <div key={index} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-4 font-mono">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-violet-400 block">{log.event}</span>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{log.desc}</p>
                </div>

                <div className="text-right space-y-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] block font-bold w-fit ml-auto">
                    {log.status}
                  </span>
                  <span className="text-[8px] text-slate-500 block">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage capacity allocations widget */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-violet-400" />
              <h3 className="font-display font-bold text-sm text-slate-100">Cluster Capacity</h3>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-400">FIRESTORE RECORD LIMIT</span>
                <span className="text-slate-200">12.4% / 10 GB</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[12.4%] h-full bg-violet-500 rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-400">AUDIO BLOB ASSETS</span>
                <span className="text-slate-200">2.5% / 100 GB</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[2.5%] h-full bg-blue-500 rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-400">DAILY API CALL BUDGET</span>
                <span className="text-slate-200">34.8% / 1,000 requests</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[34.8%] h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
