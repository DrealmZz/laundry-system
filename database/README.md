# Database

PostgreSQL 15+. Semua file SQL ada di sini.

## Setup

```bash
# 1. Buat database
createdb laundry_system

# 2. Jalankan schema
psql -U postgres -d laundry_system -f schema.sql

# 3. (Opsional) Isi data awal untuk development
psql -U postgres -d laundry_system -f seeds/001_dev_seed.sql
```

## Struktur

```
database/
├── schema.sql          # DDL lengkap (tabel, enum, index)
├── migrations/         # Perubahan schema bertahap
│   └── 001_initial_schema.sql
└── seeds/              # Data awal untuk development
    └── 001_dev_seed.sql
```

## Konvensi migration

Nama file: `NNN_deskripsi_singkat.sql` (contoh: `002_add_notifications.sql`)  
Jalankan migration secara berurutan.
