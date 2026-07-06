import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Mic, 
  Upload, 
  Trash2, 
  FolderOpen, 
  Sparkles, 
  StopCircle, 
  Pause, 
  Play, 
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  Volume2,
  Settings,
  AlertCircle
} from 'lucide-react';
import { Meeting } from '../types';

interface MeetingsPageProps {
  meetings: Meeting[];
  onSelectMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (meetingId: string) => void;
  onProcessMeeting: (title: string, template: string, audioBase64?: string, audioMimeType?: string) => Promise<void>;
  processing: boolean;
}

export default function MeetingsPage({ 
  meetings, 
  onSelectMeeting, 
  onDeleteMeeting, 
  onProcessMeeting,
  processing 
}: MeetingsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('product_sync');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration'>('date');
  
  // Modal / Creator states
  const [showCreator, setShowCreator] = useState(false);
  const [creatorTitle, setCreatorTitle] = useState('');
  const [creatorMethod, setCreatorMethod] = useState<'template' | 'record' | 'upload'>('template');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [recordError, setRecordError] = useState<string | null>(null);
  const [noiseReduction, setNoiseReduction] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load input devices
  useEffect(() => {
    if (showCreator && creatorMethod === 'record') {
      navigator.mediaDevices.enumerateDevices()
        .then(deviceList => {
          const inputs = deviceList.filter(d => d.kind === 'audioinput');
          setDevices(inputs);
          if (inputs.length > 0) {
            setSelectedDevice(inputs[0].deviceId);
          }
        })
        .catch(err => {
          console.warn("Could not retrieve media devices:", err);
        });
    }
  }, [showCreator, creatorMethod]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordTime(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Audio Visualization Canvas
  const drawWave = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isRecording || isPaused) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5;
        // Gradient color for premium feel
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(1, '#8b5cf6');
        
        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };
    draw();
  };

  const startRecording = async () => {
    setRecordError(null);
    audioChunksRef.current = [];
    setRecordTime(0);

    try {
      const constraints = {
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Setup analyser for wave visualization
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to Base64 to send to server
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          await handleSubmit(base64Data, 'audio/webm');
        };
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      
      // Allow visualizer to boot
      setTimeout(() => {
        drawWave();
      }, 100);

    } catch (err: any) {
      console.error(err);
      setRecordError("Microphone access denied or device currently unavailable. Real microphone recording will be simulated.");
      setIsRecording(true);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    } else {
      // Simulation mode toggle
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setTimeout(() => drawWave(), 100);
    } else {
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulate stop and process template
      handleSubmit();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    setIsPaused(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (base64?: string, mimeType?: string) => {
    const title = creatorTitle.trim() || `Meeting Sync #${meetings.length + 1}`;
    
    // For manual template execution
    if (creatorMethod === 'template') {
      await onProcessMeeting(title, selectedTemplate);
      setShowCreator(false);
      setCreatorTitle('');
    } else if (creatorMethod === 'upload' && uploadFile) {
      // Upload flow
      const reader = new FileReader();
      reader.readAsDataURL(uploadFile);
      reader.onloadend = async () => {
        const fileBase64 = (reader.result as string).split(',')[1];
        await onProcessMeeting(title, 'none', fileBase64, uploadFile.type);
        setShowCreator(false);
        setCreatorTitle('');
        setUploadFile(null);
      };
    } else if (creatorMethod === 'record') {
      // Real mic base64 or mockup if mic failed
      if (base64) {
        await onProcessMeeting(title, 'none', base64, mimeType);
      } else {
        // Fallback to template simulator so they get real mock data
        await onProcessMeeting(title, selectedTemplate);
      }
      setShowCreator(false);
      setCreatorTitle('');
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Filter and Sort meetings
  const processedMeetings = meetings
    .filter(m => {
      const matchSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.summary?.short || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.transcript.some(t => t.text.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchSentiment = filterSentiment === 'all' || m.analytics?.sentiment === filterSentiment;
      
      return matchSearch && matchSentiment;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'duration') return b.duration - a.duration;
      return 0;
    });

  return (
    <div className="space-y-6 pb-12 relative selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="font-display text-xl font-bold text-white">My Meetings Workspace</h2>
          <p className="text-xs text-slate-400">Total processed sessions: {meetings.length}</p>
        </div>
        
        <button
          onClick={() => {
            setCreatorMethod('template');
            setShowCreator(true);
          }}
          disabled={processing}
          className="glow-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Meeting Analysis</span>
        </button>
      </div>

      {/* Query Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search meetings keyword or transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sentiment Filter */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={filterSentiment} 
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="bg-transparent border-none text-slate-300 focus:outline-none"
            >
              <option value="all">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-slate-300 focus:outline-none"
            >
              <option value="date">Sort: Newest Date</option>
              <option value="title">Sort: Alphabetic</option>
              <option value="duration">Sort: Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Processing Loader Banner */}
      {processing && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-violet-950/40 to-slate-950/40 border border-violet-500/20 shadow-lg shadow-violet-500/5 flex items-center space-x-4">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
              <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Gemini AI Processing Meeting Audio...</span>
              <Sparkles className="w-4 h-4 text-violet-400 animate-bounce" />
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Transcribing audio waves, performing speaker diarization, generating summaries, and syncing workspace tasks. Please wait a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* Grid of processed meetings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {processedMeetings.map((meeting) => (
          <div 
            key={meeting.id}
            className="group p-5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/50 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-bold">
                  {meeting.status === 'completed' ? 'Processed' : 'Processing'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(meeting.date).toLocaleDateString()}
                </span>
              </div>
              
              <h3 
                onClick={() => onSelectMeeting(meeting)}
                className="font-display font-bold text-slate-200 group-hover:text-violet-400 transition cursor-pointer"
              >
                {meeting.title}
              </h3>
              
              <p className="text-xs text-slate-400 line-clamp-2">
                {meeting.summary?.short || 'No summary overview generated.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-[10px] text-slate-500">
                <span>{Math.round(meeting.duration / 60)} mins</span>
                <span>•</span>
                <span>{meeting.speakers?.length || 0} Speakers</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onDeleteMeeting(meeting.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  title="Delete analysis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectMeeting(meeting)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {processedMeetings.length === 0 && !processing && (
          <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-white/5 text-slate-500 space-y-3">
            <FolderOpen className="w-10 h-10 mx-auto opacity-40 text-violet-400" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">No meetings found</p>
              <p className="text-xs text-slate-500">Refine your search parameters or start a new transcription sync.</p>
            </div>
          </div>
        )}
      </div>

      {/* Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl glass-panel p-6 border border-white/5 space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <h3 className="font-display font-bold text-sm text-white">Create Meeting Analysis</h3>
                </div>
                <button 
                  onClick={() => {
                    if (isRecording) stopRecording();
                    setShowCreator(false);
                  }}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Form Input Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Roadmap Review"
                  value={creatorTitle}
                  onChange={(e) => setCreatorTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                />
              </div>

              {/* Creator Method toggle tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-900">
                <button
                  type="button"
                  onClick={() => setCreatorMethod('template')}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    creatorMethod === 'template' ? 'bg-slate-800 text-white border border-white/5' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sample Templates
                </button>
                <button
                  type="button"
                  onClick={() => setCreatorMethod('record')}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    creatorMethod === 'record' ? 'bg-slate-800 text-white border border-white/5' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Record Live Mic
                </button>
                <button
                  type="button"
                  onClick={() => setCreatorMethod('upload')}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    creatorMethod === 'upload' ? 'bg-slate-800 text-white border border-white/5' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Upload File
                </button>
              </div>

              {/* Creator Methods Contents */}
              <div className="min-h-[140px] flex flex-col justify-center">
                {creatorMethod === 'template' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Choose AI Mockup Template</label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="product_sync">Product Launch Sync (SaaS Auth Sync)</option>
                        <option value="marketing_brainstorm">Marketing Brainstorm (User Acquisition campaigns)</option>
                        <option value="engineering_postmortem">Engineering Post-Mortem (Database Replication failure)</option>
                        <option value="sales_review">Sales Review (CRM pipeline updates)</option>
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Our platform will simulate a multi-speaker meeting and analyze it using the Gemini 2.5 API, complete with transcripts, task extractions, sentiment audits, and scheduling rules.
                    </p>
                  </div>
                )}

                {creatorMethod === 'record' && (
                  <div className="space-y-4 text-center">
                    {recordError && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-[10px] text-amber-400 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{recordError}</span>
                      </div>
                    )}

                    {!isRecording ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audio Input</label>
                            <select 
                              value={selectedDevice}
                              onChange={(e) => setSelectedDevice(e.target.value)}
                              className="w-full p-2 rounded-lg bg-slate-900 border border-white/5 text-[10px] text-slate-300"
                            >
                              {devices.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>
                              ))}
                              {devices.length === 0 && <option value="">Default Microphone</option>}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Noise Reduction</label>
                            <div className="flex items-center space-x-2 p-2 bg-slate-900 border border-white/5 rounded-lg text-[10px]">
                              <input 
                                type="checkbox" 
                                checked={noiseReduction} 
                                onChange={(e) => setNoiseReduction(e.target.checked)}
                                className="accent-violet-500"
                              />
                              <span>Filter static hums</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={startRecording}
                          className="mx-auto w-16 h-16 rounded-full bg-red-600/10 border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-600/20 transition cursor-pointer shadow-lg shadow-red-500/5 animate-pulse"
                        >
                          <Mic className="w-6 h-6" />
                        </button>
                        <p className="text-xs font-semibold text-slate-300">Click to start recording</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-slate-950 border border-white/5 flex flex-col items-center">
                          <span className="text-2xl font-mono font-bold text-red-500 recording-pulse px-3 py-1 rounded bg-red-500/10">
                            {formatTime(recordTime)}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
                            {isPaused ? 'Recording Paused' : 'Recording Live Audio'}
                          </span>
                        </div>

                        {/* Visualizer Canvas */}
                        <canvas 
                          ref={canvasRef} 
                          className="w-full h-16 rounded-xl border border-white/5 bg-slate-950"
                          width={400}
                          height={64}
                        />

                        <div className="flex items-center justify-center space-x-4">
                          {isPaused ? (
                            <button
                              type="button"
                              onClick={resumeRecording}
                              className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer flex items-center space-x-1"
                            >
                              <Play className="w-3.5 h-3.5 text-green-400" />
                              <span>Resume</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={pauseRecording}
                              className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer flex items-center space-x-1"
                            >
                              <Pause className="w-3.5 h-3.5 text-amber-400" />
                              <span>Pause</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-5 py-1.5 rounded-lg bg-red-600 text-xs font-semibold hover:bg-red-500 text-white transition cursor-pointer flex items-center space-x-1"
                          >
                            <StopCircle className="w-3.5 h-3.5" />
                            <span>Stop & Analyze</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {creatorMethod === 'upload' && (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/30 transition text-center cursor-pointer relative group">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUploadChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-slate-500 mx-auto group-hover:text-violet-400 transition mb-2" />
                    {uploadFile ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-200">{uploadFile.name}</p>
                        <p className="text-[10px] text-slate-400">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-300">Drag & drop or click to upload</p>
                        <p className="text-[10px] text-slate-500">Supports MP3, WAV, M4A up to 25MB</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreator(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processing || (creatorMethod === 'upload' && !uploadFile) || isRecording}
                  onClick={() => handleSubmit()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-xs font-semibold text-white shadow-lg shadow-violet-500/15 transition cursor-pointer disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Run Diagnostics'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
