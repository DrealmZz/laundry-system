# Testing — Audit Log

## Prerequisites

- Admin login
- Minimal sudah ada aktivitas di system (login, booking, update status, dll)

## Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/audit` | admin |
| GET | `/audit/:id` | admin |

---

## A. List Audit Logs

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | List semua audit log | `GET /audit` (token admin) | — | Response 200, array audit log, terurut by created_at DESC | | |
| A2 | List dengan pagination | `GET /audit?page=1&limit=10` | — | Response 200, max 10 items | | |
| A3 | Filter by action | `GET /audit?action=BOOKING_STATUS_CHANGED` | — | Hanya log dengan action tsb | | |
| A4 | Filter by date range | `GET /audit?start_date=2026-07-01&end_date=2026-07-13` | — | Log dalam rentang | | |
| A5 | Filter by user | `GET /audit?user_id=1&user_table=karyawan` | — | Log dari user tsb | | |

## B. Get Audit Log Detail

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Get by ID | `GET /audit/1` (token admin) | — | Response 200, detail log: `action`, `message`, `userId`, `userTable`, `created_at` | | |
| B2 | Get by ID tidak ditemukan | `GET /audit/99999` | — | Response 404 | | |

## C. Role Access

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Kasir coba lihat audit | `GET /audit` (token kasir) | — | Response 403 | | |
| C2 | Owner coba lihat audit | `GET /audit` (token owner) | — | Response 403 | | |
| C3 | Customer coba lihat audit | `GET /audit` (token customer) | — | Response 403 | | |

## D. Verifikasi Log Otomatis

Setelah melakukan test case di modul lain, cek apakah audit log tercatat:

| No | Skenario | Expected Action di Audit Log | Status | Notes |
|----|----------|------------------------------|--------|-------|
| D1 | Login | `LOGIN_SUCCESS` atau `USER_LOGIN` | | |
| D2 | Buat booking | `BOOKING_CREATED` | | |
| D3 | Admin approve booking | `BOOKING_STATUS_CHANGED` (dengan message "disetujui") | | |
| D4 | Admin reject booking | `BOOKING_REJECTED` | | |
| D5 | Kasir konfirmasi pickup | `BOOKING_PICKUP_CONFIRMED` | | |
| D6 | Kasir konfirmasi pakaian | `BOOKING_CLOTHES_RECEIVED` | | |
| D7 | Kasir timbang | `BOOKING_WEIGHED` | | |
| D8 | Customer bayar QRIS | `BOOKING_PAYMENT_CONFIRMED` | | |
| D9 | Admin verifikasi bayar | `BOOKING_STATUS_CHANGED` (ke "sudah dibayar") | | |
| D10 | Customer batal | `BOOKING_CANCELLED` | | |
| D11 | Kasir konfirmasi pembayaran transaksi | `PAYMENT_CONFIRMED` | | |

## E. UI Web — Audit Log Viewer

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| E1 | Admin lihat audit log | `/admin/audit-logs` | Tabel: timestamp, user, action, message | | |
| E2 | Pencarian/filter | Ketik di search box | Log terfilter | | |
| E3 | Urutkan | Klik kolom header | Urutan berubah | | |

---

## Audit Log Fields

| Field | Deskripsi |
|-------|-----------|
| `id_audit` | Primary key |
| `userId` | ID pelaku (id_karyawan / id_customer) |
| `userTable` | Tabel asal (`karyawan` / `customer`) |
| `action` | Kode aksi (uppercase snake_case) |
| `message` | Deskripsi kejadian |
| `created_at` | Timestamp |

## Edge Cases

- Admin-only — role lain tidak bisa akses
- Audit log bersifat append-only (tidak bisa dihapus/diedit)
- Filter berdasarkan action menggunakan partial match atau exact match (sesuai implementasi)
