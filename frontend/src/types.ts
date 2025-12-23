export type ContentType = 'job' | 'result' | 'admit-card' | 'syllabus' | 'answer-key' | 'admission';

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Announcement {
  id: number;
  title: string;
  slug: string;
  type: ContentType;
  category: string;
  organization: string;
  content?: string;
  externalLink?: string;
  location?: string;
  deadline?: string;
  minQualification?: string;
  ageLimit?: string;
  applicationFee?: string;
  totalPosts?: number;
  postedAt: string;
  updatedAt?: string;
  isActive: boolean;
  viewCount: number;
  tags?: Tag[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
