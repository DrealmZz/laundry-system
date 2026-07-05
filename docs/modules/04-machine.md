# Modul 04: Mesin Cuci (Machine)

## Overview

Modul ini menangani manajemen mesin cuci dan pengering yang tersedia di outlet. Customer dapat melihat ketersediaan mesin secara real-time dan melakukan booking mesin untuk layanan koin.

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ✅ Sudah ada (read-only) | Perlu tambah CRUD endpoints |
| Frontend Web | ✅ Sudah ada | `MachinesStatus.tsx` (view only) |
| Frontend Mobile | ✅ Sudah ada | `BookingKoinScreen.tsx` (pilih mesin) |

---

## Database Tables

### Tabel yang Digunakan

```sql
CREATE TABLE mesin_cuci (
    id_mesin              SERIAL PRIMARY KEY,
    kode_mesin            VARCHAR(20)    UNIQUE NOT NULL,
    tipe_mesin            VARCHAR(50)    NOT NULL
                          CHECK (tipe_mesin IN ('pencucian', 'pengeringan')),
    nama_mesin            VARCHAR(100)   NOT NULL,
    status_mesin          VARCHAR(20)    NOT NULL DEFAULT 'tersedia'
                          CHECK (status_mesin IN ('tersedia', 'dipakai', 'perbaikan')),
    konsumsi_kwh          NUMERIC(6,2),
    kapasitas_kg          SMALLINT,
    penggunaan_air_liter  NUMERIC(6,2)
);

-- Tabel junction untuk booking mesin
CREATE TABLE booking_mesin (
    id_booking_mesin  SERIAL PRIMARY KEY,
    id_pemesanan      INTEGER NOT NULL REFERENCES pemesanan(id_pemesanan) ON DELETE CASCADE,
    id_mesin          INTEGER NOT NULL REFERENCES mesin_cuci(id_mesin),
    UNIQUE(id_pemesanan, id_mesin)
);
```

### Contoh Data

**Mesin Cuci:**
| id_mesin | kode_mesin | tipe_mesin | nama_mesin | status_mesin | kapasitas_kg |
|----------|------------|------------|------------|--------------|--------------|
| 1 | MC-01 | pencucian | Mesin Cuci 1 | tersedia | 10 |
| 2 | MC-02 | pencucian | Mesin Cuci 2 | dipakai | 10 |
| 3 | MD-01 | pengeringan | Mesin Pengering 1 | tersedia | 8 |
| 4 | MD-02 | pengeringan | Mesin Pengering 2 | perbaikan | 8 |

**Booking Mesin (Junction):**
| id_booking_mesin | id_pemesanan | id_mesin |
|------------------|--------------|----------|
| 1 | 1 | 1 | ← Booking 1 pakai mesin cuci MC-01
| 2 | 1 | 3 | ← Booking 1 pakai mesin pengering MD-01
| 3 | 2 | 2 | ← Booking 2 pakai mesin cuci MC-02

---

## API Endpoints

### 1. GET `/api/v1/mesin`

**Deskripsi:** Mendapatkan daftar semua mesin

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** Semua role

**Query Parameters:**
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 20
- `tipe` (optional): Filter tipe mesin ('pencucian', 'pengeringan')
- `status` (optional): Filter status ('tersedia', 'dipakai', 'perbaikan')

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_mesin": 1,
        "kode_mesin": "MC-01",
        "tipe_mesin": "pencucian",
        "nama_mesin": "Mesin Cuci 1",
        "status_mesin": "tersedia",
        "konsumsi_kwh": 1.5,
        "kapasitas_kg": 10,
        "penggunaan_air_liter": 50
      },
      {
        "id_mesin": 3,
        "kode_mesin": "MD-01",
        "tipe_mesin": "pengeringan",
        "nama_mesin": "Mesin Pengering 1",
        "status_mesin": "tersedia",
        "konsumsi_kwh": 2.0,
        "kapasitas_kg": 8,
        "penggunaan_air_liter": 0
      }
    ],
    "total": 4,
    "page": 1,
    "limit": 20
  },
  "message": "Daftar mesin berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT id_mesin, kode_mesin, tipe_mesin, nama_mesin, status_mesin,
       konsumsi_kwh, kapasitas_kg, penggunaan_air_liter
FROM mesin_cuci
WHERE ($1::text IS NULL OR tipe_mesin = $1)
  AND ($2::text IS NULL OR status_mesin = $2)
ORDER BY kode_mesin
LIMIT $3 OFFSET $4
```

---

### 2. GET `/api/v1/mesin/available`

**Deskripsi:** Mendapatkan daftar mesin yang tersedia berdasarkan tanggal dan shift

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** customer, kasir, admin

**Query Parameters:**
- `tanggal` (required): Tanggal booking (format: YYYY-MM-DD)
- `shift` (required): Shift booking ('pagi', 'siang', 'sore', 'malam')
- `tipe` (optional): Filter tipe mesin ('pencucian', 'pengeringan')

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_mesin": 1,
        "kode_mesin": "MC-01",
        "tipe_mesin": "pencucian",
        "nama_mesin": "Mesin Cuci 1",
        "status_mesin": "tersedia",
        "kapasitas_kg": 10
      }
    ],
    "total": 1,
    "tanggal": "2026-07-03",
    "shift": "pagi"
  },
  "message": "Daftar mesin tersedia berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT m.id_mesin, m.kode_mesin, m.tipe_mesin, m.nama_mesin, 
       m.status_mesin, m.kapasitas_kg
FROM mesin_cuci m
WHERE m.status_mesin = 'tersedia'
  AND m.id_mesin NOT IN (
    SELECT bm.id_mesin 
    FROM booking_mesin bm
    JOIN pemesanan p ON bm.id_pemesanan = p.id_pemesanan
    WHERE p.tanggal_pesanan = $1
      AND p.shift = $2
      AND p.status_pesanan NOT IN ('selesai', 'pesanan ditolak')
  )
  AND ($3::text IS NULL OR m.tipe_mesin = $3)
ORDER BY m.kode_mesin
```

**Business Rules:**
- Mesin dianggap "tersedia" jika:
  - `status_mesin` = 'tersedia' (tidak dalam perbaikan atau dipakai manual)
  - Tidak ada booking aktif untuk tanggal dan shift yang sama
- Booking aktif: status_pesanan bukan 'selesai' atau 'pesanan ditolak'

---

### 3. GET `/api/v1/mesin/:id`

**Deskripsi:** Mendapatkan detail mesin berdasarkan ID

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** Semua role

**Path Parameters:**
- `id`: ID mesin

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "id_mesin": 1,
    "kode_mesin": "MC-01",
    "tipe_mesin": "pencucian",
    "nama_mesin": "Mesin Cuci 1",
    "status_mesin": "tersedia",
    "konsumsi_kwh": 1.5,
    "kapasitas_kg": 10,
    "penggunaan_air_liter": 50
  },
  "message": "Detail mesin berhasil diambil"
}
```

---

### 4. POST `/api/v1/mesin` ⚠️ BELUM ADA

**Deskripsi:** Menambahkan mesin baru

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Request:**
```json
{
  "kode_mesin": "MC-03",
  "tipe_mesin": "pencucian",
  "nama_mesin": "Mesin Cuci 3",
  "konsumsi_kwh": 1.8,
  "kapasitas_kg": 12,
  "penggunaan_air_liter": 60
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "data": {
    "id_mesin": 5,
    "kode_mesin": "MC-03",
    "tipe_mesin": "pencucian",
    "nama_mesin": "Mesin Cuci 3",
    "status_mesin": "tersedia"
  },
  "message": "Mesin berhasil ditambahkan"
}
```

**Validasi:**
- `kode_mesin`: 3-20 karakter, alphanumeric, unik
- `tipe_mesin`: harus 'pencucian' atau 'pengeringan'
- `nama_mesin`: minimal 3 karakter
- `kapasitas_kg`: angka positif
- `konsumsi_kwh`: angka positif (opsional)
- `penggunaan_air_liter`: angka positif (opsional)

**Business Rules:**
- Status default: 'tersedia'
- Kode mesin harus unik
- Catat ke `audit_log` dengan tipe `MACHINE_CREATED`

---

### 5. PUT `/api/v1/mesin/:id` ⚠️ BELUM ADA

**Deskripsi:** Update data mesin

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `id`: ID mesin

**Request:**
```json
{
  "nama_mesin": "Mesin Cuci 1 Updated",
  "konsumsi_kwh": 2.0,
  "kapasitas_kg": 12
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Mesin berhasil diupdate"
}
```

**Business Rules:**
- Tidak bisa mengubah `kode_mesin` dan `tipe_mesin` (digunakan sebagai identifier)
- Catat ke `audit_log` dengan tipe `MACHINE_UPDATED`

---

### 6. PATCH `/api/v1/mesin/:id/status` ⚠️ BELUM ADA

**Deskripsi:** Mengubah status mesin

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `id`: ID mesin

**Request:**
```json
{
  "status_mesin": "perbaikan"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Status mesin berhasil diubah"
}
```

**Business Rules:**
- Status bisa diubah ke: 'tersedia', 'dipakai', 'perbaikan'
- Jika mesin sedang dalam booking aktif, tidak bisa diubah ke 'perbaikan'
- Catat ke `audit_log` dengan tipe `MACHINE_STATUS_CHANGED`

---

### 7. GET `/api/v1/pemesanan/:id/mesin` ⚠️ BELUM ADA

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

### Web - MachinesStatus.tsx

**Fitur:**
- Grid/tabel status semua mesin
- Warna berdasarkan status:
  - Hijau: tersedia
  - Kuning: dipakai
  - Merah: perbaikan
- Filter berdasarkan tipe dan status
- Admin: tombol ubah status mesin

**Flow:**
1. User buka halaman Machines Status
2. Fetch data dari `GET /api/v1/mesin`
3. Tampilkan grid mesin dengan warna status
4. Admin klik mesin → buka modal ubah status
5. Admin pilih status baru → `PATCH /api/v1/mesin/:id/status`

**UI Components:**
```typescript
// Grid mesin
<div className="grid grid-cols-4 gap-4">
  {machines.map(machine => (
    <div 
      key={machine.id_mesin}
      className={`p-4 rounded-lg border ${
        machine.status_mesin === 'tersedia' ? 'bg-green-100 border-green-300' :
        machine.status_mesin === 'dipakai' ? 'bg-yellow-100 border-yellow-300' :
        'bg-red-100 border-red-300'
      }`}
    >
      <h3>{machine.kode_mesin}</h3>
      <p>{machine.nama_mesin}</p>
      <p className="capitalize">{machine.tipe_mesin}</p>
      <Badge status={machine.status_mesin} />
    </div>
  ))}
</div>
```

---

### Mobile - BookingKoinScreen.tsx

**Fitur:**
- Pilih tanggal dan shift booking
- Tampilkan mesin tersedia berdasarkan tanggal dan shift
- Pilih mesin cuci dan mesin pengering (opsional)
- Konfirmasi booking

**Flow:**
1. Customer buka halaman Booking Koin
2. Pilih tanggal dan shift
3. Fetch mesin tersedia dari `GET /api/v1/mesin/available?tanggal=...&shift=...&tipe=pencucian`
4. Tampilkan mesin cuci tersedia
5. Customer pilih mesin cuci
6. Fetch mesin pengering tersedia (jika pilih cuci + kering)
7. Customer pilih mesin pengering (opsional)
8. Customer klik "Konfirmasi Booking"
9. Kirim request ke `POST /api/v1/pemesanan` dengan `mesin_ids`

**UI Components:**
```typescript
// Pilih mesin cuci
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

// Pilih mesin pengering (opsional)
<Text>Pilih Mesin Pengering (opsional):</Text>
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
```

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                    MACHINE STATUS FLOW                  │
└─────────────────────────────────────────────────────────┘

[Status Mesin]
    │
    ├── tersedia ──→ dipakai (saat booking aktif)
    │                  │
    │                  └──→ tersedia (booking selesai)
    │
    └── perbaikan (admin bisa set kapan saja)
         │
         └──→ tersedia (setelah selesai diperbaiki)

[Booking Mesin Flow]
    │
    ├── Customer pilih mesin cuci (wajib untuk koin)
    ├── Customer pilih mesin pengering (opsional)
    ├── System cek ketersediaan
    ├── Jika tersedia → simpan ke booking_mesin
    └── Jika tidak tersedia → tampilkan pesan error
```

---

## Business Rules Detail

### Ketersediaan Mesin

**Mesin dianggap tersedia jika:**
1. `status_mesin` = 'tersedia' (tidak dalam perbaikan atau dipakai manual)
2. Tidak ada booking aktif untuk tanggal dan shift yang sama
3. Booking aktif: `status_pesanan` bukan 'selesai' atau 'pesanan ditolak'

**Contoh:**
- Mesin MC-01 status 'tersedia'
- Tanggal 2026-07-03, shift pagi
- Tidak ada booking untuk MC-01 pada tanggal dan shift tersebut
- Result: MC-01 tersedia

### Booking Mesin

**Untuk layanan koin:**
- Customer WAJIB pilih minimal 1 mesin cuci
- Customer BISA pilih mesin pengering (opsional)
- Maksimal 2 mesin per booking (1 cuci + 1 pengering)

**Untuk layanan kiloan:**
- Tidak perlu pilih mesin (dikelola oleh karyawan)
- Kolom `id_mesin` di tabel `pemesanan` bisa NULL

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

---

## Testing Checklist

- [ ] List semua mesin
- [ ] List mesin dengan filter tipe
- [ ] List mesin dengan filter status
- [ ] Detail mesin berdasarkan ID
- [ ] Cek ketersediaan mesin berdasarkan tanggal dan shift
- [ ] Tambah mesin baru dengan data valid
- [ ] Tambah mesin dengan kode yang sudah ada → error
- [ ] Update data mesin
- [ ] Ubah status mesin ke 'perbaikan'
- [ ] Ubah status mesin yang sedang booking aktif → error
- [ ] Tampilan grid mesin dengan warna status
- [ ] Booking koin: pilih mesin cuci dan pengering
- [ ] Booking koin: mesin tidak tersedia → error
- [ ] Booking kiloan: tidak perlu pilih mesin
