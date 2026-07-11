# Testing — Auth Module

## Prerequisites

- Backend running
- Database sudah terisi data seed (customer, admin, kasir, owner)

## Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/auth/login` | Public |
| POST | `/auth/register` | Public |
| GET | `/auth/me` | All (protect) |
| PATCH | `/auth/profile` | All (protect) |
| PATCH | `/auth/change-password` | All (protect) |
| POST | `/auth/logout` | All (protect) |

---

### 1. Register Customer

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| 1.1 | Register sukses | `POST /auth/register` | `{ "nama_lengkap": "Budi Test", "username": "buditest", "email": "budi@test.com", "no_hp": "08123456789", "password": "rahasia123", "alamat": "Jl. Merdeka No.1" }` | Response 201, `data.user` terisi, `data.token` ada | | |
| 1.2 | Register duplikat email | `POST /auth/register` | Email yang sudah terdaftar | Response 409 / 400, `status: "error"` | | |
| 1.3 | Register tanpa password | `POST /auth/register` | `{ "nama_lengkap": "Test" }` (tanpa password) | Response 400, validasi error | | |

### 2. Login

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| 2.1 | Login admin sukses | `POST /auth/login` | `{ "identifier": "admin", "password": "password123" }` | Response 200, `data.token` ada, `data.user.role === "admin"` | | |
| 2.2 | Login kasir sukses | `POST /auth/login` | `{ "identifier": "kasir@laundaja.com", "password": "password123" }` | Response 200, `data.user.role === "kasir"` | | |
| 2.3 | Login owner sukses | `POST /auth/login` | `{ "identifier": "owner", "password": "password123" }` | Response 200, `data.user.role === "owner"` | | |
| 2.4 | Login customer sukses | `POST /auth/login` | `{ "identifier": "08123456789", "password": "rahasia123" }` | Response 200, `data.user.role === "customer"` | | |
| 2.5 | Login wrong password | `POST /auth/login` | `{ "identifier": "admin", "password": "salah" }` | Response 401, `status: "error"` | | |
| 2.6 | Login user tidak dikenal | `POST /auth/login` | `{ "identifier": "unknown@test.com", "password": "xxx" }` | Response 401, `status: "error"` | | |
| 2.7 | Rate limit login | `POST /auth/login` 11x berturut | Password salah | Response 429 setelah 10 percobaan | | |

### 3. Get Profile (Me)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| 3.1 | Get profile admin | `GET /auth/me` (Bearer token admin) | — | Response 200, `data.nama_lengkap` sesuai, `data.role === "admin"` | | |
| 3.2 | Get profile tanpa token | `GET /auth/me` | — | Response 401 | | |
| 3.3 | Get profile dengan token expired | `GET /auth/me` (token palsu) | — | Response 401 | | |

### 4. Update Profile

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| 4.1 | Update nama | `PATCH /auth/profile` (Bearer token) | `{ "nama_lengkap": "Admin Baru" }` | Response 200, `data.nama_lengkap` berubah | | |
| 4.2 | Update alamat | `PATCH /auth/profile` | `{ "alamat": "Jl. Baru No.5" }` | Response 200, data alamat berubah | | |
| 4.3 | Update tanpa body | `PATCH /auth/profile` | `{}` | Response 400 / tetap sukses (tidak ada yg diubah) | | |

### 5. Change Password

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| 5.1 | Ganti password sukses | `PATCH /auth/change-password` | `{ "password_lama": "password123", "password_baru": "newpass123" }` | Response 200 | | |
| 5.2 | Ganti password dengan password_lama salah | `PATCH /auth/change-password` | `{ "password_lama": "salah", "password_baru": "newpass123" }` | Response 401 | | |
| 5.3 | Login dengan password baru | `POST /auth/login` | `{ "identifier": "admin", "password": "newpass123" }` | Response 200 (verifikasi perubahan) | | |
| 5.4 | Kembalikan password | `PATCH /auth/change-password` | `{ "password_lama": "newpass123", "password_baru": "password123" }` | Response 200 | | |

### 6. Logout

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| 6.1 | Logout sukses | `POST /auth/logout` (Bearer token) | — | Response 200 | | |
| 6.2 | Akses setelah logout | `GET /auth/me` (token yang sama) | — | Response 401 | | |

### 7. Forgot Password

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| 7.1 | Forgot password (email terdaftar) | `POST /auth/forgot-password` | `{ "email": "budi@test.com" }` | Response 200, `message` konfirmasi | | |
| 7.2 | Forgot password (email tidak terdaftar) | `POST /auth/forgot-password` | `{ "email": "tidak@ada.com" }` | Response 200 (security: jangan kasih tahu email ada/tidak) | | |

---

## Diagram Endpoint

```
                    ┌───────────────┐
                    │  POST /login  │ ◄── Public
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  Token JWT   │
                    └───────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼───────┐ ┌────▼────┐ ┌────────▼────────┐
    │  GET /me      │ │ PATCH   │ │ PATCH /change-  │
    │  (profile)    │ │ /profile│ │ password        │
    └───────────────┘ └─────────┘ └─────────────────┘
```

## Edge Cases Summary

- Rate limit: 10x login dalam 15 menit
- Register: 5x per jam per IP
- Token expired: auto 401
- Password minimal length: (sesuai validasi backend)
