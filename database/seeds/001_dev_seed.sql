-- Seed: Data awal untuk development
-- Password semua akun: "password123" (bcrypt hash)
-- Schema: Bab 5 (customer, karyawan, owner, mesin_cuci, layanan)

-- Owner
INSERT INTO owner (nama_lengkap, username, no_hp, email, password, hak_akses) VALUES
  ('Owner Laundry', 'owner', '081200000001', 'owner@laundry.com', '$2b$10$nx37FM.eMUOGabLxn09nW.8vNI2ezWZ2HQ.lFG.AuaUkzrCyMkD2a', 'full');

-- Karyawan (Admin & Kasir)
INSERT INTO karyawan (nama_lengkap, username, no_hp, email, password, role, hak_akses, alamat) VALUES
  ('Admin Sistem', 'admin', '081200000002', 'admin@laundry.com', '$2b$10$nx37FM.eMUOGabLxn09nW.8vNI2ezWZ2HQ.lFG.AuaUkzrCyMkD2a', 'admin', 'full', 'Jl. Admin No. 1'),
  ('Kasir Satu', 'kasir1', '081200000003', 'kasir@laundry.com', '$2b$10$nx37FM.eMUOGabLxn09nW.8vNI2ezWZ2HQ.lFG.AuaUkzrCyMkD2a', 'kasir', 'transaksi,pemesanan', 'Jl. Kasir No. 1');

-- Customer
INSERT INTO customer (nama_lengkap, username, no_hp, email, password, alamat) VALUES
  ('Budi Customer', 'budi', '081200000004', 'budi@mail.com', '$2b$10$nx37FM.eMUOGabLxn09nW.8vNI2ezWZ2HQ.lFG.AuaUkzrCyMkD2a', 'Jl. Customer No. 1'),
  ('Siti Pelanggan', 'siti', '081200000005', 'siti@mail.com', '$2b$10$nx37FM.eMUOGabLxn09nW.8vNI2ezWZ2HQ.lFG.AuaUkzrCyMkD2a', 'Jl. Customer No. 2');

-- Layanan
INSERT INTO layanan (nama_layanan, jenis_layanan, harga, estimasi_waktu) VALUES
  ('Kiloan Reguler', 'kiloan', 7000, 480),
  ('Kiloan Express', 'kiloan', 12000, 240),
  ('Koin Cuci Saja', 'koin', 10000, 45),
  ('Koin Cuci + Kering', 'koin', 20000, 60);

-- Mesin Cuci
INSERT INTO mesin_cuci (kode_mesin, tipe_mesin, nama_mesin, status_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter) VALUES
  ('WM-001', 'pencucian', 'Mesin Cuci A', 'tersedia', 8, 1.5, 50),
  ('WM-002', 'pencucian', 'Mesin Cuci B', 'tersedia', 8, 2.0, 65),
  ('DR-001', 'pengeringan', 'Mesin Pengering A', 'tersedia', 8, 3.0, 0);