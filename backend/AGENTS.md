# Backend — Konteks AI

Kamu bekerja di direktori `backend/` milik **Tim Backend**.

## Batas Direktori

- ✅ BOLEH edit: semua file di dalam `backend/`
- ❌ JANGAN edit: `frontend/`, `database/`, `docs/`
- ⚠️ Kalau perlu ubah schema database, diskusikan dulu dengan tim sebelum mengubah `database/schema.sql`

## Stack

- Node.js + Express.js
- PostgreSQL (via `pg` library)
- JWT (`jsonwebtoken`) + bcrypt untuk auth
- helmet, cors, express-rate-limit untuk security

## Struktur Kode

```
backend/src/
├── index.js                    # Entry point, setup Express
├── modules/                    # Fitur dikelompokkan per domain
│   ├── auth/                   # Login, register, JWT
│   ├── booking/                # CRUD booking
│   ├── laundry-service/        # Data layanan (kiloan/koin)
│   ├── transaction/            # Proses pembayaran
│   ├── user-management/        # Kelola karyawan (admin only)
│   └── report/                 # Laporan keuangan (owner only)
└── shared/
    ├── database/db.js          # PostgreSQL pool connection
    ├── middlewares/            # auth.middleware.js, error.middleware.js
    ├── constants/              # ROLES, BOOKING_STATUS
    └── utils/                  # hashPassword, comparePassword
```

Setiap modul punya subfolder: `routes/` → `controllers/` → `services/` → `repositories/`

## Konvensi

- Semua response: `{ status, data, message }`
- Error dilempar ke `next(err)`, ditangkap `error.middleware.js`
- Auth endpoint: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`
- Middleware `protect` untuk endpoint yang butuh login, `restrictTo(role)` untuk role tertentu

## Environment Variables

Lihat `.env.example` untuk daftar variabel yang dibutuhkan.
