-- Seed: Data awal untuk development
-- Password semua akun: "password123" (bcrypt hash)
-- Schema: Bab 5 (customer, karyawan, owner, mesin_cuci, layanan)

-- Owner
INSERT INTO owner (nama_lengkap, username, no_hp, email, password, hak_akses) VALUES
  ('Owner Laundry', 'owner_laundry', '081200000001', 'owner@laundry.com', '$2b$10$placeholderhashhashhashhashhashhashhashhashh', 'full_access');

-- Karyawan (admin & kasir)
INSERT INTO karyawan (nama_lengkap, username, no_hp, email, password, role, hak_akses, status_akun, alamat) VALUES
  ('Admin Sistem', 'admin_sistem', '081200000002', 'admin@laundry.com', '$2b$10$placeholderhashhashhashhashhashhashhashhashh', 'admin', 'kelola_sistem', 'aktif', 'Jl. Outlet No. 1'),
  ('Kasir Satu',   'kasir_satu',   '081200000003', 'kasir@laundry.com', '$2b$10$placeholderhashhashhashhashhashhashhashhashh', 'kasir', 'transaksi_only', 'aktif', 'Jl. Outlet No. 1');

-- Customer
INSERT INTO customer (nama_lengkap, username, no_hp, email, password, status_akun, alamat) VALUES
  ('Budi Customer', 'budi_customer', '081200000004', 'budi@mail.com', '$2b$10$placeholderhashhashhashhashhashhashhashhashh', 'aktif', 'Jl. Pelanggan No. 5');

-- Layanan
INSERT INTO layanan (nama_layanan, jenis_layanan, harga, estimasi_waktu) VALUES
  ('Kiloan Reguler',    'kiloan', 7000,  180),
  ('Kiloan Express',    'kiloan', 12000, 60),
  ('Koin Self-Service', 'koin',   15000, 45);

-- Mesin Cuci
INSERT INTO mesin_cuci (kode_mesin, tipe_mesin, nama_mesin, status_mesin, konsumsi_kwh, kapasitas_kg, penggunaan_air_liter) VALUES
  ('MESIN-A', 'pencucian', 'Mesin Cuci A',      'tersedia', 0.50, 7,  50.00),
  ('MESIN-B', 'pencucian', 'Mesin Cuci B',      'tersedia', 0.50, 10, 60.00),
  ('MESIN-C', 'pengering', 'Mesin Pengering A', 'tersedia', 0.80, 7,  0.00);