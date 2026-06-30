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
  PESANAN_DITOLAK: 'pesanan ditolak',
  MENUNGGU_PEMBAYARAN: 'menunggu pembayaran',
  SUDAH_DIBAYAR: 'sudah dibayar',
  DIPROSES: 'diproses',
  SEDANG_DI_CUCI: 'sedang di cuci',
  SEDANG_DI_KERINGKAN: 'sedang di keringkan',
  SEDANG_DI_SETRIKA: 'sedang di setrika',
  PENCUCIAN_SELESAI: 'pencucian selesai',
  SELESAI: 'selesai'
};

module.exports = { ROLES, USER_TABLES, BOOKING_STATUS };
