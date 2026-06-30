 # Sistem Manajemen Laundry Hybrid

Aplikasi manajemen laundry hibrid (Kiloan & Koin) berbasis mobile app dan web.  
**Kelompok 5 — RPL 2026**

## Struktur Monorepo

```
laundry-system/
├── backend/            # REST API — Node.js + Express + PostgreSQL
├── frontend/
│   ├── mobile/         # Mobile app Customer — React Native + Expo
│   ├── web/            # Web dashboard Kasir/Admin/Owner (akan dibuat)
│   └── public/         # Aset statis bersama (logo, ikon, dll)
├── database/           # Schema & migration SQL — PostgreSQL
└── docs/               # Dokumen SRS, spesifikasi API
```

## Cara Menjalankan

### 1. Database

```bash
createdb laundry_db
psql -U postgres -d laundry_system -f database/schema.sql
psql -U postgres -d laundry_system -f database/seeds/001_dev_seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # isi variabel sesuai environment lokal
npm install
npm run dev            # berjalan di http://localhost:3000
```

### 3. Mobile

```bash
cd frontend/mobile
npm install
npm start              # buka di Expo Go (scan QR)
```

### 4. Web Dashboard (akan dibuat)

```bash
cd frontend/web
npm install
npm run dev            # berjalan di http://localhost:3001
```

## Pembagian Tugas Tim

| Bagian | Direktori | Penanggung jawab |
|--------|-----------|-----------------|
| Backend API | `backend/` | — |
| Mobile App | `frontend/mobile/` | — |
| Web Dashboard | `frontend/web/` | — |
| Database | `database/` | — |

## Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Mobile | React Native + Expo SDK 56 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 15 |
| Auth | JWT + bcrypt |
