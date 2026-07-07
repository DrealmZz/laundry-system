# Alur Laundry Kiloan — End to End

## 1. Ringkasan

Alur laundry kiloan terdiri dari **14 status** berurutan yang melibatkan 3 role: **Customer** (via mobile), **Admin** (via web), dan **Kasir** (via web).

Tidak boleh ada loncatan status — setiap transisi diverifikasi oleh state machine di backend.

```
menunggu konfirmasi
  → disetujui
    → penjemputan
      → penimbangan
        → menunggu pembayaran
          → sudah dibayar
            → diproses
              → sedang di cuci
                → sedang di keringkan
                  → sedang di setrika
                    → pencucian selesai
                      → pengiriman
                        → selesai
```

## 2. Diagram Status

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAUNDRY KILOAN FLOW                              │
│                                                                            │
│  [Customer]              [Admin]          [Kasir]          [Customer]      │
│  ┌──────────┐           ┌────────┐      ┌──────────┐      ┌──────────┐   │
│  │ Booking  │──┐        │ Setuju │      │ Pickup   │      │ Bayar    │   │
│  │          │  │        │        │      │          │      │ QRIS     │   │
│  └──────────┘  │        └────────┘      └──────────┘      └──────────┘   │
│                ▼            ▼               ▼                  ▼          │
│  menunggu ──────► disetujui ──► penjemputan ──► penimbangan ──►          │
│  konfirmasi                                                               │
│                              ┌─────────────────────────────────────┐     │
│                              │         menunggu pembayaran         │     │
│                              └─────────────────────────────────────┘     │
│                                         │                                │
│                                    [Customer]                            │
│                                    Bayar QRIS                            │
│                                         ▼                                │
│                              ┌─────────────────────────────────────┐     │
│                              │          sudah dibayar              │     │
│                              └─────────────────────────────────────┘     │
│                                         │                                │
│                                      [Admin]                             │
│                                 Verifikasi Pembayaran                     │
│                                         ▼                                │
│                              ┌─────────────────────────────────────┐     │
│                              │           diproses                  │     │
│                              └─────────────────────────────────────┘     │
│                                         │                                │
│                                      [Kasir]                             │
│                           ┌──────┬──────┼──────┬──────┐                  │
│                           ▼      ▼      ▼      ▼      ▼                  │
│                      cuci  kering setrika selesai kirim                  │
│                           │      │      │      │      │                  │
│                           ▼      ▼      ▼      ▼      ▼                  │
│                      ┌─────────────────────────────────────┐             │
│                      │          pencucian selesai          │             │
│                      └─────────────────────────────────────┘             │
│                                         │                                │
│                              [Customer]  │  [Kasir]                      │
│                           Pilih Jadwal   │  Kirim                        │
│                           (pengiriman)   │                               │
│                                         ▼                                │
│                              ┌─────────────────────────────────────┐     │
│                              │          pengiriman                │     │
│                              └─────────────────────────────────────┘     │
│                                         │                                │
│                                      [Customer]                          │
│                                   Konfirmasi Terima                       │
│                                         ▼                                │
│                              ┌─────────────────────────────────────┐     │
│                              │           selesai                  │     │
│                              └─────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Alur per Role

### 3.1 Customer (Mobile App)

| Langkah | Aksi | Status Baru | Endpoint |
|---------|------|-------------|----------|
| 1 | Buat pesanan (pilih layanan, shift, metode ambil) | `menunggu konfirmasi` | `POST /pemesanan` |
| 2 | Bayar via QRIS (demo) | `sudah dibayar` | `PATCH /:id/confirm-payment` |
| 3 | Pilih jadwal pengiriman (jika metode = pengiriman) | — (tetap `pencucian selesai`) | `PATCH /:id/set-delivery` |
| 4 | Konfirmasi pesanan diterima | `selesai` | `PATCH /:id/confirm-received` |

**Catatan:** Customer juga bisa batalkan pesanan selama status masih `menunggu konfirmasi` atau `disetujui`.

### 3.2 Admin (Web Dashboard)

| Langkah | Aksi | Status Baru | Endpoint |
|---------|------|-------------|----------|
| 1 | Setujui / Tolak pesanan masuk | `disetujui` / `pesanan ditolak` | `PATCH /:id/status` |
| 2 | Verifikasi pembayaran customer | `diproses` | `PATCH /:id/status` |

**Catatan:** Admin hanya bertugas di hulu (approve) dan verifikasi bayar. Proses cucian ditangani kasir.

### 3.3 Kasir (Web Dashboard)

| Langkah | Aksi | Status Baru | Endpoint |
|---------|------|-------------|----------|
| 1 | Konfirmasi penjemputan | `penjemputan` | `PATCH /:id/confirm-pickup` |
| 2 | Konfirmasi pakaian diterima | `penimbangan` | `PATCH /:id/confirm-clothes` |
| 3 | Input berat cucian | `menunggu pembayaran` | `PATCH /:id/weigh` |
| 4 | Mulai proses cuci | `sedang di cuci` | `PATCH /:id/status` |
| 5 | Mulai keringkan | `sedang di keringkan` | `PATCH /:id/status` |
| 6 | Mulai setrika | `sedang di setrika` | `PATCH /:id/status` |
| 7 | Selesaikan pencucian | `pencucian selesai` | `PATCH /:id/status` |
| 8 | Kirim ke customer (jadwal sudah dipilih customer) | `pengiriman` | `PATCH /:id/status` |

## 4. Tabel Status Lengkap

| Status | Penanggung Jawab | Deskripsi | Transisi yang Valid |
|--------|-----------------|-----------|---------------------|
| `menunggu konfirmasi` | Customer (auto) | Pesanan baru masuk | `disetujui`, `pesanan ditolak`, `pesanan dibatalkan` |
| `disetujui` | Admin | Admin menyetujui pesanan | `penjemputan`, `pesanan dibatalkan` |
| `penjemputan` | Kasir | Kurir menjemput | `penimbangan` |
| `penimbangan` | Kasir | Pakaian diterima, ditimbang | `menunggu pembayaran` |
| `menunggu pembayaran` | Kasir (auto) | Customer harus bayar | `sudah dibayar` |
| `sudah dibayar` | Customer (auto) | Pembayaran via QRIS | `diproses` |
| `diproses` | Admin | Admin verifikasi bayar | `sedang di cuci` |
| `sedang di cuci` | Kasir | Proses pencucian | `sedang di keringkan` |
| `sedang di keringkan` | Kasir | Proses pengeringan | `sedang di setrika`, `pencucian selesai` |
| `sedang di setrika` | Kasir | Proses penyetrikaan | `pencucian selesai` |
| `pencucian selesai` | Kasir | Cucian selesai diproses | `pengiriman` |
| `pengiriman` | Kasir | Sedang dikirim ke customer | `selesai` |
| `selesai` | Customer | Customer konfirmasi terima | — (final) |
| `pesanan ditolak` | Admin | Admin menolak pesanan | — (final) |
| `pesanan dibatalkan` | Customer | Customer batalkan pesanan | — (final) |

## 5. Endpoint API

Semua endpoint di bawah base URL `http://localhost:3000/api/v1/pemesanan`.

| Method | Endpoint | Restricted To | Deskripsi |
|--------|----------|---------------|-----------|
| `POST` | `/` | customer | Buat pesanan baru |
| `PATCH` | `/:id/status` | admin, kasir | Ubah status pesanan |
| `PATCH` | `/:id/cancel` | — (protect) | Batalkan pesanan |
| `PATCH` | `/:id/confirm-pickup` | kasir, admin | Konfirmasi penjemputan |
| `PATCH` | `/:id/confirm-clothes` | kasir, admin | Konfirmasi pakaian diterima |
| `PATCH` | `/:id/weigh` | kasir, admin | Input berat cucian |
| `GET` | `/:id/qris` | customer | Generate QR code pembayaran |
| `PATCH` | `/:id/confirm-payment` | customer | Konfirmasi pembayaran QRIS |
| `PATCH` | `/:id/set-delivery` | customer | Set jadwal pengiriman |
| `PATCH` | `/:id/confirm-received` | customer | Konfirmasi pesanan diterima |

## 6. Catatan Penting

### Path-Based Routing (Web)
Dashboard web menggunakan path-based routing (`/admin/beranda`, `/kasir/confirm-orders`, `/owner/beranda`) tanpa react-router. Role ditentukan dari URL path. Saat akses via URL tanpa login real, semua handler menggunakan state lokal (demo) — tidak ada panggilan API.

### Multi-Tab dengan Role Berbeda
Token JWT disimpan per role di localStorage dengan key `lw_token_{role}` (misal `lw_token_kasir`, `lw_token_admin`). Setiap tab bisa login dengan role berbeda tanpa saling timpa token.

### Kolom Database Terkait Pengiriman
Migration `006_add_delivery_columns` menambah dua kolom di tabel `pemesanan`:
- `tanggal_pengiriman DATE` — tanggal yang dipilih customer
- `shift_pengiriman VARCHAR(20)` — shift (pagi/siang/sore/malam)

Diisi oleh customer via mobile (`PATCH /:id/set-delivery`), dibaca oleh kasir di web sebelum mengirim.

### Demo Mode
Saat mengakses dashboard via URL path tanpa login (`/admin/berana`, `/kasir/dashboard`, dll):
- `fetchData` tidak memanggil API backend (skipped karena `!authRole`)
- Semua handler (approve, weigh, update status, dll) update state lokal langsung
- Data menggunakan `initialData.ts` sebagai seed
- Tidak ada error 403/429 karena tidak ada request API
