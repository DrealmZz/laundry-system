# Software Requirements Specification (SRS) - Sistem Manajemen Laundry Hybrid

## 1. Pendahuluan
Dokumen ini menjelaskan persyaratan fungsional dan non-fungsional untuk Sistem Manajemen Laundry Hybrid (Kiloan & Koin). Sistem ini dirancang untuk mempermudah operasional outlet laundry serta memberikan kemudahan bagi pelanggan dalam melakukan booking layanan secara mandiri lewat aplikasi mobile.

## 2. Aturan Bisnis Utama (Critical Business Rules)
- **Keamanan Akun**: Akun pengguna akan terkunci selama 15 menit jika gagal melakukan login sebanyak 3 kali berturut-turut.
- **Booking Pelanggan**: Setiap Customer hanya diperbolehkan memiliki maksimal 1 booking aktif dalam satu waktu (`menunggu_konfirmasi`, `dikonfirmasi`, `diproses`).
- **Booking Koin**: Pemesanan layanan laundry koin hanya berlaku untuk hari yang sama (H+0) sampai hari berikutnya (H+1).
- **Cut-off Time Kiloan**: Pesanan kiloan yang masuk sebelum batas waktu cut-off akan diproses pada shift hari yang sama, sisanya masuk ke shift berikutnya.
- **Batasan Shift Kasir**: Kasir hanya diizinkan memproses transaksi yang berada dalam shift kerjanya sendiri.
- **Akses Laporan**: Laporan keuangan eksklusif hanya dapat diakses oleh Owner.
- **Audit Logging**: Semua aktivitas penting sistem wajib dicatat ke dalam log audit (mencakup `user_id`, `action`, dan `timestamp`).

## 3. Manajemen Pengguna & Peran (Role-based Access)
- **Customer**: Melakukan registrasi, melihat layanan, melakukan booking koin/kiloan, melihat riwayat transaksi.
- **Kasir**: Memverifikasi booking, memproses pembayaran, mengelola status laundry kiloan, mencetak struk belanja.
- **Admin**: Mengelola data master (karyawan, layanan, mesin cuci/pengering), mengatur jadwal shift kasir.
- **Owner**: Melihat dashboard performa, mengakses laporan keuangan analitis dan log audit menyeluruh.
