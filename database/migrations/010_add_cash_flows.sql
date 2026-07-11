-- Migration: Add cash_flows table for Cash Flow tracking
-- Sprint 2: Cash Flow Statement & Forecast

CREATE TABLE IF NOT EXISTS cash_flows (
    id              SERIAL PRIMARY KEY,
    tanggal         DATE NOT NULL DEFAULT CURRENT_DATE,
    tipe            VARCHAR(10) NOT NULL
                    CHECK (tipe IN ('masuk', 'keluar')),
    kategori        VARCHAR(50) NOT NULL
                    CHECK (kategori IN ('operasional', 'investasi', 'pembiayaan')),
    sub_kategori    VARCHAR(100),
    jumlah          NUMERIC(12,2) NOT NULL DEFAULT 0,
    deskripsi       TEXT,
    ref_id          INTEGER,
    ref_type        VARCHAR(50),
    id_karyawan     INTEGER REFERENCES karyawan(id_karyawan),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cash_flows_tanggal ON cash_flows(tanggal);
CREATE INDEX idx_cash_flows_tipe ON cash_flows(tipe);
CREATE INDEX idx_cash_flows_kategori ON cash_flows(kategori);
