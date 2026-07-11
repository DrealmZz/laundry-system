# Testing — Laporan Owner

## Prerequisites

- Owner login
- Minimal ada data transaksi & booking (dari test sebelumnya)
- Minimal ada data biaya operasional (untuk test)

## Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/reports/finance` | owner |
| GET | `/reports/summary` | owner |
| GET | `/reports/daily` | owner |
| GET | `/reports/profit-loss` | owner |
| GET | `/reports/shift-performance` | owner |
| GET | `/reports/operational-costs` | owner |
| POST | `/reports/operational-costs` | owner |
| DELETE | `/reports/operational-costs/:id` | owner |
| GET | `/reports/sales-target` | owner |
| PUT | `/reports/sales-target` | owner |

---

## A. Finance Report

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | Laporan keuangan | `GET /reports/finance?start_date=2026-07-01&end_date=2026-07-13` (token owner) | — | Response 200, `total_pendapatan`, `total_transaksi`, `rata_rata_transaksi` | | |
| A2 | Finance tanpa date range | `GET /reports/finance` | — | Response 400 / gunakan default (bulan berjalan) | | |
| A3 | Non-owner coba akses | `GET /reports/finance` (token kasir) | — | Response 403 | | |

## B. Summary

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Summary report | `GET /reports/summary?start_date=2026-07-01&end_date=2026-07-13` | — | Response 200, `total_customer`, `total_pesanan`, `total_pendapatan`, `metode_pembayaran` breakdown | | |

## C. Profit & Loss

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Laba rugi | `GET /reports/profit-loss?start_date=2026-07-01&end_date=2026-07-13` | — | Response 200, `pendapatan`, `biaya_operasional`, `laba_bersih`, `margin` | | |

## D. Daily Report

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| D1 | Laporan harian | `GET /reports/daily?start_date=2026-07-01&end_date=2026-07-13` | — | Response 200, array per-hari: `tanggal`, `total_transaksi`, `total_pendapatan` | | |

## E. Shift Performance

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| E1 | Performa shift | `GET /reports/shift-performance?start_date=2026-07-01&end_date=2026-07-13` | — | Response 200, performa per shift (pagi/siang/sore/malam) | | |

## F. Operational Costs

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| F1 | List biaya operasional | `GET /reports/operational-costs?start_date=2026-07-01&end_date=2026-07-13` | — | Response 200, array biaya | | |
| F2 | Tambah biaya operasional | `POST /reports/operational-costs` | `{ "kategori": "listrik", "jumlah": 500000, "deskripsi": "Tagihan listrik Juli", "tanggal": "2026-07-13" }` | Response 201 | | |
| F3 | Tambah biaya tanpa kategori | `POST /reports/operational-costs` | `{ "jumlah": 500000 }` | Response 400 | | |
| F4 | Tambah biaya dengan jumlah negatif | `POST /reports/operational-costs` | `{ "kategori": "listrik", "jumlah": -500000 }` | Response 400 | | |
| F5 | Hapus biaya operasional | `DELETE /reports/operational-costs/1` | — | Response 200 / 204 | | |
| F6 | Hapus biaya tidak ada | `DELETE /reports/operational-costs/99999` | — | Response 404 | | |

## G. Sales Target

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| G1 | Get sales target | `GET /reports/sales-target?periode=2026-07` | — | Response 200, `periode`, `target_amount`, `current_amount`, `progress` | | |
| G2 | Set sales target | `PUT /reports/sales-target` | `{ "periode": "2026-07", "target_amount": 50000000 }` | Response 200, target tersimpan | | |
| G3 | Set target dengan amount 0 | `PUT /reports/sales-target` | `{ "periode": "2026-07", "target_amount": 0 }` | Response 400 | | |

## H. UI Web — Owner Dashboard

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| H1 | KPI cards muncul | Buka `/owner/dashboard` | 5 KPI: Revenue, Transactions, Avg Order, New Customers, Active Staff | | |
| H2 | Grafik revenue | Scroll ke grafik | Area chart revenue per periode | | |
| H3 | Sales target progress | Cek card target | Progress bar + editable target | | |
| H4 | Ganti periode | Pilih periode (hari/minggu/bulan/tahun) | Data & grafik berubah sesuai periode | | |

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| H5 | Buka finance report | `/owner/finance` | 4 KPI: Gross Revenue, Operational Cost, Net Profit, Margin % | | |
| H6 | Grafik revenue trend | Scroll | Area chart | | |
| H7 | Tabel cost breakdown | Lihat tabel | Biaya per kategori + total | | |
| H8 | Tambah biaya operasional | Klik "Add Cost" → isi form | Biaya baru muncul di tabel | | |
| H9 | Hapus biaya operasional | Klik delete | Biaya hilang | | |

---

## Edge Cases

- Semua report wajib parameter tanggal (start_date & end_date)
- Owner-only — role lain kena 403
- Sales target per bulan (format periode: YYYY-MM)
- Operational costs: kategori harus salah satu dari: listrik, air, deterjen, gaji, sewa, perawatan, lainnya
