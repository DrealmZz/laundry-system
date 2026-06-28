module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Terjadi kesalahan pada server.'
    : err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
  });
};
