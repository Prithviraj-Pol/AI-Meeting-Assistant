import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckSquare, 
  List, 
  Kanban, 
  Plus, 
  User, 
  Calendar, 
  Tag, 
  AlertCircle,
  TrendingDown,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { MeetingTask, Meeting } from '../types';

interface TasksPageProps {
  meetings: Meeting[];
  onAddTask: (task: MeetingTask) => void;
  onUpdateTask: (task: MeetingTask) => void;
}

export default function TasksPage({ meetings, onAddTask, onUpdateTask }: TasksPageProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Create Manual Task Modal states
  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskOwner, setTaskOwner] = useState('Alex');
  const [taskDeadline, setTaskDeadline] = useState('2026-07-10');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskCategory, setTaskCategory] = useState('Engineering');
  const [targetMeetingId, setTargetMeetingId] = useState('');

  // Aggregate all tasks from meetings
  const allTasks: MeetingTask[] = meetings.reduce((acc, m) => {
    return [...acc, ...(m.tasks || []).map(t => ({ ...t, meetingTitle: m.title }))];
  }, [] as any[]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: MeetingTask = {
      id: `task_${Date.now()}`,
      meetingId: targetMeetingId || (meetings[0]?.id || 'manual'),
      title: taskTitle,
      owner: taskOwner,
      deadline: taskDeadline,
      priority: taskPriority,
      status: 'pending',
      category: taskCategory
    };

    onAddTask(newTask);
    setShowForm(false);
    setTaskTitle('');
  };

  const advanceTaskStatus = (task: MeetingTask) => {
    onUpdateTask({
      ...task,
      status: task.status === 'pending' ? 'completed' : 'pending'
    });
  };

  const filteredTasks = allTasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const pendingList = filteredTasks.filter(t => t.status === 'pending');
  const completedList = filteredTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6 pb-12 relative selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-violet-400" />
            <span>Workspace Action Board</span>
          </h2>
          <p className="text-xs text-slate-400">Manage deliverables and prioritizations extracted by Gemini</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View mode toggle */}
          <div className="flex p-0.5 rounded-lg bg-slate-900 border border-white/5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                viewMode === 'kanban' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List Table</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (meetings.length > 0) setTargetMeetingId(meetings[0].id);
              setShowForm(true);
            }}
            className="glow-btn px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-semibold text-white shadow-lg shadow-violet-500/15 flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Task</span>
          </button>
        </div>
      </div>

      {/* Query filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search action items or assigned owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent border-none text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Main Boards */}
      <div className="min-h-[400px]">
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1: Pending */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Pending / In Progress ({pendingList.length})</span>
                </span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {pendingList.map(task => (
                  <div 
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => advanceTaskStatus(task)}
                          className="w-4 h-4 rounded border border-white/20 hover:border-white/40 bg-slate-950 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer"
                        >
                          <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400" />
                        </button>
                        <p className="text-xs font-semibold text-slate-200">{task.title}</p>
                      </div>

                      <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold shrink-0 ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/5'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-violet-400" />
                        <span>{task.owner}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-violet-400" />
                        <span>{task.deadline}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-violet-400" />
                        <span>{task.category}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingList.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-dashed border-white/5">
                    No pending deliverables on the roadmap.
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Completed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Completed deliverables ({completedList.length})</span>
                </span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {completedList.map(task => (
                  <div 
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-900/15 border border-white/5 space-y-3 relative opacity-60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => advanceTaskStatus(task)}
                          className="w-4 h-4 rounded border border-violet-500 bg-violet-600 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer text-white"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <p className="text-xs font-semibold text-slate-400 line-through">{task.title}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{task.owner}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.deadline}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{task.category}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {completedList.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-dashed border-white/5">
                    Check tasks off your board to populate the completed index.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Table View mode */
          <div className="p-1 rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
            <table className="w-full text-left text-xs font-semibold text-slate-300">
              <thead className="bg-slate-950/50 text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-4">Deliverable</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-900/30 transition">
                    <td className="p-4 text-slate-200 font-bold">{task.title}</td>
                    <td className="p-4 text-slate-300">{task.owner}</td>
                    <td className="p-4 text-slate-400 font-mono">{task.deadline}</td>
                    <td className="p-4 text-violet-400">{task.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/5'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => advanceTaskStatus(task)}
                        className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer ${
                          task.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-800 text-slate-400 border border-white/5'
                        }`}
                      >
                        {task.status === 'completed' ? 'Completed' : 'Pending'}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No tasks logged under current query terms.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creator Modal popup */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl glass-panel p-6 border border-white/5 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Plus className="w-4 h-4 text-violet-400" />
                <span>Create Action deliverable</span>
              </span>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">Close</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct SEO keywords research"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign Owner</label>
                  <select
                    value={taskOwner}
                    onChange={(e) => setTaskOwner(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300"
                  >
                    <option value="Sarah">Sarah (Product)</option>
                    <option value="Alex">Alex (Dev Lead)</option>
                    <option value="David">David (Sales)</option>
                    <option value="Jessica">Jessica (Marketing)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline Date</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Stream Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Product">Product Management</option>
                    <option value="Sales">Sales & CRM</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-xs font-semibold text-white shadow-lg shadow-violet-500/15 transition cursor-pointer"
                >
                  Create Deliverable
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
