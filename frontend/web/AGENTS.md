# Web Dashboard — Konteks AI

Kamu bekerja di direktori `frontend/web/` milik **Tim Web**.

## Batas Direktori

- ✅ BOLEH edit: semua file di dalam `frontend/web/`
- ❌ JANGAN edit: `backend/`, `frontend/mobile/`, `database/`, `docs/`
- ✅ BOLEH tambah aset (gambar, font) ke `frontend/public/`

## Stack (rencana)

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- React Query untuk data fetching
- Recharts untuk grafik laporan

## Target Pengguna

Dashboard ini hanya untuk role internal — **bukan customer**:

| Role | Akses |
|------|-------|
| `kasir` | Konfirmasi booking, proses transaksi, cetak struk |
| `admin` | Kelola karyawan, layanan, mesin, jadwal shift |
| `owner` | Laporan keuangan, audit log |

## API Base URL

`http://localhost:3000/api/v1` — lihat `docs/api-spec.md` untuk daftar endpoint.

## Catatan

Direktori ini belum diisi. Setup project Next.js di sini ketika siap mulai.
```bash
cd frontend/web
npx create-next-app@latest . --typescript --tailwind --app
```
