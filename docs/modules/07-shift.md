# Modul 07: Manajemen Shift (Shift Management)

## Overview

Modul ini menangani manajemen jadwal shift kerja untuk karyawan (khusus kasir dan admin). Admin dapat membuat shift, mengassign karyawan ke shift, dan memantau jadwal kerja. Owner dapat melihat performa shift.

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ⚠️ BELUM ADA | Perlu dibuat dari nol |
| Frontend Web | ✅ Sudah ada | `ShiftManagement.tsx` (UI saja, belum terintegrasi) |
| Frontend Mobile | ❌ Tidak ada | Tidak diperlukan (shift dikelola admin di web) |

---

## Database Tables

### Tabel yang Akan Dibuat

```sql
-- Tabel shift
CREATE TABLE shifts (
    id_shift      SERIAL PRIMARY KEY,
    nama_shift    VARCHAR(20) NOT NULL
                  CHECK (nama_shift IN ('pagi', 'siang', 'sore', 'malam')),
    tanggal       DATE NOT NULL,
    jam_mulai     TIME NOT NULL,
    jam_selesai   TIME NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel junction shift_karyawan
CREATE TABLE shift_karyawan (
    id_shift_karyawan  SERIAL PRIMARY KEY,
    id_shift           INTEGER NOT NULL REFERENCES shifts(id_shift) ON DELETE CASCADE,
    id_karyawan        INTEGER NOT NULL REFERENCES karyawan(id_karyawan),
    UNIQUE(id_shift, id_karyawan)
);

-- Indexes
CREATE INDEX idx_shifts_tanggal ON shifts(tanggal);
CREATE INDEX idx_shift_karyawan_karyawan ON shift_karyawan(id_karyawan);
```

### Contoh Data

**Shift:**
| id_shift | nama_shift | tanggal | jam_mulai | jam_selesai |
|----------|------------|---------|-----------|-------------|
| 1 | pagi | 2026-07-03 | 08:00 | 16:00 |
| 2 | siang | 2026-07-03 | 12:00 | 20:00 |
| 3 | sore | 2026-07-03 | 16:00 | 24:00 |
| 4 | malam | 2026-07-03 | 20:00 | 04:00 |

**Shift Karyawan (Junction):**
| id_shift_karyawan | id_shift | id_karyawan |
|-------------------|----------|-------------|
| 1 | 1 | 1 | ← Budi (admin) di shift pagi
| 2 | 1 | 2 | ← Rudi (kasir) di shift pagi
| 3 | 2 | 3 | ← Siti (kasir) di shift siang

---

## API Endpoints

### 1. GET `/api/v1/shifts`

**Deskripsi:** Mendapatkan daftar shift

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin, owner

**Query Parameters:**
- `tanggal` (optional): Filter tanggal (format: YYYY-MM-DD)
- `nama_shift` (optional): Filter shift ('pagi', 'siang', 'sore', 'malam')
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 20

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_shift": 1,
        "nama_shift": "pagi",
        "tanggal": "2026-07-03",
        "jam_mulai": "08:00",
        "jam_selesai": "16:00",
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
        ],
        "created_at": "2026-07-01T10:00:00Z"
      }
    ],
    "total": 4,
    "page": 1,
    "limit": 20
  },
  "message": "Daftar shift berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT s.id_shift, s.nama_shift, s.tanggal, s.jam_mulai, s.jam_selesai, s.created_at
FROM shifts s
WHERE ($1::date IS NULL OR s.tanggal = $1)
  AND ($2::text IS NULL OR s.nama_shift = $2)
ORDER BY s.tanggal DESC, 
         CASE s.nama_shift 
           WHEN 'pagi' THEN 1 
           WHEN 'siang' THEN 2 
           WHEN 'sore' THEN 3 
           WHEN 'malam' THEN 4 
         END
LIMIT $3 OFFSET $4;

-- Ambil karyawan per shift
SELECT k.id_karyawan, k.nama_lengkap, k.role
FROM karyawan k
JOIN shift_karyawan sk ON k.id_karyawan = sk.id_karyawan
WHERE sk.id_shift = $1
ORDER BY k.nama_lengkap;
```

---

### 2. POST `/api/v1/shifts`

**Deskripsi:** Membuat shift baru

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Request:**
```json
{
  "nama_shift": "pagi",
  "tanggal": "2026-07-04",
  "jam_mulai": "08:00",
  "jam_selesai": "16:00"
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "data": {
    "id_shift": 5,
    "nama_shift": "pagi",
    "tanggal": "2026-07-04",
    "jam_mulai": "08:00",
    "jam_selesai": "16:00"
  },
  "message": "Shift berhasil dibuat"
}
```

**Validasi:**
- `nama_shift`: harus 'pagi', 'siang', 'sore', atau 'malam'
- `tanggal`: tidak boleh di masa lalu
- `jam_mulai`: format TIME valid
- `jam_selesai`: format TIME valid, harus setelah `jam_mulai` (kecuali shift malam yang melewati tengah malam)

**Business Rules:**
- 1 shift per tanggal per nama_shift (tidak boleh duplikat)
- Jam shift default:
  - Pagi: 08:00 - 16:00
  - Siang: 12:00 - 20:00
  - Sore: 16:00 - 24:00
  - Malam: 20:00 - 04:00
- Admin bisa kustom jam sesuai kebutuhan
- Catat ke `audit_log` dengan tipe `SHIFT_CREATED`

---

### 3. PUT `/api/v1/shifts/:id`

**Deskripsi:** Update shift

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `id`: ID shift

**Request:**
```json
{
  "jam_mulai": "09:00",
  "jam_selesai": "17:00"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Shift berhasil diupdate"
}
```

**Business Rules:**
- Tidak bisa mengubah `nama_shift` dan `tanggal` (gunakan hapus + buat baru)
- Bisa mengubah `jam_mulai` dan `jam_selesai`
- Catat ke `audit_log` dengan tipe `SHIFT_UPDATED`

---

### 4. DELETE `/api/v1/shifts/:id`

**Deskripsi:** Hapus shift

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `id`: ID shift

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Shift berhasil dihapus"
}
```

**Business Rules:**
- Hapus juga data di `shift_karyawan` (CASCADE)
- Tidak bisa menghapus shift yang sudah lewat
- Catat ke `audit_log` dengan tipe `SHIFT_DELETED`

---

### 5. GET `/api/v1/shifts/:id/karyawan`

**Deskripsi:** Mendapatkan daftar karyawan dalam shift

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin, owner

**Path Parameters:**
- `id`: ID shift

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "karyawan": [
      {
        "id_karyawan": 1,
        "nama_lengkap": "Budi Santoso",
        "role": "admin",
        "no_hp": "081234567891",
        "email": "budi@laundry.com"
      },
      {
        "id_karyawan": 2,
        "nama_lengkap": "Rudi Hermawan",
        "role": "kasir",
        "no_hp": "081234567894",
        "email": "rudi@laundry.com"
      }
    ],
    "total": 2
  },
  "message": "Daftar karyawan shift berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT k.id_karyawan, k.nama_lengkap, k.role, k.no_hp, k.email
FROM karyawan k
JOIN shift_karyawan sk ON k.id_karyawan = sk.id_karyawan
WHERE sk.id_shift = $1
ORDER BY k.nama_lengkap;
```

---

### 6. POST `/api/v1/shifts/:id/assign`

**Deskripsi:** Assign karyawan ke shift

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `id`: ID shift

**Request:**
```json
{
  "id_karyawan": 2
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Karyawan berhasil di-assign ke shift"
}
```

**Response Error (400):**
```json
{
  "status": "error",
  "data": null,
  "message": "Karyawan sudah di-assign ke shift ini"
}
```

**Validasi:**
- `id_karyawan`: harus valid dan ada di tabel `karyawan`
- Karyawan harus role 'kasir' atau 'admin'

**Business Rules:**
- 1 karyawan bisa di-assign ke banyak shift (beda hari)
- 1 shift bisa punya banyak karyawan
- Tidak boleh assign karyawan yang sama ke shift yang sama (duplikat)
- Catat ke `audit_log` dengan tipe `SHIFT_ASSIGNED`

---

### 7. DELETE `/api/v1/shifts/:id/unassign/:karyawan_id`

**Deskripsi:** Unassign karyawan dari shift

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `id`: ID shift
- `karyawan_id`: ID karyawan

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Karyawan berhasil di-unassign dari shift"
}
```

**Business Rules:**
- Hapus data dari `shift_karyawan`
- Catat ke `audit_log` dengan tipe `SHIFT_UNASSIGNED`

---

## Frontend Integration

### Web - ShiftManagement.tsx

**Fitur:**
- Kalender/tabel jadwal shift per hari
- Filter berdasarkan tanggal dan shift
- Tombol "Tambah Shift" → form modal
- Tombol "Assign Karyawan" → modal pilih karyawan
- Tombol "Unassign Karyawan" → konfirmasi hapus
- Tampilan daftar karyawan per shift

**Flow:**
1. Admin buka halaman Shift Management
2. Fetch data dari `GET /api/v1/shifts?tanggal=2026-07-03`
3. Tampilkan shift dalam bentuk kalender/tabel
4. Admin klik "Tambah Shift" → buka modal form
5. Admin isi form dan submit → `POST /api/v1/shifts`
6. Admin klik "Assign Karyawan" pada shift tertentu → buka modal
7. Admin pilih karyawan dari dropdown → `POST /api/v1/shifts/:id/assign`
8. Admin klik "Unassign Karyawan" → konfirmasi → `DELETE /api/v1/shifts/:id/unassign/:karyawan_id`

**UI Components:**
```typescript
// Kalender shift
<div className="shift-calendar">
  <div className="date-selector">
    <DatePicker value={selectedDate} onChange={setSelectedDate} />
  </div>
  
  <div className="shift-grid">
    {['pagi', 'siang', 'sore', 'malam'].map(shiftName => {
      const shift = shifts.find(s => s.nama_shift === shiftName);
      return (
        <div key={shiftName} className="shift-card">
          <h3>{shiftName.toUpperCase()}</h3>
          <p>{shift?.jam_mulai} - {shift?.jam_selesai}</p>
          
          {shift ? (
            <>
              <div className="karyawan-list">
                {shift.karyawan.map(k => (
                  <div key={k.id_karyawan} className="karyawan-item">
                    <span>{k.nama_lengkap}</span>
                    <span className="role">{k.role}</span>
                    <button onClick={() => handleUnassign(shift.id_shift, k.id_karyawan)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => handleAssign(shift.id_shift)}>
                + Assign Karyawan
              </button>
            </>
          ) : (
            <button onClick={() => handleCreateShift(shiftName)}>
              + Buat Shift
            </button>
          )}
        </div>
      );
    })}
  </div>
</div>

// Modal assign karyawan
<Modal>
  <h2>Assign Karyawan ke Shift</h2>
  <Picker
    selectedValue={selectedKaryawan}
    onValueChange={setSelectedKaryawan}
  >
    {karyawanList.map(k => (
      <Picker.Item 
        key={k.id_karyawan} 
        label={`${k.nama_lengkap} (${k.role})`} 
        value={k.id_karyawan} 
      />
    ))}
  </Picker>
  <Button onClick={handleConfirmAssign}>Assign</Button>
</Modal>
```

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                    SHIFT MANAGEMENT FLOW                │
└─────────────────────────────────────────────────────────┘

[Admin] ──→ [Shift Management Page]
                │
                ▼
        [Pilih Tanggal]
                │
                ▼
        [Tampilkan Shift]
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
[Buat Shift] [Assign]   [Unassign]
    │           │           │
    ▼           ▼           ▼
[POST /shifts] [POST /shifts/:id/assign] [DELETE /shifts/:id/unassign/:karyawan_id]
    │           │           │
    ▼           ▼           ▼
[Shift Baru] [Karyawan Ditambahkan] [Karyawan Dihapus]
```

---

## Business Rules Detail

### Jenis Shift

**1. Pagi (08:00 - 16:00)**
- Jam sibuk: pagi sampai siang
- Cocok untuk: admin, kasir pagi

**2. Siang (12:00 - 20:00)**
- Jam sibuk: siang sampai sore
- Cocok untuk: kasir siang

**3. Sore (16:00 - 24:00)**
- Jam sibuk: sore sampai malam
- Cocok untuk: kasir sore

**4. Malam (20:00 - 04:00)**
- Jam sibuk: malam sampai dini hari
- Cocok untuk: admin remote (tidak perlu di outlet)

### Penugasan Karyawan

**Admin:**
- Bisa di-assign ke shift mana saja
- Bisa bekerja remote (terutama shift malam)
- Bertanggung jawab atas konfirmasi booking dan manajemen sistem

**Kasir:**
- Hanya bisa di-assign ke shift pagi, siang, sore
- Harus hadir di outlet
- Bertanggung jawab atas transaksi dan pembayaran

### Keterkaitan dengan Transaksi

**Aturan:**
- Kasir hanya bisa memproses transaksi yang berada dalam shift kerjanya
- Contoh: Kasir Rudi di shift pagi (08:00-16:00)
  - Rudi bisa proses transaksi dari 08:00 sampai 16:00
  - Rudi tidak bisa proses transaksi di luar jam tersebut

**Implementasi:**
- Saat kasir login, sistem cek shift yang aktif
- Jika tidak ada shift aktif → kasir tidak bisa akses menu transaksi
- Jika ada shift aktif → kasir hanya bisa proses transaksi dalam rentang waktu shift

---

## Dependencies

### Backend
- `pg` - PostgreSQL client

### Frontend Web
- `react-router-dom` - Navigation
- `tailwindcss` - Styling
- `react-datepicker` - Date picker (opsional)

### Frontend Mobile
- Tidak diperlukan

---

## Testing Checklist

### CRUD Shift
- [ ] List shift dengan filter tanggal
- [ ] List shift dengan filter nama_shift
- [ ] Buat shift baru dengan data valid
- [ ] Buat shift dengan tanggal di masa lalu → error
- [ ] Buat shift duplikat (tanggal + nama_shift sama) → error
- [ ] Update shift (jam_mulai, jam_selesai)
- [ ] Hapus shift yang belum lewat
- [ ] Hapus shift yang sudah lewat → error

### Assign/Unassign Karyawan
- [ ] List karyawan dalam shift
- [ ] Assign karyawan ke shift dengan data valid
- [ ] Assign karyawan yang sudah di-assign → error
- [ ] Assign karyawan dengan role bukan kasir/admin → error
- [ ] Unassign karyawan dari shift

### Integrasi dengan Transaksi
- [ ] Kasir di shift pagi bisa proses transaksi di jam 08:00-16:00
- [ ] Kasir di shift pagi tidak bisa proses transaksi di jam 16:01-07:59
- [ ] Kasir tidak di-assign shift → tidak bisa akses menu transaksi

### Frontend
- [ ] Tampilan kalender shift
- [ ] Tampilan daftar karyawan per shift
- [ ] Form tambah shift
- [ ] Modal assign karyawan
- [ ] Konfirmasi unassign karyawan
- [ ] Filter berdasarkan tanggal
- [ ] Filter berdasarkan shift
