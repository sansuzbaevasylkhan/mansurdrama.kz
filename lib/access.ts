import { prisma } from './prisma';

export async function hasEpisodeAccess(userId: string, dramaId: string, episodeNumber: number): Promise<boolean> {
  if (episodeNumber <= 10) return true;

  // Full package unlock
  const full = await prisma.unlockedContent.findFirst({
    where: {
      userId,
      dramaId,
      episodeNumber: null,
    },
    select: { id: true },
  });
  if (full) return true;

  // Single episode unlock
  const unlocked = await prisma.unlockedContent.findFirst({
    where: {
      userId,
      dramaId,
      episodeNumber,
    },
    select: { id: true },
  });
  return Boolean(unlocked);
}

