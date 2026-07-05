# Modul 05: Booking/Pemesanan

## Overview

Modul ini menangani pemesanan layanan laundry oleh customer. Terdapat 2 jenis booking: **Kiloan** (customer mengirim pakaian, dijemput kurir atau antar sendiri) dan **Koin** (customer datang ke outlet dan menggunakan mesin sendiri).

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ✅ Sudah ada | Perlu tambah logic `booking_mesin` |
| Frontend Web | ✅ Sudah ada | `ConfirmBookings.tsx` |
| Frontend Mobile | ✅ Sudah ada | `BookingScreen.tsx`, `BookingKoinScreen.tsx` |

---

## Database Tables

### Tabel yang Digunakan

```sql
-- Tabel pemesanan (sudah ada)
CREATE TABLE pemesanan (
    id_pemesanan        SERIAL PRIMARY KEY,
    id_customer         INTEGER        NOT NULL REFERENCES customer(id_customer),
    id_layanan          INTEGER        NOT NULL REFERENCES layanan(id_layanan),
    id_mesin            INTEGER        REFERENCES mesin_cuci(id_mesin),  -- opsional, untuk kiloan
    tanggal_pesanan     DATE           NOT NULL DEFAULT CURRENT_DATE,
    shift               VARCHAR(20)    NOT NULL
                        CHECK (shift IN ('pagi', 'siang', 'sore', 'malam')),
    status_pesanan      VARCHAR(30)    NOT NULL DEFAULT 'menunggu konfirmasi'
                        CHECK (status_pesanan IN (
                            'menunggu konfirmasi',
                            'pesanan ditolak',
                            'menunggu pembayaran',
                            'sudah dibayar',
                            'diproses',
                            'sedang di cuci',
                            'sedang di keringkan',
                            'sedang di setrika',
                            'pencucian selesai',
                            'selesai'
                        )),
    berat_kg            NUMERIC(5,2),
    jenis_pencucian     VARCHAR(20)    NOT NULL
                        CHECK (jenis_pencucian IN ('kiloan', 'koin')),
    metode_pengambilan  VARCHAR(20)    NOT NULL
                        CHECK (metode_pengambilan IN ('ambil_sendiri', 'pengiriman')),
    catatan             TEXT
);

-- Tabel junction booking_mesin (akan ditambahkan)
CREATE TABLE booking_mesin (
    id_pemesanan  INTEGER NOT NULL REFERENCES pemesanan(id_pemesanan) ON DELETE CASCADE,
    id_mesin      INTEGER NOT NULL REFERENCES mesin_cuci(id_mesin),
    PRIMARY KEY (id_pemesanan, id_mesin)
);
```

### Contoh Data

**Booking Kiloan:**
| id_pemesanan | id_customer | id_layanan | id_mesin | shift | status_pesanan | berat_kg | jenis_pencucian | metode_pengambilan |
|--------------|-------------|------------|----------|-------|----------------|----------|-----------------|-------------------|
| 1 | 1 | 1 | NULL | pagi | menunggu konfirmasi | NULL | kiloan | pengiriman |

**Booking Koin:**
| id_pemesanan | id_customer | id_layanan | id_mesin | shift | status_pesanan | berat_kg | jenis_pencucian | metode_pengambilan |
|--------------|-------------|------------|----------|-------|----------------|----------|-----------------|-------------------|
| 2 | 2 | 3 | 1 | siang | menunggu konfirmasi | NULL | koin | ambil_sendiri |

**Booking Mesin (Junction):**
| id_pemesanan | id_mesin |
|--------------|----------|
| 2 | 1 | ← Mesin cuci MC-01
| 2 | 3 | ← Mesin pengering MD-01

---

## API Endpoints

### 1. POST `/api/v1/pemesanan`

**Deskripsi:** Membuat booking baru

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** customer

**Request (Kiloan):**
```json
{
  "id_layanan": 1,
  "shift": "pagi",
  "tanggal": "2026-07-04",
  "metode_pengambilan": "pengiriman",
  "catatan": "Pakaian harap dipisah dengan yang berwarna",
  "mesin_ids": null
}
```

**Request (Koin):**
```json
{
  "id_layanan": 3,
  "shift": "siang",
  "tanggal": "2026-07-04",
  "metode_pengambilan": "ambil_sendiri",
  "catatan": null,
  "mesin_ids": [1, 3]
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "data": {
    "id_pemesanan": 1,
    "status_pesanan": "menunggu konfirmasi",
    "tanggal_pesanan": "2026-07-04",
    "shift": "pagi"
  },
  "message": "Booking berhasil dibuat"
}
```

**Response Error (400):**
```json
{
  "status": "error",
  "data": null,
  "message": "Anda sudah memiliki booking aktif"
}
```

**Validasi:**
- `id_layanan`: harus valid dan ada di tabel `layanan`
- `shift`: harus 'pagi', 'siang', 'sore', atau 'malam'
- `tanggal`: tidak boleh di masa lalu
- `metode_pengambilan`: harus 'ambil_sendiri' atau 'pengiriman'
- `mesin_ids` (koin): array ID mesin yang valid dan tersedia

**Business Rules:**
- 1 customer hanya boleh punya 1 booking aktif
- Booking aktif: status bukan 'selesai' atau 'pesanan ditolak'
- Booking koin: `mesin_ids` wajib diisi (minimal 1 mesin cuci)
- Booking kiloan: `mesin_ids` tidak perlu (dikelola karyawan)
- Cek ketersediaan mesin sebelum simpan
- Simpan ke tabel `pemesanan` dan `booking_mesin` (jika koin)
- Catat ke `audit_log` dengan tipe `BOOKING_CREATED`

**Query SQL (Insert):**
```sql
-- Insert ke pemesanan
INSERT INTO pemesanan (
    id_customer, id_layanan, tanggal_pesanan, shift, 
    jenis_pencucian, metode_pengambilan, catatan
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id_pemesanan;

-- Insert ke booking_mesin (jika koin)
INSERT INTO booking_mesin (id_pemesanan, id_mesin)
VALUES ($1, $2), ($1, $3);
```

---

### 2. GET `/api/v1/pemesanan`

**Deskripsi:** Mendapatkan daftar booking

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** Semua role (customer hanya bisa lihat booking sendiri)

**Query Parameters:**
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 20
- `status` (optional): Filter status booking
- `jenis` (optional): Filter jenis ('kiloan', 'koin')
- `tanggal_mulai` (optional): Filter tanggal mulai
- `tanggal_akhir` (optional): Filter tanggal akhir

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_pemesanan": 1,
        "id_customer": 1,
        "nama_customer": "Andi Wijaya",
        "id_layanan": 1,
        "nama_layanan": "Kiloan Reguler",
        "jenis_layanan": "kiloan",
        "tanggal_pesanan": "2026-07-04",
        "shift": "pagi",
        "status_pesanan": "menunggu konfirmasi",
        "berat_kg": null,
        "metode_pengambilan": "pengiriman",
        "catatan": "Pakaian harap dipisah",
        "created_at": "2026-07-03T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  },
  "message": "Daftar booking berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT p.id_pemesanan, p.id_customer, c.nama_lengkap AS nama_customer,
       p.id_layanan, l.nama_layanan, l.jenis_layanan,
       p.tanggal_pesanan, p.shift, p.status_pesanan, p.berat_kg,
       p.metode_pengambilan, p.catatan, p.created_at
FROM pemesanan p
JOIN customer c ON p.id_customer = c.id_customer
JOIN layanan l ON p.id_layanan = l.id_layanan
WHERE ($1::text IS NULL OR p.status_pesanan = $1)
  AND ($2::text IS NULL OR l.jenis_layanan = $2)
  AND ($3::date IS NULL OR p.tanggal_pesanan >= $3)
  AND ($4::date IS NULL OR p.tanggal_pesanan <= $4)
  -- Customer hanya bisa lihat booking sendiri
  AND ($5::text != 'customer' OR p.id_customer = $6)
ORDER BY p.created_at DESC
LIMIT $7 OFFSET $8
```

---

### 3. GET `/api/v1/pemesanan/:id`

**Deskripsi:** Mendapatkan detail booking berdasarkan ID

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** Semua role (customer hanya bisa lihat booking sendiri)

**Path Parameters:**
- `id`: ID pemesanan

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "id_pemesanan": 1,
    "id_customer": 1,
    "nama_customer": "Andi Wijaya",
    "id_layanan": 1,
    "nama_layanan": "Kiloan Reguler",
    "jenis_layanan": "kiloan",
    "harga": 6000,
    "tanggal_pesanan": "2026-07-04",
    "shift": "pagi",
    "status_pesanan": "menunggu konfirmasi",
    "berat_kg": null,
    "metode_pengambilan": "pengiriman",
    "catatan": "Pakaian harap dipisah",
    "mesin": [],
    "created_at": "2026-07-03T10:00:00Z"
  },
  "message": "Detail booking berhasil diambil"
}
```

**Response Error (404):**
```json
{
  "status": "error",
  "data": null,
  "message": "Booking tidak ditemukan"
}
```

**Business Rules:**
- Customer hanya bisa melihat booking sendiri
- Admin/kasir bisa melihat semua booking

---

### 4. PATCH `/api/v1/pemesanan/:id/status`

**Deskripsi:** Mengubah status booking

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin, kasir

**Path Parameters:**
- `id`: ID pemesanan

**Request:**
```json
{
  "status_pesanan": "diproses",
  "berat_kg": 5.5
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Status booking berhasil diubah"
}
```

**Response Error (400):**
```json
{
  "status": "error",
  "data": null,
  "message": "Transisi status tidak valid"
}
```

**Business Rules:**

**Status Flow (Lengkap):**
```
menunggu konfirmasi
    ├→ pesanan ditolak (selesai)
    └→ diproses
        └→ sedang di cuci
            └→ sedang di keringkan
                └→ sedang di setrika
                    └→ pencucian selesai
                        └→ menunggu pembayaran
                            └→ sudah dibayar
                                └→ selesai
```

**Transisi yang Diizinkan:**
| Dari | Ke |
|------|-----|
| menunggu konfirmasi | diproses, pesanan ditolak |
| diproses | sedang di cuci, pesanan ditolak |
| sedang di cuci | sedang di keringkan, pesanan ditolak |
| sedang di keringkan | sedang di setrika, pencucian selesai, pesanan ditolak |
| sedang di setrika | pencucian selesai, pesanan ditolak |
| pencucian selesai | menunggu pembayaran, pesanan ditolak |
| menunggu pembayaran | sudah dibayar, pesanan ditolak |
| sudah dibayar | selesai, pesanan ditolak |

**Catatan:**
- `berat_kg` wajib diisi saat status berubah ke 'diproses' (untuk kiloan)
- Catat ke `audit_log` dengan tipe `BOOKING_STATUS_CHANGED`

---

### 5. PATCH `/api/v1/pemesanan/:id/cancel`

**Deskripsi:** Membatalkan booking

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin, kasir

**Path Parameters:**
- `id`: ID pemesanan

**Request:**
```json
{
  "alasan_pembatalan": "Customer tidak konfirmasi dalam 24 jam"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Booking berhasil dibatalkan"
}
```

**Business Rules:**
- Status berubah menjadi 'pesanan ditolak'
- Alasan pembatalan wajib diisi
- Catat ke `audit_log` dengan tipe `BOOKING_CANCELLED`

---

### 6. GET `/api/v1/pemesanan/:id/mesin` ⚠️ BELUM ADA

**Deskripsi:** Mendapatkan daftar mesin yang digunakan dalam booking

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** Semua role (customer hanya bisa lihat booking sendiri)

**Path Parameters:**
- `id`: ID pemesanan

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "mesin": [
      {
        "id_mesin": 1,
        "kode_mesin": "MC-01",
        "tipe_mesin": "pencucian",
        "nama_mesin": "Mesin Cuci 1"
      },
      {
        "id_mesin": 3,
        "kode_mesin": "MD-01",
        "tipe_mesin": "pengeringan",
        "nama_mesin": "Mesin Pengering 1"
      }
    ]
  },
  "message": "Daftar mesin booking berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT m.id_mesin, m.kode_mesin, m.tipe_mesin, m.nama_mesin
FROM mesin_cuci m
JOIN booking_mesin bm ON m.id_mesin = bm.id_mesin
WHERE bm.id_pemesanan = $1
ORDER BY m.tipe_mesin, m.kode_mesin
```

---

## Frontend Integration

### Web - ConfirmBookings.tsx

**Fitur:**
- Tabel daftar booking yang menunggu konfirmasi
- Filter berdasarkan status, jenis, tanggal
- Tombol "Konfirmasi" → booking diterima
- Tombol "Tolak" → buka modal alasan penolakan
- Tombol "Detail" → lihat detail booking

**Flow:**
1. Admin buka halaman Confirm Bookings
2. Fetch data dari `GET /api/v1/pemesanan?status=menunggu konfirmasi`
3. Tampilkan data di tabel
4. Admin klik "Konfirmasi" → `PATCH /api/v1/pemesanan/:id/status`
5. Admin klik "Tolak" → buka modal → input alasan → `PATCH /api/v1/pemesanan/:id/cancel`

**UI Components:**
```typescript
// Tabel booking
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Customer</th>
      <th>Layanan</th>
      <th>Tanggal</th>
      <th>Shift</th>
      <th>Status</th>
      <th>Aksi</th>
    </tr>
  </thead>
  <tbody>
    {bookings.map(booking => (
      <tr key={booking.id_pemesanan}>
        <td>{booking.id_pemesanan}</td>
        <td>{booking.nama_customer}</td>
        <td>{booking.nama_layanan}</td>
        <td>{booking.tanggal_pesanan}</td>
        <td>{booking.shift}</td>
        <td><Badge status={booking.status_pesanan} /></td>
        <td>
          <Button onClick={() => handleConfirm(booking.id)}>Konfirmasi</Button>
          <Button onClick={() => handleReject(booking.id)}>Tolak</Button>
          <Button onClick={() => handleDetail(booking.id)}>Detail</Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### Mobile - BookingScreen.tsx (Kiloan)

**Fitur:**
- Pilih layanan kiloan (Reguler/Express)
- Input alamat pengiriman
- Pilih tanggal dan shift pengambilan
- Input catatan (opsional)
- Konfirmasi booking

**Flow:**
1. Customer buka halaman Booking Kiloan
2. Fetch layanan dari `GET /api/v1/services?jenis=kiloan`
3. Customer pilih layanan
4. Customer input alamat dan pilih tanggal/shift
5. Customer klik "Pesan Sekarang"
6. Kirim request ke `POST /api/v1/pemesanan`
7. Jika berhasil → redirect ke halaman Status

**UI Components:**
```typescript
// Form booking kiloan
<View>
  <Text>Pilih Layanan:</Text>
  <Picker
    selectedValue={selectedService}
    onValueChange={setSelectedService}
  >
    {services.map(service => (
      <Picker.Item 
        key={service.id_layanan} 
        label={`${service.nama_layanan} - Rp ${service.harga}/kg`} 
        value={service.id_layanan} 
      />
    ))}
  </Picker>

  <Text>Alamat Pengiriman:</Text>
  <TextInput
    value={address}
    onChangeText={setAddress}
    placeholder="Masukkan alamat lengkap"
  />

  <Text>Tanggal Pengambilan:</Text>
  <DatePicker
    value={date}
    onChange={setDate}
    minimumDate={new Date()}
  />

  <Text>Shift:</Text>
  <Picker
    selectedValue={shift}
    onValueChange={setShift}
  >
    <Picker.Item label="Pagi (08:00-12:00)" value="pagi" />
    <Picker.Item label="Siang (12:00-16:00)" value="siang" />
    <Picker.Item label="Sore (16:00-20:00)" value="sore" />
    <Picker.Item label="Malam (20:00-24:00)" value="malam" />
  </Picker>

  <Text>Catatan (opsional):</Text>
  <TextInput
    value={notes}
    onChangeText={setNotes}
    placeholder="Catatan khusus"
  />

  <Button title="Pesan Sekarang" onPress={handleSubmit} />
</View>
```

---

### Mobile - BookingKoinScreen.tsx (Koin)

**Fitur:**
- Pilih layanan koin (Cuci Saja / Cuci + Kering)
- Pilih tanggal dan shift
- Pilih mesin cuci (wajib)
- Pilih mesin pengering (opsional, jika pilih Cuci + Kering)
- Konfirmasi booking

**Flow:**
1. Customer buka halaman Booking Koin
2. Fetch layanan dari `GET /api/v1/services?jenis=koin`
3. Customer pilih layanan
4. Customer pilih tanggal dan shift
5. Fetch mesin tersedia dari `GET /api/v1/mesin/available?tanggal=...&shift=...`
6. Customer pilih mesin cuci
7. Jika pilih "Cuci + Kering" → customer pilih mesin pengering
8. Customer klik "Konfirmasi Booking"
9. Kirim request ke `POST /api/v1/pemesanan` dengan `mesin_ids`
10. Jika berhasil → redirect ke halaman Status

**UI Components:**
```typescript
// Form booking koin
<View>
  <Text>Pilih Layanan:</Text>
  <Picker
    selectedValue={selectedService}
    onValueChange={setSelectedService}
  >
    {services.map(service => (
      <Picker.Item 
        key={service.id_layanan} 
        label={`${service.nama_layanan} - Rp ${service.harga}`} 
        value={service.id_layanan} 
      />
    ))}
  </Picker>

  <Text>Tanggal:</Text>
  <DatePicker
    value={date}
    onChange={setDate}
    minimumDate={new Date()}
  />

  <Text>Shift:</Text>
  <Picker
    selectedValue={shift}
    onValueChange={setShift}
  >
    <Picker.Item label="Pagi (08:00-12:00)" value="pagi" />
    <Picker.Item label="Siang (12:00-16:00)" value="siang" />
    <Picker.Item label="Sore (16:00-20:00)" value="sore" />
    <Picker.Item label="Malam (20:00-24:00)" value="malam" />
  </Picker>

  <Text>Pilih Mesin Cuci:</Text>
  {washingMachines.map(machine => (
    <TouchableOpacity
      key={machine.id_mesin}
      onPress={() => setSelectedWasher(machine.id_mesin)}
      style={[
        styles.machineCard,
        selectedWasher === machine.id_mesin && styles.selected
      ]}
    >
      <Text>{machine.kode_mesin}</Text>
      <Text>{machine.nama_mesin}</Text>
      <Text>Kapasitas: {machine.kapasitas_kg} kg</Text>
    </TouchableOpacity>
  ))}

  {selectedService?.includes('Kering') && (
    <>
      <Text>Pilih Mesin Pengering:</Text>
      {dryerMachines.map(machine => (
        <TouchableOpacity
          key={machine.id_mesin}
          onPress={() => setSelectedDryer(machine.id_mesin)}
          style={[
            styles.machineCard,
            selectedDryer === machine.id_mesin && styles.selected
          ]}
        >
          <Text>{machine.kode_mesin}</Text>
          <Text>{machine.nama_mesin}</Text>
        </TouchableOpacity>
      ))}
    </>
  )}

  <Button title="Konfirmasi Booking" onPress={handleSubmit} />
</View>
```

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                    BOOKING STATUS FLOW                  │
└─────────────────────────────────────────────────────────┘

[Customer] ──→ [Buat Booking]
                    │
                    ▼
            [menunggu konfirmasi]
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    [Admin Konfirmasi]     [Admin Tolak]
        │                       │
        ▼                       ▼
    [diproses]            [pesanan ditolak]
        │                       (selesai)
        ▼
    [sedang di cuci]
        │
        ▼
    [sedang di keringkan]
        │
        ▼
    [sedang di setrika]  ← (opsional, untuk kiloan)
        │
        ▼
    [pencucian selesai]
        │
        ▼
    [menunggu pembayaran]
        │
        ▼
    [sudah dibayar]
        │
        ▼
    [selesai]
```

---

## Business Rules Detail

### Batasan Booking

**1. 1 Customer = 1 Booking Aktif**
- Customer hanya boleh punya 1 booking dengan status selain 'selesai' atau 'pesanan ditolak'
- Jika customer mencoba booking lagi → error "Anda sudah memiliki booking aktif"

**2. Booking Koin (H+0 sampai H+1)**
- Customer hanya bisa booking untuk hari ini (H+0) atau besok (H+1)
- Tidak bisa booking untuk hari yang sudah lewat
- Tidak bisa booking untuk lusa dan seterusnya

**3. Booking Kiloan (Cut-off Time)**
- Pesanan sebelum cut-off time diproses hari ini
- Pesanan setelah cut-off time diproses besok
- Cut-off time ditentukan oleh admin (misal: 14:00 WIB)

**4. Konfirmasi Admin**
- Admin wajib konfirmasi booking sebelum proses cuci dimulai
- Jika ditolak, customer mendapat notifikasi dengan alasan

### Perhitungan Harga

**Kiloan:**
```
Total = Harga per kg × Berat (kg)
Contoh: Rp 6.000 × 5 kg = Rp 30.000
```
- Berat diinput oleh kasir/admin setelah pakaian diterima

**Koin:**
```
Total = Harga flat per mesin
Contoh: Rp 8.000 (sudah termasuk 1 mesin)
```
- Harga sudah termasuk penggunaan mesin

---

## Dependencies

### Backend
- `pg` - PostgreSQL client

### Frontend Web
- `react-router-dom` - Navigation
- `tailwindcss` - Styling

### Frontend Mobile
- `@react-navigation/native` - Navigation
- `react-native` - UI components
- `@react-native-community/datetimepicker` - Date picker

---

## Testing Checklist

### Booking Kiloan
- [ ] Buat booking kiloan dengan data valid
- [ ] Buat booking dengan layanan yang tidak ada → error
- [ ] Buat booking dengan tanggal di masa lalu → error
- [ ] Buat booking dengan shift yang tidak valid → error
- [ ] Buat booking ketika sudah punya booking aktif → error
- [ ] Booking berhasil tersimpan di database
- [ ] Status default: 'menunggu konfirmasi'

### Booking Koin
- [ ] Buat booking koin dengan data valid
- [ ] Buat booking koin dengan mesin yang tidak tersedia → error
- [ ] Buat booking koin dengan mesin yang sudah dibooking → error
- [ ] Booking mesin tersimpan di tabel junction
- [ ] Booking dengan 2 mesin (cuci + pengering) berhasil

### Konfirmasi/Tolak Booking
- [ ] Konfirmasi booking → status berubah ke 'diproses'
- [ ] Tolak booking → status berubah ke 'pesanan ditolak'
- [ ] Tolak booking tanpa alasan → error
- [ ] Konfirmasi booking yang sudah dikonfirmasi → error
- [ ] Konfirmasi booking yang sudah ditolak → error

### Status Flow
- [ ] Update status dari 'menunggu konfirmasi' ke 'diproses'
- [ ] Update status dari 'diproses' ke 'sedang di cuci'
- [ ] Update status dari 'sedang di cuci' ke 'sedang di keringkan'
- [ ] Update status dari 'sedang di keringkan' ke 'sedang di setrika'
- [ ] Update status dari 'sedang di setrika' ke 'pencucian selesai'
- [ ] Update status dari 'pencucian selesai' ke 'menunggu pembayaran'
- [ ] Update status dari 'menunggu pembayaran' ke 'sudah dibayar'
- [ ] Update status dari 'sudah dibayar' ke 'selesai'
- [ ] Update status dengan transisi tidak valid → error

### List dan Detail
- [ ] List booking dengan pagination
- [ ] List booking dengan filter status
- [ ] List booking dengan filter jenis
- [ ] List booking dengan filter tanggal
- [ ] Customer hanya bisa lihat booking sendiri
- [ ] Detail booking dengan ID valid
- [ ] Detail booking dengan ID tidak ada → error

### Frontend
- [ ] Tampilan form booking kiloan
- [ ] Tampilan form booking koin
- [ ] Pilih mesin cuci dan pengering
- [ ] Konfirmasi booking berhasil
- [ ] Error handling untuk semua validasi
- [ ] Redirect ke halaman status setelah booking
