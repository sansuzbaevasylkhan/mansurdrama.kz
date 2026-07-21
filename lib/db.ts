// Database query helpers — all persistence flows through here.
import { prisma } from './prisma';
import { slugify, ensureUniqueSlug } from './slug';
import type { DramaSummary, EpisodeSummary, UserSummary, UserRole } from '@/types';

// ---------- Dramas ----------

export async function getDramasBySearch(search: string) {
  const where = search
    ? {
        isPublished: true,
        OR: [
          { title: { contains: search } },
          { slug: { contains: search } },
        ],
      }
    : { isPublished: true };

  return prisma.drama.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      episodes: {
        orderBy: { episodeNumber: 'asc' },
        select: episodeSelect,
      },
    },
  });
}

export async function getAllDramasForAdmin() {
  return prisma.drama.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      episodes: {
        orderBy: { episodeNumber: 'asc' },
        select: episodeSelect,
      },
    },
  });
}

export async function getDramaBySlug(slug: string) {
  return prisma.drama.findUnique({
    where: { slug },
    include: {
      episodes: {
        orderBy: { episodeNumber: 'asc' },
        select: episodeSelect,
      },
    },
  });
}

export async function getDramaById(id: string) {
  return prisma.drama.findUnique({
    where: { id },
    include: {
      episodes: {
        orderBy: { episodeNumber: 'asc' },
        select: episodeSelect,
      },
    },
  });
}

const episodeSelect = {
  id: true,
  episodeNumber: true,
  title: true,
  videoUrl: true,
  duration: true,
  thumbnail: true,
  views: true,
  createdAt: true,
} as const;

export type DramaWithEpisodes = NonNullable<Awaited<ReturnType<typeof getDramaBySlug>>>;

export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  return ensureUniqueSlug(title, async (slug) => {
    const found = await prisma.drama.findUnique({ where: { slug }, select: { id: true } });
    if (!found) return false;
    if (excludeId && found.id === excludeId) return false;
    return true;
  });
}

export interface CreateDramaInput {
  title: string;
  slug?: string;
  description?: string | null;
  posterUrl: string;
  totalEpisodes: number;
  isPublished?: boolean;
}

export async function createDrama(data: CreateDramaInput) {
  const finalSlug = data.slug ? slugify(data.slug) : await generateUniqueSlug(data.title);
  return prisma.drama.create({
    data: {
      title: data.title.trim(),
      slug: finalSlug,
      description: data.description ?? null,
      posterUrl: data.posterUrl,
      totalEpisodes: data.totalEpisodes,
      isPublished: data.isPublished ?? true,
    },
  });
}

export interface UpdateDramaInput {
  title?: string;
  slug?: string;
  description?: string | null;
  posterUrl?: string;
  totalEpisodes?: number;
  isPublished?: boolean;
}

export async function updateDrama(id: string, data: UpdateDramaInput) {
  const update: UpdateDramaInput = { ...data };
  if (data.title) update.title = data.title.trim();
  if (data.slug) update.slug = await generateUniqueSlug(data.slug, id);
  if (data.totalEpisodes !== undefined) {
    // Keep episodes table consistent: drop the tail if totalEpisodes shrank.
    await prisma.episode.deleteMany({
      where: { dramaId: id, episodeNumber: { gt: data.totalEpisodes } },
    });
  }
  return prisma.drama.update({ where: { id }, data: update });
}

export async function deleteDrama(id: string) {
  return prisma.drama.delete({ where: { id } });
}

// ---------- Episodes ----------

export interface CreateEpisodeInput {
  dramaId: string;
  episodeNumber: number;
  title: string;
  videoUrl: string;
  duration?: number;
  thumbnail?: string | null;
}

export async function createEpisode(data: CreateEpisodeInput) {
  return prisma.episode.create({ data });
}

export async function createEpisodes(episodes: CreateEpisodeInput[]) {
  if (episodes.length === 0) return { count: 0 };
  return prisma.episode.createMany({ data: episodes });
}

export async function updateEpisode(
  id: string,
  data: Partial<{ title: string; videoUrl: string; duration: number; thumbnail: string | null }>,
) {
  return prisma.episode.update({ where: { id }, data });
}

export async function deleteEpisode(id: string) {
  return prisma.episode.delete({ where: { id } });
}

export async function deleteEpisodesForDrama(dramaId: string) {
  return prisma.episode.deleteMany({ where: { dramaId } });
}

// ---------- Users ----------

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  role: true,
  createdAt: true,
} as const;

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: userSelect,
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: userSelect });
}

export async function createUser(data: {
  name: string;
  email: string;
  avatar?: string | null;
  role?: UserRole;
  password?: string;
}) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      avatar: data.avatar ?? null,
      role: data.role ?? 'USER',
      password: data.password ?? '',
    },
    select: userSelect,
  });
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; email: string; avatar: string | null; role: UserRole }>,
) {
  return prisma.user.update({ where: { id }, data, select: userSelect });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function getUserCount() {
  return prisma.user.count();
}

// Re-exports for the response payload type.
export type { UserSummary, DramaSummary, EpisodeSummary };
