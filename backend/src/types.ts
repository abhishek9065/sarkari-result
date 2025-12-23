export type ContentType = 'job' | 'result' | 'admit-card' | 'syllabus' | 'answer-key' | 'admission';
export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
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
  deadline?: Date;
  minQualification?: string;
  ageLimit?: string;
  applicationFee?: string;
  totalPosts?: number;
  postedBy?: number;
  postedAt: Date;
  updatedAt: Date;
  isActive: boolean;
  viewCount: number;
  tags?: Tag[];
  importantDates?: ImportantDate[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface ImportantDate {
  id: number;
  announcementId: number;
  eventName: string;
  eventDate: Date;
  description?: string;
}

export interface CreateAnnouncementDto {
  title: string;
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
  tags?: string[];
  importantDates?: Omit<ImportantDate, 'id' | 'announcementId'>[];
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}
