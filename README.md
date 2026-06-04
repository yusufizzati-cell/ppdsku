# PPDS Knowledge Mapper

> AI adaptive quiz builder untuk calon PPDS.

**Upload soal tryout PDF/foto → AI extract soal → review hasil → adaptive IRT quiz → tau gap kamu di mana.**

PPDS Knowledge Mapper membantu calon PPDS mengubah tumpukan soal tryout (PDF, foto, screenshot) menjadi bank soal personal yang langsung bisa dilatih secara adaptif. AI mengekstrak soal otomatis, user mereview & mengoreksi hasilnya, lalu engine IRT memetakan kelemahan belajar per topik.

> Catatan: bank soal Onkologi Radiasi internal tetap tersedia sebagai **demo/onboarding**, bukan lagi pusat produk. Lihat `docs/PROJECT_BRIEF.md` untuk arah produk lengkap.

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand + localStorage (client), Supabase (server)
- **Auth:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Supabase Storage (uploaded soal)
- **AI Extraction:** Gemini Flash + Tesseract OCR fallback (roadmap P2)
- **Payment:** Midtrans QRIS
- **Charts:** Custom SVG radar chart
- **Deploy:** Vercel

## Documentation

Dokumen produk & teknis ada di `docs/`:

```
docs/PROJECT_BRIEF.md       arah produk (baca pertama)
docs/SYSTEM_MAP.md          arsitektur + data model
docs/PRD.md                 kebutuhan produk
docs/IMPLEMENTATION_PLAN.md roadmap pivot (Sprint P0–P9)
docs/API_SPEC.md            kontrak API (termasuk upload/extraction)
docs/UPLOAD_EXTRACTION.md   flow upload & extraction
docs/AI_EXTRACTION_SPEC.md  spesifikasi AI extraction
docs/PAGE_SPECS.md          spesifikasi halaman
docs/DESIGN_SYSTEM.md       design system
docs/TESTING.md             test plan
docs/CHANGELOG.md           catatan perubahan
```

## Getting Started



### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone repository
git clone <repo-url>
cd ppds-knowledge-mapper

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon/public key
MIDTRANS_SERVER_KEY=            # Midtrans server key (for webhook)
MIDTRANS_CLIENT_KEY=            # Midtrans client key
NEXT_PUBLIC_APP_URL=            # App URL (http://localhost:3000 for dev)
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── onkrad/quiz/       # Quiz page (Onkologi Radiasi)
│   ├── onkrad/result/     # Result page
│   ├── auth/              # Login & Register
│   ├── dashboard/         # PRO Dashboard
│   ├── upgrade/           # Pricing/Upgrade page
│   ├── api/               # API routes (payment webhook)
│   └── (specialties)/     # Coming soon specialty pages
├── components/
│   ├── ui/                # Base UI components (Button, Card, Badge)
│   ├── landing/           # Landing page sections
│   ├── quiz/              # Quiz components
│   ├── result/            # Result components
│   ├── dashboard/         # Dashboard shell
│   └── specialty/         # Specialty pages
├── engine/                # IRT adaptive engine
│   ├── irt.ts            # IRT 2PL calculations
│   ├── selector.ts       # Adaptive question selection
│   └── scorer.ts         # Quiz scoring & results
├── store/                 # Zustand stores
│   └── quiz-store.ts     # Quiz state management
└── lib/                   # Utilities
    └── supabase/          # Supabase client helpers

public/
└── data/
    └── onkrad.json        # Demo question bank (Onkologi Radiasi, 790 soal)

supabase/
└── migrations/            # Database schema
    └── 001_initial_schema.sql
```

## Features

### Foundation (Built)

- ✅ Landing page (light medical-edtech SaaS)
- ✅ Adaptive quiz engine (IRT 2PL)
- ✅ Result page dengan radar chart + gap teaser
- ✅ Auth (Supabase) — login/register/logout live
- ✅ Supabase schema + RLS
- ✅ Quiz persistence (sessions, responses, topic abilities)
- ✅ Dashboard backed by real user data
- ✅ Subscription PRO validation (server/database, bukan CSS)
- ✅ Payment scaffolding (pending/success/failed + status API)
- ✅ Demo Onkologi Radiasi (790 soal) sebagai onboarding
- ✅ Mobile responsive

### Pivot Roadmap (Upload-to-Adaptive)

Lihat `docs/IMPLEMENTATION_PLAN.md` untuk detail Sprint P0–P9.

- [x] **P0** — Pivot docs & architecture
- [ ] **P1** — Upload UI + file storage (Supabase Storage)
- [ ] **P2** — AI extraction pipeline (Gemini Flash + OCR fallback)
- [ ] **P3** — Review extracted questions
- [ ] **P4** — Adaptive quiz from uploaded questions
- [ ] **P5** — Gap dashboard from uploaded bank
- [ ] **P6** — Payment + usage limits
- [ ] **P7** — AI tutor per soal
- [ ] **P8** — Share result + referral
- [ ] **P9** — QA, security, polish, growth

## Quiz Engine (IRT 2PL)

Adaptive quiz menggunakan Item Response Theory 2-Parameter Logistic Model. Engine ini **netral sumber soal** — bekerja sama baik untuk demo internal maupun soal hasil upload user (format `QuestionItem` sama):

- **Selection Strategy:** 70% weakest topic, 30% random
- **Target:** P(correct) = 0.6
- **Pool:** Top 5 candidates, random pick
- **Update:** Newton-Raphson ability estimation per answer
- **Rules:** No repeat questions, only scoreable questions (with answer key)

## Database

Supabase PostgreSQL with RLS:

- `profiles` — user data
- `subscriptions` — PRO access (source of truth)
- `quiz_sessions` — quiz history
- `question_responses` — answer log
- `topic_abilities` — persistent mastery per topic
- `payments` — transaction records
- `study_tasks` — learning tasks

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
3. Copy project URL and anon key to `.env.local`
4. Enable Email auth in Authentication settings

## Core Principles

1. Trial 10 soal tanpa login adalah sacred — jangan ubah
2. PRO access harus divalidasi dari database, bukan CSS blur
3. IRT engine tidak boleh diubah tanpa alasan teknis kuat
4. Dashboard harus menjawab: lemah di mana, harus belajar apa
5. UI harus light medical-edtech SaaS, bukan dark game-like

## License

Private — All rights reserved.
