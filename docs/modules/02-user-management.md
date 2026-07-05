# Modul 02: Manajemen Pengguna (User Management)

## Overview

Modul ini menangani CRUD (Create, Read, Update, Delete) untuk semua pengguna sistem: customer, karyawan (admin/kasir), dan owner. Hanya admin yang memiliki akses penuh ke modul ini.

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ✅ Sudah ada | Lengkap |
| Frontend Web | ✅ Sudah ada | `CustomerDirectory.tsx`, `EmployeeDirectory.tsx` |
| Frontend Mobile | ✅ Sudah ada | `ProfileScreen.tsx` (view/edit profil sendiri) |

---

## Database Tables

### Tabel yang Digunakan

```sql
-- customer
CREATE TABLE customer (
    id_customer     SERIAL PRIMARY KEY,
    nama_lengkap    VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    no_hp           VARCHAR(20),
    email           VARCHAR(150) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    status_akun     VARCHAR(20)  NOT NULL DEFAULT 'aktif'
                    CHECK (status_akun IN ('aktif', 'tidak aktif')),
    alamat          TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    tanggal_daftar  DATE         NOT NULL DEFAULT CURRENT_DATE
);

-- karyawan
CREATE TABLE karyawan (
    id_karyawan     SERIAL PRIMARY KEY,
    nama_lengkap    VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    no_hp           VARCHAR(20),
    email           VARCHAR(150) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL
                    CHECK (role IN ('admin', 'kasir')),
    hak_akses       TEXT,
    status_akun     VARCHAR(20)  NOT NULL DEFAULT 'aktif'
                    CHECK (status_akun IN ('aktif', 'tidak aktif')),
    alamat          TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- owner
CREATE TABLE owner (
    id_owner        SERIAL PRIMARY KEY,
    nama_lengkap    VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    no_hp           VARCHAR(20),
    email           VARCHAR(150) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    hak_akses       TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

---

## API Endpoints

### 1. GET `/api/v1/users/customers`

**Deskripsi:** Mendapatkan daftar semua customer

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin, kasir

**Query Parameters:**
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 20
- `search` (optional): Cari berdasarkan nama, username, email
- `status` (optional): Filter status ('aktif', 'tidak aktif')

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_customer": 1,
        "nama_lengkap": "Andi Wijaya",
        "username": "andi123",
        "email": "andi@email.com",
        "no_hp": "081234567890",
        "alamat": "Jl. Merdeka No. 10",
        "status_akun": "aktif",
        "tanggal_daftar": "2026-07-01",
        "created_at": "2026-07-01T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  },
  "message": "Daftar customer berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT id_customer, nama_lengkap, username, email, no_hp, alamat, 
       status_akun, tanggal_daftar, created_at
FROM customer
WHERE ($1::text IS NULL OR nama_lengkap ILIKE '%' || $1 || '%' 
       OR username ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
  AND ($2::text IS NULL OR status_akun = $2)
ORDER BY created_at DESC
LIMIT $3 OFFSET $4
```

---

### 2. GET `/api/v1/users/karyawan`

**Deskripsi:** Mendapatkan daftar semua karyawan

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Query Parameters:**
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 20
- `search` (optional): Cari berdasarkan nama, username, email
- `role` (optional): Filter role ('admin', 'kasir')
- `status` (optional): Filter status ('aktif', 'tidak aktif')

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_karyawan": 1,
        "nama_lengkap": "Budi Santoso",
        "username": "budi_admin",
        "email": "budi@laundry.com",
        "no_hp": "081234567891",
        "role": "admin",
        "hak_akses": "full",
        "alamat": "Jl. Sudirman No. 20",
        "status_akun": "aktif",
        "created_at": "2026-07-01T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  },
  "message": "Daftar karyawan berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT id_karyawan, nama_lengkap, username, email, no_hp, role,
       hak_akses, alamat, status_akun, created_at
FROM karyawan
WHERE ($1::text IS NULL OR nama_lengkap ILIKE '%' || $1 || '%' 
       OR username ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
  AND ($2::text IS NULL OR role = $2)
  AND ($3::text IS NULL OR status_akun = $3)
ORDER BY created_at DESC
LIMIT $4 OFFSET $5
```

---

### 3. GET `/api/v1/users/owners`

**Deskripsi:** Mendapatkan daftar semua owner

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_owner": 1,
        "nama_lengkap": "Siti Rahayu",
        "username": "siti_owner",
        "email": "siti@laundry.com",
        "no_hp": "081234567892",
        "hak_akses": "full",
        "created_at": "2026-07-01T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  },
  "message": "Daftar owner berhasil diambil"
}
```

---

### 4. GET `/api/v1/users/:table/:id`

**Deskripsi:** Mendapatkan detail user berdasarkan tabel dan ID

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `table`: Nama tabel ('customers', 'karyawan', 'owners')
- `id`: ID user

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "id_customer": 1,
    "nama_lengkap": "Andi Wijaya",
    "username": "andi123",
    "email": "andi@email.com",
    "no_hp": "081234567890",
    "alamat": "Jl. Merdeka No. 10",
    "status_akun": "aktif",
    "tanggal_daftar": "2026-07-01",
    "created_at": "2026-07-01T10:00:00Z"
  },
  "message": "Data user berhasil diambil"
}
```

**Response Error (404):**
```json
{
  "status": "error",
  "data": null,
  "message": "User tidak ditemukan"
}
```

---

### 5. POST `/api/v1/users/customers`

**Deskripsi:** Membuat customer baru (oleh admin/kasir)

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin, kasir

**Request:**
```json
{
  "nama_lengkap": "Dewi Lestari",
  "username": "dewi123",
  "email": "dewi@email.com",
  "password": "password123",
  "no_hp": "081234567893",
  "alamat": "Jl. Gatot Subroto No. 15"
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "data": {
    "id_customer": 2,
    "username": "dewi123",
    "email": "dewi@email.com"
  },
  "message": "Customer berhasil dibuat"
}
```

**Validasi:**
- `username`: 3-50 karakter, alphanumeric, unik di semua tabel
- `email`: format valid, unik di semua tabel
- `password`: minimal 8 karakter
- `nama_lengkap`: minimal 2 karakter

**Business Rules:**
- Password di-hash dengan bcrypt
- Catat ke `audit_log` dengan tipe `USER_CREATED`

---

### 6. POST `/api/v1/users/karyawan`

**Deskripsi:** Membuat karyawan baru (oleh admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Request:**
```json
{
  "nama_lengkap": "Rudi Hermawan",
  "username": "rudi_kasir",
  "email": "rudi@laundry.com",
  "password": "password123",
  "no_hp": "081234567894",
  "role": "kasir",
  "alamat": "Jl. Ahmad Yani No. 25"
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "data": {
    "id_karyawan": 2,
    "username": "rudi_kasir",
    "role": "kasir"
  },
  "message": "Karyawan berhasil dibuat"
}
```

**Validasi:**
- Semua validasi seperti customer
- `role`: harus 'admin' atau 'kasir'

---

### 7. PUT `/api/v1/users/:table/:id`

**Deskripsi:** Update data user

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `table`: Nama tabel ('customers', 'karyawan', 'owners')
- `id`: ID user

**Request:**
```json
{
  "nama_lengkap": "Andi Wijaya Updated",
  "no_hp": "081234567899",
  "alamat": "Jl. Merdeka No. 15"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "User berhasil diupdate"
}
```

**Business Rules:**
- Tidak bisa mengubah `username` dan `email` (digunakan sebagai identifier)
- Tidak bisa mengubah `password` (gunakan endpoint reset-password)
- Catat ke `audit_log` dengan tipe `USER_UPDATED`

---

### 8. PATCH `/api/v1/users/:table/:id/reset-password`

**Deskripsi:** Reset password user (oleh admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `table`: Nama tabel ('customers', 'karyawan', 'owners')
- `id`: ID user

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "temporary_password": "a1b2c3d4"
  },
  "message": "Password berhasil direset. Berikan password sementara kepada user."
}
```

**Business Rules:**
- Generate password sementara dengan `crypto.randomBytes(4).toString('hex')`
- Hash password dengan bcrypt sebelum disimpan
- User harus mengganti password setelah login pertama kali
- Catat ke `audit_log` dengan tipe `PASSWORD_RESET`

---

### 9. PATCH `/api/v1/users/:table/:id/status`

**Deskripsi:** Aktifkan/nonaktifkan user (oleh admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `table`: Nama tabel ('customers', 'karyawan', 'owners')
- `id`: ID user

**Request:**
```json
{
  "status_akun": "tidak aktif"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Status user berhasil diubah"
}
```

**Business Rules:**
- Jika user dinonaktifkan, token JWT yang aktif tetap berlaku sampai expired
- User yang dinonaktifkan tidak bisa login
- Catat ke `audit_log` dengan tipe `USER_DEACTIVATED` atau `USER_ACTIVATED`

---

## Frontend Integration

### Web - CustomerDirectory.tsx

**Fitur:**
- Tabel daftar customer dengan kolom: nama, username, email, no_hp, status, tanggal daftar
- Search bar untuk cari customer
- Filter berdasarkan status (aktif/tidak aktif)
- Pagination
- Tombol aksi: View Detail, Edit, Reset Password, Nonaktifkan

**Flow:**
1. Admin buka halaman Customer Directory
2. Fetch data dari `GET /api/v1/users/customers?page=1&limit=20`
3. Tampilkan data di tabel
4. Admin bisa search, filter, dan paginate
5. Admin klik tombol aksi → fetch detail atau update

---

### Web - EmployeeDirectory.tsx

**Fitur:**
- Tabel daftar karyawan dengan kolom: nama, username, email, role, status
- Filter berdasarkan role (admin/kasir) dan status
- Tombol "Tambah Karyawan" → form modal
- Tombol aksi: Edit, Reset Password, Nonaktifkan

**Flow:**
1. Admin buka halaman Employee Directory
2. Fetch data dari `GET /api/v1/users/karyawan?page=1&limit=20`
3. Tampilkan data di tabel
4. Admin klik "Tambah Karyawan" → buka modal form
5. Admin isi form dan submit → `POST /api/v1/users/karyawan`
6. Admin klik "Edit" → buka modal dengan data existing
7. Admin update dan submit → `PUT /api/v1/users/karyawan/:id`

---

### Mobile - ProfileScreen.tsx

**Fitur:**
- Tampilkan data profil user yang sedang login
- Tombol "Edit Profil"
- Tombol "Ganti Password"
- Tombol "Logout"

**Flow:**
1. Customer buka halaman Profil
2. Fetch data dari `GET /api/v1/auth/me`
3. Tampilkan data profil
4. Customer klik "Edit Profil" → buka form edit
5. Customer update dan submit → `PUT /api/v1/users/customers/:id`
6. Customer klik "Ganti Password" → buka form
7. Customer submit → `PATCH /api/v1/auth/change-password`

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                   USER MANAGEMENT FLOW                  │
└─────────────────────────────────────────────────────────┘

[Admin] ──→ [User Management Page]
                │
        ┌───────┴───────┐
        ▼               ▼
    [Customer]      [Karyawan]
        │               │
        ▼               ▼
    [List View]     [List View]
        │               │
    ┌───┴───┐       ┌───┴───┐
    ▼       ▼       ▼       ▼
 [Search] [Filter] [Search] [Filter]
    │       │       │       │
    └───┬───┘       └───┬───┘
        ▼               ▼
    [Actions]       [Actions]
    - View          - View
    - Edit          - Edit
    - Reset PWD     - Reset PWD
    - Deactivate    - Deactivate
                    - Add New
```

---

## Dependencies

### Backend
- `bcryptjs` - Password hashing
- `crypto` - Generate temporary password

### Frontend Web
- `react-router-dom` - Navigation
- Component library (Tailwind CSS)

### Frontend Mobile
- `@react-navigation/native` - Navigation
- `@react-native-async-storage/async-storage` - Token storage

---

## Testing Checklist

### Customer Management
- [ ] List customer dengan pagination
- [ ] Search customer berdasarkan nama
- [ ] Filter customer berdasarkan status
- [ ] Buat customer baru dengan data valid
- [ ] Buat customer dengan username yang sudah ada → error
- [ ] Edit data customer
- [ ] Reset password customer
- [ ] Nonaktifkan customer
- [ ] Aktifkan customer yang sudah dinonaktifkan

### Karyawan Management
- [ ] List karyawan dengan pagination
- [ ] Filter karyawan berdasarkan role
- [ ] Buat karyawan baru (admin/kasir)
- [ ] Edit data karyawan
- [ ] Reset password karyawan
- [ ] Nonaktifkan karyawan

### Profile (Mobile)
- [ ] Lihat profil sendiri
- [ ] Edit profil sendiri
- [ ] Ganti password sendiri
