# Testing Guide — Laundry System

## Base URL

```
http://localhost:3000/api/v1
```

## Prerequisites

- Backend server running (`npm run dev` di `backend/`)
- PostgreSQL database sudah running & migrated
- Frontend web running (`npm run dev` di `frontend/web/`)
- Mobile app running (`npx expo start` di `frontend/mobile/`) — hanya untuk testing customer flow

## Authentication

Setiap test case butuh token JWT sesuai role. Cara dapat token:

1. **Login via API:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier": "admin@laundaja.com", "password": "password123"}'
   ```
   Simpan `data.token` dari response.

2. **Set header untuk request selanjutnya:**
   ```
   Authorization: Bearer <token>
   ```

### Akun Test yang Tersedia

| Role | Username/Email | Password |
|------|---------------|----------|
| Admin | `admin` / `admin@laundaja.com` | `password123` |
| Kasir | `kasir` / `kasir@laundaja.com` | `password123` |
| Owner | `owner` / `owner@laundaja.com` | `password123` |
| Customer | (register sendiri via mobile / `POST /auth/register`) | — |

## Cara Testing

1. Buka file `.md` sesuai modul yang mau di-test
2. Ikuti langkah-langkah berurutan
3. Isi kolom **Status** di tabel:
   - ✅ `PASS` — sesuai expected
   - ❌ `FAIL` — tidak sesuai (catat error di kolom notes)
   - ⏭️ `SKIP` — skip karena dependensi tidak terpenuhi
4. Untuk test API, gunakan Postman / Insomnia / curl
5. Untuk test UI, akses sesuai role dashboard:
   - Kasir: `http://localhost:5173/kasir/dashboard`
   - Admin: `http://localhost:5173/admin/dashboard`
   - Owner: `http://localhost:5173/owner/dashboard`
6. Customer flow via mobile app (Expo) atau langsung hit API

## Status Tracking

Setiap file test punya tabel dengan format:

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|

Isi **Status** setelah selesai test. Tulis **Notes** jika FAIL untuk dokumentasi bug.

## Daftar Modul

| File | Modul | Tester |
|------|-------|--------|
| `01-auth.md` | Auth (login, register, profil) | |
| `02-kiloan.md` | Alur Laundry Kiloan (14 status) | |
| `03-koin.md` | Alur Laundry Koin | |
| `04-walkin.md` | Walk-in Transaksi (Kasir) | |
| `05-transaction.md` | Manajemen Transaksi / Pembayaran | |
| `06-users.md` | Manajemen User (Customer & Karyawan) | |
| `07-services.md` | Manajemen Layanan | |
| `08-machines.md` | Manajemen Mesin | |
| `09-shifts.md` | Manajemen Shift | |
| `10-reports.md` | Laporan Owner | |
| `11-notifications.md` | Notifikasi Customer | |
| `12-audit.md` | Audit Log Admin | |

## Tips

- Test berurutan dari atas ke bawah dalam satu file (beberapa test case dependen pada test sebelumnya)
- Untuk test "cancel" atau "reject", buat booking baru agar tidak mengganggu booking yang sedang di-test
- Walk-in transaction bisa di-test tanpa perlu mobile app (cukup via web dashboard kasir)
- Beberapa fitur (laporan, audit) hanya untuk role tertentu — pastikan login dengan role yang benar
