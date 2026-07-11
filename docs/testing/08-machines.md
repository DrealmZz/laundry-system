# Testing — Manajemen Mesin

## Prerequisites

- Admin login (untuk CRUD)
- Minimal 1 mesin terdaftar di database

## Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/mesin` | All (protect) |
| GET | `/mesin/status` | All (protect) |
| GET | `/mesin/available` | All (protect) |
| GET | `/mesin/:id` | All (protect) |
| POST | `/mesin` | admin |
| PUT | `/mesin/:id` | admin |
| DELETE | `/mesin/:id` | admin |
| PATCH | `/mesin/:id/status` | admin |

---

## A. Read

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | List semua mesin | `GET /mesin` (token admin) | — | Response 200, array mesin | | |
| A2 | List mesin dengan status | `GET /mesin/status` | — | Response 200, setiap mesin punya `status_mesin` | | |
| A3 | List mesin available | `GET /mesin/available` (token customer) | — | Response 200, hanya mesin `tersedia` | | |
| A4 | List mesin available dengan filter tanggal | `GET /mesin/available?tanggal=2026-07-13&shift=pagi` | — | Response 200, mesin yang available di shift tsb | | |
| A5 | Get by ID | `GET /mesin/1` | — | Response 200, detail mesin | | |
| A6 | Get by ID tidak ditemukan | `GET /mesin/99999` | — | Response 404 | | |

## B. CRUD (Admin)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Tambah mesin baru | `POST /mesin` (token admin) | `{ "kode_mesin": "M-004", "nama_mesin": "Mesin Cuci Besar", "tipe_mesin": "pencucian", "kapasitas_kg": 15, "konsumsi_kwh": 2.5, "penggunaan_air_liter": 80 }` | Response 201, mesin baru terdaftar | | |
| B2 | Tambah mesin tanpa kode | `POST /mesin` | `{ "nama_mesin": "Test", "tipe_mesin": "pencucian" }` | Response 400 | | |
| B3 | Kasir coba tambah mesin | `POST /mesin` (token kasir) | — | Response 403 | | |
| B4 | Update mesin | `PUT /mesin/1` | `{ "kapasitas_kg": 20 }` | Response 200 | | |
| B5 | Delete mesin | `DELETE /mesin/1` | — | Response 200 / 204 | | |

## C. Status Mesin

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Set status = dipakai | `PATCH /mesin/1/status` | `{ "status_mesin": "dipakai" }` | Response 200, mesin tidak muncul di available | | |
| C2 | Set status = perbaikan | `PATCH /mesin/1/status` | `{ "status_mesin": "perbaikan" }` | Response 200 | | |
| C3 | Set status = tersedia | `PATCH /mesin/1/status` | `{ "status_mesin": "tersedia" }` | Response 200, muncul di available lagi | | |
| C4 | Set status tidak valid | `PATCH /mesin/1/status` | `{ "status_mesin": "rusak_berat" }` | Response 400 | | |

## D. UI Web — Machine Management & Status

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| D1 | Admin lihat daftar mesin | `/admin/machines` | Tabel: kode, nama, tipe, kapasitas, status | | |
| D2 | Admin tambah mesin | Klik "Add Machine" → isi form | Mesin baru muncul | | |
| D3 | Admin ubah status mesin | Klik toggle status | Status berubah di tabel | | |
| D4 | Kasir lihat status real-time | `/kasir/machines` | Grid mesin: warna hijau (tersedia), merah (dipakai), kuning (perbaikan) | | |
| D5 | Kasir lihat detail mesin | Klik salah satu mesin | Info detail: kapasitas, konsumsi listrik/air | | |

---

## Edge Cases

- Mesin dengan status `dipakai` tidak bisa di-booking oleh customer
- Filter `available` harus cek jadwal (tidak ada konflik booking)
- Delete mesin sebaiknya hanya jika tidak ada booking terkait
