# Modul 09: Laporan (Report)

## Overview

Modul ini menangani laporan keuangan dan performa bisnis untuk owner. Owner dapat melihat ringkasan pendapatan, performa shift, dan mengekspor laporan dalam format PDF atau Excel.

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ✅ Sudah ada | Perlu tambah endpoint `shift-performance` dan `export` |
| Frontend Web | ✅ Sudah ada | `OwnerDashboard.tsx` |
| Frontend Mobile | ❌ Tidak ada | Tidak diperlukan (laporan untuk owner di web) |

---

## Database Tables

### Tabel yang Digunakan (Query Aggregasi)

```sql
-- Tabel transaksi (sumber data utama)
CREATE TABLE transaksi (
    id_transaksi        SERIAL PRIMARY KEY,
    id_pemesanan        INTEGER NOT NULL REFERENCES pemesanan(id_pemesanan),
    id_customer         INTEGER NOT NULL REFERENCES customer(id_customer),
    id_karyawan         INTEGER NOT NULL REFERENCES karyawan(id_karyawan),
    nomor_struk         VARCHAR(50) UNIQUE NOT NULL,
    total               NUMERIC(10,2) NOT NULL,
    metode_pembayaran   VARCHAR(20) NOT NULL,
    status_pembayaran   VARCHAR(20) NOT NULL DEFAULT 'pending',
    tanggal_transaksi   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel pemesanan (untuk filter jenis layanan)
CREATE TABLE pemesanan (
    id_pemesanan        SERIAL PRIMARY KEY,
    id_customer         INTEGER NOT NULL REFERENCES customer(id_customer),
    id_layanan          INTEGER NOT NULL REFERENCES layanan(id_layanan),
    tanggal_pesanan     DATE NOT NULL DEFAULT CURRENT_DATE,
    shift               VARCHAR(20) NOT NULL,
    status_pesanan      VARCHAR(30) NOT NULL DEFAULT 'menunggu konfirmasi',
    berat_kg            NUMERIC(5,2),
    jenis_pencucian     VARCHAR(20) NOT NULL,
    metode_pengambilan  VARCHAR(20) NOT NULL,
    catatan             TEXT
);

-- Tabel layanan (untuk filter jenis layanan)
CREATE TABLE layanan (
    id_layanan      SERIAL PRIMARY KEY,
    nama_layanan    VARCHAR(100) NOT NULL,
    jenis_layanan   VARCHAR(20) NOT NULL,
    harga           NUMERIC(10,2) NOT NULL,
    estimasi_waktu  INTEGER NOT NULL
);

-- Tabel shift_karyawan (untuk laporan performa shift)
CREATE TABLE shift_karyawan (
    id_shift      INTEGER NOT NULL REFERENCES shifts(id_shift),
    id_karyawan   INTEGER NOT NULL REFERENCES karyawan(id_karyawan),
    PRIMARY KEY (id_shift, id_karyawan)
);

-- Tabel shifts (untuk laporan performa shift)
CREATE TABLE shifts (
    id_shift      SERIAL PRIMARY KEY,
    nama_shift    VARCHAR(20) NOT NULL,
    tanggal       DATE NOT NULL,
    jam_mulai     TIME NOT NULL,
    jam_selesai   TIME NOT NULL
);
```

---

## API Endpoints

### 1. GET `/api/v1/reports/finance`

**Deskripsi:** Mendapatkan laporan keuangan

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** owner

**Query Parameters:**
- `tanggal_mulai` (required): Tanggal mulai (format: YYYY-MM-DD)
- `tanggal_akhir` (required): Tanggal akhir (format: YYYY-MM-DD)
- `jenis_layanan` (optional): Filter jenis layanan ('kiloan', 'koin')

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "periode": {
      "tanggal_mulai": "2026-07-01",
      "tanggal_akhir": "2026-07-03"
    },
    "ringkasan": {
      "total_pendapatan": 15000000,
      "total_transaksi": 150,
      "rata_rata_transaksi": 100000,
      "transaksi_lunas": 120,
      "transaksi_belum_lunas": 30
    },
    "per_jenis_layanan": {
      "kiloan": {
        "total_pendapatan": 10000000,
        "total_transaksi": 100,
        "persentase": 66.7
      },
      "koin": {
        "total_pendapatan": 5000000,
        "total_transaksi": 50,
        "persentase": 33.3
      }
    },
    "per_metode_pembayaran": {
      "cash": {
        "total_pendapatan": 8000000,
        "total_transaksi": 80
      },
      "qris": {
        "total_pendapatan": 4000000,
        "total_transaksi": 40
      },
      "transfer": {
        "total_pendapatan": 3000000,
        "total_transaksi": 30
      }
    },
    "per_hari": [
      {
        "tanggal": "2026-07-01",
        "total_pendapatan": 5000000,
        "total_transaksi": 50
      },
      {
        "tanggal": "2026-07-02",
        "total_pendapatan": 5000000,
        "total_transaksi": 50
      },
      {
        "tanggal": "2026-07-03",
        "total_pendapatan": 5000000,
        "total_transaksi": 50
      }
    ]
  },
  "message": "Laporan keuangan berhasil diambil"
}
```

**Query SQL:**
```sql
-- Ringkasan total
SELECT 
  SUM(t.total) AS total_pendapatan,
  COUNT(t.id_transaksi) AS total_transaksi,
  AVG(t.total) AS rata_rata_transaksi,
  COUNT(CASE WHEN t.status_pembayaran = 'lunas' THEN 1 END) AS transaksi_lunas,
  COUNT(CASE WHEN t.status_pembayaran = 'belum dibayar' THEN 1 END) AS transaksi_belum_lunas
FROM transaksi t
JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
JOIN layanan l ON p.id_layanan = l.id_layanan
WHERE t.tanggal_transaksi >= $1
  AND t.tanggal_transaksi <= $2
  AND ($3::text IS NULL OR l.jenis_layanan = $3);

-- Per jenis layanan
SELECT 
  l.jenis_layanan,
  SUM(t.total) AS total_pendapatan,
  COUNT(t.id_transaksi) AS total_transaksi
FROM transaksi t
JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
JOIN layanan l ON p.id_layanan = l.id_layanan
WHERE t.tanggal_transaksi >= $1
  AND t.tanggal_transaksi <= $2
GROUP BY l.jenis_layanan;

-- Per metode pembayaran
SELECT 
  t.metode_pembayaran,
  SUM(t.total) AS total_pendapatan,
  COUNT(t.id_transaksi) AS total_transaksi
FROM transaksi t
WHERE t.tanggal_transaksi >= $1
  AND t.tanggal_transaksi <= $2
GROUP BY t.metode_pembayaran;

-- Per hari
SELECT 
  DATE(t.tanggal_transaksi) AS tanggal,
  SUM(t.total) AS total_pendapatan,
  COUNT(t.id_transaksi) AS total_transaksi
FROM transaksi t
WHERE t.tanggal_transaksi >= $1
  AND t.tanggal_transaksi <= $2
GROUP BY DATE(t.tanggal_transaksi)
ORDER BY tanggal;
```

---

### 2. GET `/api/v1/reports/summary`

**Deskripsi:** Mendapatkan ringkasan dashboard owner

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** owner

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "booking": {
      "menunggu_konfirmasi": 5,
      "diproses": 10,
      "sedang_di_cuci": 8,
      "selesai": 120
    },
    "pendapatan": {
      "hari_ini": 1500000,
      "minggu_ini": 10000000,
      "bulan_ini": 45000000
    },
    "customer_baru": {
      "hari_ini": 3,
      "minggu_ini": 15,
      "bulan_ini": 50
    },
    "karyawan_aktif": 8
  },
  "message": "Ringkasan dashboard berhasil diambil"
}
```

**Query SQL:**
```sql
-- Booking berdasarkan status
SELECT 
  status_pesanan,
  COUNT(*) AS jumlah
FROM pemesanan
WHERE tanggal_pesanan >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY status_pesanan;

-- Pendapatan hari ini
SELECT SUM(total) AS pendapatan
FROM transaksi
WHERE DATE(tanggal_transaksi) = CURRENT_DATE
  AND status_pembayaran = 'lunas';

-- Pendapatan minggu ini
SELECT SUM(total) AS pendapatan
FROM transaksi
WHERE tanggal_transaksi >= CURRENT_DATE - INTERVAL '7 days'
  AND status_pembayaran = 'lunas';

-- Pendapatan bulan ini
SELECT SUM(total) AS pendapatan
FROM transaksi
WHERE EXTRACT(MONTH FROM tanggal_transaksi) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM tanggal_transaksi) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND status_pembayaran = 'lunas';

-- Customer baru hari ini
SELECT COUNT(*) AS jumlah
FROM customer
WHERE DATE(created_at) = CURRENT_DATE;

-- Customer baru minggu ini
SELECT COUNT(*) AS jumlah
FROM customer
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

-- Customer baru bulan ini
SELECT COUNT(*) AS jumlah
FROM customer
WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

-- Karyawan aktif
SELECT COUNT(*) AS jumlah
FROM karyawan
WHERE status_akun = 'aktif';
```

---

### 3. GET `/api/v1/reports/daily`

**Deskripsi:** Mendapatkan laporan pendapatan harian

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** owner

**Query Parameters:**
- `tanggal` (required): Tanggal (format: YYYY-MM-DD)

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "tanggal": "2026-07-03",
    "total_pendapatan": 1500000,
    "total_transaksi": 15,
    "per_shift": {
      "pagi": {
        "total_pendapatan": 600000,
        "total_transaksi": 6
      },
      "siang": {
        "total_pendapatan": 500000,
        "total_transaksi": 5
      },
      "sore": {
        "total_pendapatan": 400000,
        "total_transaksi": 4
      }
    },
    "transaksi": [
      {
        "id_transaksi": 1,
        "nomor_struk": "STRUK-20260703-0001",
        "nama_customer": "Andi Wijaya",
        "nama_layanan": "Kiloan Reguler",
        "total": 30000,
        "metode_pembayaran": "cash",
        "shift": "pagi"
      }
    ]
  },
  "message": "Laporan harian berhasil diambil"
}
```

**Query SQL:**
```sql
-- Total harian
SELECT SUM(t.total) AS total_pendapatan, COUNT(*) AS total_transaksi
FROM transaksi t
WHERE DATE(t.tanggal_transaksi) = $1;

-- Per shift
SELECT 
  p.shift,
  SUM(t.total) AS total_pendapatan,
  COUNT(*) AS total_transaksi
FROM transaksi t
JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
WHERE DATE(t.tanggal_transaksi) = $1
GROUP BY p.shift;

-- Detail transaksi
SELECT 
  t.id_transaksi, t.nomor_struk, c.nama_lengkap AS nama_customer,
  l.nama_layanan, t.total, t.metode_pembayaran, p.shift
FROM transaksi t
JOIN customer c ON t.id_customer = c.id_customer
JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
JOIN layanan l ON p.id_layanan = l.id_layanan
WHERE DATE(t.tanggal_transaksi) = $1
ORDER BY t.tanggal_transaksi;
```

---

### 4. GET `/api/v1/reports/shift-performance` ⚠️ BELUM ADA

**Deskripsi:** Mendapatkan laporan performa shift

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** owner

**Query Parameters:**
- `tanggal_mulai` (required): Tanggal mulai (format: YYYY-MM-DD)
- `tanggal_akhir` (required): Tanggal akhir (format: YYYY-MM-DD)

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "periode": {
      "tanggal_mulai": "2026-07-01",
      "tanggal_akhir": "2026-07-03"
    },
    "shifts": [
      {
        "nama_shift": "pagi",
        "total_transaksi": 45,
        "total_pendapatan": 4500000,
        "rata_rata_transaksi": 100000,
        "karyawan_aktif": 3,
        "karyawan": [
          {
            "id_karyawan": 1,
            "nama_lengkap": "Budi Santoso",
            "role": "admin"
          },
          {
            "id_karyawan": 2,
            "nama_lengkap": "Rudi Hermawan",
            "role": "kasir"
          }
        ]
      },
      {
        "nama_shift": "siang",
        "total_transaksi": 35,
        "total_pendapatan": 3500000,
        "rata_rata_transaksi": 100000,
        "karyawan_aktif": 2,
        "karyawan": [
          {
            "id_karyawan": 3,
            "nama_lengkap": "Siti Rahayu",
            "role": "kasir"
          }
        ]
      }
    ]
  },
  "message": "Laporan performa shift berhasil diambil"
}
```

**Query SQL:**
```sql
-- Performa per shift
SELECT 
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
  END;

-- Karyawan per shift
SELECT DISTINCT
  s.nama_shift,
  k.id_karyawan,
  k.nama_lengkap,
  k.role
FROM shifts s
JOIN shift_karyawan sk ON s.id_shift = sk.id_shift
JOIN karyawan k ON sk.id_karyawan = k.id_karyawan
WHERE s.tanggal >= $1
  AND s.tanggal <= $2
ORDER BY s.nama_shift, k.nama_lengkap;
```

---

### 5. GET `/api/v1/reports/export` ⚠️ BELUM ADA

**Deskripsi:** Export laporan keuangan dalam format PDF atau Excel

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** owner

**Query Parameters:**
- `type` (required): Format export ('pdf' atau 'excel')
- `tanggal_mulai` (required): Tanggal mulai (format: YYYY-MM-DD)
- `tanggal_akhir` (required): Tanggal akhir (format: YYYY-MM-DD)
- `jenis_layanan` (optional): Filter jenis layanan ('kiloan', 'koin')

**Response:**
- Content-Type: application/pdf (untuk PDF)
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (untuk Excel)
- Content-Disposition: attachment; filename="laporan-2026-07-01-2026-07-03.pdf"

**Business Rules:**
- Generate laporan dengan data yang sama seperti endpoint `/reports/finance`
- Format PDF menggunakan puppeteer (render HTML ke PDF)
- Format Excel menggunakan library seperti exceljs

**Implementasi PDF (puppeteer):**
```javascript
const puppeteer = require('puppeteer');

async function generateFinanceReportPDF(data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary { margin-top: 20px; }
        .summary-item { margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>Laporan Keuangan Laundry System</h1>
      <p>Periode: ${data.periode.tanggal_mulai} - ${data.periode.tanggal_akhir}</p>
      
      <div class="summary">
        <div class="summary-item">
          <strong>Total Pendapatan:</strong> Rp ${data.ringkasan.total_pendapatan.toLocaleString()}
        </div>
        <div class="summary-item">
          <strong>Total Transaksi:</strong> ${data.ringkasan.total_transaksi}
        </div>
        <div class="summary-item">
          <strong>Rata-rata Transaksi:</strong> Rp ${data.ringkasan.rata_rata_transaksi.toLocaleString()}
        </div>
      </div>
      
      <h2>Pendapatan per Hari</h2>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Total Pendapatan</th>
            <th>Jumlah Transaksi</th>
          </tr>
        </thead>
        <tbody>
          ${data.per_hari.map(hari => `
            <tr>
              <td>${hari.tanggal}</td>
              <td>Rp ${hari.total_pendapatan.toLocaleString()}</td>
              <td>${hari.total_transaksi}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  
  await browser.close();
  return pdf;
}
```

**Implementasi Excel (exceljs):**
```javascript
const ExcelJS = require('exceljs');

async function generateFinanceReportExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Laporan Keuangan');
  
  // Header
  worksheet.columns = [
    { header: 'Tanggal', key: 'tanggal', width: 15 },
    { header: 'Total Pendapatan', key: 'total_pendapatan', width: 20 },
    { header: 'Jumlah Transaksi', key: 'total_transaksi', width: 20 }
  ];
  
  // Data
  data.per_hari.forEach(hari => {
    worksheet.addRow({
      tanggal: hari.tanggal,
      total_pendapatan: hari.total_pendapatan,
      total_transaksi: hari.total_transaksi
    });
  });
  
  // Footer
  worksheet.addRow({});
  worksheet.addRow({ tanggal: 'TOTAL', total_pendapatan: data.ringkasan.total_pendapatan, total_transaksi: data.ringkasan.total_transaksi });
  
  return workbook.xlsx.writeBuffer();
}
```

---

## Frontend Integration

### Web - OwnerDashboard.tsx

**Fitur:**
- Ringkasan pendapatan (hari ini, minggu ini, bulan ini)
- Grafik pendapatan per hari (line chart)
- Grafik perbandingan kiloan vs koin (pie chart)
- Grafik perbandingan metode pembayaran (bar chart)
- Filter berdasarkan tanggal
- Tombol "Export PDF" dan "Export Excel"

**Flow:**
1. Owner buka halaman Dashboard
2. Fetch data dari `GET /api/v1/reports/summary`
3. Tampilkan ringkasan di KPI cards
4. Fetch data grafik dari `GET /api/v1/reports/finance?tanggal_mulai=...&tanggal_akhir=...`
5. Tampilkan grafik dengan Recharts
6. Owner klik "Export PDF" → download dari `GET /api/v1/reports/export?type=pdf&...`
7. Owner klik "Export Excel" → download dari `GET /api/v1/reports/export?type=excel&...`

**UI Components:**
```typescript
// KPI Cards
<div className="grid grid-cols-4 gap-4">
  <Card>
    <h3>Pendapatan Hari Ini</h3>
    <p className="text-2xl font-bold">Rp {summary.pendapatan.hari_ini.toLocaleString()}</p>
  </Card>
  <Card>
    <h3>Pendapatan Minggu Ini</h3>
    <p className="text-2xl font-bold">Rp {summary.pendapatan.minggu_ini.toLocaleString()}</p>
  </Card>
  <Card>
    <h3>Pendapatan Bulan Ini</h3>
    <p className="text-2xl font-bold">Rp {summary.pendapatan.bulan_ini.toLocaleString()}</p>
  </Card>
  <Card>
    <h3>Customer Baru</h3>
    <p className="text-2xl font-bold">{summary.customer_baru.bulan_ini}</p>
  </Card>
</div>

// Grafik pendapatan per hari
<LineChart data={finance.per_hari}>
  <Line type="monotone" dataKey="total_pendapatan" stroke="#8884d8" />
  <XAxis dataKey="tanggal" />
  <YAxis />
  <Tooltip />
</LineChart>

// Grafik kiloan vs koin
<PieChart>
  <Pie
    data={[
      { name: 'Kiloan', value: finance.per_jenis_layanan.kiloan.total_pendapatan },
      { name: 'Koin', value: finance.per_jenis_layanan.koin.total_pendapatan }
    ]}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={80}
    fill="#8884d8"
    label
  />
  <Tooltip />
</PieChart>

// Filter tanggal
<div className="flex gap-4">
  <DatePicker value={startDate} onChange={setStartDate} />
  <DatePicker value={endDate} onChange={setEndDate} />
  <Button onClick={handleFilter}>Filter</Button>
</div>

// Export buttons
<div className="flex gap-4">
  <Button onClick={handleExportPDF}>Export PDF</Button>
  <Button onClick={handleExportExcel}>Export Excel</Button>
</div>
```

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                    REPORT FLOW                          │
└─────────────────────────────────────────────────────────┘

[Owner] ──→ [Owner Dashboard]
                │
                ▼
        [Tampilkan Ringkasan]
        - Pendapatan hari ini
        - Pendapatan minggu ini
        - Pendapatan bulan ini
        - Customer baru
                │
                ▼
        [Filter Tanggal]
                │
                ▼
        [Tampilkan Grafik]
        - Pendapatan per hari
        - Kiloan vs Koin
        - Metode pembayaran
                │
        ┌───────┴───────┐
        ▼               ▼
    [Export PDF]    [Export Excel]
        │               │
        ▼               ▼
    [Download]      [Download]
```

---

## Business Rules Detail

### Jenis Laporan

**1. Laporan Keuangan**
- Ringkasan pendapatan total
- Breakdown per jenis layanan (kiloan vs koin)
- Breakdown per metode pembayaran (cash, QRIS, transfer)
- Breakdown per hari

**2. Laporan Harian**
- Detail transaksi per hari
- Breakdown per shift (pagi, siang, sore, malam)
- Daftar transaksi

**3. Laporan Performa Shift**
- Performa per shift (total transaksi, pendapatan)
- Daftar karyawan per shift
- Rata-rata transaksi per shift

### Filter dan Periode

**Filter Tanggal:**
- Tanggal mulai dan tanggal akhir
- Default: 30 hari terakhir

**Filter Jenis Layanan:**
- Semua (default)
- Kiloan saja
- Koin saja

### Export Format

**PDF:**
- Format A4
- Header: nama perusahaan, judul laporan, periode
- Tabel data
- Footer: tanggal generate

**Excel:**
- Format .xlsx
- Sheet 1: Ringkasan
- Sheet 2: Detail per hari
- Sheet 3: Detail per shift

---

## Dependencies

### Backend
- `puppeteer` - Generate PDF dari HTML
- `exceljs` - Generate Excel
- `pg` - PostgreSQL client

### Frontend Web
- `react-router-dom` - Navigation
- `tailwindcss` - Styling
- `recharts` - Grafik (sudah ada)
- `lucide-react` - Icons (sudah ada)

### Frontend Mobile
- Tidak diperlukan

---

## Testing Checklist

### Laporan Keuangan
- [ ] Laporan dengan filter tanggal valid
- [ ] Laporan dengan filter jenis layanan
- [ ] Total pendapatan benar
- [ ] Breakdown per jenis layanan benar
- [ ] Breakdown per metode pembayaran benar
- [ ] Breakdown per hari benar

### Ringkasan Dashboard
- [ ] Booking berdasarkan status
- [ ] Pendapatan hari ini
- [ ] Pendapatan minggu ini
- [ ] Pendapatan bulan ini
- [ ] Customer baru hari ini
- [ ] Customer baru minggu ini
- [ ] Customer baru bulan ini
- [ ] Karyawan aktif

### Laporan Harian
- [ ] Laporan dengan tanggal valid
- [ ] Total pendapatan harian
- [ ] Breakdown per shift
- [ ] Detail transaksi

### Laporan Performa Shift
- [ ] Laporan dengan filter tanggal valid
- [ ] Performa per shift
- [ ] Daftar karyawan per shift
- [ ] Rata-rata transaksi per shift

### Export
- [ ] Export PDF dengan data valid
- [ ] Export Excel dengan data valid
- [ ] File PDF bisa dibuka
- [ ] File Excel bisa dibuka
- [ ] Nama file sesuai format

### Frontend
- [ ] Tampilan KPI cards
- [ ] Tampilan grafik pendapatan per hari
- [ ] Tampilan grafik kiloan vs koin
- [ ] Tampilan grafik metode pembayaran
- [ ] Filter tanggal berfungsi
- [ ] Tombol export PDF berfungsi
- [ ] Tombol export Excel berfungsi
