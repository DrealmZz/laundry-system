# Testing — Manajemen Transaksi / Pembayaran

## Prerequisites

- Sudah ada booking & transaksi di database (dari test 02/03/04)
- Kasir / Admin login

## Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/transaksi` | kasir |
| POST | `/transaksi/walk-in` | kasir |
| GET | `/transaksi` | kasir, admin, owner |
| GET | `/transaksi/daily-recap` | kasir, admin, owner |
| GET | `/transaksi/struk/:nomor_struk` | kasir, admin |
| GET | `/transaksi/:id` | kasir, admin, owner |
| GET | `/transaksi/:id/pdf` | kasir, admin, customer |
| GET | `/transaksi/:id/qris` | kasir, admin, customer |
| PATCH | `/transaksi/:id/pay` | kasir, admin |

---

## A. Read / List

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | List semua transaksi (kasir) | `GET /transaksi` (token kasir) | — | Response 200, `data.items` array, `data.total` | | |
| A2 | List transaksi dengan filter status | `GET /transaksi?status_pembayaran=lunas` | — | Hanya transaksi lunas | | |
| A3 | List transaksi dengan date range | `GET /transaksi?start_date=2026-07-01&end_date=2026-07-13` | — | Transaksi dalam rentang | | |
| A4 | List transaksi (owner) | `GET /transaksi` (token owner) | — | Response 200 | | |
| A5 | List transaksi (customer) | `GET /transaksi` (token customer) | — | Response 403 | | |

## B. Detail

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Get by ID | `GET /transaksi/{id}` | — | Response 200, detail transaksi lengkap | | |
| B2 | Get by ID tidak ditemukan | `GET /transaksi/99999` | — | Response 404 | | |
| B3 | Get by nomor struk | `GET /transaksi/struk/STRUK-20260713-1234` | — | Response 200 | | |
| B4 | Get by struk tidak ditemukan | `GET /transaksi/struk/STRUK-00000000-0000` | — | Response 404 | | |

## C. Daily Recap

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Rekap harian | `GET /transaksi/daily-recap?tanggal=2026-07-13` | — | Response 200, `total_transaksi`, `total_pendapatan`, breakdown per metode | | |
| C2 | Rekap per shift | `GET /transaksi/daily-recap?tanggal=2026-07-13&shift=pagi` | — | Hanya transaksi shift pagi | | |
| C3 | Rekap per karyawan | `GET /transaksi/daily-recap?tanggal=2026-07-13&id_karyawan=1` | — | Hanya transaksi karyawan tsb | | |
| C4 | Rekap tanpa tanggal | `GET /transaksi/daily-recap` | — | Response 400 "tanggal wajib diisi" | | |

## D. Cetak PDF & QR

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| D1 | Generate PDF struk | `GET /transaksi/{id}/pdf` (token kasir) | — | Response 200, Content-Type: application/pdf, file download | | |
| D2 | Generate PDF (customer) | `GET /transaksi/{id}/pdf` (token customer) | — | Response 200 (customer boleh lihat PDF miliknya) | | |
| D3 | Generate QR | `GET /transaksi/{id}/qris` (token kasir) | — | Response 200, `qris_data`, `total`, `nomor_struk` | | |
| D4 | Generate QR transaksi tidak valid | `GET /transaksi/99999/qris` | — | Response 404 | | |

## E. Konfirmasi Pembayaran (PATCH /transaksi/:id/pay)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| E1 | Konfirmasi bayar (cash) | `PATCH /transaksi/{id}/pay` (token kasir) | `{ "metode_pembayaran": "cash" }` | Response 200, status_pembayaran → lunas, status pemesanan → sudah dibayar | | |
| E2 | Konfirmasi bayar (transfer) | `PATCH /transaksi/{id}/pay` | `{ "metode_pembayaran": "transfer" }` | Response 200 | | |
| E3 | Konfirmasi bayar transaksi sudah lunas | `PATCH /transaksi/{id}/pay` (transaksi sdh lunas) | — | Response 400 "sudah lunas" | | |
| E4 | Konfirmasi bayar tanpa metode | `PATCH /transaksi/{id}/pay` | `{}` | Response 400 | | |
| E5 | Customer tidak bisa konfirmasi | `PATCH /transaksi/{id}/pay` (token customer) | — | Response 403 | | |

## F. UI Web — Transaksi History

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| F1 | Tabel transaksi muncul | Kasir → tab Transaksi | Daftar transaksi lengkap dengan kolom: No, Customer, Layanan, Total, Status, Waktu, Kasir | | |
| F2 | Klik struk | Klik nomor struk | ReceiptPrint muncul | | |
| F3 | Rekap harian | Kasir → tab Rekap | Total transaksi, total pendapatan, breakdown metode bayar | | |

---

## Diagram

```
List ──► GET /transaksi?filter
           │
Detail ──► GET /transaksi/:id
           │
PDF ────► GET /transaksi/:id/pdf
           │
QR ─────► GET /transaksi/:id/qris
           │
Bayar ──► PATCH /transaksi/:id/pay
           │
Rekap ──► GET /transaksi/daily-recap
```

## Edge Cases

- PDF hanya untuk transaksi yang ada (404 jika tidak ditemukan)
- Daily recap wajib parameter `tanggal`
- Transaksi lunas tidak bisa dibayar ulang
- Customer hanya bisa akses PDF/QR transaksi miliknya (via protect middleware)
