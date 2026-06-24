const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  KASIR: 'kasir',
  CUSTOMER: 'customer'
};

const BOOKING_STATUS = {
  MENUNGGU_KONFIRMASI: 'menunggu_konfirmasi',
  DIKONFIRMASI: 'dikonfirmasi',
  DIPROSES: 'diproses',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan'
};

module.exports = { ROLES, BOOKING_STATUS };
