import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Құпиялық саясаты',
  description:
    'MansurDrama.kz-тағы жеке деректерді жинау, сақтау және пайдалану ережелері. Cookies, аналитика, қауіпсіздік.',
  alternates: { canonical: '/privacy' },
};

const sections = [
  {
    id: 'intro',
    title: '1. Кіріспе',
    content: [
      'MansurDrama.kz (бұдан әрі — «Платформа») сіздің жеке деректеріңізді қорғауды өзінің басым міндеті деп санайды.',
      'Осы Құпиялық саясаты қандай деректерді жинайтынымызды, оларды қалай пайдаланатынымызды және қандай құқықтарыңыз бар екенін сипаттайды.',
      'Платформаны пайдалана отырып, сіз осы Саясаттың шарттарына келісесіз.',
    ],
  },
  {
    id: 'data-collected',
    title: '2. Қандай деректерді жинаймыз',
    content: [
      'Тіркелгі деректері — аты, email, пароль (тек ерікті тіркелген жағдайда).',
      'Пайдалану деректері — IP-мекенжай, браузер түрі, құрылғы, қаралған беттер, көру уақыты.',
      'Cookie-файлдар — тіл, сессия, талғам (preferences).',
      'Қауіпсіздік логтары — кіру әрекеттері, ескертулер (анонимизацияланған).',
    ],
  },
  {
    id: 'purpose',
    title: '3. Деректерді пайдалану мақсаттары',
    content: [
      'Қызмет көрсету және жақсарту — контент жеткізу, оңтайландыру, қателерді анықтау.',
      'Жекелендіру — қаралған тарихқа негізделген ұсыныстар.',
      'Қауіпсіздік — спам, бот, рұқсатсыз кіруден қорғау.',
      'Аналитика — жиынтық статистика (анонимді).',
      'Хабарлама — жаңартулар, техникалық хабарламалар (тек маңызды жағдайда).',
    ],
  },
  {
    id: 'cookies',
    title: '4. Cookie-файлдар',
    content: [
      'Cookie-файлдар — браузерде сақталатын кішігірім мәтіндік файлдар.',
      'Біз міндетті (аутентификация, қауіпсіздік) және аналитикалық cookie-лерді қолданамыз.',
      'Сіз браузер баптауларында cookie-лерді өшіре аласыз, бірақ бұл сайттың кейбір функцияларының жұмысын бұзуы мүмкін.',
    ],
  },
  {
    id: 'supabase',
    title: '5. Инфрақұрылым қызметтері',
    content: [
      'Платформа Supabase (дерекқор, файл сақтау) қызметтерін пайдаланады.',
      'Деректер Supabase серверлерінде сақталады. Supabase-тің Құпиялық саясатына қолданылады: supabase.com/privacy.',
      'Статистика (көрулер, эпизод ойнатулар) анонимді түрде сақталады.',
    ],
  },
  {
    id: 'sharing',
    title: '6. Деректерді тарату',
    content: [
      'Біз сіздің жеке деректеріңізді үшінші тарапқа сатпаймыз және бермейміз.',
      'Тек заңнамалық талап бойынша (сот, құқық қорғау органдары) деректер берілуі мүмкін.',
      'Сервис провайдерлері (Supabase, хостинг) тек техникалық қажеттілік үшін қол жеткізеді.',
    ],
  },
  {
    id: 'storage',
    title: '7. Деректерді сақтау мерзімі',
    content: [
      'Тіркелгі деректері — тіркелкі жойылғанға дейін.',
      'Қауіпсіздік логтары — 90 күн.',
      'Аналитика — 14 ай (анонимделген).',
      'Көрулер статистикасы — дерекқорда жинақталған күйде сақталады.',
    ],
  },
  {
    id: 'rights',
    title: '8. Сіздің құқықтарыңыз',
    content: [
      'Деректеріңізді көру, жүктеп алу (export).',
      'Қате деректерді түзету.',
      'Тиркелкіні жою — support@mansurdrama.kz поштасына өтініш жолдаңыз.',
      'Маркетинг хабарламаларынан бас тарту.',
    ],
  },
  {
    id: 'security',
    title: '9. Қауіпсіздік шаралары',
    content: [
      'HTTPS шифрлау — барлық деректер тасымалы.',
      'Парольдер bcrypt арқылы хэшталады (егер қолданылса).',
      'Admin SDK кілттері серверде ғана сақталады — клиентке берілмейді.',
      'Rate limiting — API endpoint-теріне шабуылдан қорғау.',
    ],
  },
  {
    id: 'children',
    title: '10. Балалардың деректері',
    content: [
      'Платформа 13 жасқа толмаған балалардан саналы түрде деректер жинамайды.',
      'Егер ата-ана баласының деректері жиналғанын білсе, бірден support@mansurdrama.kz поштасына хабарласып, деректерді жоюымызды сұраңыз.',
    ],
  },
  {
    id: 'changes',
    title: '11. Саясатқа өзгерістер',
    content: [
      'Біз осы Саясатты уақыт өте келе жаңартуымыз мүмкін.',
      'Маңызды өзгерістер сайттағы хабарламамен немесе email арқылы хабарланады.',
      'Өзгерістер жарияланған күннен бастап күшіне енеді.',
    ],
  },
  {
    id: 'contact',
    title: '12. Байланыс',
    content: [
      'Құпиялық мәселелері бойынша: support@mansurdrama.kz',
      'Жауап мерзімі: жұмыс күндері 24 сағат ішінде.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-black">
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Басты бетке
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Құпиялық саясаты
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Соңғы жаңарту: {new Date().toLocaleDateString('kk-KZ')}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 space-y-8">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-xl font-semibold text-white mb-3">
                {section.title}
              </h2>
              <div className="space-y-3 text-white/70 leading-relaxed text-sm sm:text-base">
                {section.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="pt-6 border-t border-white/5 text-xs text-white/40">
            Бұл құжат Қазақстан Республикасының «Дербес деректер және оларды қорғау туралы» Заңына сәйкес әзірленген.
          </div>
        </div>
      </div>
    </div>
  );
}
