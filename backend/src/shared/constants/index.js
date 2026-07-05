const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  KASIR: 'kasir',
  CUSTOMER: 'customer'
};

const USER_TABLES = {
  CUSTOMER: 'customer',
  KARYAWAN: 'karyawan',
  OWNER: 'owner'
};

const BOOKING_STATUS = {
  MENUNGGU_KONFIRMASI: 'menunggu konfirmasi',
  DISETUJUI: 'disetujui',
  PENJEMPUTAN: 'penjemputan',
  PENIMBANGAN: 'penimbangan',
  MENUNGGU_PEMBAYARAN: 'menunggu pembayaran',
  SUDAH_DIBAYAR: 'sudah dibayar',
  DIPROSES: 'diproses',
  SEDANG_DI_CUCI: 'sedang di cuci',
  SEDANG_DI_KERINGKAN: 'sedang di keringkan',
  SEDANG_DI_SETRIKA: 'sedang di setrika',
  PENCUCIAN_SELESAI: 'pencucian selesai',
  PENGIRIMAN: 'pengiriman',
  SELESAI: 'selesai',
  PESANAN_DITOLAK: 'pesanan ditolak',
  PESANAN_DIBATALKAN: 'pesanan dibatalkan'
};

const SHIFT_NAMES = {
  PAGI: 'pagi',
  SIANG: 'siang',
  SORE: 'sore',
  MALAM: 'malam'
};

module.exports = { ROLES, USER_TABLES, BOOKING_STATUS, SHIFT_NAMES };
