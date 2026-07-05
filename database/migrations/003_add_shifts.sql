-- ============================================================
-- Migration 003: Tambah tabel shifts dan shift_karyawan
-- PostgreSQL 16
-- ============================================================

-- Tabel shift kerja (khusus kasir dan admin)
CREATE TABLE IF NOT EXISTS shifts (
    id_shift      SERIAL PRIMARY KEY,
    nama_shift    VARCHAR(20) NOT NULL
                  CHECK (nama_shift IN ('pagi', 'siang', 'sore', 'malam')),
    tanggal       DATE NOT NULL,
    jam_mulai     TIME NOT NULL,
    jam_selesai   TIME NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel junction shift_karyawan
-- Menghubungkan karyawan dengan shift yang dijadwalkan
CREATE TABLE IF NOT EXISTS shift_karyawan (
    id_shift_karyawan  SERIAL PRIMARY KEY,
    id_shift           INTEGER NOT NULL REFERENCES shifts(id_shift) ON DELETE CASCADE,
    id_karyawan        INTEGER NOT NULL REFERENCES karyawan(id_karyawan),
    UNIQUE(id_shift, id_karyawan)
);

-- Indexes untuk performa query
CREATE INDEX IF NOT EXISTS idx_shifts_tanggal ON shifts(tanggal);
CREATE INDEX IF NOT EXISTS idx_shifts_nama_shift ON shifts(nama_shift);
CREATE INDEX IF NOT EXISTS idx_shift_karyawan_karyawan ON shift_karyawan(id_karyawan);

-- Unique constraint: 1 shift per tanggal per nama_shift
CREATE UNIQUE INDEX IF NOT EXISTS idx_shifts_unique ON shifts(tanggal, nama_shift);

-- Comments
COMMENT ON TABLE shifts IS 'Tabel jadwal shift kerja untuk kasir dan admin';
COMMENT ON COLUMN shifts.nama_shift IS 'Nama shift: pagi, siang, sore, malam';
COMMENT ON COLUMN shifts.tanggal IS 'Tanggal shift berlaku';
COMMENT ON COLUMN shifts.jam_mulai IS 'Jam mulai shift';
COMMENT ON COLUMN shifts.jam_selesai IS 'Jam selesai shift';

COMMENT ON TABLE shift_karyawan IS 'Junction table untuk relasi many-to-many antara shifts dan karyawan';
COMMENT ON COLUMN shift_karyawan.id_shift_karyawan IS 'ID primary key auto-increment';
COMMENT ON COLUMN shift_karyawan.id_shift IS 'ID shift yang dijadwalkan';
COMMENT ON COLUMN shift_karyawan.id_karyawan IS 'ID karyawan yang di-assign ke shift';
