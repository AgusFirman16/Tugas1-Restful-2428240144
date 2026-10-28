// Format semua respons error dibuat seragam: { status, message, data }.
function kirimError(res, status, message) {
  return res.status(status).json({ status: 'error', message, data: null });
}

function errorHttp(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function notFoundHandler(req, res) {
  return kirimError(res, 404, 'Endpoint tidak ditemukan');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return kirimError(res, 400, 'Format JSON tidak valid');
  }
  if (err.name === 'ValidationError') {
    return kirimError(res, 400, Object.values(err.errors)[0].message);
  }
  if (err.code === 11000) {
    return kirimError(res, 409, 'Nomor kamar sudah terdaftar');
  }

  const status = err.status || 500;
  if (status === 500) {
    console.error(err.stack);
    return kirimError(res, 500, 'Terjadi kesalahan pada server');
  }

  return kirimError(res, status, err.message);
}

module.exports = { errorHttp, kirimError, notFoundHandler, errorHandler };