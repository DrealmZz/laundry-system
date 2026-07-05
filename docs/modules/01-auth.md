# Modul 01: Autentikasi (Auth)

## Overview

Modul ini menangani autentikasi dan otorisasi pengguna untuk semua role (customer, kasir, admin, owner). Sistem mendukung login dengan username, email, atau nomor HP.

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ✅ Sudah ada | Perlu tambah endpoint `forgot-password` |
| Frontend Web | ✅ Sudah ada | `LoginPage.tsx` |
| Frontend Mobile | ✅ Sudah ada | `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen` |

---

## Database Tables

### Tabel yang Digunakan

```sql
-- customer (id_customer, username, email, password, no_hp, nama_lengkap, status_akun, ...)
-- karyawan (id_karyawan, username, email, password, no_hp, nama_lengkap, role, status_akun, ...)
-- owner (id_owner, username, email, password, no_hp, nama_lengkap, hak_akses, ...)
```

### Query Utama

```sql
-- Login: Cari user di 3 tabel
SELECT * FROM customer WHERE username = $1 OR email = $1 OR no_hp = $1
UNION ALL
SELECT * FROM karyawan WHERE username = $1 OR email = $1 OR no_hp = $1
UNION ALL
SELECT * FROM owner WHERE username = $1 OR email = $1 OR no_hp = $1

-- Cek username unik
SELECT id_customer FROM customer WHERE username = $1
UNION ALL
SELECT id_karyawan FROM karyawan WHERE username = $1
UNION ALL
SELECT id_owner FROM owner WHERE username = $1

-- Cek email unik
SELECT id_customer FROM customer WHERE email = $1
UNION ALL
SELECT id_karyawan FROM karyawan WHERE email = $1
UNION ALL
SELECT id_owner FROM owner WHERE email = $1
```

---

## API Endpoints

### 1. POST `/api/v1/auth/register`

**Deskripsi:** Registrasi customer baru

**Request:**
```json
{
  "username": "andi123",
  "email": "andi@email.com",
  "password": "password123",
  "no_hp": "081234567890",
  "nama_lengkap": "Andi Wijaya"
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "data": {
    "id_customer": 1,
    "username": "andi123",
    "email": "andi@email.com"
  },
  "message": "Registrasi berhasil"
}
```

**Response Error (400):**
```json
{
  "status": "error",
  "data": null,
  "message": "Username sudah digunakan"
}
```

**Validasi:**
- `username`: 3-50 karakter, alphanumeric, unik di semua tabel
- `email`: format valid, unik di semua tabel
- `password`: minimal 8 karakter, kombinasi huruf dan angka
- `no_hp`: format valid Indonesia (08xxxxxxxxxx)
- `nama_lengkap`: minimal 2 karakter

**Business Rules:**
- Registrasi hanya untuk role `customer`
- Password di-hash dengan bcrypt (salt rounds: 10)
- Username dan email harus unik di seluruh sistem
- Catat aktivitas ke `audit_log` dengan tipe `REGISTER_SUCCESS`

---

### 2. POST `/api/v1/auth/login`

**Deskripsi:** Login untuk semua role

**Request:**
```json
{
  "identifier": "andi123",
  "password": "password123"
}
```

**Keterangan:**
- `identifier` bisa berupa: username, email, atau no_hp

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "customer",
    "user_id": 1,
    "nama_lengkap": "Andi Wijaya"
  },
  "message": "Login berhasil"
}
```

**Response Error (401):**
```json
{
  "status": "error",
  "data": null,
  "message": "Password salah"
}
```

**Response Error - Akun Terkunci (423):**
```json
{
  "status": "error",
  "data": {
    "locked_until": "2026-07-03T10:15:00Z"
  },
  "message": "Akun terkunci selama 15 menit karena 3x gagal login"
}
```

**Business Rules:**
- Cari user di tabel `customer`, `karyawan`, dan `owner`
- Jika ditemukan di `karyawan`, return `role` dari kolom `role` (admin/kasir)
- Jika ditemukan di `owner`, return `role` = "owner"
- 3x gagal login berturut-turut → akun terkunci 15 menit
- Catat ke `audit_log`:
  - `LOGIN_SUCCESS` jika berhasil
  - `LOGIN_FAILED` jika gagal
  - `LOGIN_LOCKED` jika akun terkunci

**JWT Token Payload:**
```json
{
  "id": 1,
  "role": "customer",
  "table": "customer",
  "iat": 1688361600,
  "exp": 1688448000
}
```

**Token Expiry:**
- Customer (mobile): 24 jam
- Kasir/Admin/Owner (web): 8 jam

---

### 3. GET `/api/v1/auth/me`

**Deskripsi:** Mendapatkan data user yang sedang login

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "table": "customer",
    "username": "andi123",
    "email": "andi@email.com",
    "nama_lengkap": "Andi Wijaya",
    "role": "customer",
    "no_hp": "081234567890",
    "alamat": "Jl. Merdeka No. 10",
    "status_akun": "aktif",
    "created_at": "2026-07-01T10:00:00Z"
  },
  "message": "Data user berhasil diambil"
}
```

**Business Rules:**
- Menggunakan token JWT untuk identifikasi user
- Query ke tabel sesuai `table` di payload token

---

### 4. POST `/api/v1/auth/logout`

**Deskripsi:** Logout pengguna

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Logout berhasil"
}
```

**Business Rules:**
- Implementasi saat ini: client-side token delete
- Catat ke `audit_log` dengan tipe `LOGOUT`

---

### 5. PATCH `/api/v1/auth/change-password`

**Deskripsi:** Ganti password (user yang sedang login)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "old_password": "password123",
  "new_password": "newpassword456"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Password berhasil diubah"
}
```

**Response Error (400):**
```json
{
  "status": "error",
  "data": null,
  "message": "Password lama salah"
}
```

**Validasi:**
- `old_password`: harus sesuai password saat ini
- `new_password`: minimal 8 karakter, kombinasi huruf dan angka
- `new_password` tidak boleh sama dengan `old_password`

**Business Rules:**
- Hash password baru dengan bcrypt
- Update password di tabel sesuai role
- Catat ke `audit_log` dengan tipe `PASSWORD_CHANGED`

---

### 6. POST `/api/v1/auth/forgot-password` ⚠️ BELUM ADA

**Deskripsi:** Kirim OTP reset password via email

**Request:**
```json
{
  "email": "andi@email.com"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "OTP telah dikirim ke email Anda"
}
```

**Response Error (404):**
```json
{
  "status": "error",
  "data": null,
  "message": "Email tidak terdaftar"
}
```

**Business Rules:**
- Generate OTP 6 digit, berlaku 10 menit
- Kirim email via Mailgun
- Simpan OTP di tabel sementara atau in-memory cache
- Rate limit: 3 request per 15 menit per email

**Implementasi Mailgun:**
```javascript
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
```

---

## Frontend Integration

### Web (LoginPage.tsx)

**Flow:**
1. User buka halaman login
2. Input identifier (username/email/no_hp) dan password
3. Klik tombol "Login"
4. Kirim request ke `POST /api/v1/auth/login`
5. Jika berhasil:
   - Simpan token ke `localStorage`
   - Simpan role dan user_id ke state
   - Redirect ke dashboard sesuai role:
     - `kasir` → `/kasir/dashboard`
     - `admin` → `/admin/bookings`
     - `owner` → `/owner/finance`
6. Jika gagal:
   - Tampilkan pesan error
   - Jika akun terkunci, tampilkan waktu tunggu

**Code Example:**
```typescript
// services/api.ts
const API_BASE = 'http://localhost:3000/api/v1';

export async function login(identifier: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  return response.json();
}

// pages/auth/LoginPage.tsx
const handleLogin = async () => {
  const result = await login(identifier, password);
  if (result.status === 'success') {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('role', result.data.role);
    // Redirect berdasarkan role
  }
};
```

---

### Mobile (LoginScreen.tsx)

**Flow:**
1. User buka halaman login
2. Input identifier dan password
3. Klik tombol "Login"
4. Kirim request ke `POST /api/v1/auth/login`
5. Jika berhasil:
   - Simpan token ke `AsyncStorage` via `AuthContext`
   - Redirect ke `HomeScreen`
6. Jika gagal:
   - Tampilkan pesan error

**Code Example:**
```typescript
// services/api.ts
const API_BASE = 'http://localhost:3000/api/v1';

export async function login(identifier: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  return response.json();
}

// context/AuthContext.tsx
const signIn = async (identifier: string, password: string) => {
  const result = await login(identifier, password);
  if (result.status === 'success') {
    await AsyncStorage.setItem('token', result.data.token);
    setToken(result.data.token);
  }
};
```

---

## Bug yang Harus Diperbaiki

### Bug 1: Endpoint `forgot-password` belum ada

**Lokasi:** `backend/src/modules/auth/routes/auth.routes.js`

**Masalah:** Mobile app memanggil `/auth/lupa-password` tapi endpoint tidak ada

**Solusi:**
1. Tambah endpoint `POST /api/v1/auth/forgot-password`
2. Implementasi Mailgun untuk kirim OTP
3. Update mobile `api.ts` untuk pakai endpoint yang benar

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                      AUTH FLOW                          │
└─────────────────────────────────────────────────────────┘

[User] ──→ [Login Page] ──→ [POST /auth/login]
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
              [Valid?]                [Invalid]
                │                       │
        ┌───────┴───────┐               ▼
        ▼               ▼         [3x Gagal?]
    [Generate      [Return           │
     JWT Token]     Error]    ┌──────┴──────┐
        │                     ▼             ▼
        ▼               [Kunci Akun    [Coba Lagi]
    [Return Token]      15 Menit]
        │
        ▼
    [Redirect ke Dashboard sesuai Role]
```

---

## Dependencies

### Backend
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `mailgun.js` - Email service (untuk forgot-password)

### Frontend Web
- `react-router-dom` - Navigation
- `localStorage` - Token storage

### Frontend Mobile
- `@react-navigation/native` - Navigation
- `@react-native-async-storage/async-storage` - Token storage

---

## Testing Checklist

- [ ] Register customer baru dengan data valid
- [ ] Register dengan username yang sudah ada → error
- [ ] Register dengan email yang sudah ada → error
- [ ] Login dengan username
- [ ] Login dengan email
- [ ] Login dengan no_hp
- [ ] Login dengan password salah
- [ ] Login 3x gagal → akun terkunci
- [ ] Login setelah akun terkunci 15 menit
- [ ] Get data user yang sedang login
- [ ] Ganti password dengan data valid
- [ ] Ganti password dengan password lama salah
- [ ] Forgot password → terima OTP via email
- [ ] Logout berhasil
