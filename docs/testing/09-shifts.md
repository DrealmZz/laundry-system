# Testing — Manajemen Shift

## Prerequisites

- Admin login
- Minimal 1 karyawan terdaftar
- Database sudah terisi data shift (jika ada)

## Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/shifts` | admin, owner |
| GET | `/shifts/:id` | admin, owner |
| GET | `/shifts/:id/karyawan` | admin, owner |
| POST | `/shifts` | admin |
| PUT | `/shifts/:id` | admin |
| DELETE | `/shifts/:id` | admin |
| POST | `/shifts/:id/assign` | admin |
| DELETE | `/shifts/:id/unassign/:karyawan_id` | admin |

---

## A. Read

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | List semua shift | `GET /shifts` (token admin) | — | Response 200, array shift | | |
| A2 | List shift dengan filter | `GET /shifts?tanggal=2026-07-13` | — | Hanya shift tanggal tsb | | |
| A3 | List shift (owner) | `GET /shifts` (token owner) | — | Response 200 | | |
| A4 | Get shift by ID | `GET /shifts/1` | — | Response 200 | | |
| A5 | Get karyawan by shift | `GET /shifts/1/karyawan` | — | Response 200, array karyawan yang ditugaskan | | |
| A6 | Kasir coba akses shift | `GET /shifts` (token kasir) | — | Response 403 | | |

## B. CRUD Shift

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Tambah shift baru | `POST /shifts` (token admin) | `{ "nama_shift": "pagi", "tanggal": "2026-07-14", "jam_mulai": "08:00", "jam_selesai": "16:00" }` | Response 201 | | |
| B2 | Tambah shift duplikat (shift + tanggal sama) | `POST /shifts` | Shift & tanggal yang sudah ada | Response 409 / 400 | | |
| B3 | Update shift | `PUT /shifts/1` | `{ "jam_selesai": "17:00" }` | Response 200 | | |
| B4 | Delete shift | `DELETE /shifts/1` | — | Response 200 / 204 | | |
| B5 | Delete shift yang tidak ada | `DELETE /shifts/99999` | — | Response 404 | | |

## C. Assign / Unassign

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Assign karyawan ke shift | `POST /shifts/1/assign` | `{ "id_karyawan": 1 }` | Response 200, karyawan terdaftar di shift | | |
| C2 | Assign karyawan yang sudah ditugaskan | `POST /shifts/1/assign` | id_karyawan sama | Response 409 / 200 (idempotent) | | |
| C3 | Assign karyawan tidak valid | `POST /shifts/1/assign` | `{ "id_karyawan": 99999 }` | Response 404 | | |
| C4 | Unassign karyawan dari shift | `DELETE /shifts/1/unassign/1` | — | Response 200, karyawan dihapus dari shift | | |
| C5 | Unassign karyawan yang tidak terdaftar | `DELETE /shifts/1/unassign/99999` | — | Response 404 | | |

## D. UI Web — Shift Management

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| D1 | Admin lihat jadwal shift | `/admin/shifts` | Kalender/grid: baris = hari (Sen-Ming), kolom = shift (pagi/siang/sore/malam) | | |
| D2 | Admin assign karyawan | Klik slot → pilih karyawan | Karyawan muncul di slot tsb | | |
| D3 | Admin remove karyawan | Klik karyawan di slot → remove | Karyawan hilang dari slot | | |
| D4 | Perubahan tersimpan | Refresh halaman | Data tetap (via API) | | |

---

## Data Flow

```
List ──────────────► GET /shifts?tanggal=&nama_shift=
Detail ────────────► GET /shifts/:id
Karyawan by shift ─► GET /shifts/:id/karyawan
Create ────────────► POST /shifts
Update ────────────► PUT /shifts/:id
Delete ────────────► DELETE /shifts/:id
Assign ────────────► POST /shifts/:id/assign
Unassign ──────────► DELETE /shifts/:id/unassign/:karyawan_id
```

## Shift Names & Times

| Shift | Jam Mulai | Jam Selesai |
|-------|-----------|-------------|
| Pagi | 08:00 | 16:00 |
| Siang | 12:00 | 20:00 |
| Sore | 16:00 | 24:00 |
| Malam | 20:00 | 04:00 |

## Edge Cases

- Shift tidak bisa di-create duplikat (tanggal + nama_shift sama)
- Unassign hanya jika karyawan terdaftar di shift tsb
- Delete shift hanya jika tidak ada karyawan terassign (atau cascade)
- Owner read-only (bisa lihat, tidak bisa edit)
