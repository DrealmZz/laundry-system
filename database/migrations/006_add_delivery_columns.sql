-- Migration: Tambah kolom tanggal_pengiriman dan shift_pengiriman
-- Jalankan: psql -U postgres -d laundry_system -f migrations/006_add_delivery_columns.sql

ALTER TABLE pemesanan ADD COLUMN IF NOT EXISTS tanggal_pengiriman DATE;
ALTER TABLE pemesanan ADD COLUMN IF NOT EXISTS shift_pengiriman VARCHAR(20)
  CHECK (shift_pengiriman IN ('pagi', 'siang', 'sore', 'malam'));
