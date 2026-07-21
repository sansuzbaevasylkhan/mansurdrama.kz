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
  // TikTok фирмалық логотипі — дұрыс нышан түпнұсқа ресми гайдқа сәйкес
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
    <footer className="border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        {/* Жоғарғы қатар: copyright + әлеуметтік желілер */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

        {/* Төменгі қатар: сілтемелер */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50 border-t border-white/5 pt-6">
          <Link href="/terms" className="hover:text-white transition-colors">
            Пайдалану шарттары
          </Link>
          <span className="text-white/15">•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Құпиялық саясаты
          </Link>
          <span className="text-white/15">•</span>
          <a
            href="mailto:support@mansurdrama.kz"
            className="hover:text-white transition-colors"
          >
            Қолдау
          </a>
        </div>
      </div>
    </footer>
  );
}
