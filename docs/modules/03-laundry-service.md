# Modul 03: Layanan Laundry (Laundry Service)

## Overview

Modul ini menangani manajemen layanan laundry yang tersedia di sistem. Terdapat 2 jenis layanan utama: **Kiloan** (cuci berdasarkan berat) dan **Koin** (self-service mesin cuci).

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ✅ Sudah ada | Lengkap |
| Frontend Web | ✅ Sudah ada | `ServiceManagement.tsx` |
| Frontend Mobile | ✅ Sudah ada | `LayananScreen.tsx` |

---

## Database Tables

### Tabel yang Digunakan

```sql
CREATE TABLE layanan (
    id_layanan      SERIAL PRIMARY KEY,
    nama_layanan    VARCHAR(100)   NOT NULL,
    jenis_layanan   VARCHAR(20)    NOT NULL
                    CHECK (jenis_layanan IN ('kiloan', 'koin')),
    harga           NUMERIC(10,2)  NOT NULL,
    estimasi_waktu  INTEGER        NOT NULL  -- dalam menit
);
```

### Contoh Data

| id_layanan | nama_layanan | jenis_layanan | harga | estimasi_waktu |
|------------|--------------|---------------|-------|----------------|
| 1 | Kiloan Reguler | kiloan | 6000 | 180 |
| 2 | Kiloan Express | kiloan | 10000 | 90 |
| 3 | Koin Cuci Saja | koin | 8000 | 45 |
| 4 | Koin Cuci + Kering | koin | 12000 | 60 |

---

## API Endpoints

### 1. GET `/api/v1/services`

**Deskripsi:** Mendapatkan daftar semua layanan

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** Semua role (customer, kasir, admin, owner)

**Query Parameters:**
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 20
- `jenis` (optional): Filter jenis layanan ('kiloan', 'koin')

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_layanan": 1,
        "nama_layanan": "Kiloan Reguler",
        "jenis_layanan": "kiloan",
        "harga": 6000,
        "estimasi_waktu": 180
      },
      {
        "id_layanan": 2,
        "nama_layanan": "Kiloan Express",
        "jenis_layanan": "kiloan",
        "harga": 10000,
        "estimasi_waktu": 90
      },
      {
        "id_layanan": 3,
        "nama_layanan": "Koin Cuci Saja",
        "jenis_layanan": "koin",
        "harga": 8000,
        "estimasi_waktu": 45
      }
    ],
    "total": 4,
    "page": 1,
    "limit": 20
  },
  "message": "Daftar layanan berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT id_layanan, nama_layanan, jenis_layanan, harga, estimasi_waktu
FROM layanan
WHERE ($1::text IS NULL OR jenis_layanan = $1)
ORDER BY jenis_layanan, harga
LIMIT $2 OFFSET $3
```

---

### 2. GET `/api/v1/services/:id`

**Deskripsi:** Mendapatkan detail layanan berdasarkan ID

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** Semua role

**Path Parameters:**
- `id`: ID layanan

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "id_layanan": 1,
    "nama_layanan": "Kiloan Reguler",
    "jenis_layanan": "kiloan",
    "harga": 6000,
    "estimasi_waktu": 180
  },
  "message": "Detail layanan berhasil diambil"
}
```

**Response Error (404):**
```json
{
  "status": "error",
  "data": null,
  "message": "Layanan tidak ditemukan"
}
```

---

### 3. POST `/api/v1/services`

**Deskripsi:** Membuat layanan baru

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Request:**
```json
{
  "nama_layanan": "Koin Cuci + Kering + Setrika",
  "jenis_layanan": "koin",
  "harga": 18000,
  "estimasi_waktu": 90
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "data": {
    "id_layanan": 5,
    "nama_layanan": "Koin Cuci + Kering + Setrika",
    "jenis_layanan": "koin",
    "harga": 18000,
    "estimasi_waktu": 90
  },
  "message": "Layanan berhasil dibuat"
}
```

**Validasi:**
- `nama_layanan`: minimal 3 karakter, tidak boleh duplikat
- `jenis_layanan`: harus 'kiloan' atau 'koin'
- `harga`: angka positif, minimal 1000
- `estimasi_waktu`: angka positif (dalam menit)

**Business Rules:**
- Nama layanan harus unik
- Catat ke `audit_log` dengan tipe `SERVICE_CREATED`

---

### 4. PUT `/api/v1/services/:id`

**Deskripsi:** Update data layanan

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `id`: ID layanan

**Request:**
```json
{
  "nama_layanan": "Kiloan Reguler Updated",
  "harga": 7000,
  "estimasi_waktu": 180
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Layanan berhasil diupdate"
}
```

**Business Rules:**
- Tidak bisa mengubah `jenis_layanan` (karena mempengaruhi logika booking)
- Catat ke `audit_log` dengan tipe `SERVICE_UPDATED`

---

### 5. DELETE `/api/v1/services/:id`

**Deskripsi:** Hapus layanan

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `id`: ID layanan

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Layanan berhasil dihapus"
}
```

**Response Error (400):**
```json
{
  "status": "error",
  "data": null,
  "message": "Tidak bisa menghapus layanan yang sedang digunakan dalam booking aktif"
}
```

**Business Rules:**
- Tidak bisa menghapus layanan yang memiliki booking dengan status selain 'selesai' atau 'pesanan ditolak'
- Catat ke `audit_log` dengan tipe `SERVICE_DELETED`

---

## Frontend Integration

### Web - ServiceManagement.tsx

**Fitur:**
- Tabel daftar layanan dengan kolom: nama, jenis, harga, estimasi waktu
- Filter berdasarkan jenis layanan (kiloan/koin)
- Tombol "Tambah Layanan" → form modal
- Tombol aksi: Edit, Hapus

**Flow:**
1. Admin buka halaman Service Management
2. Fetch data dari `GET /api/v1/services?page=1&limit=20`
3. Tampilkan data di tabel
4. Admin klik "Tambah Layanan" → buka modal form
5. Admin isi form dan submit → `POST /api/v1/services`
6. Admin klik "Edit" → buka modal dengan data existing
7. Admin update dan submit → `PUT /api/v1/services/:id`
8. Admin klik "Hapus" → konfirmasi → `DELETE /api/v1/services/:id`

**UI Components:**
```typescript
// Tabel layanan
<table>
  <thead>
    <tr>
      <th>Nama Layanan</th>
      <th>Jenis</th>
      <th>Harga</th>
      <th>Estimasi</th>
      <th>Aksi</th>
    </tr>
  </thead>
  <tbody>
    {services.map(service => (
      <tr key={service.id_layanan}>
        <td>{service.nama_layanan}</td>
        <td><Badge type={service.jenis_layanan} /></td>
        <td>Rp {service.harga.toLocaleString()}</td>
        <td>{service.estimasi_waktu} menit</td>
        <td>
          <Button onClick={() => handleEdit(service)}>Edit</Button>
          <Button onClick={() => handleDelete(service.id)}>Hapus</Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### Mobile - LayananScreen.tsx

**Fitur:**
- Daftar layanan dalam bentuk card/list
- Filter berdasarkan jenis layanan (kiloan/koin)
- Klik card → buka detail layanan
- Tombol "Booking" untuk langsung ke halaman booking

**Flow:**
1. Customer buka halaman Layanan
2. Fetch data dari `GET /api/v1/services`
3. Tampilkan data dalam card layout
4. Customer bisa filter berdasarkan jenis
5. Customer klik card → buka detail
6. Customer klik "Booking" → redirect ke halaman booking dengan layanan terpilih

**UI Components:**
```typescript
// Card layanan
<View style={styles.card}>
  <Text style={styles.title}>{service.nama_layanan}</Text>
  <View style={styles.badge}>
    <Text>{service.jenis_layanan === 'kiloan' ? 'Kiloan' : 'Koin'}</Text>
  </View>
  <Text style={styles.price}>Rp {service.harga.toLocaleString()}</Text>
  <Text style={styles.time}>Estimasi: {service.estimasi_waktu} menit</Text>
  <Button 
    title="Booking" 
    onPress={() => navigation.navigate('Booking', { serviceId: service.id_layanan })}
  />
</View>
```

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                  LAUNDRY SERVICE FLOW                   │
└─────────────────────────────────────────────────────────┘

[Admin] ──→ [Service Management Page]
                │
                ▼
            [List View]
                │
        ┌───────┴───────┐
        ▼               ▼
    [Filter]        [Actions]
    - Kiloan        - Add New
    - Koin          - Edit
                    - Delete
                        │
                        ▼
                [Confirmation]
                        │
                        ▼
                [Delete/Cancel]
```

---

## Business Rules Detail

### Jenis Layanan

**1. Kiloan**
- Harga berdasarkan berat (per kg)
- Contoh: Kiloan Reguler Rp 6.000/kg
- Estimasi waktu lebih lama (180 menit = 3 jam)
- Customer mengirim pakaian, dijemput kurir atau antar sendiri
- Berat ditimbang oleh kasir/admin setelah pakaian diterima

**2. Koin (Self-Service)**
- Harga flat per mesin
- Contoh: Koin Cuci Saja Rp 8.000/mesin
- Estimasi waktu lebih cepat (45 menit)
- Customer datang ke outlet dan menggunakan mesin sendiri
- Bisa pilih mesin cuci saja atau cuci + pengeringan

### Harga dan Perhitungan

**Kiloan:**
```
Total = Harga per kg × Berat (kg)
Contoh: Rp 6.000 × 5 kg = Rp 30.000
```

**Koin:**
```
Total = Harga flat
Contoh: Rp 8.000 (sudah termasuk 1 mesin)
```

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

- [ ] List semua layanan
- [ ] List layanan dengan filter jenis
- [ ] Detail layanan berdasarkan ID
- [ ] Buat layanan baru dengan data valid
- [ ] Buat layanan dengan nama yang sudah ada → error
- [ ] Edit data layanan
- [ ] Edit layanan dengan jenis berbeda → error (tidak diizinkan)
- [ ] Hapus layanan yang tidak digunakan
- [ ] Hapus layanan yang sedang digunakan → error
- [ ] Tampilan mobile responsive
- [ ] Filter berfungsi dengan baik
