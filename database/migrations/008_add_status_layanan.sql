-- Migration: Tambah kolom status_layanan ke tabel layanan
-- Jalankan: psql -U postgres -d laundry_system -f migrations/008_add_status_layanan.sql

ALTER TABLE layanan ADD COLUMN IF NOT EXISTS status_layanan BOOLEAN NOT NULL DEFAULT TRUE;
