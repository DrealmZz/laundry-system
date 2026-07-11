# Testing — Manajemen User

## Prerequisites

- Admin login
- Database sudah terisi data seed

## Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/users/customers` | admin, kasir |
| GET | `/users/karyawan` | admin |
| GET | `/users/owners` | admin |
| GET | `/users/:table/:id` | admin |
| POST | `/users/customers` | admin, kasir |
| POST | `/users/karyawan` | admin |
| PUT | `/users/:table/:id` | admin |
| PATCH | `/users/:table/:id/reset-password` | admin |
| PATCH | `/users/:table/:id/status` | admin |

---

## A. List Users

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | List semua customer | `GET /users/customers` (token admin) | — | Response 200, array customer | | |
| A2 | List semua karyawan | `GET /users/karyawan` (token admin) | — | Response 200, array karyawan (admin + kasir) | | |
| A3 | List semua owner | `GET /users/owners` (token admin) | — | Response 200, array owner | | |
| A4 | Kasir coba list karyawan | `GET /users/karyawan` (token kasir) | — | Response 403 | | |
| A5 | Kasir list customer | `GET /users/customers` (token kasir) | — | Response 200 (kasir boleh lihat customer) | | |

## B. Get User Detail

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Get customer by ID | `GET /users/customer/1` (token admin) | — | Response 200, data customer | | |
| B2 | Get karyawan by ID | `GET /users/karyawan/1` (token admin) | — | Response 200, data karyawan | | |
| B3 | Get user tidak ditemukan | `GET /users/customer/99999` | — | Response 404 | | |
| B4 | Get dengan table invalid | `GET /users/invalid/1` | — | Response 400 | | |

## C. Create User

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Tambah customer baru | `POST /users/customers` (token admin) | `{ "nama_lengkap": "Customer Baru", "username": "custbaru", "no_hp": "08222222222", "password": "pass123" }` | Response 201, data customer terisi | | |
| C2 | Tambah karyawan baru | `POST /users/karyawan` (token admin) | `{ "nama_lengkap": "Kasir Baru", "username": "kasirbaru", "email": "kasirbaru@laundaja.com", "password": "pass123", "role": "kasir" }` | Response 201, data karyawan | | |
| C3 | Tambah admin baru | `POST /users/karyawan` | `{ ..., "role": "admin" }` | Response 201, role = admin | | |
| C4 | Tambah customer duplikat username | `POST /users/customers` | Username sudah ada | Response 409 / 400 | | |
| C5 | Tambah karyawan tanpa role | `POST /users/karyawan` | Tanpa `role` | Response 400 | | |
| C6 | Kasir coba tambah karyawan | `POST /users/karyawan` (token kasir) | — | Response 403 | | |
| C7 | Kasir tambah customer | `POST /users/customers` (token kasir) | — | Response 201 (kasir boleh daftarkan customer) | | |

## D. Update User

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| D1 | Update nama customer | `PUT /users/customer/1` (token admin) | `{ "nama_lengkap": "Nama Diubah" }` | Response 200, nama berubah | | |
| D2 | Update status karyawan jadi nonaktif | `PATCH /users/karyawan/1/status` | `{ "status": "tidak aktif" }` | Karyawan tidak bisa login | | |
| D3 | Aktifkan kembali | `PATCH /users/karyawan/1/status` | `{ "status": "aktif" }` | Karyawan bisa login lagi | | |
| D4 | Reset password karyawan | `PATCH /users/karyawan/1/reset-password` | `{ "password_baru": "newpass456" }` | Password berubah, bisa login dengan password baru | | |

## E. UI Web — Employee Directory & Customer Directory

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| E1 | Admin lihat daftar karyawan | `/admin/employees` | Tabel karyawan: nama, role, email, status, join date | | |
| E2 | Admin tambah karyawan | Klik "Add Employee" → isi form | Karyawan baru muncul di tabel | | |
| E3 | Admin nonaktifkan karyawan | Klik toggle status | Status berubah, konfirmasi muncul | | |
| E4 | Admin lihat daftar customer | `/admin/customers` (atau tab) | Daftar customer dengan info kontak | | |

---

## Data Flow Summary

```
List ─────► GET /users/{table}
Detail ───► GET /users/{table}/{id}
Create ───► POST /users/{table}
Update ───► PUT /users/{table}/{id}
Status ───► PATCH /users/{table}/{id}/status
Reset PW ─► PATCH /users/{table}/{id}/reset-password
```

## Edge Cases

- Role admin tidak bisa dibuat via API (hanya via seed database)
- Set status karyawan ke nonaktif → token karyawan tsb masih valid sampai expired
- Customer tidak bisa di-nonaktifkan oleh kasir (hanya admin)
- Reset password tidak memerlukan password lama
