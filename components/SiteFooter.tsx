import Link from 'next/link';

/* Әлеуметтік желі SVG-лер — lucide-react-те TikTok логотипі жоқ,
   сондықтан inline SVG қолданамыз. */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.51a8.16 8.16 0 0 0 4.77 1.52V6.69h-1.84z" />
    </svg>
  );
}

const socialLinks = [
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@mansurdrama.kz',
    Icon: TiktokIcon,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/mansurdrama.kz',
    Icon: InstagramIcon,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@mansurdrama.kz',
    Icon: YoutubeIcon,
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 mt-16 bg-black select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10">


        {/* Store Buttons Section - Premium Ultra Max Style */}
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1">プレミアム・ウルトラ・マックス</h3>
            <p className="text-sm text-white/40">Қосымшаны жүктеп алып, мүмкіндіктерді кеңейтіңіз</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <span
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 text-white/30 font-bold text-sm cursor-not-allowed opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.3 16.4-64.2 50-64.2 14.2-14.2 28.4-14.2 38.8-14.2 10.6 0 17.6-12.6 28.4-12.6 11.2 0 17.2 12.2 28 12.2 11.2 0 24.5-15.7 44.7-15.7 18.3 0 34.3 12.6 44.7 28.4-15.6 36.7-12.1 66.9-12.1 66.9-16.7 2.7-36.3 12.5-49 12.5-12.8 0-25.3-12.5-34.3-12.5s-21.5 12.5-34.3 12.5c-12.8 0-25.7-12.5-34.3-12.5-12.6 0-24.5 12.5-34.3 12.5-12.8 0-25.3-12.5-34.3-12.5-12.8 0-24.5 12.5-34.3 12.5-12.8 0-25.7-12.5-34.3-12.5-12.8 0-24.5 12.5-34.3 12.5-12.8 0-25.7-12.5-34.3-12.5z"/></svg>
              App Store
            </span>
            <a
              href="https://play.google.com/store/apps/details?id=kz.asylkhansansuzbaev.mansurdrama.app&hl=en-US&ah=kuAa_NLwNKTaK3bT_9sZ9TYojxY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20A1,1 0 0,1 2,19V5A1,1 0 0,1 3,4H21A1,1 0 0,1 22,5V19A1,1 0 0,1 21,20H3M3,5V19H21V5H3M13.5,12.5L16,15L18.5,12.5L13.5,12.5Z"/></svg>
              Google Play
            </a>

          </div>
        </div>

        {/* Bottom row: Copyright + Socials */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-8">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} MansurDrama.kz — Барлық құқықтар қорғалған.
          </p>

          <div className="flex items-center gap-3">
            {socialLinks.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                title={name}
                className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40 border-t border-white/5 pt-6">
          <Link href="/terms" className="hover:text-white transition-colors">
            Пайдалану шарттары
          </Link>
          <span className="text-white/15">•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Құпиялық саясаты
          </Link>
          <span className="text-white/15">•</span>
          <a
            href="mailto:asylkhansansuzbaev73@gmail.com"
            className="hover:text-white transition-colors"
          >
            Қолдау
          </a>
        </div>
      </div>
    </footer>
  );
}
