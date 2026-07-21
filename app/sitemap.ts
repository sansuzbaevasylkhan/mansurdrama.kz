import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const dramas = await prisma.drama
    .findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    })
    .catch(() => []);

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/admin`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    ...dramas.map((d) => ({
      url: `${base}/drama/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
