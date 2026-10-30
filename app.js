require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const createBoardingRoomsRouter = require('./routes/boardingRooms');
const BoardingRoom = require('./models/BoardingRoomsModel');

const PORT = process.env.PORT || 3000;

function createApp({
  apiKey = process.env.API_KEY,
  roomModel = BoardingRoom,
} = {}) {
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
        'GET /boarding-rooms?page=1&limit=10',
        'GET /boarding-rooms?sort=nomorKamar&fields=id,nomorKamar',
        'GET /boarding-rooms/summary',
        'GET /boarding-rooms/:id',
        'POST /boarding-rooms',
        'PUT /boarding-rooms/:id',
        'DELETE /boarding-rooms/:id',
        'GET /boarding-rooms?tipe=putri',
      ],
    });
  });

  app.use('/boarding-rooms', createBoardingRoomsRouter({ apiKey, roomModel }));

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
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: Object.values(err.errors)[0].message,
        data: null,
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Nomor kamar atau id sudah terdaftar',
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

async function startServer() {
  if (!process.env.DB_URI) {
    throw new Error('DB_URI belum dikonfigurasi');
  }

  await mongoose.connect(process.env.DB_URI);
  const app = createApp();
  return app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

const app = createApp();

if (require.main === module) {
  startServer().catch((err) => {
    console.error(`Gagal memulai server MongoDB (${err.name || 'Error'}${err.code ? `, kode ${err.code}` : ''})`);
    process.exitCode = 1;
  });
}

module.exports = app;
module.exports.createApp = createApp;
module.exports.startServer = startServer;
