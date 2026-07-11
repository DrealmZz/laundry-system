# Testing — Notifikasi Customer

## Prerequisites

- Customer login (via mobile app atau API)
- Minimal ada 1 notifikasi di database (bisa dari hasil test booking sebelumnya)
- Admin / Kasir login (untuk create notifikasi)

## Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/notifications` | customer |
| GET | `/notifications/count` | customer |
| PATCH | `/notifications/:id/read` | customer |
| POST | `/notifications` | admin, kasir |

---

## A. Read Notifications

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | List notifikasi customer | `GET /notifications` (token customer) | — | Response 200, array notifikasi, terurut by created_at DESC | | |
| A2 | List dengan pagination | `GET /notifications?page=1&limit=5` | — | Response 200, `data.items` max 5 | | |
| A3 | Count unread | `GET /notifications/count` | — | Response 200, `data.count` (jumlah notif belum dibaca) | | |
| A4 | Non-customer akses notif | `GET /notifications` (token admin) | — | Response 403 | | |

## B. Mark as Read

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Tandai notifikasi sudah dibaca | `PATCH /notifications/{id}/read` (token customer) | — | Response 200, `is_read = true` | | |
| B2 | Tandai notifikasi yang sudah dibaca | `PATCH /notifications/{id}/read` lagi | — | Response 200 (idempotent) | | |
| B3 | Tandai notifikasi orang lain | `PATCH /notifications/{id}/read` (customer lain) | — | Response 403 / not found | | |
| B4 | Tandai notifikasi tidak ada | `PATCH /notifications/99999/read` | — | Response 404 | | |
| B5 | Verifikasi count berubah | `GET /notifications/count` setelah B1 | Count berkurang 1 | | |

## C. Create Notification (Admin / Kasir)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Admin buat notifikasi | `POST /notifications` (token admin) | `{ "id_pemesanan": 1, "id_customer": 1, "judul": "Promo Spesial", "isi_pesan": "Dapatkan diskon 20% untuk transaksi berikutnya!" }` | Response 201 | | |
| C2 | Kasir buat notifikasi | `POST /notifications` (token kasir) | — | Response 201 | | |
| C3 | Buat notifikasi tanpa id_customer | `POST /notifications` | `{ "judul": "Test", "isi_pesan": "Test" }` | Response 400 | | |
| C4 | Customer coba buat notifikasi | `POST /notifications` (token customer) | — | Response 403 | | |

## D. Mobile UI

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| D1 | Badge unread di header | Buka app | Icon bell dengan badge angka = unread count | | |
| D2 | Buka layar notifikasi | Tap icon bell | Daftar notifikasi: icon, judul, isi, waktu, status read/unread | | |
| D3 | Mark as read | Tap notifikasi yang unread | Notif berubah jadi read, badge berkurang | | |
| D4 | Pull to refresh | Tarik ke bawah | Data ter-refresh | | |
| D5 | Tap notifikasi dengan id_pemesanan | Tap notif yang punya id_pemesanan | Navigasi ke TrackingScreen pesanan tsb | | |

---

## Notification Triggers (Auto-generated)

Notifikasi dibuat otomatis oleh sistem saat:

| Event | Judul Notifikasi |
|-------|-----------------|
| Booking dibuat | (opsional) |
| Booking disetujui admin | "Pesanan Disetujui" |
| Booking ditolak admin | "Pesanan Ditolak: {alasan}" |
| Berat ditimbang kasir | "Pesanan Menunggu Pembayaran" |
| Pembayaran diverifikasi | "Pembayaran Diterima" |
| Pesanan selesai | "Pesanan Selesai" |

---

## Edge Cases

- Customer hanya melihat notifikasinya sendiri (filter by id_customer dari token)
- Unread count = jumlah notif dengan `is_read = false`
- Pagination default limit (backend): 10 atau 20 per page
- Notifikasi bisa dibuat manual oleh admin/kasir untuk pengumuman
