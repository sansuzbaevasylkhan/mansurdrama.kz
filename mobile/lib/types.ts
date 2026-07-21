// Веб-сайттағы Prisma схемасына сәйкес типтер
// (Жаңартқанда /api/dramas, /api/episodes, /api/payments құрылымын салыстырыңыз)

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  videoUrl: string;
  duration: number;
  thumbnail?: string | null;
  views: number;
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
  episodes?: Episode[];
}

export type PaymentType = "SINGLE_EPISODE" | "FULL_PACKAGE";
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Payment {
  id: string;
  userId: string;
  dramaId: string;
  dramaSlug?: string;
  dramaTitle?: string | null;
  type: "next_episode" | "full_season";
  fullName: string;
  phone: string;
  receiptUrl: string;
  amount: number;
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
}

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN";
}
