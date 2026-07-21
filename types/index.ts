// Shared types for the Mansur Drama platform.

export type UserRole = 'ADMIN' | 'USER';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  createdAt: string;
}

export interface EpisodeSummary {
  id: string;
  episodeNumber: number;
  title: string;
  videoUrl: string;
  duration: number;
  thumbnail: string | null;
  views: number;
  createdAt: string;
}

export interface Drama {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  posterUrl: string;
  totalEpisodes: number;
  views: number;
  rating: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  episodes?: EpisodeSummary[];
}

// Backward-compatible alias
export type DramaSummary = Drama;


export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
