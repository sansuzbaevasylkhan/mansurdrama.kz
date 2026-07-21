# 🚀 Vercel-ге Deploy нұсқаулығы (Supabase + Firebase Storage)

Бұл нұсқаулық **MansurDrama.kz** жобасын Vercel-ге production-да deploy етудің толық қадамдарын сипаттайды.

**Стек:**
- ⚡ **Vercel** — Next.js 15 хостинг
- 🐘 **Supabase** — PostgreSQL дерекқор (тегтік план, 500MB)
- 🔥 **Firebase Storage** — видео/постер файлдары

---

## 📋 Алдын ала дайындық

### Қажетті аккаунттар
- ✅ GitHub аккаунты (репо push үшін) бар 
- ✅ Vercel аккаунты (GitHub арқылы кіру) бар 
- ✅ Supabase аккаунты (тегтік) бар 
- ✅ Firebase аккаунты (тегтік Spark план) бар 

### Жергілікті дайындық
```bash
# Репоңыздың түбірінде
cd "Mansurdrama.kz website"
git init                    # егер әлі жасалмаған болса
git add .
git commit -m "chore: prepare for Vercel deployment"
git remote add origin https://github.com/sansuzbaevasylkhan/mansurdrama.kz.git
git branch -M main
git push -u origin main
```

---

## 🐘 1-қадам: Supabase жобасын жасау

### 1.1 Жаңа жоба
1. [supabase.com](https://supabase.com) → **Start your project** (GitHub арқылы кіру)
2. **New project** басыңыз
   - **Name:** `mansurdrama`
   - **Database Password:** күшті пароль (сақтап қойыңыз!)
   - **Region:** `West EU (Ireland)` немесе `Central EU (Frankfurt)` — Vercel-ге жақын
3. **Create new project** → 1-2 минут күтіңіз

### 1.2 Connection string алу
1. **Project Settings** (⚙️) → **Database**
2. **Connection string** секциясы:
   - **Transaction** (pooler, 6543 порт) → `DATABASE_URL` үшін
   - **Direct** (5432 порт) → `DIRECT_URL` үшін
3. "URI" батырмасын басыңыз, мәндерді көшіріңіз

**Мысал формат:**
```
DATABASE_URL="postgresql://postgres.abcdefgh:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.abcdefgh.supabase.co:5432/postgres"
```

> 💡 **Маңызды:** `?pgbouncer=true` параметрі Prisma-ның Supabase Pooler-мен үйлесімді жұмыс істеуі үшін қажет.

### 1.3 Кестелерді жасау (Prisma db push)
Жергілікті терминалда:
```bash
# .env файлын уақытша Supabase-ке ауыстырыңыз
DATABASE_URL="postgresql://postgres.XXXXX:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true" \
DIRECT_URL="postgresql://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres" \
npx prisma db push
```

✅ Сәтті орындалса: `Your database is now in sync with your Prisma schema.`

---

## 🔥 2-қадам: Firebase Storage конфигурациясы

### 2.1 Firebase жобасы
1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. **Project name:** `mansurdrama` (немесе өз атыңыз)
3. **Continue** → **Create project**

### 2.2 Storage қосу
1. Сол жақ мәзір → **Storage** → **Get started**
2. **Production mode** таңдаңыз
3. **Next** → аймақ: `europe-west1` (немесе жақын)
4. **Done**

### 2.3 Storage Rules баптау
**Rules** қойындысында мынаны жазыңыз:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;     // public — көрушілер ойната алады
      allow write: if false;   // тек сервер жазады (Admin SDK)
    }
  }
}
```
**Publish** басыңыз.

### 2.4 Service Account кілтін алу
1. ⚙️ **Project Settings** → **Service Accounts** қойындысы
2. **Generate new private key** → **Generate key** → JSON файл жүктеледі
3. JSON-нан мына мәндерді алыңыз:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (толық, `\n` escape-терімен)

**Мысал:**
```
FIREBASE_PROJECT_ID="mansurdrama-xxxxx"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@mansurdrama-xxxxx.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqh...\n-----END PRIVATE KEY-----\n"
```

> ⚠️ **Маңызды:** `private_key`-дегі `\n` escape-терін сақтаңыз! Кодта автоматты replace жасалады.

### 2.5 Web Config (Client)
1. ⚙️ **Project Settings** → **General** → **Your apps** → **</>** (Web)
2. **App nickname:** `mansurdrama-web` → **Register app**
3. Конфигурацияны көшіріңіз:
```
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="mansurdrama-xxxxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="mansurdrama-xxxxx"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="mansurdrama-xxxxx.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef..."
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://mansurdrama-xxxxx-default-rtdb.firebaseio.com"
```

---

## ⚡ 3-қадам: Vercel-де жоба жасау

### 3.1 Import репо
1. [vercel.com](https://vercel.com) → **Add New…** → **Project**
2. **Import** `mansurdrama` репосынан
3. **Framework Preset:** Next.js (автоматты)
4. **Root Directory:** `./` (бос қалдырыңыз)
5. **Build & Output Settings** — өзгертпеңіз (`vercel.json` басқарады)

### 3.2 Environment Variables қосу
**Environment Variables** бөлімінде мынаны қосыңыз:

| Variable | Мән | Орта |
|----------|-----|------|
| `DATABASE_URL` | Supabase pooler URL | Production, Preview, Development |
| `DIRECT_URL` | Supabase direct URL | Production, Preview, Development |
| `ADMIN_PASSWORD` | күшті пароль | Production |
| `JWT_SECRET` | 32+ символ кездейсоқ | Production, Preview |
| `NEXTAUTH_SECRET` | 32+ символ кездейсоқ | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://mansurdrama.vercel.app` | Production |
| `NEXT_PUBLIC_SITE_NAME` | `Mansur Drama` | Production |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Firebase web | Production, Preview, Development |
| `FIREBASE_PROJECT_ID` | Service account | Production |
| `FIREBASE_CLIENT_EMAIL` | Service account | Production |
| `FIREBASE_PRIVATE_KEY` | Service account (\\n escape-терімен) | Production |
| `FIREBASE_STORAGE_BUCKET` | `<projectId>.appspot.com` | Production |

> 💡 **Құпия кілт генерациялау:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3.3 Deploy
1. **Deploy** басыңыз
2. Vercel автоматты:
   - `npm install` іске қосады
   - `prisma generate && next build` (vercel.json арқылы)
3. ⏱️ 2-3 минут күтіңіз
4. ✅ **Success!** — production URL дайын

---

## 🌐 4-қадам: Домен қосу (міндетті емес)

### Тегтік Vercel домені
`mansurdrama.vercel.app` — автоматты беріледі, жұмыс істейді.

### Өз доменіңіз (мысалы `mansurdrama.kz`)
1. Vercel Dashboard → **Settings** → **Domains**
2. `mansurdrama.kz` енгізіңіз → **Add**
3. DNS провайдеріңізде (мысалы Hoster.kz) мына жазбаларды қосыңыз:
   - **A** record: `@` → `76.76.21.21`
   - **CNAME** record: `www` → `cname.vercel-dns.com`
4. ⏱️ DNS таралуы 5-30 минут
5. **NEXT_PUBLIC_SITE_URL**-ды жаңартып, **Redeploy**

---

## ✅ 5-қадам: Деплойдан кейінгі тексерулер

### Чек-парақ
- [ ] **/api/dramas** — дорамалар API жауап береді
- [ ] **/admin/login** — админ кіру беті ашылады
- [ ] **ADMIN_PASSWORD** арқылы кіру жұмыс істейді
- [ ] Админ-панельден жаңа дорама қосу — Firebase-ке файл жүктеледі
- [ ] `/drama/[slug]` — постер Firebase URL-нан көрінеді
- [ ] Видео ойнайды (Firebase Storage public URL)

### Логтарды қарау
Vercel Dashboard → **Deployments** → соңғы деплой → **Logs**

---

## 🐛 Жиі кездесетін қателіктер

### 1. `P1001: Can't reach database server`
**Себебі:** Supabase URL қате немесе IP рұқсат етілмеген.
**Шешім:**
- Connection string дұрыстығын тексеріңіз
- `?pgbouncer=true` параметрі бар ма?
- Supabase Dashboard → **Settings** → **Database** → **Connection Pooling** қосылған ба?

### 2. `Error: FIREBASE_PRIVATE_KEY is invalid`
**Себебі:** Vercel-де `\n` escape-тері бұзылған.
**Шешім:**
Vercel Environment Variables-та:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```
Егер `\n` жұмыс істемесе, `lib/firebase-storage.ts`-та мынаны қосыңыз:
```typescript
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
```

### 3. `Build failed: prisma generate not found`
**Себебі:** `postinstall` скрипт жойылған, бірақ build-та керек.
**Шешім:** `vercel.json`-да `"buildCommand": "prisma generate && next build"` — біз қойдық ✅

### 4. Админ кіру жұмыс істемейді
**Себебі:** Cookie `secure: true` болғандықтан HTTP-де жіберілмейді.
**Шешім:** Vercel-де әрқашан HTTPS, бұл проблема болмауы керек. Cookie өшіп, қайта кіріңіз.

### 5. Файл жүктеу қатесі `Vercel-де локалды файлдық жүйе жұмыс істемейді`
**Себебі:** Firebase конфигурациясы жоқ немесе қате.
**Шешім:**
- Барлық `FIREBASE_*` айнымалылар Vercel-де бар ма?
- `FIREBASE_STORAGE_BUCKET` = `<projectId>.appspot.com`
- Service Account кілті дұрыс па?

### 6. Supabase SSL қатесі
**Себебі:** `sslmode` параметрі жоқ.
**Шешім:** Supabase URL-дері әдепкі `?sslmode=require` болуы керек, бірақ pooler URL-ге `?pgbouncer=true` қосыңыз.

---

## 📊 Деплойдан кейінгі мониторинг

### Vercel Analytics
Vercel Dashboard → **Analytics** — нақты уақыттағы трафик, Core Web Vitals.

### Supabase Logs
Supabase Dashboard → **Logs** → **Postgres Logs** — SQL сұраулар, қателіктер.

### Firebase Storage Usage
Firebase Console → **Storage** → **Files** — жүктелген файлдар, көлемі.

---

## 🔄 Қайта деплой (Redeploy)

Әр `git push` кезінде Vercel автоматты жаңа деплой жасайды:
```bash
git add .
git commit -m "feat: жаңа мүмкіндік"
git push origin main
```

Қолмен:
- Vercel Dashboard → **Deployments** → **Redeploy**

---

## 💾 Алғашқы деректерді енгізу

Деплойдан кейін бірінші админге кіріп, мынаны жасаңыз:
1. `/admin/login` → `ADMIN_PASSWORD` енгізіңіз
2. **Дорамалар** → **Жаңа дорама қосу**
3. Постер жүктеңіз (Firebase-ке барады)
4. Эпизодтар қосыңыз (видео URL — Firebase-тен public URL)

---

## 🆘 Қолдау

Мәселе туындаса:
1. Vercel build логтарын тексеріңіз
2. Supabase Logs-ты қараңыз
3. Vercel **Functions** → **Logs** (runtime қателіктер)
4. GitHub Issues-та issue ашыңыз

---

**🎬 Сәтті деплой!**
