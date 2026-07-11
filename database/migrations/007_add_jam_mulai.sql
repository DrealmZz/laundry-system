-- Migration: Tambah kolom jam_mulai untuk pemesanan koin + izinkan shift null
-- Jalankan: psql -U postgres -d laundry_system -f migrations/007_add_jam_mulai.sql

ALTER TABLE pemesanan ADD COLUMN IF NOT EXISTS jam_mulai TIME;
ALTER TABLE pemesanan ALTER COLUMN shift DROP NOT NULL;
