# RENCANA PENGEMBANGAN SISTEM MANAJEMEN LAUNDRY HYBRID

> Dokumen ini berisi rencana lengkap pengembangan sistem laundry hybrid dari awal hingga deployment.
> Gunakan dokumen ini sebagai panduan dan checklist untuk memastikan semua fitur terimplementasi.

---

## DAFTAR ISI

1. [Ringkasan Proyek](#1-ringkasan-proyek)
2. [Kondisi Saat Ini](#2-kondisi-saat-ini)
3. [Fase 1: Backend Completion](#3-fase-1-backend-completion)
4. [Fase 2: Database & Seed Data](#4-fase-2-database--seed-data)
5. [Fase 3: Frontend Web - API Integration](#5-fase-3-frontend-web---api-integration)
6. [Fase 4: Frontend Mobile - API Integration](#6-fase-4-frontend-mobile---api-integration)
7. [Fase 5: UI/UX Improvements](#7-fase-5-uiux-improvements)
8. [Fase 6: Testing](#8-fase-6-testing)
9. [Fase 7: Documentation Update](#9-fase-7-documentation-update)
10. [Fase 8: Deployment Preparation](#10-fase-8-deployment-preparation)
11. [Dependencies](#11-dependencies)
12. [Checklist Akhir](#12-checklist-akhir)

---

## 1. RINGKASAN PROYEK

### Deskripsi
Sistem Manajemen Laundry Hybrid (Kiloan & Koin) berbasis mobile dan web.

### Tech Stack
| Layer | Teknologi |
|-------|-----------|
| Mobile | React Native + Expo SDK 51 |
| Web | Vite + React 19 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 16 |
| Auth | JWT + bcrypt |
| PDF | pdfkit |
| Excel | exceljs |
| Email | Mailgun |

### Struktur Proyek
```
laundry-system/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── user-management/
│       │   ├── laundry-service/
│       │   ├── machine/
│       │   ├── pemesanan/
│       │   ├── transaction/
│       │   ├── shift/
│       │   ├── notification/
│       │   ├── audit/
│       │   └── report/
│       └── shared/
├── frontend/
│   ├── mobile/
│   ├── web/
│   └── public/
├── database/
│   ├── schema.sql
│   ├── migrations/
│   └── seeds/
└── docs/
```

---

## 2. KONDISI SAAT INI

### Database
- [x] 12 tabel sudah dibuat
- [x] Junction tables menggunakan single PK
- [x] Indexes sudah dibuat
- [ ] Seed data belum lengkap

### Backend
- [x] Auth module (login, register, logout, change-password)
- [x] User management module (CRUD karyawan/customer)
- [x] Laundry service module (CRUD layanan)
- [x] Machine module (READ only)
- [x] Pemesanan module (CRUD booking)
- [x] Transaction module (create, read)
- [x] Shift module (CRUD + assign)
- [x] Notification module (CRUD)
- [x] Audit module (READ only)
- [x] Report module (READ only)

### Frontend Web
- [x] UI components (17 files)
- [ ] API integration (100% localStorage)
- [ ] Auth integration (hardcoded login)

### Frontend Mobile
- [x] UI screens (13 files)
- [x] Navigation structure
- [ ] API integration (mock mode)
- [ ] Route mismatch dengan backend

---

## 3. FASE 1: BACKEND COMPLETION

### 3.1 Machine Module Enhancement

**File yang diubah:**
- [ ] `backend/src/modules/machine/repositories/machine.repository.js`
- [ ] `backend/src/modules/machine/services/machine.service.js`
- [ ] `backend/src/modules/machine/controllers/machine.controller.js`
- [ ] `backend/src/modules/machine/routes/machine.routes.js`

**Endpoints yang ditambah:**
- [ ] `POST /api/v1/mesin` - Tambah mesin (admin)
- [ ] `PUT /api/v1/mesin/:id` - Update mesin (admin)
- [ ] `PATCH /api/v1/mesin/:id/status` - Ubah status mesin (admin)

**Bug fix:**
- [ ] `findAvailableByDateAndShift()` - Ganti query dari `pemesanan.id_mesin` ke `booking_mesin`

**Detail Implementasi:**

```javascript
// machine.repository.js - Method baru
async create({ kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter }) {
  const { rows } = await db.query(
    `INSERT INTO mesin_cuci (kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter]
  );
  return rows[0];
}

async update(id, { nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter }) {
  const { rows } = await db.query(
    `UPDATE mesin_cuci 
     SET nama_mesin = $1, kapasitas_kg = $2, konsumsi_kwh = $3, penggunaan_air_liter = $4
     WHERE id_mesin = $5
     RETURNING *`,
    [nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter, id]
  );
  return rows[0];
}

async updateStatus(id, status_mesin) {
  const { rows } = await db.query(
    'UPDATE mesin_cuci SET status_mesin = $1 WHERE id_mesin = $2 RETURNING *',
    [status_mesin, id]
  );
  return rows[0];
}

// Bug fix - findAvailableByDateAndShift
async findAvailableByDateAndShift(tanggal, shift) {
  const { rows } = await db.query(
    `SELECT * FROM mesin_cuci 
     WHERE status_mesin = 'tersedia'
     AND id_mesin NOT IN (
       SELECT bm.id_mesin FROM booking_mesin bm
       JOIN pemesanan p ON bm.id_pemesanan = p.id_pemesanan
       WHERE p.tanggal_pesanan = $1 AND p.shift = $2 
       AND p.status_pesanan NOT IN ('selesai', 'pesanan ditolak')
     )
     ORDER BY kode_mesin ASC`,
    [tanggal, shift],
  );
  return rows;
}
```

---

### 3.2 Auth Module Enhancement

**File yang diubah:**
- [ ] `backend/src/modules/auth/controllers/auth.controller.js`
- [ ] `backend/src/modules/auth/services/auth.service.js`
- [ ] `backend/src/modules/auth/repositories/customer.repository.js`
- [ ] `backend/src/modules/auth/repositories/karyawan.repository.js`
- [ ] `backend/src/modules/auth/repositories/owner.repository.js`
- [ ] `backend/src/modules/auth/routes/auth.routes.js`

**Endpoints yang ditambah:**
- [ ] `POST /api/v1/auth/forgot-password` - Kirim OTP reset password

**Dependencies:**
- [ ] `npm install mailgun.js`

**Detail Implementasi:**

```javascript
// customer.repository.js - Method baru
async findByEmail(email) {
  const { rows } = await db.query(
    'SELECT id_customer, nama_lengkap, email FROM customer WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

// auth.service.js - Method baru
async forgotPassword(email) {
  if (!email) {
    throw Object.assign(new Error('Email wajib diisi.'), { statusCode: 400 });
  }

  // Cari user di 3 tabel
  let user = await customerRepository.findByEmail(email);
  let table = 'customer';

  if (!user) {
    user = await karyawanRepository.findByEmail(email);
    table = 'karyawan';
  }

  if (!user) {
    user = await ownerRepository.findByEmail(email);
    table = 'owner';
  }

  if (!user) {
    throw Object.assign(new Error('Email tidak terdaftar.'), { statusCode: 404 });
  }

  // Generate OTP 6 digit
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Simpan OTP di memory
  if (!this.otpStore) {
    this.otpStore = new Map();
  }
  this.otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 menit
  });

  // Kirim email via Mailgun
  const mailgun = require('mailgun.js');
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
  });

  await mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: 'Laundry System <noreply@laundry.com>',
    to: [email],
    subject: 'Reset Password - Laundry System',
    text: `Kode OTP Anda: ${otp}. Berlaku selama 10 menit.`
  });

  return true;
}

// auth.routes.js - Tambah route
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    status: 'error',
    message: 'Terlalu banyak permintaan reset password. Coba lagi dalam 15 menit.',
  },
});

router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
```

---

### 3.3 Transaction Module Enhancement

**File yang diubah:**
- [ ] `backend/src/modules/transaction/repositories/transaksi.repository.js`
- [ ] `backend/src/modules/transaction/services/transaksi.service.js`
- [ ] `backend/src/modules/transaction/controllers/transaksi.controller.js`
- [ ] `backend/src/modules/transaction/routes/transaksi.routes.js`

**Endpoints yang ditambah:**
- [ ] `PATCH /api/v1/transaksi/:id/pay` - Konfirmasi pembayaran
- [ ] `GET /api/v1/transaksi/daily-recap` - Rekap harian kasir
- [ ] `GET /api/v1/transaksi/:id/pdf` - Generate PDF struk

**Dependencies:**
- [ ] `npm install pdfkit`

**Detail Implementasi:**

```javascript
// transaksi.repository.js - Method baru
async updatePaymentStatus(id, metode_pembayaran) {
  const { rows } = await db.query(
    `UPDATE transaksi 
     SET status_pembayaran = 'lunas', metode_pembayaran = $1
     WHERE id_transaksi = $2
     RETURNING *`,
    [metode_pembayaran, id]
  );
  return rows[0];
}

async getDailyRecap({ tanggal, id_karyawan, shift }) {
  let query = `
    SELECT 
      COUNT(*) AS total_transaksi, 
      SUM(total) AS total_pendapatan,
      COUNT(CASE WHEN status_pembayaran = 'lunas' THEN 1 END) AS transaksi_lunas,
      COUNT(CASE WHEN status_pembayaran = 'belum dibayar' THEN 1 END) AS transaksi_belum_lunas
    FROM transaksi t
    JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
    WHERE DATE(t.tanggal_transaksi) = $1
      AND t.id_karyawan = $2
  `;
  const params = [tanggal, id_karyawan];
  let paramIndex = 3;

  if (shift) {
    query += ` AND p.shift = $${paramIndex++}`;
    params.push(shift);
  }

  const { rows } = await db.query(query, params);
  return rows[0];
}

// transaksi.service.js - Method baru
async confirmPayment(id, metode_pembayaran) {
  const transaksi = await transaksiRepository.findById(id);
  if (!transaksi) {
    throw Object.assign(new Error('Transaksi tidak ditemukan.'), { statusCode: 404 });
  }

  if (transaksi.status_pembayaran === 'lunas') {
    throw Object.assign(new Error('Transaksi sudah lunas.'), { statusCode: 400 });
  }

  const updated = await transaksiRepository.updatePaymentStatus(id, metode_pembayaran);
  await pemesananRepository.updateStatus(transaksi.id_pemesanan, 'sudah dibayar');

  return updated;
}

async generatePDF(id) {
  const transaksi = await transaksiRepository.findByIdWithDetails(id);
  if (!transaksi) {
    throw Object.assign(new Error('Transaksi tidak ditemukan.'), { statusCode: 404 });
  }

  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ size: 'A5', margin: 30 });

  // Header
  doc.fontSize(16).text('LAUNDRY SYSTEM', { align: 'center' });
  doc.fontSize(10).text('Struk Digital', { align: 'center' });
  doc.moveDown();

  // Info struk
  doc.fontSize(10);
  doc.text(`No. Struk: ${transaksi.nomor_struk}`);
  doc.text(`Tanggal: ${new Date(transaksi.tanggal_transaksi).toLocaleDateString('id-ID')}`);
  doc.text(`Kasir: ${transaksi.nama_karyawan}`);
  doc.moveDown();

  // Info customer
  doc.text(`Customer: ${transaksi.nama_customer}`);
  doc.text(`Layanan: ${transaksi.nama_layanan}`);
  if (transaksi.berat_kg) {
    doc.text(`Berat: ${transaksi.berat_kg} kg`);
  }
  doc.moveDown();

  // Total
  doc.fontSize(12).text(`TOTAL: Rp ${parseFloat(transaksi.total).toLocaleString()}`, { align: 'right' });
  doc.fontSize(10).text(`Metode: ${transaksi.metode_pembayaran}`, { align: 'right' });
  doc.text(`Status: ${transaksi.status_pembayaran.toUpperCase()}`, { align: 'right' });

  return doc;
}

// transaksi.routes.js - Tambah routes
router.patch('/:id/pay', restrictTo(ROLES.KASIR, ROLES.ADMIN), transaksiController.confirmPayment);
router.get('/daily-recap', restrictTo(ROLES.KASIR), transaksiController.getDailyRecap);
router.get('/:id/pdf', restrictTo(ROLES.KASIR, ROLES.ADMIN, ROLES.CUSTOMER), transaksiController.generatePDF);
```

---

### 3.4 Report Module Enhancement

**File yang diubah:**
- [ ] `backend/src/modules/report/repositories/report.repository.js`
- [ ] `backend/src/modules/report/services/report.service.js`
- [ ] `backend/src/modules/report/controllers/report.controller.js`
- [ ] `backend/src/modules/report/routes/report.routes.js`

**Endpoints yang ditambah:**
- [ ] `GET /api/v1/reports/shift-performance` - Performa shift
- [ ] `GET /api/v1/reports/export` - Export PDF/Excel

**Dependencies:**
- [ ] `npm install puppeteer exceljs`

**Detail Implementasi:**

```javascript
// report.repository.js - Method baru
async getShiftPerformance({ tanggal_mulai, tanggal_akhir }) {
  const { rows } = await db.query(
    `SELECT 
      p.shift AS nama_shift,
      COUNT(t.id_transaksi) AS total_transaksi,
      SUM(t.total) AS total_pendapatan,
      AVG(t.total) AS rata_rata_transaksi
    FROM transaksi t
    JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
    WHERE t.tanggal_transaksi >= $1
      AND t.tanggal_transaksi <= $2
    GROUP BY p.shift
    ORDER BY 
      CASE p.shift 
        WHEN 'pagi' THEN 1 
        WHEN 'siang' THEN 2 
        WHEN 'sore' THEN 3 
        WHEN 'malam' THEN 4 
      END`,
    [tanggal_mulai, tanggal_akhir]
  );
  return rows;
}

// report.service.js - Method baru
async exportReport({ type, tanggal_mulai, tanggal_akhir, jenis_layanan }) {
  const financeData = await reportRepository.getFinanceData({ tanggal_mulai, tanggal_akhir, jenis_layanan });

  if (type === 'pdf') {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.fontSize(18).text('Laporan Keuangan Laundry System', { align: 'center' });
    doc.fontSize(12).text(`Periode: ${tanggal_mulai} - ${tanggal_akhir}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('Ringkasan');
    doc.fontSize(10);
    doc.text(`Total Pendapatan: Rp ${parseFloat(financeData.total_pendapatan).toLocaleString()}`);
    doc.text(`Total Transaksi: ${financeData.total_transaksi}`);
    doc.text(`Transaksi Lunas: ${financeData.transaksi_lunas}`);
    doc.text(`Transaksi Belum Lunas: ${financeData.transaksi_belum_lunas}`);

    return { doc, contentType: 'application/pdf', filename: `laporan-${tanggal_mulai}-${tanggal_akhir}.pdf` };
  } else if (type === 'excel') {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Keuangan');

    worksheet.columns = [
      { header: 'Metrik', key: 'metrik', width: 30 },
      { header: 'Nilai', key: 'nilai', width: 20 }
    ];

    worksheet.addRow({ metrik: 'Total Pendapatan', nilai: `Rp ${parseFloat(financeData.total_pendapatan).toLocaleString()}` });
    worksheet.addRow({ metrik: 'Total Transaksi', nilai: financeData.total_transaksi });
    worksheet.addRow({ metrik: 'Transaksi Lunas', nilai: financeData.transaksi_lunas });
    worksheet.addRow({ metrik: 'Transaksi Belum Lunas', nilai: financeData.transaksi_belum_lunas });

    return { workbook, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `laporan-${tanggal_mulai}-${tanggal_akhir}.xlsx` };
  }
}

// report.routes.js - Tambah routes
router.get('/shift-performance', restrictTo(ROLES.OWNER), reportController.getShiftPerformance);
router.get('/export', restrictTo(ROLES.OWNER), reportController.exportReport);
```

---

### 3.5 Pemesanan Module Enhancement

**File yang diubah:**
- [ ] `backend/src/modules/pemesanan/repositories/pemesanan.repository.js`
- [ ] `backend/src/modules/pemesanan/services/pemesanan.service.js`
- [ ] `backend/src/modules/pemesanan/controllers/pemesanan.controller.js`

**Endpoints yang ditambah:**
- [ ] `GET /api/v1/pemesanan/:id/mesin` - Ambil mesin per booking

**Detail Implementasi:**

```javascript
// pemesanan.repository.js - Method baru
async findMesinByBookingId(id_pemesanan) {
  const { rows } = await db.query(
    `SELECT m.id_mesin, m.kode_mesin, m.tipe_mesin, m.nama_mesin
     FROM mesin_cuci m
     JOIN booking_mesin bm ON m.id_mesin = bm.id_mesin
     WHERE bm.id_pemesanan = $1
     ORDER BY m.tipe_mesin, m.kode_mesin`,
    [id_pemesanan]
  );
  return rows;
}

// pemesanan.routes.js - Tambah route
router.get('/:id/mesin', protect, pemesananController.getMesinByBooking);
```

---

## 4. FASE 2: DATABASE & SEED DATA

### 4.1 Update Seed Data

**File yang diubah:**
- [ ] `database/seeds/001_dev_seed.sql`

**Data yang ditambah:**

```sql
-- Customer (5 data)
INSERT INTO customer (nama_lengkap, username, no_hp, email, password, alamat) VALUES
('Budi Santoso', 'budi', '081234567890', 'budi@mail.com', '$2b$10$hashed_password', 'Jl. Merdeka No. 10'),
('Siti Rahayu', 'siti', '081234567891', 'siti@mail.com', '$2b$10$hashed_password', 'Jl. Sudirman No. 20'),
('Ahmad Fauzi', 'ahmad', '081234567892', 'ahmad@mail.com', '$2b$10$hashed_password', 'Jl. Gatot Subroto No. 30'),
('Dewi Lestari', 'dewi', '081234567893', 'dewi@mail.com', '$2b$10$hashed_password', 'Jl. Ahmad Yani No. 40'),
('Rizki Pratama', 'rizki', '081234567894', 'rizki@mail.com', '$2b$10$hashed_password', 'Jl. Diponegoro No. 50');

-- Karyawan (3 data)
INSERT INTO karyawan (nama_lengkap, username, no_hp, email, password, role, alamat) VALUES
('Admin Utama', 'admin', '081234567895', 'admin@laundry.com', '$2b$10$hashed_password', 'admin', 'Jl. Admin No. 1'),
('Kasir Pagi', 'kasir_pagi', '081234567896', 'kasir.pagi@laundry.com', '$2b$10$hashed_password', 'kasir', 'Jl. Kasir No. 1'),
('Kasir Siang', 'kasir_siang', '081234567897', 'kasir.siang@laundry.com', '$2b$10$hashed_password', 'kasir', 'Jl. Kasir No. 2');

-- Owner (1 data)
INSERT INTO owner (nama_lengkap, username, no_hp, email, password) VALUES
('Owner Utama', 'owner', '081234567898', 'owner@laundry.com', '$2b$10$hashed_password');

-- Mesin Cuci (6 data)
INSERT INTO mesin_cuci (kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter) VALUES
('MC-01', 'pencucian', 'Mesin Cuci 1', 10, 1.5, 50),
('MC-02', 'pencucian', 'Mesin Cuci 2', 10, 1.5, 50),
('MC-03', 'pencucian', 'Mesin Cuci 3', 12, 1.8, 60),
('MD-01', 'pengeringan', 'Mesin Pengering 1', 8, 2.0, 0),
('MD-02', 'pengeringan', 'Mesin Pengering 2', 8, 2.0, 0),
('MD-03', 'pengeringan', 'Mesin Pengering 3', 10, 2.5, 0);

-- Layanan (4 data)
INSERT INTO layanan (nama_layanan, jenis_layanan, harga, estimasi_waktu) VALUES
('Kiloan Reguler', 'kiloan', 6000, 180),
('Kiloan Express', 'kiloan', 10000, 90),
('Koin Cuci Saja', 'koin', 8000, 45),
('Koin Cuci + Kering', 'koin', 12000, 60);

-- Pemesanan (10 data - berbagai status)
INSERT INTO pemesanan (id_customer, id_layanan, tanggal_pesanan, shift, status_pesanan, berat_kg, jenis_pencucian, metode_pengambilan) VALUES
(1, 1, '2026-07-01', 'pagi', 'selesai', 5.0, 'kiloan', 'ambil_sendiri'),
(2, 2, '2026-07-01', 'siang', 'selesai', 3.5, 'kiloan', 'pengiriman'),
(3, 3, '2026-07-02', 'pagi', 'selesai', NULL, 'koin', 'ambil_sendiri'),
(4, 4, '2026-07-02', 'sore', 'selesai', NULL, 'koin', 'ambil_sendiri'),
(5, 1, '2026-07-03', 'pagi', 'sedang di cuci', 7.0, 'kiloan', 'ambil_sendiri'),
(1, 2, '2026-07-03', 'siang', 'menunggu pembayaran', 4.0, 'kiloan', 'pengiriman'),
(2, 3, '2026-07-03', 'sore', 'diproses', NULL, 'koin', 'ambil_sendiri'),
(3, 1, '2026-07-04', 'pagi', 'menunggu konfirmasi', 6.0, 'kiloan', 'ambil_sendiri'),
(4, 4, '2026-07-04', 'siang', 'menunggu konfirmasi', NULL, 'koin', 'ambil_sendiri'),
(5, 2, '2026-07-04', 'sore', 'menunggu konfirmasi', 8.0, 'kiloan', 'pengiriman');

-- Transaksi (10 data)
INSERT INTO transaksi (id_pemesanan, id_customer, id_karyawan, nomor_struk, total, metode_pembayaran, status_pembayaran, tanggal_transaksi) VALUES
(1, 1, 2, 'STRUK-20260701-0001', 30000, 'cash', 'lunas', '2026-07-01 10:00:00'),
(2, 2, 2, 'STRUK-20260701-0002', 35000, 'qris', 'lunas', '2026-07-01 14:00:00'),
(3, 3, 2, 'STRUK-20260702-0001', 8000, 'cash', 'lunas', '2026-07-02 09:00:00'),
(4, 4, 3, 'STRUK-20260702-0002', 12000, 'transfer', 'lunas', '2026-07-02 16:00:00'),
(5, 5, 2, 'STRUK-20260703-0001', 42000, 'cash', 'belum dibayar', '2026-07-03 08:00:00'),
(6, 1, 3, 'STRUK-20260703-0002', 40000, 'qris', 'belum dibayar', '2026-07-03 13:00:00'),
(7, 2, 2, 'STRUK-20260703-0003', 8000, 'cash', 'belum dibayar', '2026-07-03 15:00:00');

-- Booking Mesin (untuk pemesanan koin)
INSERT INTO booking_mesin (id_pemesanan, id_mesin) VALUES
(3, 1), (4, 3), (4, 5), (7, 2);

-- Shifts (5 data)
INSERT INTO shifts (nama_shift, tanggal, jam_mulai, jam_selesai) VALUES
('pagi', '2026-07-03', '08:00', '16:00'),
('siang', '2026-07-03', '12:00', '20:00'),
('sore', '2026-07-03', '16:00', '24:00'),
('pagi', '2026-07-04', '08:00', '16:00'),
('siang', '2026-07-04', '12:00', '20:00');

-- Shift Karyawan (6 data)
INSERT INTO shift_karyawan (id_shift, id_karyawan) VALUES
(1, 1), (1, 2), (2, 3), (3, 2), (4, 1), (5, 3);

-- Notifikasi (10 data)
INSERT INTO notifikasi (id_pemesanan, id_customer, judul, isi_pesan, is_read) VALUES
(1, 1, 'Pesanan Dikonfirmasi', 'Pesanan kiloan Anda telah dikonfirmasi.', true),
(1, 1, 'Cucian Sedang Dicuci', 'Pesanan Anda sedang dalam proses pencucian.', true),
(1, 1, 'Pesanan Selesai', 'Pesanan Anda sudah selesai. Silakan ambil di outlet.', true),
(5, 5, 'Pesanan Dikonfirmasi', 'Pesanan kiloan Anda telah dikonfirmasi.', false),
(5, 5, 'Cucian Sedang Dicuci', 'Pesanan Anda sedang dalam proses pencucian.', false),
(6, 1, 'Menunggu Pembayaran', 'Pesanan Anda menunggu pembayaran.', false),
(7, 2, 'Pesanan Dikonfirmasi', 'Pesanan koin Anda telah dikonfirmasi.', false),
(8, 3, 'Pesanan Baru', 'Anda memiliki pesanan baru menunggu konfirmasi.', false),
(9, 4, 'Pesanan Baru', 'Anda memiliki pesanan baru menunggu konfirmasi.', false),
(10, 5, 'Pesanan Baru', 'Anda memiliki pesanan baru menunggu konfirmasi.', false);

-- Audit Log (20 data)
INSERT INTO audit_log (id_customer, id_karyawan, tipe_log, isi_pesan, aktivitas, status) VALUES
(1, NULL, 'LOGIN_SUCCESS', 'Customer dengan ID 1 berhasil login', 'customer login berhasil', 'berhasil'),
(2, NULL, 'LOGIN_SUCCESS', 'Customer dengan ID 2 berhasil login', 'customer login berhasil', 'berhasil'),
(NULL, 1, 'LOGIN_SUCCESS', 'Karyawan dengan ID 1 berhasil login', 'karyawan login berhasil', 'berhasil'),
(NULL, 2, 'LOGIN_SUCCESS', 'Karyawan dengan ID 2 berhasil login', 'karyawan login berhasil', 'berhasil'),
(1, NULL, 'BOOKING_CREATED', 'Customer ID 1 membuat booking ID 1', 'customer membuat booking', 'berhasil'),
(2, NULL, 'BOOKING_CREATED', 'Customer ID 2 membuat booking ID 2', 'customer membuat booking', 'berhasil'),
(NULL, 1, 'BOOKING_CONFIRMED', 'Booking ID 1 dikonfirmasi oleh admin', 'konfirmasi booking', 'berhasil'),
(NULL, 1, 'BOOKING_CONFIRMED', 'Booking ID 2 dikonfirmasi oleh admin', 'konfirmasi booking', 'berhasil'),
(NULL, 2, 'TRANSACTION_CREATED', 'Transaksi ID 1 dibuat oleh kasir ID 2', 'membuat transaksi', 'berhasil'),
(NULL, 2, 'PAYMENT_CONFIRMED', 'Pembayaran transaksi ID 1 dikonfirmasi', 'konfirmasi pembayaran', 'berhasil'),
(1, NULL, 'NOTIFICATION_READ', 'Notifikasi ID 1 dibaca oleh customer ID 1', 'membaca notifikasi', 'berhasil'),
(NULL, 1, 'SHIFT_CREATED', 'Shift pagi 2026-07-03 dibuat', 'membuat shift', 'berhasil'),
(NULL, 1, 'SHIFT_ASSIGNED', 'Karyawan ID 1 di-assign ke shift ID 1', 'assign karyawan', 'berhasil'),
(NULL, 1, 'MACHINE_STATUS_CHANGED', 'Status mesin ID 1 diubah ke dipakai', 'ubah status mesin', 'berhasil'),
(NULL, 1, 'SERVICE_CREATED', 'Layanan Kiloan Reguler dibuat', 'membuat layanan', 'berhasil'),
(3, NULL, 'REGISTER_SUCCESS', 'Customer ID 3 berhasil registrasi', 'customer registrasi', 'berhasil'),
(4, NULL, 'REGISTER_SUCCESS', 'Customer ID 4 berhasil registrasi', 'customer registrasi', 'berhasil'),
(5, NULL, 'REGISTER_SUCCESS', 'Customer ID 5 berhasil registrasi', 'customer registrasi', 'berhasil'),
(NULL, 3, 'LOGIN_SUCCESS', 'Karyawan dengan ID 3 berhasil login', 'karyawan login berhasil', 'berhasil'),
(NULL, 1, 'USER_CREATED', 'Admin membuat karyawan baru dengan ID 3', 'membuat karyawan', 'berhasil');
```

---

## 5. FASE 3: FRONTEND WEB - API INTEGRATION

### 5.1 Buat API Service Layer

**File yang dibuat:**
- [ ] `frontend/web/src/services/api.ts`
- [ ] `frontend/web/src/services/auth.service.ts`
- [ ] `frontend/web/src/services/booking.service.ts`
- [ ] `frontend/web/src/services/transaction.service.ts`
- [ ] `frontend/web/src/services/machine.service.ts`
- [ ] `frontend/web/src/services/shift.service.ts`
- [ ] `frontend/web/src/services/notification.service.ts`
- [ ] `frontend/web/src/services/report.service.ts`
- [ ] `frontend/web/src/services/audit.service.ts`

**Contoh api.ts:**
```typescript
const API_BASE = 'http://localhost:3000/api/v1';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
```

---

### 5.2 Auth Integration

**File yang diubah:**
- [ ] `frontend/web/src/App.tsx`
- [ ] `frontend/web/src/components/LoginPage.tsx`

**Perubahan:**
- [ ] Ganti hardcoded login dengan `POST /api/v1/auth/login`
- [ ] Simpan token di localStorage
- [ ] Tambah auth context/hook untuk manage user state
- [ ] Tambah logout functionality
- [ ] Tambah protected routes

---

### 5.3 Kasir Pages Integration

**File yang diubah:**
- [ ] `frontend/web/src/components/CashierDashboard.tsx`
- [ ] `frontend/web/src/components/NewTransaction.tsx`
- [ ] `frontend/web/src/components/TransactionsHistory.tsx`
- [ ] `frontend/web/src/components/DailyRecap.tsx`
- [ ] `frontend/web/src/components/MachinesStatus.tsx`
- [ ] `frontend/web/src/components/CustomerDirectory.tsx`
- [ ] `frontend/web/src/components/ReceiptPrint.tsx`

**Perubahan per file:**

**CashierDashboard.tsx:**
- [ ] Fetch transaksi dari `/api/v1/transaksi`
- [ ] Fetch daily recap dari `/api/v1/transaksi/daily-recap`
- [ ] Tambah loading state
- [ ] Tambah error handling

**NewTransaction.tsx:**
- [ ] Fetch bookings dari `/api/v1/pemesanan?status=diproses`
- [ ] Submit transaksi ke `/api/v1/transaksi`
- [ ] Generate struk PDF dari `/api/v1/transaksi/:id/pdf`

**TransactionsHistory.tsx:**
- [ ] Fetch transaksi dari `/api/v1/transaksi`
- [ ] Tambah filter (status, tanggal, metode bayar)
- [ ] Tambah pagination

**DailyRecap.tsx:**
- [ ] Fetch recap dari `/api/v1/transaksi/daily-recap`
- [ ] Tambah filter shift

**MachinesStatus.tsx:**
- [ ] Fetch mesin dari `/api/v1/mesin`
- [ ] Tambah real-time status update

**CustomerDirectory.tsx:**
- [ ] Fetch customers dari `/api/v1/users/customers`

**ReceiptPrint.tsx:**
- [ ] Fetch transaksi detail dari `/api/v1/transaksi/:id`
- [ ] Download PDF dari `/api/v1/transaksi/:id/pdf`

---

### 5.4 Admin Pages Integration

**File yang diubah:**
- [ ] `frontend/web/src/components/AdminPanel.tsx`
- [ ] `frontend/web/src/components/ConfirmBookings.tsx`
- [ ] `frontend/web/src/components/ShiftManagement.tsx`
- [ ] `frontend/web/src/components/EmployeeDirectory.tsx`
- [ ] `frontend/web/src/components/ServiceManagement.tsx`

**Perubahan per file:**

**AdminPanel.tsx:**
- [ ] Fetch summary dari `/api/v1/reports/summary`
- [ ] Tambah dashboard metrics

**ConfirmBookings.tsx:**
- [ ] Fetch bookings dari `/api/v1/pemesanan?status=menunggu konfirmasi`
- [ ] Confirm booking ke `/api/v1/pemesanan/:id/status`
- [ ] Reject booking ke `/api/v1/pemesanan/:id/cancel`
- [ ] Kirim notifikasi ke `/api/v1/notifications`

**ShiftManagement.tsx:**
- [ ] Fetch shifts dari `/api/v1/shifts`
- [ ] Create shift ke `/api/v1/shifts`
- [ ] Assign karyawan ke `/api/v1/shifts/:id/assign`
- [ ] Unassign karyawan ke `/api/v1/shifts/:id/unassign/:karyawan_id`

**EmployeeDirectory.tsx:**
- [ ] Fetch karyawan dari `/api/v1/users/karyawan`
- [ ] Create karyawan ke `/api/v1/users/karyawan`
- [ ] Update karyawan ke `/api/v1/users/:table/:id`
- [ ] Reset password ke `/api/v1/users/:table/:id/reset-password`

**ServiceManagement.tsx:**
- [ ] Fetch services dari `/api/v1/services`
- [ ] Create service ke `/api/v1/services`
- [ ] Update service ke `/api/v1/services/:id`
- [ ] Delete service ke `/api/v1/services/:id`

---

### 5.5 Owner Pages Integration

**File yang diubah:**
- [ ] `frontend/web/src/components/OwnerDashboard.tsx`

**Perubahan:**
- [ ] Fetch finance dari `/api/v1/reports/finance`
- [ ] Fetch summary dari `/api/v1/reports/summary`
- [ ] Fetch shift performance dari `/api/v1/reports/shift-performance`
- [ ] Fetch audit log dari `/api/v1/audit`
- [ ] Export PDF dari `/api/v1/reports/export?type=pdf`
- [ ] Export Excel dari `/api/v1/reports/export?type=excel`
- [ ] Tambah filter tanggal

---

## 6. FASE 4: FRONTEND MOBILE - API INTEGRATION

### 6.1 Fix Route Mismatches

**File yang diubah:**
- [ ] `frontend/mobile/src/services/api.ts`

**Perubahan:**
- [ ] `/bookings` → `/pemesanan`
- [ ] `/auth/lupa-password` → `/auth/forgot-password`
- [ ] `/payments/:id` → `/transaksi/:id`
- [ ] `/services` → `/services` (sudah benar)
- [ ] `/mesin` → `/mesin` (sudah benar)

---

### 6.2 Aktifkan Real API

**File yang diubah:**
- [ ] `frontend/mobile/src/services/api.ts`

**Perubahan:**
- [ ] Set `USE_MOCK = false`
- [ ] Tambah error handling untuk setiap API call
- [ ] Tambah loading states
- [ ] Tambah retry logic untuk network errors

---

### 6.3 Auth Integration

**File yang diubah:**
- [ ] `frontend/mobile/src/context/AuthContext.tsx`
- [ ] `frontend/mobile/src/screens/LoginScreen.tsx`
- [ ] `frontend/mobile/src/screens/RegisterScreen.tsx`
- [ ] `frontend/mobile/src/screens/ForgotPasswordScreen.tsx`

**Perubahan:**
- [ ] Real API calls untuk login/register
- [ ] Token management dengan AsyncStorage
- [ ] Auto-refresh token
- [ ] Handle expired token

---

### 6.4 Booking Flow Integration

**File yang diubah:**
- [ ] `frontend/mobile/src/screens/BookingScreen.tsx`
- [ ] `frontend/mobile/src/screens/BookingKoinScreen.tsx`
- [ ] `frontend/mobile/src/screens/AddressScreen.tsx`

**Perubahan:**
- [ ] Fetch services dari `/api/v1/services`
- [ ] Fetch available machines dari `/api/v1/mesin/available`
- [ ] Create booking ke `/api/v1/pemesanan`
- [ ] Handle booking confirmation

---

### 6.5 Status & History Integration

**File yang diubah:**
- [ ] `frontend/mobile/src/screens/StatusScreen.tsx`
- [ ] `frontend/mobile/src/screens/RiwayatScreen.tsx`
- [ ] `frontend/mobile/src/screens/TrackingScreen.tsx`

**Perubahan:**
- [ ] Fetch bookings dari `/api/v1/pemesanan`
- [ ] Real-time status updates
- [ ] Pull-to-refresh
- [ ] Pagination untuk history

---

### 6.6 Notification Integration

**File yang dibuat:**
- [ ] `frontend/mobile/src/screens/NotificationScreen.tsx`

**File yang diubah:**
- [ ] `frontend/mobile/src/navigation/AppNavigator.tsx`

**Perubahan:**
- [ ] Tambah tab notifikasi
- [ ] Fetch notifications dari `/api/v1/notifications`
- [ ] Badge count untuk unread
- [ ] Mark as read functionality

---

## 7. FASE 5: UI/UX IMPROVEMENTS

### 7.1 Web Dashboard UI Improvements

**Perubahan:**
- [ ] Tambah loading spinners
- [ ] Tambah error messages yang user-friendly
- [ ] Tambah confirmation dialogs
- [ ] Tambah toast notifications
- [ ] Tambah responsive design untuk mobile web
- [ ] Perbaiki form validation
- [ ] Tambah empty states

---

### 7.2 Mobile App UI Improvements

**Perubahan:**
- [ ] Tambah loading indicators
- [ ] Tambah error handling UI
- [ ] Tambah pull-to-refresh
- [ ] Tambah skeleton loading
- [ ] Tambah image optimization
- [ ] Tambah haptic feedback
- [ ] Perbaiki form validation

---

## 8. FASE 6: TESTING

### 8.1 Backend Testing

**File yang dibuat:**
- [ ] `backend/tests/auth.test.js`
- [ ] `backend/tests/booking.test.js`
- [ ] `backend/tests/transaction.test.js`
- [ ] `backend/tests/machine.test.js`
- [ ] `backend/tests/shift.test.js`
- [ ] `backend/tests/notification.test.js`
- [ ] `backend/tests/report.test.js`
- [ ] `backend/tests/audit.test.js`

**Dependencies:**
- [ ] `npm install --save-dev jest supertest`

---

### 8.2 Frontend Web Testing

**File yang dibuat:**
- [ ] `frontend/web/src/__tests__/LoginPage.test.tsx`
- [ ] `frontend/web/src/__tests__/CashierDashboard.test.tsx`
- [ ] `frontend/web/src/__tests__/AdminPanel.test.tsx`
- [ ] `frontend/web/src/__tests__/OwnerDashboard.test.tsx`

**Dependencies:**
- [ ] `npm install --save-dev @testing-library/react @testing-library/jest-dom`

---

### 8.3 Integration Testing

**Test scenarios:**
- [ ] Login flow (all roles)
- [ ] Booking flow (kiloan & koin)
- [ ] Transaction flow (payment & receipt)
- [ ] Shift management flow
- [ ] Notification flow
- [ ] Report generation flow

---

## 9. FASE 7: DOCUMENTATION UPDATE

### 9.1 Update API Spec

**File yang diubah:**
- [ ] `docs/api-spec.md`

**Perubahan:**
- [ ] Tambah semua endpoints yang baru
- [ ] Update response format
- [ ] Tambah error codes
- [ ] Tambah examples

---

### 9.2 Update Module Documentation

**File yang diubah:**
- [ ] `docs/modules/04-machine.md`
- [ ] `docs/modules/06-transaction.md`
- [ ] `docs/modules/09-report.md`

**Perubahan:**
- [ ] Update status dari "BELUM ADA" ke "SUDAH ADA"
- [ ] Tambah contoh response
- [ ] Tambah error handling

---

## 10. FASE 8: DEPLOYMENT PREPARATION

### 10.1 Docker Setup

**File yang dibuat:**
- [ ] `docker-compose.yml`
- [ ] `backend/Dockerfile`
- [ ] `frontend/web/Dockerfile`
- [ ] `database/Dockerfile` (opsional)

---

### 10.2 Environment Configuration

**File yang dibuat/ubah:**
- [ ] `.env.production`
- [ ] `.env.staging`
- [ ] `backend/.env.example` (update)

---

### 10.3 CI/CD Pipeline

**File yang dibuat:**
- [ ] `.github/workflows/ci.yml`
- [ ] `.github/workflows/deploy.yml`

---

## 11. DEPENDENCIES

### Backend
```bash
npm install pdfkit puppeteer exceljs mailgun.js
npm install --save-dev jest supertest
```

### Frontend Web
```bash
npm install axios
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Frontend Mobile
```bash
npm install @react-native-async-storage/async-storage
```

---

## 12. CHECKLIST AKHIR

### Database
- [ ] 12 tabel sudah dibuat
- [ ] Seed data lengkap
- [ ] Indexes sudah dibuat
- [ ] Foreign keys benar

### Backend
- [ ] Auth module lengkap (termasuk forgot-password)
- [ ] User management module lengkap
- [ ] Laundry service module lengkap
- [ ] Machine module lengkap (CRUD)
- [ ] Pemesanan module lengkap
- [ ] Transaction module lengkap (termasuk pay, daily-recap, pdf)
- [ ] Shift module lengkap
- [ ] Notification module lengkap
- [ ] Audit module lengkap
- [ ] Report module lengkap (termasuk shift-performance, export)

### Frontend Web
- [ ] API integration selesai
- [ ] Auth integration selesai
- [ ] Kasir pages terintegrasi
- [ ] Admin pages terintegrasi
- [ ] Owner pages terintegrasi
- [ ] Loading states ditambahkan
- [ ] Error handling ditambahkan

### Frontend Mobile
- [ ] Route mismatches diperbaiki
- [ ] Real API diaktifkan
- [ ] Auth integration selesai
- [ ] Booking flow terintegrasi
- [ ] Status & history terintegrasi
- [ ] Notification terintegrasi

### Testing
- [ ] Backend unit tests
- [ ] Frontend unit tests
- [ ] Integration tests

### Documentation
- [ ] API spec updated
- [ ] Module docs updated
- [ ] README updated

### Deployment
- [ ] Docker setup
- [ ] Environment configuration
- [ ] CI/CD pipeline

---

## CATATAN PENTING

1. **Jangan lupa bug fix di machine module** - `findAvailableByDateAndShift()` harus pakai `booking_mesin`
2. **Jangan lupa bug fix di index.js** - Import path `./modules/booking/` sudah diperbaiki ke `./modules/pemesanan/`
3. **Jangan lupa bug fix di transaksi.service.js** - Import path `../../booking/repositories/` sudah diperbaiki ke `../../pemesanan/repositories/`
4. **Mobile route mismatch** - `/bookings` harus diubah ke `/pemesanan`
5. **LoginPage.tsx is LOCKED** - Perlu approval untuk mengubah

---

**Terakhir diperbarui: 2026-07-04**
**Versi: 1.0**
