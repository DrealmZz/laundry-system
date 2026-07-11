# Laundry System — Konteks AI

Sistem Manajemen Laundry Hybrid (Kiloan & Koin) — Kelompok 5 RPL 2026.

## Struktur Monorepo

```
laundry-system/
├── backend/        → REST API (Node.js + Express + PostgreSQL)
├── frontend/
│   ├── mobile/     → Mobile app Customer (React Native + Expo)
│   ├── web/        → Web dashboard Kasir/Admin/Owner (belum dibuat)
│   └── public/     → Aset statis bersama
├── database/       → Schema & migration SQL (PostgreSQL)
└── docs/           → SRS dan spesifikasi API
```

## Aturan Penting

- Setiap anggota tim HANYA mengerjakan direktori miliknya (lihat tabel di bawah)
- JANGAN edit direktori lain tanpa koordinasi tim
- Semua perubahan lewat branch → pull request → review → merge ke main
- JANGAN push langsung ke branch `main`

## Pembagian Direktori

| Direktori | Penanggung jawab |
|-----------|-----------------|
| `backend/` | Tim Backend |
| `frontend/mobile/` | Tim Mobile |
| `frontend/web/` | Tim Web |
| `database/` | Koordinasi bersama (diskusikan dulu sebelum ubah schema) |

## API Contract

Base URL: `http://localhost:3000/api/v1`

Semua response mengikuti format:
```json
{ "status": "success|error", "data": {}, "message": "..." }
```

Endpoint yang tersedia: lihat `docs/api-spec.md`

## Role Pengguna

- `customer` — booking, tracking, riwayat (akses via mobile)
- `kasir` — konfirmasi booking, proses transaksi (akses via web)
- `admin` — kelola data master, shift karyawan (akses via web)
- `owner` — laporan keuangan, audit log (akses via web)

## Alur Laundry Kiloan — LOCKED

Flow laundry kiloan (14 status) sudah finalized dan **LOCKED**.

Aturan:
- ❌ Jangan ubah status, transisi, atau urutan alur kiloan yang sudah ada
- ❌ Jangan tambah status baru di tengah alur kiloan
- ✅ Jika ingin menambah jenis layanan baru (satuan, express, dll), buat alur terpisah — jangan potong alur kiloan
- ✅ Bug fix pada implementasi alur kiloan diperbolehkan, asalkan tidak mengubah state machine

Referensi:
- Dokumentasi lengkap alur: `docs/alur-kiloan.md`
- State machine (source of truth): `backend/src/modules/pemesanan/services/pemesanan.service.js` method `_getValidTransitions`
- Kolom terkait pengiriman: `tanggal_pengiriman`, `shift_pengiriman` (migration `006`)
