import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DramaCard } from "@/components/DramaCard";
import { Search as SearchIcon } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata = {
  title: "Іздеу",
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let results: any[] = [];
  if (query) {
    try {
      const dramas = await prisma.drama.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query } },
            { slug: { contains: query } },
            { description: { contains: query } },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { episodes: true } } },
      });
      results = dramas.map((d) => ({
        id: d.id,
        title: d.title,
        slug: d.slug,
        posterUrl: d.posterUrl,
        totalEpisodes: d._count.episodes,
      }));
    } catch (err) {
      console.error("Search error:", err);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-pink-500/20 border border-primary-500/30 flex items-center justify-center">
              <SearchIcon className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                Іздеу нәтижелері
              </h1>
              {query && (
                <p className="text-sm text-white/60 mt-1">
                  «<span className="text-white font-medium">{query}</span>» үшін{" "}
                  <span className="text-primary-400 font-semibold">{results.length}</span> нәтиже табылды
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            {!query ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-white/5 border border-dashed border-white/10">
                <SearchIcon className="h-12 w-12 text-white/20 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Іздеу үшін сөз енгізіңіз</h3>
                <p className="text-sm text-white/50">
                  Дорама атауы немесе slug бойынша іздеу
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-white/5 border border-dashed border-white/10">
                <h3 className="text-lg font-semibold text-white mb-1">Ештеңе табылмады</h3>
                <p className="text-sm text-white/50">
                  Басқа сөзбен қайталап көріңіз
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
                {results.map((drama, i) => (
                  <DramaCard key={drama.id} {...drama} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
