# Testing — Alur Laundry Kiloan (14 Status)

> ⚠️ **LOCKED**: Alur ini sudah finalized. Jangan ubah status, transisi, atau urutan.

## Prerequisites

- Customer sudah terdaftar dan login (via mobile atau API)
- Admin sudah login (via web dashboard)
- Kasir sudah login (via web dashboard)
- Minimal 1 layanan kiloan aktif di database

## Diagram Alur

```
menunggu konfirmasi
  → disetujui [Admin]
    → penjemputan [Kasir]
      → penimbangan [Kasir]
        → menunggu pembayaran
          → menunggu verifikasi pembayaran [Customer bayar QRIS]
            → sudah dibayar [Admin verifikasi]
              → diproses [Kasir]
                → sedang di cuci [Kasir]
                  → sedang di keringkan [Kasir]
                    → sedang di setrika [Kasir]
                      → pencucian selesai [Kasir]
                        → pengiriman [Kasir, jika metode=pengiriman]
                          → selesai [Customer konfirmasi terima]
                        → selesai [Kasir, jika metode=ambil_sendiri]

  → pesanan ditolak [Admin]
  → pesanan dibatalkan [Customer / Admin / Kasir]
```

---

## A. Customer — Booking (Mobile App / API)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | Buat booking kiloan shift pagi | `POST /pemesanan` (token customer) | `{ "id_layanan": 1, "tanggal_pesanan": "2026-07-13", "shift": "pagi", "jenis_pencucian": "kiloan", "metode_pengambilan": "pengiriman", "catatan": "Test" }` | Response 201, `status_pesanan === "menunggu konfirmasi"`, `id_pemesanan` terisi | | |
| A2 | Buat booking kiloan metode ambil_sendiri | `POST /pemesanan` | `{ "id_layanan": 1, "tanggal_pesanan": "2026-07-13", "shift": "siang", "jenis_pencucian": "kiloan", "metode_pengambilan": "ambil_sendiri" }` | Response 201, `status === "menunggu konfirmasi"`, `metode_pengambilan === "ambil_sendiri"` | | |
| A3 | Booking tanpa id_layanan | `POST /pemesanan` | `{ "tanggal_pesanan": "2026-07-13", "shift": "pagi", "jenis_pencucian": "kiloan", "metode_pengambilan": "pengiriman" }` | Response 400, validasi error | | |
| A4 | Booking tanpa metode_pengambilan | `POST /pemesanan` | `{ "id_layanan": 1, "tanggal_pesanan": "2026-07-13", "shift": "pagi", "jenis_pencucian": "kiloan" }` | Response 400, validasi error | | |
| A5 | Booking dengan shift tidak valid | `POST /pemesanan` | `{ ..., "shift": "tengah_malam" }` | Response 400 | | |

### Verifikasi UI Mobile

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| A6 | Booking muncul di StatusScreen | Buka app → tab Status | Booking baru muncul di daftar dengan status "Menunggu Konfirmasi" | | |
| A7 | TrackingScreen menampilkan timeline | Tap booking → TrackingScreen | Timeline dimulai dari "menunggu konfirmasi" | | |
| A8 | Tombol batalkan muncul | Cek di TrackingScreen | Tombol "Batalkan Pesanan" muncul (karena status menunggu konfirmasi) | | |

---

## B. Admin — Konfirmasi Booking (Web Dashboard)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Admin melihat booking baru | Buka web → `/admin/bookings` → tab "Menunggu" | Booking dari A1 muncul di tab | | |
| B2 | Approve booking | Klik "Setujui" | `PATCH /pemesanan/{id}/approve` | Status → `disetujui`, notif ke customer | | |
| B3 | Cek notif customer setelah approve | Buka mobile → notifikasi | Notif "Pesanan Disetujui" muncul | | |
| B4 | Reject booking lain | Klik "Tolak" → isi alasan | `PATCH /pemesanan/{id}/reject` body: `{ "catatan": "Stok penuh" }` | Status → `pesanan ditolak`, notif ke customer | | |
| B5 | Reject tanpa catatan | Klik "Tolak" → biarkan kosong | — | Tombol disabled / error "Alasan wajib diisi" | | |

### Verifikasi API Langsung

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B6 | Approve booking yang sudah diapprove | `PATCH /pemesanan/{id}/approve` | Token admin, id sudah `disetujui` | Response 400 | | |
| B7 | Reject booking yang sudah diapprove | `PATCH /pemesanan/{id}/reject` | Token admin, id sudah `disetujui` | Response 400 | | |
| B8 | Kasir coba approve | `PATCH /pemesanan/{id}/approve` | Token kasir | Response 403 | | |

---

## C. Kasir — Penjemputan & Penimbangan (Web Dashboard)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Kasir melihat booking disetujui | Buka web → `/kasir/confirm-orders` | Booking status `disetujui` muncul dengan tombol "Konfirmasi Jemput" | | |
| C2 | Konfirmasi penjemputan | Klik "Konfirmasi Jemput" | `PATCH /pemesanan/{id}/confirm-pickup` | Status → `penjemputan` | | |
| C3 | Konfirmasi pakaian diterima | Klik "Pakaian Diterima" | `PATCH /pemesanan/{id}/confirm-clothes` | Status → `penimbangan` | | |
| C4 | Input berat cucian | Input berat → submit | `PATCH /pemesanan/{id}/weigh` body: `{ "berat_kg": 2.5 }` | Status → `menunggu pembayaran`, berat tersimpan, harga total terhitung, notif ke customer | | |
| C5 | Input berat = 0 | Coba submit berat 0 | `PATCH /pemesanan/{id}/weigh` body: `{ "berat_kg": 0 }` | Response 400 | | |

### Verifikasi UI Mobile Customer

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| C6 | Customer lihat status terbaru | Buka mobile → tab Status | Status berubah jadi "Menunggu Pembayaran" | | |
| C7 | Tombol Bayar muncul | Di TrackingScreen | Tombol "Bayar Sekarang" muncul | | |

---

## D. Customer — Pembayaran QRIS (Mobile App)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| D1 | Generate QR pembayaran | `GET /pemesanan/{id}/qris` (token customer) | — | Response 200, `qris_data`, `total` | | |
| D2 | Confirm payment via QRIS | `PATCH /pemesanan/{id}/confirm-payment` (token customer) | — | Status → `menunggu verifikasi pembayaran`, transaksi dibuat, audit log tercatat | | |
| D3 | Confirm payment duplikat | Lakukan D2 lagi | — | Response 409 "sudah lunas" | | |
| D4 | Confirm payment untuk koin | Coba pada booking koin | — | Response 400 "Koin bayar di outlet" | | |

### Verifikasi UI Mobile

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| D5 | QR code ditampilkan | Buka QrisPaymentScreen | QR code muncul, countdown 15 menit | | |
| D6 | Confirm button setelah bayar | Klik "Sudah Bayar" | Loading → success → navigate ke Status | | |

---

## E. Admin — Verifikasi Pembayaran (Web Dashboard)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| E1 | Admin lihat booking menunggu verifikasi | Buka `/admin/bookings` → tab "Verifikasi" | Booking dengan status `menunggu verifikasi pembayaran` muncul | | |
| E2 | Verifikasi pembayaran | Klik "Verifikasi Pembayaran" | `PATCH /pemesanan/{id}/verify-payment` | Status → `sudah dibayar`, notif ke customer | | |
| E3 | Kasir coba akses verify | `PATCH /pemesanan/{id}/verify-payment` (token kasir) | — | Response 403 | | |
| E4 | Verify booking yg sudah diverifikasi | Lakukan E2 lagi | — | Response 400 | | |

---

## F. Kasir — Proses Pencucian (Web Dashboard)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| F1 | Mulai diproses | Klik "Proses Cucian" | `PATCH /pemesanan/{id}/status` body: `{ "status_pesanan": "diproses" }` | Status → `diproses` | | |
| F2 | Mulai cuci | Klik "Mulai Cuci" | body: `{ "status_pesanan": "sedang di cuci" }` | Status → `sedang di cuci` | | |
| F3 | Mulai keringkan | Klik "Mulai Keringkan" | body: `{ "status_pesanan": "sedang di keringkan" }` | Status → `sedang di keringkan` | | |
| F4 | Mulai setrika | Klik "Mulai Setrika" | body: `{ "status_pesanan": "sedang di setrika" }` | Status → `sedang di setrika` | | |
| F5 | Selesaikan pencucian | Klik "Selesai" | body: `{ "status_pesanan": "pencucian selesai" }` | Status → `pencucian selesai` | | |
| F6 | Skip setrika (langsung kering → selesai) | Dari `sedang di keringkan` → `pencucian selesai` | body: `{ "status_pesanan": "pencucian selesai" }` | Transisi valid (kering → selesai) | | |

### Invalid Transitions (State Machine)

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| F7 | Loncat dari diproses ke keringkan | `PATCH /pemesanan/{id}/status` → `sedang di keringkan` | Response 400, "Tidak bisa mengubah status" | | |
| F8 | Loncat dari cuci ke setrika | `PATCH /pemesanan/{id}/status` → `sedang di setrika` | Response 400 | | |
| F9 | Dari pencucian selesai ke cuci | `PATCH /pemesanan/{id}/status` → `sedang di cuci` | Response 400 | | |

---

## G. Customer — Pengiriman (Mobile App) — Jika Metode = Pengiriman

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| G1 | Customer lihat tombol atur jadwal | Buka TrackingScreen setelah `pencucian selesai` | Tombol "Atur Jadwal Pengiriman" muncul | | |
| G2 | Set jadwal pengiriman | `PATCH /pemesanan/{id}/set-delivery` (token customer) | `{ "tanggal_pengiriman": "2026-07-14", "shift_pengiriman": "pagi" }` | Response 200, data tersimpan | | |
| G3 | Set jadwal tanpa tanggal | `PATCH /pemesanan/{id}/set-delivery` | `{ "shift_pengiriman": "pagi" }` | Response 400 | | |
| G4 | Set jadwal untuk ambil_sendiri | Coba pada booking dengan metode `ambil_sendiri` | — | Response 400 "Hanya pengiriman" | | |

### Kasir — Kirim (Web Dashboard)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| G5 | Kasir kirim pesanan | Klik "Kirim" | body: `{ "status_pesanan": "pengiriman" }` | Status → `pengiriman` | | |

### Customer — Konfirmasi Terima (Mobile App)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| G6 | Konfirmasi terima | `PATCH /pemesanan/{id}/confirm-received` (token customer) | — | Status → `selesai` | | |

---

## H. Metode Ambil_Sendiri — Langsung Selesai

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| H1 | Kasir selesaikan tanpa kirim | Booking dengan `metode_pengambilan = "ambil_sendiri"` | body: `{ "status_pesanan": "selesai" }` | Status → `selesai` (tanpa melalui `pengiriman`) | | |
| H2 | Kasir coba kirim untuk ambil_sendiri | `PATCH /pemesanan/{id}/status` → `pengiriman` | Booking `ambil_sendiri` di `pencucian selesai` | Response 400 (transisi tidak valid) | | |

---

## I. Batal / Tolak

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| I1 | Customer batal saat menunggu konfirmasi | `PATCH /pemesanan/{id}/cancel` (token customer) | `{ "catatan": "Ganti pikiran" }` | Status → `pesanan dibatalkan` | | |
| I2 | Customer batal saat sudah diproses | Coba pada booking dgn status > disetujui | — | Response 400 "Tidak bisa batalkan" | | |
| I3 | Admin batalkan kapan saja | `PATCH /pemesanan/{id}/cancel` (token admin) | `{ "catatan": "Administratif" }` | Status → `pesanan ditolak` | | |
| I4 | Kasir batalkan kapan saja | `PATCH /pemesanan/{id}/cancel` (token kasir) | `{ "catatan": "Kesalahan input" }` | Status → `pesanan ditolak` | | |

---

## J. Update Metode Pengambilan

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| J1 | Admin ubah ke pengiriman | `PATCH /pemesanan/{id}/metode-pengambilan` | `{ "metode_pengambilan": "pengiriman" }` | Response 200, metode berubah | | |
| J2 | Kasir ubah ke ambil_sendiri | `PATCH /pemesanan/{id}/metode-pengambilan` | `{ "metode_pengambilan": "ambil_sendiri" }` | Response 200 | | |
| J3 | Ubah di status selesai | Coba booking dengan status `selesai` | — | Response 400 "Tidak bisa mengubah" | | |

---

## K. Notifikasi (Verifikasi)

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| K1 | Notif saat booking dibuat | Cek notif customer | Ada notif "Pesanan baru" | | |
| K2 | Notif saat disetujui | Setelah B2 | "Pesanan Disetujui" | | |
| K3 | Notif saat ditimbang | Setelah C4 | "Pesanan Menunggu Pembayaran" | | |
| K4 | Notif saat pembayaran diverifikasi | Setelah E2 | "Pembayaran Diterima" | | |
| K5 | Notif saat ditolak | Setelah B4 | "Pesanan Ditolak: Stok penuh" | | |

---

## Data Flow Summary

```
[Customer] → POST /pemesanan          → menunggu konfirmasi
[Admin]    → PATCH /:id/approve       → disetujui
[Kasir]    → PATCH /:id/confirm-pickup → penjemputan
[Kasir]    → PATCH /:id/confirm-clothes → penimbangan
[Kasir]    → PATCH /:id/weigh          → menunggu pembayaran
[Customer] → PATCH /:id/confirm-payment→ menunggu verifikasi pembayaran
[Admin]    → PATCH /:id/verify-payment → sudah dibayar
[Kasir]    → PATCH /:id/status         → diproses → cuci → kering → setrika → selesai
[Customer] → PATCH /:id/set-delivery   → (jadwal disimpan)
[Kasir]    → PATCH /:id/status         → pengiriman
[Customer] → PATCH /:id/confirm-received → selesai
```

## Edge Cases Summary

- Koin booking ditolak di endpoint kiloan (validasi jenis_pencucian)
- Ambil_sendiri tidak bisa set delivery schedule
- Cancel hanya bisa untuk customer saat `menunggu konfirmasi` / `disetujui`
- State machine strict — tidak ada loncatan status
