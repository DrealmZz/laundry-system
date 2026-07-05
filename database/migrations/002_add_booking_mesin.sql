-- ============================================================
-- Migration 002: Tambah tabel booking_mesin (Junction Table)
-- PostgreSQL 16
-- ============================================================

-- Tabel junction untuk booking mesin
-- Digunakan untuk booking koin yang butuh 2 mesin (mesin cuci + mesin pengering)
CREATE TABLE IF NOT EXISTS booking_mesin (
    id_booking_mesin  SERIAL PRIMARY KEY,
    id_pemesanan      INTEGER NOT NULL REFERENCES pemesanan(id_pemesanan) ON DELETE CASCADE,
    id_mesin          INTEGER NOT NULL REFERENCES mesin_cuci(id_mesin),
    UNIQUE(id_pemesanan, id_mesin)
);

-- Indexes untuk performa query
CREATE INDEX IF NOT EXISTS idx_booking_mesin_pemesanan ON booking_mesin(id_pemesanan);
CREATE INDEX IF NOT EXISTS idx_booking_mesin_mesin ON booking_mesin(id_mesin);

-- Comment
COMMENT ON TABLE booking_mesin IS 'Junction table untuk relasi many-to-many antara pemesanan dan mesin_cuci';
COMMENT ON COLUMN booking_mesin.id_booking_mesin IS 'ID primary key auto-increment';
COMMENT ON COLUMN booking_mesin.id_pemesanan IS 'ID pemesanan yang terkait';
COMMENT ON COLUMN booking_mesin.id_mesin IS 'ID mesin cuci yang digunakan';
