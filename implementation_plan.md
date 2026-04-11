# 🚀 Generous Fund Tracker — Mobile App Implementation Plan
## Transparent Fund Tracker | Bento Grid UI 2026 | Expo Router + Supabase

---

## 📊 Pemahaman Awal (Analisis Kondisi Sekarang)

### Kondisi Project Saat Ini
Project sudah dalam tahap scaffolding awal dengan Expo Router default. Sudah ada:
- `lib/supabaseConfig.ts` — Supabase client setup (tapi `.env` masih kosong!)
- `lib/databases/` — SQL schema, relasi, dan policy sudah terdefinisi
- `constants/theme.ts` — Hanya warna default Expo (belum di-customize)
- `app/(tabs)/` — Hanya ada `index.tsx` dan `explore.tsx` default template

### Analisis Database Schema (Supabase)
| Table | Kolom Kunci | Fungsi |
|---|---|---|
| `donations` | `id`, `donator_name`, `amount`, `message`, `created_at` | Menyimpan semua donasi masuk |
| `expenses` | `id`, `admin_id`, `amount`, `category`, `description`, `receipt_url`, `created_at` | Pengeluaran per kategori + bukti foto |
| `fund_summary` | `id`, `category`, `total_spent`, `percentage_of_total`, `last_updated` | Summary otomatis per kategori (untuk caching) |
| `profiles` | `id`, `full_name`, `role` | User admin vs donatur |

**Kategori Expenses yang valid:** `Logistik`, `Operasional`, `Kesehatan`, `Edukasi`, `Lainnya`

### Agentic Logic Flow
```
[Realtime Supabase Subscription]
         ↓
[useFundTracker Hook] → Subscribe ke 'expenses' + 'donations'
         ↓
[Auto Calculate]
  - Total semua donasi
  - Total per kategori
  - Persentase = (Total Kategori / Total Donasi) × 100%
         ↓
[Push ke State] → Trigger re-render UI → Update Chart & Cards
```

---

## ⚠️ User Review Required

> [!IMPORTANT]
> **`.env` File Masih KOSONG!** Perlu diisi dengan credentials Supabase sebelum app bisa jalan.
> Saya akan membuat file `.env` dengan data yang sudah kamu berikan, tapi tolong konfirmasi apakah ini aman untuk di-commit ke git.

> [!WARNING]
> **Packages baru yang perlu di-install:**
> - `nativewind` (Tailwind CSS untuk React Native)
> - `tailwindcss`
> - `expo-camera` (untuk foto struk)
> - `expo-image-picker` (alternatif/backup kamera)
> - `lucide-react-native` (icons)
> - `react-native-gifted-charts` (pie chart)
> - `expo-file-system` (upload receipt ke Supabase Storage)
>
> **NativeWind** memerlukan konfigurasi tambahan di `babel.config.js` dan `tailwind.config.js`.

> [!CAUTION]
> **OCR Receipt (Kamera):** Saya rekomendasikan menggunakan **OCR.space API** (free, tanpa perlu Google Cloud billing). Ini lebih simpel dan cocok untuk tugas kuliah. Nanti saya buatkan service tersendiri untuk hit API ini.

---

## 📁 Proposed Changes (File Structure Baru)

```
mobile-app/
├── .env                          ← [MODIFY] Isi Supabase credentials
├── app.json                      ← [MODIFY] Tambah expo-camera plugin
├── tailwind.config.js            ← [NEW] NativeWind config
├── babel.config.js               ← [NEW] Tambah NativeWind babel plugin
├── global.css                    ← [NEW] NativeWind global styles
│
├── app/
│   ├── _layout.tsx               ← [MODIFY] Wrap dengan FundTrackerProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx           ← [MODIFY] Custom tab bar (icon + warna baru)
│   │   ├── index.tsx             ← [MODIFY] Dashboard Screen (FULL REBUILD)
│   │   ├── transparency.tsx      ← [NEW] Transparency Feed Screen
│   │   └── settings.tsx          ← [NEW] Settings / Profile Screen
│   ├── modal/
│   │   └── add-expense.tsx       ← [NEW] Modal tambah expense
│   └── (auth)/
│       ├── _layout.tsx           ← [NEW] Auth stack layout
│       ├── login.tsx             ← [NEW] Login screen
│       └── register.tsx          ← [NEW] Register screen
│
├── context/
│   └── FundTrackerContext.tsx    ← [NEW] Global context + provider
│
├── hooks/
│   ├── useFundTracker.ts         ← [NEW] 🧠 AGENTIC CORE HOOK
│   ├── useAuth.ts                ← [NEW] Auth hook
│   └── useCamera.ts              ← [NEW] Camera + OCR hook
│
├── services/
│   ├── ocrService.ts             ← [NEW] OCR.space API integration
│   ├── expenseService.ts         ← [NEW] CRUD expenses + upload receipt
│   └── donationService.ts        ← [NEW] CRUD donations
│
├── components/
│   ├── bento/
│   │   ├── HeroCard.tsx          ← [NEW] Total dana card (large)
│   │   ├── ChartCard.tsx         ← [NEW] Pie chart card
│   │   ├── CategoryCard.tsx      ← [NEW] Per-category bento tile
│   │   └── RecentExpenseCard.tsx ← [NEW] Latest 3 expenses
│   ├── ui/
│   │   ├── GlassCard.tsx         ← [NEW] Reusable glassmorphism card
│   │   ├── AgentBadge.tsx        ← [NEW] "Agent Verified" badge
│   │   ├── FAB.tsx               ← [NEW] Floating action button
│   │   └── ProgressBar.tsx       ← [NEW] Animated progress bar
│   ├── feed/
│   │   └── ExpenseItem.tsx       ← [NEW] Expense list item
│   └── camera/
│       └── ReceiptScanner.tsx    ← [NEW] Camera + OCR UI component
│
├── constants/
│   └── theme.ts                  ← [MODIFY] Redesign full palette 2026
│
└── lib/
    └── supabaseConfig.ts         ← (tidak diubah, sudah bagus)
```

---

## 🎨 Design System (2026 Bento + Glassmorphism)

### Color Palette
| Token | Hex | Penggunaan |
|---|---|---|
| `bg-primary` | `#0F172A` | Background utama (Midnight Navy) |
| `bg-secondary` | `#1E293B` | Card background base |
| `accent-emerald` | `#10B981` | Income/Donasi, CTA |
| `accent-blue` | `#3B82F6` | Charts, informasi |
| `accent-electric` | `#6366F1` | Highlight interaktif |
| `glass-border` | `rgba(255,255,255,0.08)` | Border glassmorphism |
| `glass-bg` | `rgba(255,255,255,0.05)` | Background glass card |
| `text-primary` | `#F1F5F9` | Teks utama |
| `text-muted` | `#64748B` | Teks sekunder |

### Category Colors untuk Chart & Cards
| Kategori | Warna Hex |
|---|---|
| Logistik | `#F59E0B` (Amber) |
| Operasional | `#3B82F6` (Blue) |
| Kesehatan | `#EF4444` (Red) |
| Edukasi | `#10B981` (Emerald) |
| Lainnya | `#8B5CF6` (Violet) |

### Bento Grid Layout (Dashboard)
```
┌─────────────────────────────┐
│     HERO CARD (Full Width)  │  ← Total Dana, Real-time update
│     "Rp X.XXX.XXX"          │
├──────────────┬──────────────┤
│ PIE CHART    │ ALOKASI DANA │  ← Chart + ringkasan persentase
│ CARD (60%)   │ CARD (40%)   │
├──────┬───────┴──────┬───────┤
│LOGIS │  OPERASIONAL │KESEHATAN│ ← Category tiles (small)
│ TIK  │              │       │
├──────┴──────────────┴───────┤
│  EDUKASI  │   LAINNYA      │
├─────────────────────────────┤
│   RECENT EXPENSES (Feed)    │  ← 3 terbaru
└─────────────────────────────┘
```

---

## 🔧 Implementation Phases

### Phase 1: Foundation Setup
1. Fill `.env` dengan Supabase credentials
2. Install semua packages baru (NativeWind, Lucide, Chart, Camera, etc.)
3. Configure `tailwind.config.js` + `babel.config.js`
4. Redesign `constants/theme.ts`

### Phase 2: Core Agentic Hook & Context
1. Buat `hooks/useFundTracker.ts` — **Ini jantung aplikasi**
   - Subscribe realtime ke `expenses` dan `donations`
   - Auto-kalkulasi persentase per kategori
   - Expose: `totalDonations`, `totalExpenses`, `categories[]`, `recentExpenses[]`, `isLoading`
2. Buat `context/FundTrackerContext.tsx`
3. Buat `hooks/useAuth.ts`

### Phase 3: Services Layer
1. `services/expenseService.ts` — Create/Read expenses + upload receipt ke Supabase Storage
2. `services/donationService.ts` — Create/Read donations
3. `services/ocrService.ts` — Hit OCR.space API + parse hasil teks (nominal & tanggal)

### Phase 4: UI Components
1. `components/ui/GlassCard.tsx` — Reusable glassmorphism container
2. `components/ui/ProgressBar.tsx` — Animated dengan `react-native-reanimated`
3. `components/ui/FAB.tsx` — Floating Action Button
4. `components/ui/AgentBadge.tsx` — "🤖 Agent Verified" badge
5. `components/bento/*` — Semua Bento cards

### Phase 5: Screens
1. `app/(auth)/login.tsx` + `register.tsx`
2. `app/(tabs)/index.tsx` — **Dashboard (Bento Grid)**
3. `app/(tabs)/transparency.tsx` — **Transparency Feed**
4. `app/(tabs)/settings.tsx`
5. `app/modal/add-expense.tsx` — Form + Kamera + OCR

### Phase 6: Navigation & Polish
1. Custom tab bar dengan warna Midnight Navy
2. AnimatedProgressBar saat data berubah
3. Realtime badge counter
4. Micro-animations (Fade-in bento cards)

---

## 🧠 useFundTracker Hook — Spesifikasi Detail

```typescript
type CategorySummary = {
  name: 'Logistik' | 'Operasional' | 'Kesehatan' | 'Edukasi' | 'Lainnya';
  total: number;
  percentage: number;
  color: string;
};

type FundTrackerState = {
  totalDonations: number;
  totalExpenses: number;
  remainingFunds: number;
  usagePercentage: number;
  categories: CategorySummary[];
  recentExpenses: Expense[];
  recentDonations: Donation[];
  isLoading: boolean;
  lastUpdated: Date | null;
};
```

**Agentic Realtime Flow:**
```
supabase.channel('fund-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, handleChange)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, handleChange)
  .subscribe()
```

---

## 📷 Camera + OCR Flow

```
1. User tap FAB "Tambah Pengeluaran"
2. Modal terbuka → User foto struk
3. [expo-camera] ambil gambar → base64
4. [ocrService] kirim ke OCR.space API
5. API return teks → parse dengan regex (cari nominal + tanggal)
6. [Auto-fill form] nominal & tanggal terisi otomatis
7. User isi kategori + deskripsi → Submit
8. [expenseService] upload foto ke Supabase Storage → dapat URL
9. Insert ke tabel expenses dengan receipt_url
10. [useFundTracker] detect perubahan → recalculate → update UI
```

---

## ✅ Verification Plan

### Automated / In-App Testing
- Cek realtime subscription aktif (add expense → chart langsung update)
- Cek OCR auto-fill (foto struk → form terisi)
- Cek progress bar animation saat data berubah

### Manual Verification
- Run `expo start` dan test di Expo Go (Android/iOS)
- Screenshot bento grid UI
- Tambah dummy donation + expense → verifikasi perhitungan persentase
- Test kamera + OCR dengan foto struk asli

---

## ❓ Open Questions

> [!IMPORTANT]
> **Q1: Apakah project ini perlu sistem Auth (login/register)?**
> Database sudah ada tabel `profiles` dengan role `admin` vs `donatur`. Kalau pakai auth:
> - Admin = bisa tambah expense
> - Donatur = hanya bisa lihat dashboard
>
> Atau untuk simplifikasi tugas kuliah, **tanpa auth dulu**, langsung bisa CRUD?

> [!IMPORTANT]
> **Q2: OCR API Key**
> Untuk OCR.space API, perlu daftar di https://ocr.space/ocrapi dan ambil API key gratis.
> Sudah punya, atau saya perlu kasih instruksi cara daftarnya?

> [!IMPORTANT]
> **Q3: Supabase Storage**
> Untuk upload foto struk, perlu ada bucket di Supabase Storage (misal: `receipts`).
> Sudah dibuat bucketnya, atau perlu dibuatkan SQL migration-nya juga?

> [!WARNING]
> **Q4: NativeWind vs StyleSheet**
> NativeWind (Tailwind) memerlukan konfigurasi babel yang cukup kompleks di Expo SDK 54.
> Apakah mau pakai **NativeWind** atau lebih simple pakai **StyleSheet** dengan design tokens custom?
> Rekomendasi saya: **StyleSheet + custom design tokens** (lebih stable di Expo SDK 54 & React Native 0.81).
