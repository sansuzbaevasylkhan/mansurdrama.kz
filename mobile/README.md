# 📱 MansurDrama — Mobile (Expo / React Native)

Бұл — [MansurDrama.kz](https://mansurdrama.vercel.app) веб-сайтының **Expo (React Native + TypeScript)** мобиль нұсқасы.
Веб-сайттағы API-ларды (Vercel-де деплой қылынған) пайдаланып, дорама каталогын, эпизодтарды, Kaspi төлем жүйесін және админ-панельді мобильде көрсетеді.

**Стек:**
- ⚛️ **Expo SDK 52** + **React Native 0.76** (New Architecture)
- 🧭 **Expo Router 4** (файлдық маршруттау)
- 🎨 **NativeWind 4** (Tailwind CSS RN-де)
- 🎬 **expo-av** (видео-плеер)
- 📸 **expo-image-picker** (Kaspi чек скриншот)
- 🗄️ **AsyncStorage** (JWT сессия)
- 🐻 **Zustand** (state)
- 🌟 **lucide-react-native** (иконкалар)

---

## 🚀 Жылдам іске қосу (Expo Go арқылы тестілеу)

### 1. Тәуелділіктерді орнату
```bash
cd "mobile"
npm install
# немесе
yarn install
```

### 2. Expo Go орнату
- **Android**: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) — Expo Go
- **iOS**: App Store — Expo Go

### 3. API URL-ді тексеру/өзгерту
`app.json` → `extra.apiBaseUrl`:
```json
"extra": {
  "apiBaseUrl": "https://mansurdrama.vercel.app"
}
```
> **Локалды даму:** IP-ні қойыңыз, мысалы `http://192.168.1.10:3000`. Бір WiFi желісінде болуыңыз керек.

### 4. Іске қосу
```bash
npx expo start
```
Терминалда **QR-код** шығады. Expo Go-да **"Scan QR Code"** арқылы сканерлеңіз. Қосымша телефонда ашылады.

### 5. Қосымша тексеру
- 📱 **Каталог** — дорамалар тізімі (API /api/dramas)
- 🔎 **Іздеу** — debounce арқылы
- 🎬 **Дорама беті** — эпизодтар, видео-плеер (expo-av)
- 🔒 **Paywall** — 11+ бөлім Kaspi төлем
- ⚙️ **Админ** — экранның төменгі оң жағындағы "Admin" → login → дашборд

---

## 📦 APK build (EAS)

### 1. EAS CLI орнату
```bash
npm install -g eas-cli
eas login
```

### 2. Жобаны инициализациялау
```bash
eas build:configure
```

### 3. APK құрастыру (preview)
```bash
npm run build:apk
# = eas build -p android --profile preview
```
APK-ны `eas.json` → `build.preview` бөлімінде табасыз. QR-кодпен телефонға жүктей аласыз.

### 4. Production build (Google Play-ге жіберу)
```bash
npm run build:release
# = eas build -p android --profile production
```

---

## 📂 Жоба құрылымы

```
mobile/
├── app/                          # Expo Router (файлдық маршруттау)
│   ├── _layout.tsx              # Root (ThemeProvider, Stack, GestureHandler)
│   ├── (tabs)/                  # Пайдаланушы табтары
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # 📱 Басты бет (каталог + Hero)
│   │   └── search.tsx           # 🔎 Іздеу
│   ├── drama/
│   │   └── [slug].tsx           # 🎬 Дорама беті (эпизодтар + плеер)
│   └── admin/
│       ├── login.tsx            # 🔐 Admin кіру
│       └── (tabs)/              # ⚙️ Админ табтары
│           ├── _layout.tsx
│           ├── index.tsx        # 📊 Дашборд
│           ├── dramas.tsx       # 🎬 Дорамалар CRUD
│           ├── users.tsx        # 👥 Қолданушылар
│           └── payments.tsx     # 💳 Төлемдер
│
├── components/                  # React Native компоненттер
│   ├── VideoPlayer.tsx         # 🎬 expo-av плеер (fullscreen, controls, seek)
│   ├── EpisodePaywall.tsx      # 💳 Kaspi төлем (image-picker)
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Screen.tsx
│       └── Skeleton.tsx        # Skeleton + EmptyState
│
├── lib/                         # API клиент + state
│   ├── api.ts                  # fetch wrapper (Bearer token)
│   ├── auth-store.ts           # zustand (admin session)
│   ├── config.ts               # API_BASE_URL
│   ├── endpoints.ts            # dramasApi, paymentsApi, authApi, adminApi
│   ├── tv.ts                   # clsx-based variant helper
│   ├── types.ts                # Drama, Episode, Payment, User
│   └── utils.ts                # cn(), formatNumber, formatDuration
│
├── assets/                      # Иконкалар, splash
├── app.json                     # Expo конфиг
├── babel.config.js
├── eas.json                     # EAS Build профильдер
├── metro.config.js              # NativeWind Metro preset
├── tailwind.config.js           # Dark theme + primary/accent
├── global.css                   # Tailwind base
└── package.json
```

---

## 🌐 API интеграциясы

Мобиль қосымша **Vercel-дегі Next.js API-ларын** пайдаланады:

| Экран | API endpoint | Сипаттама |
|-------|--------------|-----------|
| Каталог | `GET /api/dramas` | Жарияланған дорамалар |
| Іздеу | `GET /api/dramas?q=` | Іздеу (server-side `contains`) |
| Дорама беті | `GET /api/dramas/:id/episodes` | Эпизодтар |
| Төлем | `POST /api/payments` (FormData) | Kaspi чек жүктеу |
| Админ login | `POST /api/auth/login` | JWT сессия |
| Админ статистика | `GET /api/dramas?admin=1`, `/api/users`, `/api/payments?status=pending` | Дашборд деректері |
| Админ растау | `PATCH /api/payments/:id` (action: confirm/reject) | Чекті ашу/қабылдамау |

> ⚠️ **Cookie-based auth ескертуі:** Веб-сайт JWT-ді `httpOnly cookie`-де сақтайды. React Native-де `document.cookie` жоқ. Сондықтан мобильде Bearer токен жібереміз. В production-да сервер-жағынан `Authorization: Bearer ...` қабылдау қажет болуы мүмкін (логин endpoint Bearer қайтаратындай). Қазір логин endpoint-тен `Authorization: Bearer admin-session` жіберіледі (сервер cookie-мен тексереді, RN-де cookie-ны қолмен сақтау керек).

---

## 🎨 Дизайн жүйесі (веб-сайтпен бірдей)

- **dark-950**: `#0a0a10` — негізгі фон
- **dark-900**: `#131316` — карточкалар
- **primary-500**: `#ec4899` — қызғылт (негізгі)
- **accent-500**: `#8b5cf6` — күлгін (акцент)
- **font**: System (iOS/Android)

Барлық компоненттер NativeWind (`className`) арқылы стильденеді.

---

## 🐛 Жиі кездесетін қателіктер

### 1. `Network request failed`
- API URL дұрыс па? `app.json` → `extra.apiBaseUrl`
- Телефон + компьютер бір WiFi-де ме?
- HTTPS-те CORS-қа назар аударыңыз (Vercel-де default ашық)

### 2. Видео ойнамайды
- `videoUrl` тікелей MP4/HLS сілтемесі ме? (HLS: `.m3u8` форматы)
- Firebase Storage `Allow read: true` ережесі бар ма?

### 3. Админ логин жұмыс істемейді
- Сервер `ADMIN_PASSWORD` дұрыс па?
- Bearer токен сервер-жағынан қабылдана ма?

### 4. Build қатесі
- `node_modules` тазалап, қайта орнатыңыз: `rm -rf node_modules && npm install`
- Expo SDK нұсқасын тексеріңіз (`npx expo --version`)

---

## 📝 Лицензия
Білім беру мақсатында.
