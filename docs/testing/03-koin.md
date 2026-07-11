# Testing — Alur Laundry Koin

## Prerequisites

- Customer terdaftar & login
- Admin & Kasir login
- Minimal 1 layanan koin aktif
- Minimal 1 mesin tersedia

## Diagram Alur

```
menunggu konfirmasi [Customer booking mesin]
  → disetujui [Admin]
    → [Customer datang ke outlet]
    → sudah dibayar [Kasir proses pembayaran di counter]
      → selesai [Customer pakai mesin]

  → pesanan ditolak [Admin]
  → pesanan dibatalkan [Customer]
```

> Tidak ada: penjemputan, penimbangan, proses cuci/kering/setrika, pengiriman.

---

## A. Customer — Booking Koin (Mobile App / API)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | Buat booking koin | `POST /pemesanan` (token customer) | `{ "id_layanan": 2, "tanggal_pesanan": "2026-07-13", "jam_mulai": "14:00", "jenis_pencucian": "koin", "metode_pengambilan": "ambil_sendiri", "mesin_ids": [1] }` | Response 201, `status_pesanan === "menunggu konfirmasi"`, `jenis_pencucian === "koin"` | | |
| A2 | Booking koin tanpa jam_mulai | `POST /pemesanan` | Sama tanpa `jam_mulai` | Response 400 "jam_mulai wajib diisi untuk koin" | | |
| A3 | Booking koin dengan jam_mulai < 1 jam | `POST /pemesanan` | `jam_mulai` = sekarang + 30 menit | Response 400 "minimal 1 jam dari sekarang" | | |
| A4 | Booking koin dengan metode_pengambilan pengiriman | `POST /pemesanan` | `metode_pengambilan: "pengiriman"` | Response 400 / tetap `ambil_sendiri` — koin tidak punya pengiriman | | |
| A5 | Booking koin dengan shift (bukan jam) | `POST /pemesanan` | `shift: "pagi"` tanpa `jam_mulai` | Response 400 "jam_mulai wajib diisi" | | |

### Verifikasi UI Mobile

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| A6 | Booking muncul di StatusScreen | Buka app → Status | Booking koin muncul dengan icon koin 🪙 | | |
| A7 | Tidak ada tombol batalkan jika status sudah disetujui | Cek setelah approve | Tombol hilang (hanya muncul di menunggu konfirmasi) | | |

---

## B. Admin — Approve Booking Koin

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Approve booking koin | `PATCH /pemesanan/{id}/approve` (token admin) | — | Status → `disetujui`, notif "Pemesanan mesin disetujui" | | |
| B2 | Notif ke customer | Cek notif customer | "Pemesanan mesin koin Anda telah disetujui. Silakan datang ke outlet untuk pembayaran." | | |

---

## C. Kasir — Pembayaran Koin di Counter

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Kasir lihat booking koin disetujui | Buka `/kasir/confirm-orders` | Booking koin status `disetujui` muncul | | |
| C2 | Proses bayar koin (cash) | Klik "Bayar" → pilih metode | `POST /transaksi` body: `{ "id_pemesanan": id, "id_karyawan": karyawan_id, "metode_pembayaran": "cash" }` | Transaksi tercatat, status → `sudah dibayar` | | |
| C3 | Proses bayar koin (koin/token) | `POST /transaksi` | `{ "metode_pembayaran": "koin" }` | Response 200, status → `sudah dibayar` | | |
| C4 | Proses bayar koin (QRIS) | `POST /transaksi` | `{ "metode_pembayaran": "qris" }` | Response 200, status → `sudah dibayar` | | |

### Verifikasi API

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C5 | Customer coba confirmPayment untuk koin | `PATCH /pemesanan/{id}/confirm-payment` (token customer) | — | Response 400 "Pembayaran koin dilakukan di outlet" | | |
| C6 | Bayar booking koin dua kali | `POST /transaksi` lagi pada id sama | — | Response 409 "sudah lunas" | | |

---

## D. Selesai

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| D1 | Kasir tandai selesai | `PATCH /pemesanan/{id}/status` | `{ "status_pesanan": "selesai" }` | Status → `selesai` | | |
| D2 | Customer lihat status selesai | Buka app → Status → Riwayat | Booking muncul di tab Riwayat dengan status Selesai | | |

---

## E. Batal / Tolak

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| E1 | Customer batal booking koin (menunggu konfirmasi) | `PATCH /pemesanan/{id}/cancel` (customer) | `{ "catatan": "Tidak jadi" }` | Status → `pesanan dibatalkan` | | |
| E2 | Admin tolak booking koin | `PATCH /pemesanan/{id}/reject` (admin) | `{ "catatan": "Mesin rusak" }` | Status → `pesanan ditolak` | | |

---

## Data Flow Summary

```
[Customer] → POST /pemesanan (jenis: koin) → menunggu konfirmasi
[Admin]    → PATCH /:id/approve           → disetujui
[Kasir]    → POST /transaksi               → sudah dibayar
[Kasir]    → PATCH /:id/status (selesai)   → selesai
```

## Edge Cases Summary

- Koin tidak bisa via confirmPayment (customer QRIS) — harus bayar di counter
- Koin tidak punya metode_pengambilan (auto ambil_sendiri)
- Koin wajib jam_mulai (bukan shift)
- Koin tidak melalui proses penjemputan/timbangan
- Koin tidak bisa set delivery schedule
