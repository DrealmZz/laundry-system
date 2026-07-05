-- ============================================================
-- Migration 005: Update status_pesanan enum
-- PostgreSQL 16
-- ============================================================

-- Tambah status baru ke CHECK constraint
ALTER TABLE pemesanan DROP CONSTRAINT IF EXISTS pemesanan_status_pesanan_check;

ALTER TABLE pemesanan ADD CONSTRAINT pemesanan_status_pesanan_check 
CHECK (status_pesanan IN (
    'menunggu konfirmasi',
    'disetujui',
    'penjemputan',
    'penimbangan',
    'menunggu pembayaran',
    'sudah dibayar',
    'diproses',
    'sedang di cuci',
    'sedang di keringkan',
    'sedang di setrika',
    'pencucian selesai',
    'pengiriman',
    'selesai',
    'pesanan ditolak',
    'pesanan dibatalkan'
));
