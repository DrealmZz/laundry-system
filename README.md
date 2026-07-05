# Sistem Manajemen Laundry Hybrid

> Aplikasi manajemen laundry hibrid (Kiloan & Koin) berbasis mobile dan web.

Sistem ini mendukung dua jenis layanan utama:
- **Kiloan**: Customer mengirim pakaian, dijemput oleh kurir atau diantar sendiri
- **Koin**: Customer datang ke outlet dan menggunakan mesin cuci sendiri

---

## Fitur Utama

### Customer (Mobile App)
- Registrasi dan autentikasi
- Booking layanan kiloan dan koin
- Pemilihan mesin cuci dan pengering (untuk layanan koin)
- Tracking status cucian secara real-time
- Notifikasi otomatis terkait status pesanan
- Riwayat transaksi

### Kasir (Web Dashboard)
- Proses transaksi pembayaran (cash/transfer/QRIS)
- Cetak struk digital dalam format PDF
- Rekap transaksi harian
- Verifikasi pengambilan cucian

### Admin (Web Dashboard)
- CRUD layanan laundry
- CRUD mesin cuci
- Konfirmasi atau penolakan booking
- Pembaruan status cucian
- Manajemen shift karyawan
- Pengiriman notifikasi ke customer

### Owner (Web Dashboard)
- Dashboard ringkasan bisnis
- Laporan keuangan dengan filter periode
- Export laporan ke format PDF atau Excel
- Monitoring transaksi real-time
- Akses audit log aktivitas sistem

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Mobile | React Native + Expo |
| Web | Vite + React + TypeScript |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Autentikasi | JWT + bcrypt |
| PDF Generation | pdfkit |
| Excel Export | exceljs |
| Email Service | Mailgun |

---

## Struktur Proyek

```
laundry-system/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── user-management/
│       │   ├── laundry-service/
│       │   ├── machine/
│       │   ├── pemesanan/
│       │   ├── transaction/
│       │   ├── shift/
│       │   ├── notification/
│       │   ├── audit/
│       │   └── report/
│       └── shared/
├── frontend/
│   ├── mobile/
│   ├── web/
│   └── public/
├── database/
│   ├── schema.sql
│   ├── migrations/
│   └── seeds/
└── docs/
    ├── api-spec.md
    └── modules/
```

---

## Instalasi

### Prasyarat

- Node.js >= 18
- PostgreSQL >= 16
- npm atau yarn
- Expo CLI (untuk mobile app)

### 1. Database

```bash
createdb laundry_system

psql -U postgres -d laundry_system -f database/schema.sql

psql -U postgres -d laundry_system -f database/migrations/002_add_booking_mesin.sql
psql -U postgres -d laundry_system -f database/migrations/003_add_shifts.sql
psql -U postgres -d laundry_system -f database/migrations/004_add_notifications.sql

psql -U postgres -d laundry_system -f database/seeds/001_dev_seed.sql
```

### 2. Backend

```bash
cd backend
npm install
npm install pdfkit puppeteer exceljs mailgun.js
cp .env.example .env
npm run dev
```

Server berjalan di http://localhost:3000

### 3. Mobile App

```bash
cd frontend/mobile
npm install
npm start
```

Buka menggunakan Expo Go.

### 4. Web Dashboard

```bash
cd frontend/web
npm install
npm run dev
```

Berjalan di http://localhost:5173

---

## Environment Variables

Buat file `.env` di direktori `backend/` dengan konfigurasi berikut:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=laundry_system

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# CORS
CORS_ORIGIN=http://localhost:5173

# Mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

---

## API Documentation

Base URL: `http://localhost:3000/api/v1`

### Contoh Penggunaan

**Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama_lengkap": "John Doe",
    "username": "johndoe",
    "email": "john@email.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "johndoe",
    "password": "password123"
  }'
```

### Daftar Endpoint

| Module | Method | Endpoint | Deskripsi |
|--------|--------|----------|-----------|
| Auth | POST | `/auth/register` | Registrasi customer |
| Auth | POST | `/auth/login` | Login |
| Auth | GET | `/auth/me` | Data user saat ini |
| Auth | POST | `/auth/forgot-password` | Reset password via email |
| Services | GET | `/services` | Daftar layanan |
| Services | POST | `/services` | Tambah layanan (admin) |
| Machines | GET | `/mesin` | Daftar mesin |
| Machines | POST | `/mesin` | Tambah mesin (admin) |
| Machines | PATCH | `/mesin/:id/status` | Ubah status mesin |
| Bookings | GET | `/pemesanan` | Daftar booking |
| Bookings | POST | `/pemesanan` | Buat booking |
| Bookings | PATCH | `/pemesanan/:id/status` | Update status booking |
| Transactions | GET | `/transaksi` | Daftar transaksi |
| Transactions | POST | `/transaksi` | Buat transaksi |
| Transactions | PATCH | `/transaksi/:id/pay` | Konfirmasi pembayaran |
| Transactions | GET | `/transaksi/:id/pdf` | Download struk PDF |
| Shifts | GET | `/shifts` | Daftar shift |
| Shifts | POST | `/shifts` | Buat shift (admin) |
| Notifications | GET | `/notifications` | Daftar notifikasi |
| Reports | GET | `/reports/finance` | Laporan keuangan |
| Audit | GET | `/audit` | Audit log |

Dokumentasi lengkap: [docs/api-spec.md](docs/api-spec.md)

---

## Database Schema

Sistem menggunakan 12 tabel dengan struktur relasional:

| Tabel | Deskripsi |
|-------|-----------|
| `customer` | Data pelanggan |
| `karyawan` | Data admin dan kasir |
| `owner` | Data pemilik usaha |
| `mesin_cuci` | Daftar mesin cuci dan pengering |
| `layanan` | Daftar layanan (kiloan/koin) |
| `pemesanan` | Data booking/pesanan |
| `transaksi` | Data pembayaran |
| `booking_mesin` | Relasi pemesanan-mesin (many-to-many) |
| `shifts` | Jadwal shift kerja |
| `shift_karyawan` | Relasi shift-karyawan (many-to-many) |
| `notifikasi` | Notifikasi untuk customer |
| `audit_log` | Log aktivitas sistem |

Detail schema: [database/schema.sql](database/schema.sql)

---

## Role Pengguna

| Role | Platform | Akses Utama |
|------|----------|-------------|
| Customer | Mobile | Booking, tracking, riwayat |
| Kasir | Web | Transaksi, pembayaran |
| Admin | Web | Kelola data master, shift |
| Owner | Web | Laporan, monitoring |

---

## Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [SRS](docs/) | Software Requirements Specification |
| [API Spec](docs/api-spec.md) | Spesifikasi API endpoints |
| [Module Docs](docs/modules/) | Dokumentasi detail per module |

---

## Kontribusi

1. Fork repository ini
2. Buat branch baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'Tambah fitur baru'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## Tim Pengembang

**Kelompok 5 — Rekayasa Perangkat Lunak 2026**

| Nama | NIM | Tugas |
|------|-----|-------|
| Darrel Rafa Syahmi | 2526214003 | Backend API, Penggabungan |
| Alan Farel Pradana | 2526214018 | Frontend Mobile |
| Andini Rihadatul Aisya | 2526214012 | Database Design |

---

## Lisensi

Proyek ini dikembangkan untuk keperluan akademis mata kuliah Rekayasa Perangkat Lunak.
