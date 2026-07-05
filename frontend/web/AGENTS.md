# Web Dashboard — Konteks AI

Kamu bekerja di direktori `frontend/web/` milik **Tim Web**.

## Batas Direktori

- ✅ BOLEH edit: semua file di dalam `frontend/web/`
- ❌ JANGAN edit: `backend/`, `frontend/mobile/`, `database/`, `docs/`
- ✅ BOLEH tambah aset (gambar, font) ke `frontend/public/`

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Recharts untuk grafik laporan
- Lucide React untuk icons
- Motion untuk animasi

## Target Pengguna

Dashboard ini hanya untuk role internal — **bukan customer**:

| Role | Akses |
|------|-------|
| `kasir` | Konfirmasi booking, proses transaksi, cetak struk |
| `admin` | Kelola karyawan, layanan, mesin, jadwal shift |
| `owner` | Laporan keuangan, audit log |

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server di localhost:3000
npm run build      # build production
npm run lint       # typecheck (tsc --noEmit)
```

## API Base URL

`http://localhost:3000/api/v1` — lihat `docs/api-spec.md` untuk daftar endpoint.
