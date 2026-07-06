export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  confidence: number;
}

export interface Speaker {
  id: string;
  name: string;
  originalName: string;
  speakingTime: number; // in seconds
  percentage: number;
  emotion?: string; // e.g. "Confident", "Collaborative", "Anxious", "Neutral"
}

export interface MeetingSummary {
  short: string;
  detailed: string;
  highlights: string[];
  decisions: string[];
  keyTopics: string[];
}

export interface MeetingTask {
  id: string;
  meetingId: string;
  title: string;
  owner: string;
  deadline: string; // ISO date or descriptive
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  category: string;
}

export interface CalendarEvent {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  googleSynced: boolean;
}

export interface FollowUpEmail {
  id: string;
  meetingId: string;
  subject: string;
  recipient: string;
  body: string;
  sent: boolean;
}

export interface MeetingAnalytics {
  speakingTime: { [speakerId: string]: number };
  keywords: { text: string; value: number }[];
  sentiment: 'Positive' | 'Neutral' | 'Mixed' | 'Critical';
  productivityScore: number; // 0-100
  silenceDuration: number; // seconds
  coachFeedback: string[];
  risks: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO String
  duration: number; // in seconds
  audioUrl?: string;
  status: 'recording' | 'processing' | 'completed';
  transcript: TranscriptSegment[];
  speakers: Speaker[];
  summary?: MeetingSummary;
  tasks: MeetingTask[];
  calendarEvents: CalendarEvent[];
  emails: FollowUpEmail[];
  analytics?: MeetingAnalytics;
  notes?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: string;
}
