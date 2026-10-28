function requireApiKey(apiKey) {
  return (req, res, next) => {
    if (req.method === 'GET') return next();

    if (typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(503).json({
        status: 'error',
        message: 'API key belum dikonfigurasi di server',
        data: null,
      });
    }

    if (req.get('x-api-key') !== apiKey) {
      return res.status(401).json({
        status: 'error',
        message: 'API key tidak valid',
        data: null,
      });
    }

    return next();
  };
}

module.exports = requireApiKey;
