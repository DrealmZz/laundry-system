# Modul 06: Transaksi dan Pembayaran

## Overview

Modul ini menangani transaksi pembayaran untuk booking laundry. Kasir dapat membuat transaksi baru, mengkonfirmasi pembayaran, dan mencetak struk digital (PDF). Owner dapat melihat laporan keuangan.

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ✅ Sudah ada | Perlu tambah endpoint `pay`, `daily-recap`, `pdf` |
| Frontend Web | ✅ Sudah ada | `NewTransaction.tsx`, `ReceiptPrint.tsx`, `TransactionsHistory.tsx`, `DailyRecap.tsx` |
| Frontend Mobile | ✅ Sudah ada | `QrisPaymentScreen.tsx` |

---

## Database Tables

### Tabel yang Digunakan

```sql
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
```

### Contoh Data

| id_transaksi | id_pemesanan | id_customer | id_karyawan | nomor_struk | total | metode_pembayaran | status_pembayaran | tanggal_transaksi |
|--------------|--------------|-------------|-------------|-------------|-------|-------------------|-------------------|-------------------|
| 1 | 1 | 1 | 1 | STRUK-20260703-0001 | 30000 | cash | lunas | 2026-07-03 10:00:00 |
| 2 | 2 | 2 | 1 | STRUK-20260703-0002 | 8000 | qris | belum dibayar | 2026-07-03 10:05:00 |

---

## API Endpoints

### 1. POST `/api/v1/transaksi`

**Deskripsi:** Membuat transaksi baru

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** kasir

**Request:**
```json
{
  "id_pemesanan": 1,
  "metode_pembayaran": "cash"
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "data": {
    "id_transaksi": 1,
    "nomor_struk": "STRUK-20260703-0001",
    "total": 30000,
    "metode_pembayaran": "cash",
    "status_pembayaran": "belum dibayar"
  },
  "message": "Transaksi berhasil dibuat"
}
```

**Response Error (400):**
```json
{
  "status": "error",
  "data": null,
  "message": "Booking sudah memiliki transaksi"
}
```

**Validasi:**
- `id_pemesanan`: harus valid dan ada di tabel `pemesanan`
- `metode_pembayaran`: harus 'cash', 'transfer', 'qris', atau 'koin'

**Business Rules:**
- 1 booking hanya boleh punya 1 transaksi
- Nomor struk auto-generate: `STRUK-YYYYMMDD-XXXX`
  - YYYY: tahun
  - MM: bulan
  - DD: hari
  - XXXX: urutan 4 digit (0001, 0002, dst)
- Total dihitung otomatis:
  - Kiloan: `harga × berat_kg`
  - Koin: `harga` (flat)
- Status pembayaran default: 'belum dibayar'
- Catat ke `audit_log` dengan tipe `TRANSACTION_CREATED`

**Query SQL (Insert):**
```sql
-- Generate nomor struk
SELECT COUNT(*) + 1 AS urutan
FROM transaksi
WHERE DATE(tanggal_transaksi) = CURRENT_DATE;

-- Insert transaksi
INSERT INTO transaksi (
    id_pemesanan, id_customer, id_karyawan, nomor_struk, 
    total, metode_pembayaran, status_pembayaran
) VALUES ($1, $2, $3, $4, $5, $6, 'belum dibayar')
RETURNING id_transaksi, nomor_struk;
```

---

### 2. GET `/api/v1/transaksi`

**Deskripsi:** Mendapatkan daftar transaksi

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** kasir, admin, owner

**Query Parameters:**
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 20
- `status` (optional): Filter status pembayaran ('lunas', 'belum dibayar', 'gagal')
- `metode` (optional): Filter metode pembayaran
- `tanggal_mulai` (optional): Filter tanggal mulai
- `tanggal_akhir` (optional): Filter tanggal akhir
- `id_karyawan` (optional): Filter berdasarkan kasir (untuk owner)

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_transaksi": 1,
        "id_pemesanan": 1,
        "nama_customer": "Andi Wijaya",
        "nama_kasir": "Budi Santoso",
        "nomor_struk": "STRUK-20260703-0001",
        "nama_layanan": "Kiloan Reguler",
        "jenis_layanan": "kiloan",
        "berat_kg": 5,
        "total": 30000,
        "metode_pembayaran": "cash",
        "status_pembayaran": "lunas",
        "tanggal_transaksi": "2026-07-03T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  },
  "message": "Daftar transaksi berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT t.id_transaksi, t.id_pemesanan, c.nama_lengkap AS nama_customer,
       k.nama_lengkap AS nama_kasir, t.nomor_struk,
       l.nama_layanan, l.jenis_layanan, p.berat_kg,
       t.total, t.metode_pembayaran, t.status_pembayaran, t.tanggal_transaksi
FROM transaksi t
JOIN customer c ON t.id_customer = c.id_customer
JOIN karyawan k ON t.id_karyawan = k.id_karyawan
JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
JOIN layanan l ON p.id_layanan = l.id_layanan
WHERE ($1::text IS NULL OR t.status_pembayaran = $1)
  AND ($2::text IS NULL OR t.metode_pembayaran = $2)
  AND ($3::date IS NULL OR t.tanggal_transaksi >= $3)
  AND ($4::date IS NULL OR t.tanggal_transaksi <= $4)
  AND ($5::integer IS NULL OR t.id_karyawan = $5)
ORDER BY t.tanggal_transaksi DESC
LIMIT $6 OFFSET $7
```

---

### 3. GET `/api/v1/transaksi/:id`

**Deskripsi:** Mendapatkan detail transaksi berdasarkan ID

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** kasir, admin, owner

**Path Parameters:**
- `id`: ID transaksi

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "id_transaksi": 1,
    "id_pemesanan": 1,
    "nama_customer": "Andi Wijaya",
    "no_hp_customer": "081234567890",
    "alamat_customer": "Jl. Merdeka No. 10",
    "nama_kasir": "Budi Santoso",
    "nomor_struk": "STRUK-20260703-0001",
    "nama_layanan": "Kiloan Reguler",
    "jenis_layanan": "kiloan",
    "berat_kg": 5,
    "harga_per_kg": 6000,
    "total": 30000,
    "metode_pembayaran": "cash",
    "status_pembayaran": "lunas",
    "tanggal_transaksi": "2026-07-03T10:00:00Z",
    "shift": "pagi",
    "metode_pengambilan": "pengiriman"
  },
  "message": "Detail transaksi berhasil diambil"
}
```

---

### 4. GET `/api/v1/transaksi/struk/:nomor_struk`

**Deskripsi:** Mendapatkan detail transaksi berdasarkan nomor struk

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** kasir, admin

**Path Parameters:**
- `nomor_struk`: Nomor struk transaksi

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "id_transaksi": 1,
    "nomor_struk": "STRUK-20260703-0001",
    "nama_customer": "Andi Wijaya",
    "nama_layanan": "Kiloan Reguler",
    "berat_kg": 5,
    "total": 30000,
    "metode_pembayaran": "cash",
    "status_pembayaran": "lunas",
    "tanggal_transaksi": "2026-07-03T10:00:00Z"
  },
  "message": "Detail struk berhasil diambil"
}
```

---

### 5. PATCH `/api/v1/transaksi/:id/pay` ⚠️ BELUM ADA

**Deskripsi:** Mengkonfirmasi pembayaran transaksi

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** kasir, admin

**Path Parameters:**
- `id`: ID transaksi

**Request:**
```json
{
  "metode_pembayaran": "cash"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "id_transaksi": 1,
    "status_pembayaran": "lunas"
  },
  "message": "Pembayaran berhasil dikonfirmasi"
}
```

**Response Error (400):**
```json
{
  "status": "error",
  "data": null,
  "message": "Transaksi sudah lunas"
}
```

**Business Rules:**
- Update `status_pembayaran` ke 'lunas'
- Update `metode_pembayaran` jika berbeda
- Update `pemesanan.status_pesanan` ke 'sudah dibayar'
- Catat ke `audit_log` dengan tipe `PAYMENT_CONFIRMED`

**Query SQL:**
```sql
-- Update transaksi
UPDATE transaksi 
SET status_pembayaran = 'lunas', metode_pembayaran = $1
WHERE id_transaksi = $2;

-- Update pemesanan
UPDATE pemesanan 
SET status_pesanan = 'sudah dibayar'
WHERE id_pemesanan = (
  SELECT id_pemesanan FROM transaksi WHERE id_transaksi = $2
);
```

---

### 6. GET `/api/v1/transaksi/daily-recap` ⚠️ BELUM ADA

**Deskripsi:** Mendapatkan rekap transaksi harian kasir

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** kasir

**Query Parameters:**
- `tanggal` (optional): Tanggal rekap, default hari ini (format: YYYY-MM-DD)
- `shift` (optional): Filter shift

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "tanggal": "2026-07-03",
    "shift": "pagi",
    "total_transaksi": 15,
    "total_pendapatan": 750000,
    "transaksi_lunas": 12,
    "transaksi_belum_lunas": 3,
    "metode_pembayaran": {
      "cash": 8,
      "qris": 4,
      "transfer": 3
    },
    "transaksi": [
      {
        "id_transaksi": 1,
        "nomor_struk": "STRUK-20260703-0001",
        "nama_customer": "Andi Wijaya",
        "total": 30000,
        "metode_pembayaran": "cash",
        "status_pembayaran": "lunas"
      }
    ]
  },
  "message": "Rekap harian berhasil diambil"
}
```

**Query SQL:**
```sql
-- Total transaksi dan pendapatan
SELECT COUNT(*) AS total_transaksi, 
       SUM(total) AS total_pendapatan,
       COUNT(CASE WHEN status_pembayaran = 'lunas' THEN 1 END) AS transaksi_lunas,
       COUNT(CASE WHEN status_pembayaran = 'belum dibayar' THEN 1 END) AS transaksi_belum_lunas
FROM transaksi t
JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
WHERE DATE(t.tanggal_transaksi) = $1
  AND t.id_karyawan = $2
  AND ($3::text IS NULL OR p.shift = $3);

-- Group by metode pembayaran
SELECT metode_pembayaran, COUNT(*) AS jumlah
FROM transaksi t
JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
WHERE DATE(t.tanggal_transaksi) = $1
  AND t.id_karyawan = $2
GROUP BY metode_pembayaran;

-- Detail transaksi
SELECT t.id_transaksi, t.nomor_struk, c.nama_lengkap, t.total, 
       t.metode_pembayaran, t.status_pembayaran
FROM transaksi t
JOIN customer c ON t.id_customer = c.id_customer
JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
WHERE DATE(t.tanggal_transaksi) = $1
  AND t.id_karyawan = $2
  AND ($3::text IS NULL OR p.shift = $3)
ORDER BY t.tanggal_transaksi;
```

---

### 7. GET `/api/v1/transaksi/:id/pdf` ⚠️ BELUM ADA

**Deskripsi:** Generate PDF struk transaksi

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** kasir, admin, customer (hanya untuk transaksi sendiri)

**Path Parameters:**
- `id`: ID transaksi

**Response:**
- Content-Type: application/pdf
- Content-Disposition: inline; filename="STRUK-20260703-0001.pdf"

**Business Rules:**
- Customer hanya bisa download struk untuk transaksi sendiri
- PDF berisi informasi lengkap transaksi
- Format struk sesuai template

**Implementasi PDF (pdfkit):**
```javascript
const PDFDocument = require('pdfkit');

function generateReceiptPDF(transaction) {
  const doc = new PDFDocument({ size: 'A5', margin: 30 });
  
  // Header
  doc.fontSize(16).text('LAUNDRY SYSTEM', { align: 'center' });
  doc.fontSize(10).text('Struk Digital', { align: 'center' });
  doc.moveDown();
  
  // Garis pemisah
  doc.moveTo(30, doc.y).lineTo(250, doc.y).stroke();
  doc.moveDown();
  
  // Info struk
  doc.fontSize(10);
  doc.text(`No. Struk: ${transaction.nomor_struk}`);
  doc.text(`Tanggal: ${formatDate(transaction.tanggal_transaksi)}`);
  doc.text(`Kasir: ${transaction.nama_kasir}`);
  doc.moveDown();
  
  // Info customer
  doc.text(`Customer: ${transaction.nama_customer}`);
  doc.text(`Layanan: ${transaction.nama_layanan}`);
  doc.text(`Jenis: ${transaction.jenis_layanan}`);
  if (transaction.berat_kg) {
    doc.text(`Berat: ${transaction.berat_kg} kg`);
    doc.text(`Harga/kg: Rp ${transaction.harga.toLocaleString()}`);
  }
  doc.moveDown();
  
  // Garis pemisah
  doc.moveTo(30, doc.y).lineTo(250, doc.y).stroke();
  doc.moveDown();
  
  // Total
  doc.fontSize(12).text(`TOTAL: Rp ${transaction.total.toLocaleString()}`, { align: 'right' });
  doc.fontSize(10).text(`Metode: ${transaction.metode_pembayaran}`, { align: 'right' });
  doc.text(`Status: ${transaction.status_pembayaran.toUpperCase()}`, { align: 'right' });
  doc.moveDown();
  
  // Footer
  doc.fontSize(8).text('Terima kasih atas kunjungan Anda!', { align: 'center' });
  
  return doc;
}
```

---

## Frontend Integration

### Web - NewTransaction.tsx

**Fitur:**
- Form buat transaksi baru
- Pilih booking yang sudah dikonfirmasi
- Pilih metode pembayaran
- Tampilkan total harga
- Tombol "Proses Pembayaran"

**Flow:**
1. Kasir buka halaman New Transaction
2. Fetch booking yang sudah dikonfirmasi dari `GET /api/v1/pemesanan?status=diproses`
3. Kasir pilih booking
4. Tampilkan detail booking dan total harga
5. Kasir pilih metode pembayaran
6. Kasir klik "Proses Pembayaran"
7. Kirim request ke `POST /api/v1/transaksi`
8. Jika berhasil → redirect ke halaman cetak struk

**UI Components:**
```typescript
// Form transaksi
<View>
  <Text>Pilih Booking:</Text>
  <Picker
    selectedValue={selectedBooking}
    onValueChange={setSelectedBooking}
  >
    {bookings.map(booking => (
      <Picker.Item 
        key={booking.id_pemesanan} 
        label={`${booking.nama_customer} - ${booking.nama_layanan}`} 
        value={booking.id_pemesanan} 
      />
    ))}
  </Picker>

  {selectedBooking && (
    <View>
      <Text>Customer: {booking.nama_customer}</Text>
      <Text>Layanan: {booking.nama_layanan}</Text>
      <Text>Berat: {booking.berat_kg} kg</Text>
      <Text>Total: Rp {booking.total.toLocaleString()}</Text>
    </View>
  )}

  <Text>Metode Pembayaran:</Text>
  <Picker
    selectedValue={paymentMethod}
    onValueChange={setPaymentMethod}
  >
    <Picker.Item label="Cash" value="cash" />
    <Picker.Item label="Transfer" value="transfer" />
    <Picker.Item label="QRIS" value="qris" />
  </Picker>

  <Button title="Proses Pembayaran" onPress={handleSubmit} />
</View>
```

---

### Web - ReceiptPrint.tsx

**Fitur:**
- Tampilkan struk dalam format yang bisa dicetak
- Tombol "Cetak Struk" (buka dialog print browser)
- Tombol "Download PDF"
- Tombol "Kembali"

**Flow:**
1. Kasir selesai membuat transaksi
2. Redirect ke halaman cetak struk dengan `id_transaksi`
3. Fetch detail transaksi dari `GET /api/v1/transaksi/:id`
4. Tampilkan struk dalam format printable
5. Kasir klik "Download PDF" → `GET /api/v1/transaksi/:id/pdf`

**UI Components:**
```typescript
// Struk printable
<div className="receipt-container">
  <div className="receipt-header">
    <h1>LAUNDRY SYSTEM</h1>
    <p>Struk Digital</p>
  </div>
  
  <div className="receipt-info">
    <p>No. Struk: {transaction.nomor_struk}</p>
    <p>Tanggal: {formatDate(transaction.tanggal_transaksi)}</p>
    <p>Kasir: {transaction.nama_kasir}</p>
  </div>
  
  <div className="receipt-details">
    <p>Customer: {transaction.nama_customer}</p>
    <p>Layanan: {transaction.nama_layanan}</p>
    <p>Berat: {transaction.berat_kg} kg</p>
    <p>Total: Rp {transaction.total.toLocaleString()}</p>
    <p>Metode: {transaction.metode_pembayaran}</p>
    <p>Status: {transaction.status_pembayaran}</p>
  </div>
  
  <div className="receipt-footer">
    <p>Terima kasih atas kunjungan Anda!</p>
  </div>
  
  <div className="receipt-actions">
    <Button onClick={handlePrint}>Cetak Struk</Button>
    <Button onClick={handleDownloadPDF}>Download PDF</Button>
    <Button onClick={handleBack}>Kembali</Button>
  </div>
</div>
```

---

### Web - TransactionsHistory.tsx

**Fitur:**
- Tabel daftar transaksi dengan kolom: no struk, customer, layanan, total, metode, status, tanggal
- Filter berdasarkan status, metode, tanggal
- Pagination
- Tombol aksi: View Detail, Download PDF

**Flow:**
1. Kasir/Admin/Owner buka halaman Transactions History
2. Fetch data dari `GET /api/v1/transaksi?page=1&limit=20`
3. Tampilkan data di tabel
4. User bisa search, filter, dan paginate
5. User klik "View Detail" → buka modal detail
6. User klik "Download PDF" → download struk

---

### Web - DailyRecap.tsx

**Fitur:**
- Ringkasan transaksi harian kasir yang sedang login
- Tampilkan: total transaksi, total pendapatan, transaksi lunas/belum lunas
- Breakdown per metode pembayaran
- Daftar transaksi hari ini
- Filter berdasarkan shift

**Flow:**
1. Kasir buka halaman Daily Recap
2. Fetch data dari `GET /api/v1/transaksi/daily-recap`
3. Tampilkan ringkasan dan daftar transaksi
4. Kasir bisa filter berdasarkan shift

---

### Mobile - QrisPaymentScreen.tsx

**Fitur:**
- Tampilkan QR code untuk pembayaran QRIS
- Tampilkan total harga
- Tampilkan status pembayaran
- Tombol "Cek Status Pembayaran"

**Flow:**
1. Customer mendapat notifikasi "Menunggu Pembayaran"
2. Customer buka halaman QRIS Payment
3. Fetch detail transaksi dari `GET /api/v1/transaksi/:id`
4. Tampilkan QR code dan total harga
5. Customer scan QR code dan bayar
6. Customer klik "Cek Status Pembayaran"
7. Fetch ulang status pembayaran
8. Jika lunas → tampilkan pesan sukses

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                TRANSACTION STATUS FLOW                  │
└─────────────────────────────────────────────────────────┘

[Kasir] ──→ [Pilih Booking yang Sudah Dikonfirmasi]
                    │
                    ▼
            [Buat Transaksi]
                    │
                    ▼
            [belum dibayar]
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    [Customer Bayar]      [Customer Tidak Bayar]
    (Cash/QRIS/Transfer)        │
        │                       ▼
        ▼                   [Tetap 'belum dibayar']
    [Kasir Konfirmasi]      atau [gagal']
        │
        ▼
    [lunas]
        │
        ▼
    [Generate Struk PDF]
        │
        ▼
    [Kasir/Customer Download]
```

---

## Business Rules Detail

### Perhitungan Total

**Kiloan:**
```
Total = Harga per kg × Berat (kg)
Contoh: Rp 6.000 × 5 kg = Rp 30.000
```
- Berat diinput oleh kasir/admin setelah pakaian diterima
- Berat disimpan di tabel `pemesanan.berat_kg`

**Koin:**
```
Total = Harga flat
Contoh: Rp 8.000 (sudah termasuk 1 mesin)
```
- Harga sudah termasuk penggunaan mesin

### Metode Pembayaran

**1. Cash**
- Customer bayar langsung di outlet
- Kasir input jumlah yang dibayar
- Kembalian dihitung otomatis

**2. Transfer**
- Customer transfer ke rekening laundry
- Customer kirim bukti transfer
- Kasir verifikasi bukti transfer

**3. QRIS**
- Customer scan QR code di aplikasi
- Pembayaran otomatis terverifikasi
- Status berubah otomatis (jika integrasi dengan payment gateway)

**4. Koin**
- Customer menggunakan koin di mesin
- Tidak perlu konfirmasi kasir
- Status langsung lunas

### Nomor Struk

**Format:** `STRUK-YYYYMMDD-XXXX`
- YYYY: tahun (2026)
- MM: bulan (07)
- DD: hari (03)
- XXXX: urutan 4 digit (0001, 0002, dst)

**Contoh:**
- STRUK-20260703-0001 (transaksi pertama tanggal 3 Juli 2026)
- STRUK-20260703-0002 (transaksi kedua tanggal 3 Juli 2026)
- STRUK-20260704-0001 (transaksi pertama tanggal 4 Juli 2026)

---

## Dependencies

### Backend
- `pdfkit` - Generate PDF struk
- `pg` - PostgreSQL client

### Frontend Web
- `react-router-dom` - Navigation
- `tailwindcss` - Styling
- `react-to-print` - Print struk (opsional)

### Frontend Mobile
- `@react-navigation/native` - Navigation
- `react-native` - UI components
- `react-native-qrcode-svg` - Generate QR code (untuk QRIS)

---

## Testing Checklist

### Buat Transaksi
- [ ] Buat transaksi dengan data valid
- [ ] Buat transaksi untuk booking yang sudah ada transaksi → error
- [ ] Buat transaksi dengan metode pembayaran tidak valid → error
- [ ] Nomor struk ter-generate dengan format yang benar
- [ ] Total terhitung dengan benar (kiloan: harga × berat, koin: harga flat)

### Konfirmasi Pembayaran
- [ ] Konfirmasi pembayaran dengan data valid
- [ ] Konfirmasi pembayaran yang sudah lunas → error
- [ ] Status berubah ke 'lunas'
- [ ] Status pemesanan berubah ke 'sudah dibayar'

### Rekap Harian
- [ ] Rekap harian dengan data valid
- [ ] Total transaksi dan pendapatan benar
- [ ] Breakdown per metode pembayaran benar
- [ ] Filter berdasarkan shift berfungsi

### Generate PDF
- [ ] Generate PDF struk dengan data valid
- [ ] PDF berisi informasi lengkap
- [ ] Download PDF berhasil
- [ ] Customer hanya bisa download struk sendiri

### List dan Detail
- [ ] List transaksi dengan pagination
- [ ] List transaksi dengan filter status
- [ ] List transaksi dengan filter metode
- [ ] List transaksi dengan filter tanggal
- [ ] Detail transaksi dengan ID valid
- [ ] Detail transaksi dengan nomor struk valid

### Frontend
- [ ] Tampilan form transaksi baru
- [ ] Tampilan struk printable
- [ ] Tampilan riwayat transaksi
- [ ] Tampilan rekap harian
- [ ] Tampilan QR code QRIS (mobile)
- [ ] Error handling untuk semua validasi
