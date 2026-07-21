# 🏗 Архитектура: Бір Backend, Екі Клиент

```
┌─────────────────────────────────────────────────────────────────┐
│                  Vercel (https://mansurdrama.vercel.app)         │
│                                                                   │
│  Next.js 15 (App Router) — Бір backend, екі клиентке қызмет     │
│  ├─ 📂 /app/admin/*      — Админ-панель (веб-сайт)              │
│  ├─ 📂 /app/drama/*      — Дорама беті (веб-сайт)               │
│  ├─ 📂 /app/api/*        — API endpoints                        │
│  │   ├─ /api/auth/login        — Admin login (cookie)           │
│  │   ├─ /api/auth/user-login   — User login (Bearer)            │
│  │   ├─ /api/auth/me           — Session info                   │
│  │   ├─ /api/auth/logout       — Admin logout                   │
│  │   ├─ /api/auth/user-logout  — User logout                    │
│  │   ├─ /api/dramas            — Drama CRUD                     │
│  │   ├─ /api/dramas/[id]       — Drama PATCH/DELETE             │
│  │   ├─ /api/dramas/[id]/episodes — Episodes POST               │
│  │   ├─ /api/episodes/[id]     — Episode PATCH/DELETE           │
│  │   ├─ /api/users             — Users CRUD (admin only)        │
│  │   ├─ /api/upload            — File upload (admin only)       │
│  │   ├─ /api/access            — Episode access check           │
│  │   └─ /api/payments          — Payment + /api/payments/[id]  │
│  └─ 🔐 Prisma + PostgreSQL (Supabase) + Firebase Storage        │
└─────────────────────────────────────────────────────────────────┘
            ▲                                       ▲
            │                                       │
   ┌────────┴─────────┐                  ┌─────────┴────────┐
   │   WEB КЛИЕНТ     │                  │  MOBILE КЛИЕНТ   │
   │   (Админ)        │                  │  (Пайдаланушы)   │
   │                  │                  │                  │
   │ Next.js pages    │                  │ Expo + RN        │
   │ Cookie auth      │                  │ Bearer auth      │
   │ (httpOnly)       │                  │ (AsyncStorage)   │
   │ /admin/login     │                  │ /auth/login      │
   │ Пароль           │                  │ Email            │
   └──────────────────┘                  └──────────────────┘
```

---

## 🌐 Жалпы Backend (бір рет деплой)

Vercel-ге **тек бір рет** deploy етесіз. Содан:
- Веб-админ `https://mansurdrama.vercel.app/admin` арқылы жұмыс істейді
- Мобиль `https://mansurdrama.vercel.app/api/*` арқылы деректер алады

### Backend стек
- **Next.js 15** (App Router) — API + веб-админ
- **Prisma 5** — ORM
- **Supabase PostgreSQL** — дерекқор
- **Firebase Storage** — файлдар (постер, видео, чек)
- **JWT (jose)** — сессия токендері

### Қоршаған орта айнымалылары (Vercel-де)
```bash
DATABASE_URL          # Supabase pooler URL
DIRECT_URL            # Supabase direct URL
JWT_SECRET            # 32+ символ
ADMIN_PASSWORD        # Админ кіру паролі
NEXTAUTH_SECRET       # Optional
NEXT_PUBLIC_SITE_URL  # https://mansurdrama.vercel.app
NEXT_PUBLIC_SITE_NAME # Mansur Drama
NEXT_PUBLIC_FIREBASE_*  # 7 айнымалы (Firebase web)
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
FIREBASE_STORAGE_BUCKET
```

---

## 🖥 Веб-клиент (Админ)

| URL | Сипаттама |
|-----|-----------|
| `/` | Пайдаланушы каталогы (веб-нұсқа) |
| `/drama/[slug]` | Дорама беті (веб) |
| `/admin/login` | Админ кіру (password) |
| `/admin` | Дашборд, драма, қолданушы, төлемдер |
| `/admin/payments` | Kaspi төлемдерді растау |

**Auth:** `httpOnly cookie` (`mansur_admin_session`) — JWT-мен.

### Не істей алады:
- Дорама қосу/жою (постер + видео Firebase-ке)
- Қолданушыларды басқару
- Kaspi чек-терді растау/қабылдамау

---

## 📱 Mobile-клиент (Пайдаланушы)

`/mobile` каталогында (Expo SDK 52 + React Native + TypeScript).

| Экран | Сипаттама |
|-------|-----------|
| `(tabs)/index` | Каталог + Hero + іздеу |
| `(tabs)/search` | Іздеу (debounce) |
| `(tabs)/profile` | Профиль (кіру/шығу) |
| `drama/[slug]` | Дорама беті, эпизодтар, видео-плеер |
| `auth/login` | Email-мен кіру (автоматты тіркелу) |

**Auth:** `Authorization: Bearer <token>` (AsyncStorage).

### Не істей алады:
- Дорама іздеу, көру
- Бейне ойнату (1-10 тегін, 11+ Kaspi-мен)
- Kaspi чек скриншот жүктеу

### Мобильде ADMIN жоқ — тек пайдаланушы.

---

## 🔄 Auth ағыны (мобиль)

```
1. Пайдаланушы email енгізеді
   ↓
2. POST /api/auth/user-login { email, name? }
   ↓
3. Сервер:
   - email бойынша user табады (жоқ болса жасайды)
   - JWT жасайды (role: USER)
   - cookie "user_session" орнатады (веб-үшін)
   - { token, user } қайтарады (мобиль-үшін)
   ↓
4. Мобиль:
   - token + user AsyncStorage-қа сақтайды
   - Әр API шақыруда Authorization: Bearer <token> жібереді
   ↓
5. Сервер-де /api/access POST:
   - Bearer токеннен session шығарады
   - user.email-мен UnlockedContent-тен ашылған эпизодтарды тексереді
```

---

## 🔐 Auth (веб-админ) ағыны

```
1. Админ /admin/login бетінде пароль енгізеді
   ↓
2. POST /api/auth/login { password }
   ↓
3. Сервер:
   - .env ADMIN_PASSWORD-пен салыстырады
   - JWT жасайды (role: ADMIN)
   - cookie "mansur_admin_session" орнатады
   ↓
4. Келесі сұрауларда cookie автоматты жіберіледі
   ↓
5. /api/admin/check → cookie-дан session оқиды
```

---

## 🛠 Деплой (бір рет)

```bash
# Backend + Web admin
cd "Mansurdrama.kz website"
git push origin main
# Vercel автоматты deploy қылады

# Тест
https://mansurdrama.vercel.app/api/dramas
https://mansurdrama.vercel.app/admin
```

## 📱 Мобиль іске қосу

```bash
cd mobile
npm install
# app.json → extra.apiBaseUrl = "https://mansurdrama.vercel.app"
npx expo start
# Expo Go-да QR сканерлеу
```

## 📦 APK build

```bash
cd mobile
npm install -g eas-cli
eas login
npm run build:apk
# → Android APK жүктеледі
```

---

## 🔀 API endpoints — кім қолданады?

| Endpoint | Әдіс | Web Admin | Mobile User | Auth |
|----------|------|-----------|-------------|------|
| `/api/dramas` | GET | ✓ | ✓ | public |
| `/api/dramas` | POST | ✓ | — | admin |
| `/api/dramas/[id]` | PATCH/DELETE | ✓ | — | admin |
| `/api/dramas/[id]/episodes` | POST | ✓ | — | admin |
| `/api/episodes/[id]` | PATCH/DELETE | ✓ | — | admin |
| `/api/users` | GET/POST | ✓ | — | admin |
| `/api/upload` | POST | ✓ | — | admin |
| `/api/auth/login` | POST | ✓ | — | password |
| `/api/auth/logout` | POST | ✓ | — | admin |
| `/api/auth/user-login` | POST | — | ✓ | email |
| `/api/auth/user-logout` | POST | — | ✓ | user |
| `/api/auth/me` | GET | ✓ (cookie) | ✓ (Bearer) | either |
| `/api/access` | POST | — | ✓ | public/optional Bearer |
| `/api/payments` | POST | — | ✓ | public/optional Bearer |
| `/api/payments/[id]` | PATCH | ✓ | — | admin |

---

## 🧩 Backend кеңейту (болашақ)

- **Push notifications** — Firebase Cloud Messaging + Expo Notifications
- **Watch history** — `/api/watch` POST
- **Favorites** — `/api/favorites` POST/DELETE
- **Comments** — `/api/comments` CRUD
- **Subtitles** — `/api/subtitles?episodeId=...`

Барлығы **тек backend-те жаңа endpoint** — клиенттер өзгеріссіз қосылады.
