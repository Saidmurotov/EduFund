# EduFund AI v2 — Yangi Tasklar va Claude Promptlari

> Mavjud `c:\Users\sulay\edufund-ai` loyihasiga qo'shimchalar.
> Har bir promptni Claude.ai ga yuboring, natija chiqsa keyingiga o'ting.

---

## 📋 YANGI TASKLAR RO'YXATI

| # | Task | Fayl | Muhimlik |
|---|------|------|----------|
| A.1 | Onboarding qayta yozish (4 bosqich + yangi dizayn) | Onboarding.jsx | 🔴 Yuqori |
| A.2 | Kategoriyalar kengaytirish (konferensiya, stajirovka) | Backend + Frontend | 🔴 Yuqori |
| A.3 | Target Countries (priority tanlash) | Onboarding.jsx | 🔴 Yuqori |
| B.1 | Smart Calendar (grant deadline planner) | GrantCalendar.jsx | 🔴 Yuqori |
| B.2 | Push Notifications tizimi | Backend + Frontend | 🟡 O'rta |
| C.1 | Admin Statistika sahifasi (viloyatlar xaritasi) | AdminStats.jsx | 🟡 O'rta |
| D.1 | Login / Register sahifasi (yangi dizayn) | Login.jsx, Register.jsx | 🔴 Yuqori |
| D.2 | Search / Filter sahifasi | Search.jsx | 🟡 O'rta |
| D.3 | Profile sahifasi | Profile.jsx | 🟡 O'rta |
| D.4 | Saved Grants sahifasi | Saved.jsx | 🟡 O'rta |
| D.5 | Premium obuna sahifasi | Premium.jsx | 🟢 Past |

---

## 🗂️ A-BLOK: ONBOARDING YANGILASH

---

### TASK A.1 — Onboarding Qayta Yozish (4 bosqich, yangi dizayn + keng ma'lumot yig'ish)

**Fayl:** `src/pages/Onboarding.jsx`

**Prompt:**
```
Mavjud EduFund AI loyihasidagi src/pages/Onboarding.jsx faylini to'liq qayta yoz.

DIZAYN: Light mode — background: #F0F2F5, accent: #3D3DC4, oq kartalar.

BOSQICH INDIKATORI (tepada):
- 4 ta doira raqamli: 1, 2, 3, 4
- Bajarilgan: to'liq ko'k doira + ✓ checkmark
- Joriy: ko'k border + raqam (bold)
- Kelasi: kulrang doira + raqam
- O'ng tomonda: "🌐 EN" til tugmasi (hozircha faqat ko'rinish)
- Pastda: "CONTINUE →" ko'k tugma + "Back" matn tugmasi

---

BOSQICH 1 — "Personal Info":
- To'liq ism (text input)
- Yosh (number input, 14-60 oraliq)
- Jinsi: Erkak / Ayol (2 ta pill tanlash)
- Viloyat (dropdown):
  Toshkent shahri, Toshkent viloyati, Andijon, Buxoro, Farg'ona,
  Jizzax, Qashqadaryo, Xorazm, Namangan, Navoiy, Samarqand,
  Sirdaryo, Surxondaryo, Qoraqalpog'iston, Xorijda yashayman

---

BOSQICH 2 — "Education & Field":

EDUCATION LEVEL (bitta tanlanadi, pill-shaped):
- High School | Bachelor | Master | PhD (2x2 grid)
- Tanlangan: ko'k border + ko'k matn

FIELD OF STUDY (ko'p tanlanadi, pill-shaped):
- IT & CS | Business | Engineering | Medical | Arts | Law | Economics | Education | Other
- Tanlangan: ko'k border + ko'k matn

---

BOSQICH 3 — "Academic & Test Scores":

Sarlavha: "Your Academic Profile"
Subtitle: "Bu ma'lumotlar sizga mos grantlarni topishda yordam beradi"

Inputlar (hamma ixtiyoriy, lekin tavsiya etiladigan):
- GPA (0.0 - 4.0 yoki 0-100): range slider + number input, 2 variant: "4.0 sistema" / "100 sistema" toggle
- IELTS (0.0 - 9.0): number input, "Hali topshirmaganman" checkbox
- TOEFL (0 - 120): number input, "Hali topshirmaganman" checkbox
- SAT (400 - 1600): number input, "Topshirmaganman" checkbox
- GRE (260 - 340): number input, "Topshirmaganman" checkbox
- GMAT (200 - 800): number input, "Topshirmaganman" checkbox
- Til darajasi (dropdown): A1, A2, B1, B2, C1, C2 — "Qaysi til?" (ingliz/nemis/koreys/boshqa)

Info box: "💡 Ko'proq ma'lumot = Ko'proq mos grantlar"

---

BOSQICH 4 — "Main Goals & Target Countries":

QISM 1 — "What are you looking for?" (ko'p tanlanadi, vertikal kartalar, icon bilan):
- 🎓 Full Grant (shield icon)
- 💼 Internship (briefcase icon)
- 🌐 Learn Language (globe icon)
- 🤝 Networking (users icon)
- 🏆 Conference (award icon)  ← YANGI
- 🔬 Research (microscope icon)  ← YANGI
- 📋 Stajirovka (clipboard icon)  ← YANGI
- 🎯 Exchange Program (arrows icon)  ← YANGI

QISM 2 — "Target Countries" (2x2 grid, katta kartalar, globe icon):
- USA 🇺🇸 | Germany 🇩🇪 | UK 🇬🇧 | South Korea 🇰🇷
- Turkey 🇹🇷 | China 🇨🇳 | Japan 🇯🇵 | France 🇫🇷
- Austria 🇦🇹 | Canada 🇨🇦 | Australia 🇦🇺 | Other 🌍
- Ko'p tanlanadi, tanlangan: ko'k border + yengil ko'k background
- Oxirgi tugma: "FINISH →"

---

TEXNIK TALABLAR:
- useState: currentStep (1-4), formData (barcha maydonlar)
- Firestore: onboarding tugaganda users/{userId}/preferences ga yozilsin:
  {
    name, age, gender, region,
    degree, fields,
    gpa, gpaSystem, ielts, toefl, sat, gre, gmat,
    languageLevel, languageType,
    goals, targetCountries
  }
- Oxirida /dashboard ga navigate
- useAuth() dan user olinsin
- Animatsiya: bosqichlar orasida fade transition

DIZAYN RENGLARI:
- Background: #F0F2F5
- Card: #FFFFFF, border-radius: 16px, shadow: sm
- Accent/selected: #3D3DC4
- Text primary: #1A1A2E
- Text muted: #9CA3AF
- Button: #3D3DC4 background, oq matn, border-radius: 12px

Faqat to'liq ishlaydigan kod yoz.
```

---

### TASK A.2 — Backend Kategoriyalar Kengaytirish

**Fayl:** `server/src/controllers/grants.controller.js` va Firestore seed

**Prompt:**
```
EduFund AI backend'ida grant kategoriyalarini kengaytir.

1. server/src/controllers/grants.controller.js da GET /api/grants filtering'ini yangilash kerak.
Yangi "type" qiymatlari qo'shilsin:
Eski: grant | scholarship | internship | exchange
Yangi: grant | scholarship | internship | exchange | conference | research | stajirovka | language_program

2. server/scripts/seedGrants.js ga 8 ta yangi grant qo'sh (turli kategoriyalar):
- 2 ta conference (xalqaro konferensiyalar, travel grant bilan)
- 2 ta research (research fellowship)
- 2 ta stajirovka (amaliyot dasturlari)
- 2 ta language_program (til o'rganish dasturlari)

Har bir grant strukturasi:
{
  opportunityId: "grant_021" ... "grant_028",
  title: "...",
  type: "conference" | "research" | "stajirovka" | "language_program",
  country: "...",
  organization: "...",
  degree: ["bachelor", "master", "phd"],
  field: ["All Fields"] yoki aniq soha,
  fundingType: "full" | "partial" | "stipend",
  amount: "...",
  language: "...",
  minGPA: 0.0,
  minIELTS: 0.0,
  deadline: "2025-XX-XX",
  trustScore: 85-98,
  verificationStatus: "verified",
  sourceUrl: "https://...",
  description: "...",
  embedding: [],
  createdAt: new Date()
}

3. src/pages/Search.jsx da filter'ga yangi kategoriyalar qo'sh:
Grant type filter'ga quyidagilarni qo'sh:
"Conference", "Research", "Stajirovka", "Language Program"

4. Grant kartalarida type badge'lar yangilansin:
- conference → 🏆 sariq badge
- research → 🔬 to'q yashil badge
- stajirovka → 📋 to'q sariq badge
- language_program → 🌐 to'q binafsha badge

Faqat to'liq ishlaydigan kod yoz.
```

---

### TASK A.3 — Dashboard'da Priority Countries Filtri

**Fayl:** `src/pages/Dashboard.jsx`, `server/src/controllers/grants.controller.js`

**Prompt:**
```
EduFund AI'da foydalanuvchi onboarding'da tanlagan targetCountries asosida
Dashboard va grant matching'ni yangilash kerak.

1. server/src/controllers/grants.controller.js — GET /api/grants/match/:userId:

Joriy logika: preferences bo'yicha oddiy filter.
Yangi logika — 2 qatlamli natija:

const userPrefs = await getUserPreferences(userId);
const { targetCountries, goals, degree, fields } = userPrefs;

// 1. Prioritet: foydalanuvchi tanlagan davlatlar
const priorityGrants = grants.filter(g =>
  targetCountries.includes(g.country)
).map(g => ({ ...g, isPriority: true }));

// 2. Qolgan davlatlar
const otherGrants = grants.filter(g =>
  !targetCountries.includes(g.country)
).map(g => ({ ...g, isPriority: false }));

// Birlashtirib qaytarish
return [...priorityGrants, ...otherGrants];

Match % hisoblash (murakkablashtir):
- Davlat mos: +30%
- Daraja mos: +25%
- Soha mos: +20%
- GPA yetarli: +15%
- IELTS yetarli: +10%

2. src/pages/Dashboard.jsx — GrantList komponentida:
- Prioritet grantlar tepada ko'rsatilsin
- Prioritet grantlar kartasida: "🎯 Your Priority" yashil chip qo'sh
- "Best Matches For You" bo'limidan keyin agar prioritet grantlar bo'lsa
  alohida "🌍 Your Target Countries" sarlavhasi chiqsin

3. src/components/dashboard/GrantCard.jsx:
- isPriority === true bo'lsa kartada yashil "🎯 Priority" badge qo'sh (yuqori o'ng)

Faqat to'liq ishlaydigan kod yoz.
```

---

## 🗂️ B-BLOK: SMART CALENDAR VA NOTIFICATIONS

---

### TASK B.1 — Smart Grant Calendar (Deadline Planner)

**Yangi fayl:** `src/pages/GrantCalendar.jsx`
**Backend:** `server/src/routes/calendar.routes.js`

**Prompt:**
```
EduFund AI loyihasiga Smart Calendar funksiyasini qo'sh.

FUNKSIONALLIK:
Foydalanuvchi biror grantni "Apply" qilmoqchi bo'lganda Grant Detail sahifasida
"Plan My Application" tugmasi chiqsin. Bosilganda modal ochilsin.

---

MODAL — "Application Planner":

1. Sarlavha: "Plan Your Application — {grantTitle}"

2. "When do you want to start?" — date picker (bugundan boshlab)

3. Grant deadline ko'rsatiladi: "Deadline: March 15, 2025"

4. Oradagi kunlar hisoblanadi va AI yordamida bosqichlarga bo'linadi

5. "Generate My Plan" tugmasi bosilganda:
   POST /api/calendar/generate ga yuborilsin:
   { userId, grantId, startDate, deadline, grantRequirements }

6. Backend Gemini'ga quyidagi prompt yuborsin:
"Talaba {startDate} dan boshlab {deadline} gacha {grantTitle} uchun ariza tayyorlamoqchi.
Grant talablari: {requirements}
Taxminiy tayyorgarlik bosqichlarini JSON formatda chiqar:
{
  steps: [
    {
      id: 1,
      title: 'IELTS tayyorgarlik',
      description: '...',
      startDate: 'YYYY-MM-DD',
      endDate: 'YYYY-MM-DD',
      category: 'exam' | 'document' | 'writing' | 'submission',
      priority: 'high' | 'medium' | 'low'
    }
  ]
}
Faqat JSON qaytargin."

7. Natija ekranda mini-calendar ko'rinishida chiqsin:
   - Har bir bosqich rangli card sifatida
   - exam → ko'k
   - document → yashil
   - writing → to'q sariq
   - submission → qizil

8. "Save Plan" tugmasi:
   Firestore'da userCalendars/{userId}/plans/{grantId} ga saqlansin

---

CALENDAR SAHIFASI — src/pages/GrantCalendar.jsx:

Route: /calendar
BottomNav'ga "Calendar" tab qo'sh (yoki Profile joyini o'zgartir)

Sahifa tarkibi:
- Tepa: "My Application Plans" sarlavha
- Agar plan yo'q: "Hali hech qanday reja yo'q" + "Browse Grants" tugmasi
- Har bir plan uchun karta:
  - Grant nomi + davlat
  - Progress bar: bajarilgan bosqichlar / jami
  - Keyingi deadline: "📅 Next: Write Motivation Letter — 5 kun qoldi"
  - Qizil: 3 kundan kam, sariq: 7 kundan kam, yashil: ko'proq
  - "View Plan" tugmasi — to'liq bosqichlar ro'yxatini ochadi

PLAN DETAIL:
- Vertikal timeline (Roadmap.jsx ga o'xshash)
- Har bir bosqich: sana, sarlavha, tavsif, status checkbox
- Checkbox bosilganda Firestore'da step.completed = true
- Completed bosqichlar kulrang + strikethrough

---

TEXNIK:
- src/routes/calendar.routes.js: POST /api/calendar/generate
- src/controllers/calendar.controller.js: Gemini call + JSON parse
- Firestore: userCalendars/{userId}/plans/{grantId}
- useAuth() dan user

Faqat to'liq ishlaydigan kod yoz.
```

---

### TASK B.2 — Notifications Tizimi

**Fayl:** `src/context/NotificationContext.jsx`, `server/src/routes/notifications.routes.js`

**Prompt:**
```
EduFund AI loyihasiga notification (eslatma) tizimini qo'sh.

QISM 1 — Frontend In-App Notifications:

1. src/context/NotificationContext.jsx:
- notifications array (Firestore'dan real-time o'qiladi)
- markAsRead(notifId) funksiyasi
- unreadCount computed value

2. src/components/layout/NotificationBell.jsx:
- Bell icon (lucide-react)
- Unread count badge (qizil doira, raqam)
- Bosilganda dropdown: oxirgi 10 ta notifikatsiya
- Har biri: icon + matn + sana + "Ko'rish" link
- "Hammasini o'qildi deb belgilash" tugmasi

3. Dashboard GreetingHeader'da NotificationBell qo'sh

---

QISM 2 — Avtomatik Eslatmalar:

server/src/jobs/notificationJob.js faylini yarat:

Kuniga bir marta ishlaydigan job (node-cron: har kuni 09:00):

// 1. Barcha userCalendars'ni ko'r
// 2. Har bir plan'dagi bosqichlarni tekshir
// 3. Agar step.endDate = bugun + 3 kun bo'lsa notification yaratilsin

Firestore'da notifications/{userId}/items/{notifId} ga yoz:
{
  notifId,
  type: 'deadline_reminder',
  title: '⏰ Deadline yaqinlashdi!',
  body: '{stepTitle} uchun {X} kun qoldi',
  grantId,
  stepId,
  isRead: false,
  createdAt
}

4. server/src/index.js ga notificationJob import qil va ishga tushir

---

QISM 3 — Grant Deadline Reminders:

Agar foydalanuvchi grantni savedGrants'ga saqlagan bo'lsa va
grant.deadline dan 7 kun qolsa — avtomatik notification yaratilsin:

{
  type: 'grant_deadline',
  title: '📅 Grant muddati yaqinlashmoqda',
  body: '{grantTitle} ariza topshirish muddati {X} kun ichida tugaydi',
  grantId,
  isRead: false
}

Kutubxona: node-cron

Faqat to'liq ishlaydigan kod yoz.
```

---

## 🗂️ C-BLOK: ADMIN STATISTIKA

---

### TASK C.1 — Admin Statistika Sahifasi (Viloyatlar Xaritasi + Grafik)

**Yangi fayl:** `src/pages/AdminStats.jsx`

**Prompt:**
```
EduFund AI loyihasiga Admin Statistika sahifasini qo'sh.

Route: /admin/stats
Faqat role === "admin" bo'lgan userlar kirishi mumkin (ProtectedRoute yangilansin).

---

SAHIFA TARKIBI:

QISM 1 — "Umumiy statistika" sarlavha

Stat kartalar (2x2 grid, oq kartalar, border-radius: 12px):
- "Umumiy foydalanuvchilar" — Firestore'dan users count
- "40 yoshgacha bo'lgan foydalanuvchilar" — preferences.age <= 40 count
- "Erkak foydalanuvchilar" — gender === 'male' count
- "Ayol foydalanuvchilar" — gender === 'female' count
- "Ilmiy darajaga ega" — degree === 'master' || 'phd' count
- "Ilmiy unvonga ega" — degree === 'phd' count

O'ng tomonda Donut Chart (recharts kutubxonasi):
- 4 segment: 40 yoshdan kichik erkaklar (yashil), 40 yoshdan kichik ayollar (qizil), 40 yoshdan katta erkaklar (sariq), 40 yoshdan katta ayollar (ko'k)
- Markazda: "Umumiy foydalanuvchilar" + umumiy son
- Legend o'ng tomonda

---

QISM 2 — "Hududlar bo'yicha ma'lumot" sarlavha

Ikki ustun:
LEFT: O'zbekiston xaritasi SVG
- Har bir viloyat bo'yalgan bo'lsin (foydalanuvchi soni bo'yicha)
- Ko'p foydalanuvchi = to'qroq ko'k rang
- Hover: viloyat nomi + soni tooltip
- O'zbekiston SVG xaritasini quyidagi URL'dan ol:
  (oddiy SVG polygon'lar bilan chiz, 14 viloyat + Toshkent shahri)

RIGHT: "Respublika bo'yicha" ro'yxat (scroll bo'ladi):
- Har bir qator: viloyat nomi + foydalanuvchi soni
- Sort: kamayish tartibida
- Progress bar (kenglik foizda)

---

QISM 3 — "Grant Kategoriyalari" bar chart (recharts):
- X axis: kategoriya nomlari
- Y axis: foydalanuvchi soni
- Bar har xil rangda

QISM 4 — "Oylik o'sish" line chart (recharts):
- Oxirgi 6 oy bo'yicha yangi foydalanuvchilar
- Smooth line, #3D3DC4 rang

---

TEXNIK:
- Ma'lumotlar: Firestore'dan GET /api/admin/stats endpoint
- server/src/routes/admin.routes.js: GET /api/admin/stats
  - verifyToken + isAdmin middleware
  - Firestore'dan aggregatsiya
  - Response: { totalUsers, byGender, byAge, byRegion, byCategory, monthlyGrowth }
- Kutubxona: recharts (npm install recharts)
- Loading skeleton bo'lsin

Faqat to'liq ishlaydigan kod yoz.
```

---

## 🗂️ D-BLOK: QOLGAN SAHIFALAR (YANGI DIZAYN)

---

### TASK D.1 — Login / Register (Yangi Light Dizayn)

**Fayl:** `src/pages/Login.jsx`, `src/pages/Register.jsx`

**Prompt:**
```
EduFund AI Login va Register sahifalarini yangi dizayn bilan qayta yoz.

DIZAYN: Light mode, onboarding bilan bir xil stil.
Background: #F0F2F5
Card: oq, border-radius: 20px, shadow: lg, maksimal kenglik: 420px, markazda

LOGIN SAHIFASI (src/pages/Login.jsx):
- Tepa: EduFund AI logo (gradient matn: #3D3DC4)
- "Xush kelibsiz 👋" sarlavha
- "Hisobingizga kiring" subtitle (kulrang)
- Email input (icon: Mail)
- Password input (icon: Lock, ko'rish/yashirish toggle)
- "Parolni unutdingizmi?" link (o'ng tomonda)
- "Kirish" to'liq kenglikdagi ko'k tugma
- Divider: "yoki"
- "Google bilan kirish" oq tugma (Google icon + matn)
- Pastda: "Hisobingiz yo'qmi? Ro'yxatdan o'ting" link

REGISTER SAHIFASI (src/pages/Register.jsx):
- EduFund AI logo
- "Hisob yarating" sarlavha
- "Bepul ro'yxatdan o'ting" subtitle
- To'liq ism input
- Email input
- Parol input (kuchlilik indikatori: zaiif/o'rta/kuchli)
- Parolni tasdiqlash input
- "Ro'yxatdan o'tish" ko'k tugma
- "Google bilan ro'yxatdan o'tish" oq tugma
- "Allaqachon hisobingiz bormi? Kiring" link

TEXNIK:
- useAuth() dan loginWithEmail, loginWithGoogle, registerWithEmail
- Loading spinner tugmada
- Error toast (useToast)
- Muvaffaqiyatli register'dan keyin → /onboarding
- Muvaffaqiyatli login'dan keyin → /dashboard

Faqat to'liq ishlaydigan kod yoz.
```

---

### TASK D.2 — Search / Filter Sahifasi (Yangi Dizayn)

**Fayl:** `src/pages/Search.jsx`

**Prompt:**
```
EduFund AI Search sahifasini yangi dizayn va kengaytirilgan filter bilan qayta yoz.

DIZAYN: Dark mode saqlangan (#0F172A), lekin yangi filter panel.

LAYOUT:
1. Sticky tepa: search input + filter icon tugmasi
2. Filter panel (filter icon bosilganda slide-down):
   - Yopish "X" tugmasi
   - "Filtrlarni tozalash" link

FILTER QISMLARI:

a) Grant Turi (chip'lar, ko'p tanlash):
   Scholarship | Full Grant | Internship | Exchange |
   Conference | Research | Stajirovka | Language Program

b) Davlat (dropdown, ko'p tanlash):
   Germany, South Korea, USA, UK, Austria, Japan, China, France, Turkey, Canada

c) Ta'lim darajasi (chip'lar):
   High School | Bachelor | Master | PhD

d) Trust Score (range slider): minimum 0-100

e) Moliyalashtirish (chip'lar):
   Full Fund | Partial | Stipend

f) Faqat menimga mos (toggle switch):
   ON bo'lsa: foydalanuvchi preferences'ga mos grantlar

3. Natijalar:
   - "X ta grant topildi" + aktiv filterlar chips (X bilan o'chiriladi)
   - Sort dropdown: Match %, Deadline, Trust Score, Yangi
   - GrantCard ro'yxati

4. Floating "Filtrlash" tugmasi (pastda): filtr ochilmagan holda ham filter count ko'rsatadi

TEXNIK:
- useState: filters, searchQuery, isFilterOpen
- useEffect + debounce (500ms)
- Backend: GET /api/grants?type=&country=&degree=&minTrust=&fundingType=&sort=&myMatch=
- myMatch=true bo'lsa: userId ham yuborilsin, backend foydalanuvchi preferences'ni hisobga olsin

Faqat to'liq ishlaydigan kod yoz.
```

---

### TASK D.3 — Profile Sahifasi (Yangi Dizayn)

**Fayl:** `src/pages/Profile.jsx`

**Prompt:**
```
EduFund AI Profile sahifasini yangi dizayn bilan qayta yoz.

DIZAYN: Dark mode (#0F172A) saqlangan.

TARKIB:

1. HEADER:
- Gradient background (ko'k → to'q ko'k)
- Katta avatar (ism 2 harfi, rangli doira, 80px)
- Ism (katta, oq)
- Email (kichik, muted)
- "Premium" badge (oltin, agar isPremium)
- "Profilni tahrirlash" tugmasi (outline, oq)

2. AKADEMIK KARTA (#1E293B bg):
Sarlavha: "Akademik Ma'lumotlar" + "✏️" tahrirlash icon
Grid (2 ustun):
- 🎓 Daraja: {degree}
- 📚 Soha: {fields join ', '}
- 📊 GPA: {gpa} ({gpaSystem} sistema)
- 🗣️ IELTS: {ielts} (yo'q bo'lsa "—")
- 📝 TOEFL: {toefl} (yo'q bo'lsa "—")
- 📋 SAT: {sat} (yo'q bo'lsa "—")
- 🌍 Maqsad davlatlar: flag emoji + nom chips

3. MAQSADLAR KARTA:
- Tanlangan goals: icon + nom chips

4. STATISTIKA KARTA:
- "X ta grant saqlangan", "X ta ko'rilgan", "X ta reja yaratilgan"

5. PREMIUM KARTA (agar bepul):
- Gradient background (ko'k)
- "🚀 Premium'ga o'ting" sarlavha
- 3 afzallik bullet: Cheksiz AI, To'liq Roadmap, CV tekshirish
- "29,000 so'm/oy — Boshlash" tugmasi → /premium

6. SOZLAMALAR:
- Bildirishnomalar (toggle, Firestore'da update)
- Til (O'zbek / Rus / English)
- "Parolni o'zgartirish" link
- "Hisobdan chiqish" qizil tugma

TAHRIRLASH MODAL:
- GPA, IELTS, TOEFL, SAT inputlar
- Daraja select
- Sohalar multi-select chips
- Maqsad davlatlar multi-select
- "Saqlash" → Firestore update → toast

Faqat to'liq ishlaydigan kod yoz.
```

---

### TASK D.4 — Saved Grants (Yangi Dizayn + Kategoriya)

**Fayl:** `src/pages/Saved.jsx`

**Prompt:**
```
EduFund AI Saved Grants sahifasini yangi xususiyatlar bilan qayta yoz.

YANGI XUSUSIYATLAR:
1. Tab'lar: "Saqlangan" | "Arizalar" | "Rejalar"
   - Saqlangan: savedGrants/{userId}/items
   - Arizalar: placeholder (hozircha bo'sh holat)
   - Rejalar: userCalendars/{userId}/plans

2. SAQLANGAN TAB:
   - Sort: "Saqlangan sana" / "Deadline" / "Match %"
   - Filter chips: Scholarship | Internship | Conference | Research
   - Har bir karta: GrantCard + "Reja tuzish 📅" tugmasi
   - "Reja tuzish" bosilganda GrantCalendar modal ochilsin
   - Bo'sh holat: bookmark icon + "Grant qidirish" tugmasi

3. REJALAR TAB:
   - userCalendars'dan planlar o'qilsin
   - Har bir plan karta:
     - Grant nomi
     - Progress: "3/7 bosqich bajarildi"
     - Keyingi deadline (qizil/sariq/yashil)
     - "Ko'rish" tugmasi → /calendar

TEXNIK:
- useState: activeTab
- Firestore: savedGrants + userCalendars parallel o'qish
- Loading skeleton har tab uchun

Faqat to'liq ishlaydigan kod yoz.
```

---

### TASK D.5 — Premium Obuna Sahifasi

**Yangi fayl:** `src/pages/Premium.jsx`

**Prompt:**
```
EduFund AI uchun Premium obuna sahifasini yoz.

Route: /premium
Fayl: src/pages/Premium.jsx

DIZAYN: Dark mode, gradient accent.

TARKIB:

1. HEADER:
- "🚀 EduFund AI Premium" sarlavha (gradient matn)
- "Grantlar yo'lingizda hech qanday to'siq bo'lmasin" subtitle

2. NARX KARTALAR (2 ta: Oylik | Yillik):
OYLIK karta:
- "29,000 so'm / oy"
- Afzalliklar ro'yxati (✓ bilan)
- "Boshlash" ko'k tugma

YILLIK karta (tavsiya etiladigan, "BEST VALUE" badge):
- "249,000 so'm / yil" (28% tejaymiz)
- Bir xil afzalliklar
- "Boshlash" oltin tugma

Afzalliklar ro'yxati (ikkalasida ham):
✓ Cheksiz AI maslahat (kuniga 5 o'rniga ∞)
✓ To'liq Academic Roadmap (12-18 oylik)
✓ CV va Motivation Letter AI tekshirish
✓ Barcha grant filtrlari (250+ grant)
✓ Smart Calendar va deadline eslatmalari
✓ Priority support

3. FAQ bo'lim (accordion):
- "To'lov qanday amalga oshiriladi?" — Payme/Click
- "Bekor qilsam pul qaytariladi?" — 7 kun ichida to'liq
- "Qachon faollashadi?" — To'lov tasdiqlangandan so'ng darhol

4. "Boshlash" bosilganda:
- Hozircha: alert("Tez kunda! Payme/Click integratsiya qilinmoqda") + toast info
- Firestore'da paymentIntent log yozilsin

Faqat to'liq ishlaydigan kod yoz.
```

---

## ✅ BAJARISH TARTIBI

| Tartib | Task | Sabab |
|--------|------|-------|
| 1 | A.1 Onboarding | Asosiy ma'lumot yig'ish — hammasi shunga bog'liq |
| 2 | A.2 Kategoriyalar | Grant tiplari kengayishi |
| 3 | D.1 Login/Register | Yangi foydalanuvchilar uchun |
| 4 | A.3 Priority Countries | Dashboard matching yaxshilanadi |
| 5 | B.1 Smart Calendar | Eng muhim yangi funksiya |
| 6 | B.2 Notifications | Calendar bilan bog'liq |
| 7 | C.1 Admin Stats | Admin uchun analitika |
| 8 | D.2 Search | Yangi kategoriyalar bilan |
| 9 | D.3 Profile | Yangi preferences bilan |
| 10 | D.4 Saved | Calendar bilan integratsiya |
| 11 | D.5 Premium | Oxirgi bosqich |

---

> 💡 **Eslatma:** A.1 task'dan so'ng backend'da preferences schema yangilanadi.
> Shundan keyin boshqa tasklar yangi maydonlardan foydalana oladi.
> Har bir task bajarilgandan so'ng `npm run dev` bilan tekshirib oling.
