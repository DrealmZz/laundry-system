# Testing — Manajemen Layanan

## Prerequisites

- Admin login
- Database seed sudah ada layanan default

## Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/services` | All (protect) |
| GET | `/services/:id` | All (protect) |
| POST | `/services` | admin |
| PUT | `/services/:id` | admin |
| DELETE | `/services/:id` | admin |

---

## A. List Services

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | List semua layanan | `GET /services` (token admin) | — | Response 200, array layanan (kiloan + koin) | | |
| A2 | List layanan (token kasir) | `GET /services` (token kasir) | — | Response 200 | | |
| A3 | List layanan (token customer) | `GET /services` (token customer) | — | Response 200 | | |
| A4 | Get by ID | `GET /services/1` | — | Response 200, detail layanan | | |
| A5 | Get by ID tidak ditemukan | `GET /services/99999` | — | Response 404 | | |

## B. CRUD (Admin Only)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Tambah layanan kiloan baru | `POST /services` (token admin) | `{ "nama_layanan": "Cuci Kering Premium", "jenis_layanan": "kiloan", "harga": 8000, "estimasi_waktu": 180 }` | Response 201, layanan baru terdaftar | | |
| B2 | Tambah layanan koin baru | `POST /services` | `{ "nama_layanan": "Cuci Koin Besar", "jenis_layanan": "koin", "harga": 15000, "estimasi_waktu": 45 }` | Response 201 | | |
| B3 | Tambah tanpa nama | `POST /services` | `{ "jenis_layanan": "kiloan", "harga": 5000 }` | Response 400 | | |
| B4 | Tambah dengan harga negatif | `POST /services` | `{ "nama_layanan": "Test", "jenis_layanan": "kiloan", "harga": -1000 }` | Response 400 | | |
| B5 | Kasir coba tambah layanan | `POST /services` (token kasir) | — | Response 403 | | |
| B6 | Update layanan | `PUT /services/1` | `{ "harga": 7500 }` | Response 200, harga berubah | | |
| B7 | Delete layanan | `DELETE /services/1` | — | Response 200 / 204, layanan dihapus | | |
| B8 | Delete layanan yang tidak ada | `DELETE /services/99999` | — | Response 404 | | |

## C. UI Web — Service Management

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| C1 | Admin lihat daftar layanan | `/admin/services` | Tabel: nama, tipe (Kiloan/Koin), harga, durasi, status | | |
| C2 | Admin toggle status layanan | Klik toggle | Status layanan berubah (aktif/nonaktif), jika nonaktif tidak muncul di form transaksi | | |
| C3 | Admin edit layanan | Klik edit → ubah nama/harga/durasi | Data berubah di tabel | | |

---

## Edge Cases

- Layanan yang sudah dipakai di transaksi sebaiknya tidak di-delete (soft delete atau validasi)
- Harga layanan kiloan per kg, koin flat
- Status layanan nonaktif → tidak muncul di pilihan booking customer & form kasir
