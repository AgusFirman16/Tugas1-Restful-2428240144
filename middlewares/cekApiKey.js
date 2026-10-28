const { kirimError } = require('./errorHandler');

function cekApiKey(apiKey) {
  return (req, res, next) => {
    if (req.method === 'GET') return next();

    if (typeof apiKey !== 'string' || !apiKey.trim()) {
      return kirimError(res, 503, 'API key belum dikonfigurasi di server');
    }

    if (req.get('x-api-key') !== apiKey) {
      return kirimError(res, 401, 'API key tidak valid');
    }

    return next();
  };
}

module.exports = cekApiKey;