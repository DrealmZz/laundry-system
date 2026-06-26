# Database — Konteks AI

Direktori `database/` dikelola **bersama oleh semua tim**.

## Aturan Penting

- ❌ JANGAN ubah `schema.sql` tanpa diskusi dengan seluruh tim dulu
- ✅ Kalau perlu tambah kolom/tabel baru, buat file baru di `migrations/`
- ❌ JANGAN edit migration yang sudah pernah dijalankan

## Konvensi Migration

Buat file baru dengan format: `NNN_deskripsi.sql`

Contoh: `002_add_notifications_table.sql`

Jalankan secara berurutan:
```bash
psql -U postgres -d laundry_db -f migrations/002_add_notifications_table.sql
```

## Struktur

```
database/
├── schema.sql              # DDL lengkap (sumber kebenaran)
├── migrations/             # Perubahan incremental
│   └── 001_initial_schema.sql
└── seeds/                  # Data awal untuk development
    └── 001_dev_seed.sql
```

## Setup Awal

```bash
createdb laundry_db
psql -U postgres -d laundry_db -f schema.sql
psql -U postgres -d laundry_db -f seeds/001_dev_seed.sql
```

## Tabel Utama

`users`, `services`, `machines`, `shifts`, `bookings`, `transactions`, `audit_logs`

Detail lengkap ada di `schema.sql`.
