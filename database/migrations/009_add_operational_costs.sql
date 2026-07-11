-- Migration: Add operational_costs table for COGS tracking
-- Sprint 1: Financial Foundation (P&L)

CREATE TABLE IF NOT EXISTS operational_costs (
    id              SERIAL PRIMARY KEY,
    tanggal         DATE NOT NULL DEFAULT CURRENT_DATE,
    kategori        VARCHAR(50) NOT NULL
                    CHECK (kategori IN ('deterjen', 'listrik', 'air', 'gaji', 'sewa', 'perawatan', 'lainnya')),
    jumlah          NUMERIC(12,2) NOT NULL DEFAULT 0,
    satuan          VARCHAR(20) DEFAULT 'rupiah'
                    CHECK (satuan IN ('rupiah', 'per_kg')),
    deskripsi       TEXT,
    id_karyawan     INTEGER REFERENCES karyawan(id_karyawan),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_operational_costs_tanggal ON operational_costs(tanggal);
CREATE INDEX idx_operational_costs_kategori ON operational_costs(kategori);
