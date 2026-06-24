-- Seed: Data awal untuk development
-- Password semua akun: "password123" (bcrypt hash)

-- Users (1 per role)
INSERT INTO users (name, email, phone, password, role) VALUES
  ('Owner Laundry',  'owner@laundry.com',  '081200000001', '$2b$10$placeholderhashhashhashhashhashhashhashhashh', 'owner'),
  ('Admin Sistem',   'admin@laundry.com',  '081200000002', '$2b$10$placeholderhashhashhashhashhashhashhashhashh', 'admin'),
  ('Kasir Satu',     'kasir@laundry.com',  '081200000003', '$2b$10$placeholderhashhashhashhashhashhashhashhashh', 'kasir'),
  ('Budi Customer',  'budi@mail.com',      '081200000004', '$2b$10$placeholderhashhashhashhashhashhashhashhashh', 'customer');

-- Services
INSERT INTO services (name, type, price, unit) VALUES
  ('Kiloan Reguler',    'kiloan', 7000,  'per kg'),
  ('Kiloan Express',    'kiloan', 12000, 'per kg'),
  ('Koin Self-Service', 'koin',   15000, 'per mesin');

-- Machines
INSERT INTO machines (name, type, capacity_kg) VALUES
  ('Mesin Cuci A', 'washer', 7),
  ('Mesin Cuci B', 'washer', 10),
  ('Mesin Pengering A', 'dryer', 7);
