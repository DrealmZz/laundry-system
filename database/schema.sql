-- ============================================================
-- Laundry System Hybrid - Database Schema (Bab 5)
-- PostgreSQL 16
-- ============================================================

-- Hapus tabel lama jika ada (urutan penting karena ada foreign key)
DROP TABLE IF EXISTS notifikasi CASCADE;
DROP TABLE IF EXISTS shift_karyawan CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS booking_mesin CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS transaksi CASCADE;
DROP TABLE IF EXISTS pemesanan CASCADE;
DROP TABLE IF EXISTS layanan CASCADE;
DROP TABLE IF EXISTS mesin_cuci CASCADE;
DROP TABLE IF EXISTS owner CASCADE;
DROP TABLE IF EXISTS karyawan CASCADE;
DROP TABLE IF EXISTS customer CASCADE;

-- ── CUSTOMER ────────────────────────────────────────────────
CREATE TABLE customer (
    id_customer     SERIAL PRIMARY KEY,
    nama_lengkap    VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    no_hp           VARCHAR(20),
    email           VARCHAR(150) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    status_akun     VARCHAR(20)  NOT NULL DEFAULT 'aktif'
                    CHECK (status_akun IN ('aktif', 'tidak aktif')),
    alamat          TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    tanggal_daftar  DATE         NOT NULL DEFAULT CURRENT_DATE
);

-- ── KARYAWAN ────────────────────────────────────────────────
CREATE TABLE karyawan (
    id_karyawan     SERIAL PRIMARY KEY,
    nama_lengkap    VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    no_hp           VARCHAR(20),
    email           VARCHAR(150) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL
                    CHECK (role IN ('admin', 'kasir')),
    hak_akses       TEXT,
    status_akun     VARCHAR(20)  NOT NULL DEFAULT 'aktif'
                    CHECK (status_akun IN ('aktif', 'tidak aktif')),
    alamat          TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── OWNER ───────────────────────────────────────────────────
CREATE TABLE owner (
    id_owner        SERIAL PRIMARY KEY,
    nama_lengkap    VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    no_hp           VARCHAR(20),
    email           VARCHAR(150) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    hak_akses       TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── MESIN CUCI ──────────────────────────────────────────────
CREATE TABLE mesin_cuci (
    id_mesin                SERIAL PRIMARY KEY,
    kode_mesin              VARCHAR(20)    UNIQUE NOT NULL,
    tipe_mesin              VARCHAR(50)    NOT NULL
                            CHECK (tipe_mesin IN ('pencucian', 'pengeringan')),
    nama_mesin              VARCHAR(100)   NOT NULL,
    status_mesin            VARCHAR(20)    NOT NULL DEFAULT 'tersedia'
                            CHECK (status_mesin IN ('tersedia', 'dipakai', 'perbaikan')),
    konsumsi_kwh            NUMERIC(6,2),
    kapasitas_kg            SMALLINT,
    penggunaan_air_liter    NUMERIC(6,2)
);

-- ── LAYANAN ─────────────────────────────────────────────────
CREATE TABLE layanan (
    id_layanan      SERIAL PRIMARY KEY,
    nama_layanan    VARCHAR(100)   NOT NULL,
    jenis_layanan   VARCHAR(20)    NOT NULL
                    CHECK (jenis_layanan IN ('kiloan', 'koin')),
    harga           NUMERIC(10,2)  NOT NULL,
    estimasi_waktu  INTEGER        NOT NULL  -- dalam menit
);

-- ── PEMESANAN ───────────────────────────────────────────────
CREATE TABLE pemesanan (
    id_pemesanan        SERIAL PRIMARY KEY,
    id_customer         INTEGER        NOT NULL REFERENCES customer(id_customer),
    id_layanan          INTEGER        NOT NULL REFERENCES layanan(id_layanan),
    id_mesin            INTEGER        REFERENCES mesin_cuci(id_mesin),
    tanggal_pesanan     DATE           NOT NULL DEFAULT CURRENT_DATE,
    shift               VARCHAR(20)    NOT NULL
                        CHECK (shift IN ('pagi', 'siang', 'sore', 'malam')),
    status_pesanan      VARCHAR(30)    NOT NULL DEFAULT 'menunggu konfirmasi'
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
                        )),
    berat_kg            NUMERIC(5,2),
    jenis_pencucian     VARCHAR(20)    NOT NULL
                        CHECK (jenis_pencucian IN ('kiloan', 'koin')),
    metode_pengambilan  VARCHAR(20)    NOT NULL
                        CHECK (metode_pengambilan IN ('ambil_sendiri', 'pengiriman')),
    catatan             TEXT
);

-- ── TRANSAKSI ───────────────────────────────────────────────
CREATE TABLE transaksi (
    id_transaksi        SERIAL PRIMARY KEY,
    id_pemesanan        INTEGER        NOT NULL REFERENCES pemesanan(id_pemesanan),
    id_customer         INTEGER        NOT NULL REFERENCES customer(id_customer),
    id_karyawan         INTEGER        NOT NULL REFERENCES karyawan(id_karyawan),
    nomor_struk         VARCHAR(50)    UNIQUE NOT NULL,
    total               NUMERIC(10,2)  NOT NULL,
    metode_pembayaran   VARCHAR(20)    NOT NULL
                        CHECK (metode_pembayaran IN ('cash', 'transfer', 'qris', 'koin')),
    status_pembayaran   VARCHAR(20)    NOT NULL DEFAULT 'pending'
                        CHECK (status_pembayaran IN ('lunas', 'belum dibayar', 'gagal')),
    tanggal_transaksi   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── AUDIT LOG ───────────────────────────────────────────────
CREATE TABLE audit_log (
    id_log          BIGSERIAL PRIMARY KEY,
    id_customer     INTEGER      REFERENCES customer(id_customer),
    id_karyawan     INTEGER      REFERENCES karyawan(id_karyawan),
    tipe_log        VARCHAR(50)  NOT NULL,
    isi_pesan       TEXT,
    aktivitas       VARCHAR(100) NOT NULL,
    timestamp       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    status          VARCHAR(20)  NOT NULL
                    CHECK (status IN ('berhasil', 'gagal')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── BOOKING MESIN (Junction Table) ─────────────────────────
CREATE TABLE booking_mesin (
    id_booking_mesin  SERIAL PRIMARY KEY,
    id_pemesanan      INTEGER NOT NULL REFERENCES pemesanan(id_pemesanan) ON DELETE CASCADE,
    id_mesin          INTEGER NOT NULL REFERENCES mesin_cuci(id_mesin),
    UNIQUE(id_pemesanan, id_mesin)
);

-- ── SHIFTS ─────────────────────────────────────────────────
CREATE TABLE shifts (
    id_shift      SERIAL PRIMARY KEY,
    nama_shift    VARCHAR(20) NOT NULL
                  CHECK (nama_shift IN ('pagi', 'siang', 'sore', 'malam')),
    tanggal       DATE NOT NULL,
    jam_mulai     TIME NOT NULL,
    jam_selesai   TIME NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── SHIFT KARYAWAN (Junction Table) ────────────────────────
CREATE TABLE shift_karyawan (
    id_shift_karyawan  SERIAL PRIMARY KEY,
    id_shift           INTEGER NOT NULL REFERENCES shifts(id_shift) ON DELETE CASCADE,
    id_karyawan        INTEGER NOT NULL REFERENCES karyawan(id_karyawan),
    UNIQUE(id_shift, id_karyawan)
);

-- ── NOTIFIKASI ─────────────────────────────────────────────
CREATE TABLE notifikasi (
    id_notif      SERIAL PRIMARY KEY,
    id_pemesanan  INTEGER REFERENCES pemesanan(id_pemesanan) ON DELETE SET NULL,
    id_customer   INTEGER NOT NULL REFERENCES customer(id_customer),
    judul         VARCHAR(100) NOT NULL,
    isi_pesan     TEXT NOT NULL,
    is_read       BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_pemesanan_customer   ON pemesanan(id_customer);
CREATE INDEX idx_pemesanan_status     ON pemesanan(status_pesanan);
CREATE INDEX idx_transaksi_karyawan   ON transaksi(id_karyawan);
CREATE INDEX idx_transaksi_customer   ON transaksi(id_customer);
CREATE INDEX idx_audit_log_customer   ON audit_log(id_customer);
CREATE INDEX idx_audit_log_karyawan   ON audit_log(id_karyawan);
CREATE INDEX idx_audit_log_timestamp  ON audit_log(timestamp);

-- Indexes untuk tabel baru
CREATE INDEX idx_booking_mesin_pemesanan ON booking_mesin(id_pemesanan);
CREATE INDEX idx_booking_mesin_mesin ON booking_mesin(id_mesin);
CREATE INDEX idx_shifts_tanggal ON shifts(tanggal);
CREATE INDEX idx_shifts_nama_shift ON shifts(nama_shift);
CREATE INDEX idx_shift_karyawan_karyawan ON shift_karyawan(id_karyawan);
CREATE UNIQUE INDEX idx_shifts_unique ON shifts(tanggal, nama_shift);
CREATE INDEX idx_notifikasi_customer ON notifikasi(id_customer, is_read);
CREATE INDEX idx_notifikasi_pemesanan ON notifikasi(id_pemesanan);
CREATE INDEX idx_notifikasi_created_at ON notifikasi(created_at);