export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  state?: string;
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  organization: string;
  location: string;
  jobType: 'government' | 'railway' | 'banking' | 'defense' | 'teaching' | 'psu' | 'other';
  applicationStartDate: string;
  applicationEndDate: string;
  examDate?: string;
  eligibility: {
    education: string;
    ageLimit: string;
    experience?: string;
  };
  totalPosts: number;
  applicationFee: {
    general: number;
    sc_st: number;
    obc: number;
  };
  applyOnline: boolean;
  officialWebsite: string;
  notificationUrl?: string;
  description: string;
  status: 'active' | 'closed' | 'upcoming';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Result {
  _id: string;
  title: string;
  organization: string;
  examName: string;
  resultType: 'main' | 'prelims' | 'mains' | 'final' | 'cutoff' | 'interview' | 'merit_list';
  resultDate: string;
  resultUrl: string;
  examDate?: string;
  totalCandidates?: number;
  selectedCandidates?: number;
  cutoffMarks?: number;
  description: string;
  important: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdmitCard {
  _id: string;
  title: string;
  organization: string;
  examName: string;
  examDate: string;
  downloadStartDate: string;
  downloadEndDate: string;
  admitCardUrl: string;
  instructions?: string;
  requiredDocuments?: string[];
  important: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  state?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface JobFilters {
  location?: string;
  jobType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ResultFilters {
  organization?: string;
  resultType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdmitCardFilters {
  organization?: string;
  search?: string;
  page?: number;
  limit?: number;
}
