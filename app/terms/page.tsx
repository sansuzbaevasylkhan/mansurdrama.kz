import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Пайдалану шарттары',
  description:
    'MansurDrama.kz платформасын пайдалану ережелері, авторлық құқықтар, жауапкершілік шектеуі.',
  alternates: { canonical: '/terms' },
};

const sections = [
  {
    id: 'general',
    title: '1. Жалпы ережелер',
    content: [
      'MansurDrama.kz (бұдан әрі — «Платформа») — қазақ тіліндегі қысқа дорамаларды онлайн көруге арналған платформа.',
      'Осы Платформаны пайдалана отырып, сіз осы Пайдалану шарттарын толық көлемде қабылдайсыз. Егер сіз келіспесеңіз, сайтты пайдалануды тоқтатыңыз.',
      'Платформа 18 жасқа толмаған тұлғаларға ересектердің қадағалауымен қол жетімді. Егер сіз 18-ге толмасаңыз, ата-анаңыздың немесе қамқоршыңыздың келісімімен пайдаланыңыз.',
    ],
  },
  {
    id: 'account',
    title: '2. Тіркелгі және қауіпсіздік',
    content: [
      'Платформаның жалпы контентін тіркелгісіз де көруге болады. Тіркелкі жасау міндетті емес.',
      'Сіз өз тіркелгі деректеріңіздің (логин, құпиясөз) қауіпсіздігіне дербес жауаптысыз.',
      'Рұқсатсыз кіруді байқасаңыз, support@mansurdrama.kz поштасына хабарлаңыз.',
      'Платформа әкімшілігі күдікті белсенділік анықталған жағдайда тіркелгіні уақытша бұғаттау құқығын өзіне қалдырады.',
    ],
  },
  {
    id: 'content',
    title: '3. Контент және авторлық құқықтар',
    content: [
      'Платформадағы барлық дорамалар, постерлер, бейне және дыбыс материалдары тиісті иелерінің авторлық құқығымен қорғалған.',
      'Материалдарды коммерциялық мақсатта көшіру, тарату немесе қайта жариялау Қазақстан Республикасының заңнамасына сәйкес тыйым салынады.',
      'Контентті тек жеке қолдану үшін көруге рұқсат етіледі.',
      'Авторлық құқық бұзылғанын байқасаңыз, support@mansurdrama.kz поштасына DMCA-ға сәйкес өтініш жолдаңыз.',
    ],
  },
  {
    id: 'conduct',
    title: '4. Пайдаланушы мінез-құлқы',
    content: [
      'Платформада лайықсыз сөз, қорқыту, спам және жалған ақпарат тарату тыйым салынады.',
      'Пікірлердегі (комментарийлер) құқық бұзушылықтар бойынша әкімшілік ескертусіз жояды.',
      'Робот, бот, скрапер немесе автоматтандырылған құралдар арқылы деректер жинау тыйым салынады.',
    ],
  },
  {
    id: 'subscription',
    title: '5. Жазылу және төлем',
    content: [
      'Қазіргі уақытта Платформаның негізгі контенті тегін қол жетімді.',
      'Болашақта премиум-жазылу енгізілген жағдайда төлем шарттары жеке хабарланады.',
      'Қайтару (возврат) төлем шарттарында көрсетілген мерзімде жүргізіледі.',
    ],
  },
  {
    id: 'liability',
    title: '6. Жауапкершілікті шектеу',
    content: [
      'Платформа «сол қалпында» (as is) негізінде ұсынылады. Қызмет көрсету сапасына нақты кепілдік берілмейді.',
      'Платформа уақытша қол жетімсіз болған жағдайда әкімшілік жауапкершілік көтермейді.',
      'Пайдаланушының құрылғысындағы техникалық ақауларға байланысты мәселелер Платформаның жауапкершілігіне жатпайды.',
    ],
  },
  {
    id: 'changes',
    title: '7. Шарттарға өзгерістер',
    content: [
      'Платформа осы Шарттарға алдын ала ескертусіз өзгерістер енгізу құқығын өзіне қалдырады.',
      'Өзгерістер жарияланған сәттен бастап күшіне енеді.',
      'Маңызды өзгерістер сайттағы хабарлама немесе email арқылы хабарланады.',
    ],
  },
  {
    id: 'contact',
    title: '8. Байланыс',
    content: [
      'Сұрақтар, шағымдар немесе ұсыныстар бойынша support@mansurdrama.kz поштасына жазыңыз.',
      'Жауап мерзімі — жұмыс күндері 24 сағат ішінде.',
    ],
  },
];

export default function TermsPage() {
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Пайдалану шарттары
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
            Осы Шарттар Қазақстан Республикасының заңнамасына сәйкес реттеледі.
            Туындаған даулар Алматы қаласының сотында қаралады.
          </div>
        </div>
      </div>
    </div>
  );
}
