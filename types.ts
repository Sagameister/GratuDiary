
export interface JournalEntry {
  id: string;
  date: string; // ISO Date string
  workedWell: string[];
  madeHappy: string[];
  gratefulFor: string[];
  mood: number; // 1-5
  moodNote?: string; // Optional explanation for mood
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: string; // ISO Date string
}

export interface UserStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  memberSince: string;
}

export interface KeywordMetric {
  text: string;
  count: number;
  type: 'positive' | 'focus';
}

export enum MoodEmoji {
  Angry = 1,
  Sad = 2,
  Neutral = 3,
  Good = 4,
  Happy = 5
}