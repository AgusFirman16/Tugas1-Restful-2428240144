require('dotenv').config();

const express = require('express');
const createBoardingRoomsRouter = require('./routes/boardingRooms');

const PORT = process.env.PORT || 3000;

function createApp({ apiKey = process.env.API_KEY } = {}) {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      nama: 'Agus Firman',
      nim: '2428240144',
      topik: 26,
      resource: 'Kamar Kos',
      endpoints: [
        'GET /boarding-rooms',
        'GET /boarding-rooms/:id',
        'POST /boarding-rooms',
        'PUT /boarding-rooms/:id',
        'DELETE /boarding-rooms/:id',
        'GET /boarding-rooms?tipe=putri',
      ],
    });
  });

  app.use('/boarding-rooms', createBoardingRoomsRouter({ apiKey }));

  app.use((req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Endpoint tidak ditemukan',
      data: null,
    });
  });

  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        status: 'error',
        message: 'Format JSON tidak valid',
        data: null,
      });
    }

    console.error(err.stack);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      data: null,
    });
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
