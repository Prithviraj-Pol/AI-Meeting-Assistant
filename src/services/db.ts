import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meeting, UserProfile } from '../types';

const MEETINGS_COLLECTION = 'meetings';
const USERS_COLLECTION = 'users';

// Save user profile to Firestore
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, profile.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
  }
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.error('Error getting user profile:', err);
  }
  return null;
}

// Fetch all meetings for a user
export async function fetchMeetings(userId: string): Promise<Meeting[]> {
  try {
    const q = query(
      collection(db, MEETINGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const meetings: Meeting[] = [];
    querySnapshot.forEach((doc) => {
      meetings.push({ id: doc.id, ...doc.data() } as Meeting);
    });
    return meetings;
  } catch (err) {
    console.error('Error fetching meetings from Firestore:', err);
    // Fallback to local storage if offline or permissions block
    const local = localStorage.getItem(`meetings_${userId}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return [];
      }
    }
    return [];
  }
}

// Save or update a meeting
export async function saveMeeting(userId: string, meeting: Meeting): Promise<void> {
  try {
    const meetingRef = doc(db, MEETINGS_COLLECTION, meeting.id);
    await setDoc(meetingRef, { ...meeting, userId }, { merge: true });
  } catch (err) {
    console.error('Error saving meeting to Firestore:', err);
  }
  
  // Always update local storage as redundant copy / speed boost
  try {
    const local = localStorage.getItem(`meetings_${userId}`);
    let meetings: Meeting[] = [];
    if (local) {
      meetings = JSON.parse(local);
    }
    const idx = meetings.findIndex(m => m.id === meeting.id);
    if (idx >= 0) {
      meetings[idx] = meeting;
    } else {
      meetings.unshift(meeting);
    }
    localStorage.setItem(`meetings_${userId}`, JSON.stringify(meetings));
  } catch (err) {
    console.error('Error updating local cache for meetings:', err);
  }
}

// Delete a meeting
export async function deleteMeeting(userId: string, meetingId: string): Promise<void> {
  try {
    const meetingRef = doc(db, MEETINGS_COLLECTION, meetingId);
    await deleteDoc(meetingRef);
  } catch (err) {
    console.error('Error deleting meeting from Firestore:', err);
  }

  try {
    const local = localStorage.getItem(`meetings_${userId}`);
    if (local) {
      const meetings: Meeting[] = JSON.parse(local);
      const filtered = meetings.filter(m => m.id !== meetingId);
      localStorage.setItem(`meetings_${userId}`, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('Error deleting meeting from local cache:', err);
  }
}
