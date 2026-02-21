
export type ContentType = 'image' | 'video' | 'audio' | 'article';
export type UserRole = 'admin' | 'mentor' | 'student';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: ContentType;
  content: string | string[];
  thumbnail?: string;
  title?: string;
  description: string;
  sourceUrl?: string;
  likes: string[];
  comments: Comment[];
  views: number;
  timestamp: number;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  hasViewed: boolean;
  content?: string;
}

export interface SourceMaterial {
  id: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'text';
  name: string;
  mimeType: string;
  content: string; // Base64 ou texto puro
}

export interface Lesson {
  id: string;
  userId: string;
  title: string;
  summary: string;
  exercises: {
    scenario: string;
    instructions: string;
  }[];
  tests: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  article: string;
  sources: SourceMaterial[];
  timestamp: number;
}

export interface MediaAsset {
  id: string;
  userId: string;
  type: 'audio' | 'video' | 'pdf' | 'image';
  name: string;
  url: string; // Blob URL ou Base64
  mimeType: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  completedTests?: Record<string, { score: number, responses: Record<number, number> }>;
  completedPractices?: Record<string, {
    averageScore: number;
    exercises: {
      answer: string;
      score: number;
      feedback: string;
    }[]
  }>;
  completedArticles?: Record<string, boolean>;
}
