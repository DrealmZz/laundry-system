-- ============================================================
-- Migration 004: Tambah tabel notifikasi
-- PostgreSQL 16
-- ============================================================

-- Tabel notifikasi untuk customer
-- Admin/kasir mengirim notifikasi secara manual terkait status booking
CREATE TABLE IF NOT EXISTS notifikasi (
    id_notif      SERIAL PRIMARY KEY,
    id_pemesanan  INTEGER REFERENCES pemesanan(id_pemesanan) ON DELETE SET NULL,
    id_customer   INTEGER NOT NULL REFERENCES customer(id_customer),
    judul         VARCHAR(100) NOT NULL,
    isi_pesan     TEXT NOT NULL,
    is_read       BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes untuk performa query
CREATE INDEX IF NOT EXISTS idx_notifikasi_customer ON notifikasi(id_customer, is_read);
CREATE INDEX IF NOT EXISTS idx_notifikasi_pemesanan ON notifikasi(id_pemesanan);
CREATE INDEX IF NOT EXISTS idx_notifikasi_created_at ON notifikasi(created_at);

-- Comments
COMMENT ON TABLE notifikasi IS 'Tabel notifikasi untuk customer terkait status booking';
COMMENT ON COLUMN notifikasi.id_pemesanan IS 'ID pemesanan terkait (opsional)';
COMMENT ON COLUMN notifikasi.id_customer IS 'ID customer yang menerima notifikasi';
COMMENT ON COLUMN notifikasi.judul IS 'Judul notifikasi';
COMMENT ON COLUMN notifikasi.isi_pesan IS 'Isi pesan notifikasi';
COMMENT ON COLUMN notifikasi.is_read IS 'Status baca notifikasi (false = belum dibaca, true = sudah dibaca)';
COMMENT ON COLUMN notifikasi.created_at IS 'Waktu notifikasi dibuat';
