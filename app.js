const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedTypes = ['putra', 'putri', 'campur'];

app.use(express.json());

let boardingRooms = [
  {
    id: 1,
    nomorKamar: 'A-01',
    tipe: 'putra',
    hargaPerBulan: 850000,
    fasilitas: ['WiFi', 'lemari', 'kipas angin'],
    tersedia: true
  },
  {
    id: 2,
    nomorKamar: 'B-03',
    tipe: 'putri',
    hargaPerBulan: 1100000,
    fasilitas: ['AC', 'kamar mandi dalam', 'WiFi'],
    tersedia: true
  },
  {
    id: 3,
    nomorKamar: 'C-02',
    tipe: 'campur',
    hargaPerBulan: 950000,
    fasilitas: ['WiFi', 'meja belajar'],
    tersedia: false
  }
];

let nextId = 4;

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    status: 'error',
    message,
    data: null
  });
}

function validateRoom(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Body harus berupa object JSON.' };
  }

  const errors = [];

  if (typeof body.nomorKamar !== 'string' || body.nomorKamar.trim() === '') {
    errors.push('nomorKamar wajib berupa string yang tidak kosong.');
  }

  if (typeof body.tipe !== 'string' || !allowedTypes.includes(body.tipe)) {
    errors.push('tipe wajib diisi dengan salah satu nilai: putra, putri, atau campur.');
  }

  if (typeof body.hargaPerBulan !== 'number' || !Number.isFinite(body.hargaPerBulan) || body.hargaPerBulan <= 0) {
    errors.push('hargaPerBulan wajib berupa angka lebih dari 0.');
  }

  if (body.fasilitas !== undefined && (!Array.isArray(body.fasilitas) || !body.fasilitas.every((item) => typeof item === 'string'))) {
    errors.push('fasilitas harus berupa array string.');
  }

  if (body.tersedia !== undefined && typeof body.tersedia !== 'boolean') {
    errors.push('tersedia harus berupa boolean.');
  }

  if (errors.length > 0) {
    return { error: errors.join(' ') };
  }

  return {
    value: {
      nomorKamar: body.nomorKamar.trim(),
      tipe: body.tipe,
      hargaPerBulan: body.hargaPerBulan,
      fasilitas: body.fasilitas === undefined ? [] : body.fasilitas,
      tersedia: body.tersedia === undefined ? true : body.tersedia
    }
  };
}

// GET /
app.get('/', (req, res) => {
  return res.status(200).json({
    namaMahasiswa: 'Agus Firman',
    npm: '[2428240144]',
    nomorAbsen: 26,
    topik: 'Rumah Kos - Kamar Kos',
    endpoints: [
      'GET /boarding-rooms',
      'GET /boarding-rooms?tipe=putri',
      'GET /boarding-rooms/:id',
      'POST /boarding-rooms',
      'PUT /boarding-rooms/:id',
      'DELETE /boarding-rooms/:id'
    ]
  });
});

// GET /boarding-rooms
app.get('/boarding-rooms', (req, res) => {
  const { tipe } = req.query;

  if (tipe === undefined) {
    return res.status(200).json(boardingRooms);
  }

  if (typeof tipe !== 'string' || !allowedTypes.includes(tipe)) {
    return sendError(res, 400, 'Filter tipe harus berupa putra, putri, atau campur.');
  }

  const filteredRooms = boardingRooms.filter((room) => room.tipe === tipe);
  return res.status(200).json(filteredRooms);
});

// GET /boarding-rooms/:id
app.get('/boarding-rooms/:id', (req, res) => {
  const room = boardingRooms.find((item) => item.id === Number(req.params.id));

  if (!room) {
    return sendError(res, 404, 'Kamar kos tidak ditemukan.');
  }

  return res.status(200).json(room);
});

// POST /boarding-rooms
// Body: { "nomorKamar": "A-07", "tipe": "putri", "hargaPerBulan": 1100000, "fasilitas": ["AC", "kamar mandi dalam", "WiFi"], "tersedia": true }
app.post('/boarding-rooms', (req, res) => {
  const validation = validateRoom(req.body);

  if (validation.error) {
    return sendError(res, 400, validation.error);
  }

  const newRoom = {
    id: nextId,
    ...validation.value
  };

  nextId += 1;
  boardingRooms.push(newRoom);

  return res.status(201).json({
    status: 'success',
    message: 'Kamar kos berhasil ditambahkan.',
    data: newRoom
  });
});

// PUT /boarding-rooms/:id
// Body: { "nomorKamar": "A-07", "tipe": "putri", "hargaPerBulan": 1100000, "fasilitas": ["AC", "kamar mandi dalam", "WiFi"], "tersedia": true }
app.put('/boarding-rooms/:id', (req, res) => {
  const roomIndex = boardingRooms.findIndex((item) => item.id === Number(req.params.id));

  if (roomIndex === -1) {
    return sendError(res, 404, 'Kamar kos tidak ditemukan.');
  }

  const validation = validateRoom(req.body);

  if (validation.error) {
    return sendError(res, 400, validation.error);
  }

  const updatedRoom = {
    id: boardingRooms[roomIndex].id,
    ...validation.value
  };

  boardingRooms[roomIndex] = updatedRoom;

  return res.status(200).json({
    status: 'success',
    message: 'Kamar kos berhasil diperbarui.',
    data: updatedRoom
  });
});

// DELETE /boarding-rooms/:id
app.delete('/boarding-rooms/:id', (req, res) => {
  const roomIndex = boardingRooms.findIndex((item) => item.id === Number(req.params.id));

  if (roomIndex === -1) {
    return sendError(res, 404, 'Kamar kos tidak ditemukan.');
  }

  const [deletedRoom] = boardingRooms.splice(roomIndex, 1);

  return res.status(200).json({
    status: 'success',
    message: 'Kamar kos berhasil dihapus.',
    data: deletedRoom
  });
});

// Catch-all 404 untuk endpoint yang tidak terdaftar
app.use((req, res) => {
  return sendError(res, 404, 'Endpoint tidak ditemukan.');
});

// Pastikan error parser JSON juga selalu menghasilkan response JSON.
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Body JSON tidak valid.');
  }

  if (err.type === 'entity.too.large') {
    return sendError(res, 413, 'Ukuran body JSON terlalu besar.');
  }

  return sendError(res, 500, 'Terjadi kesalahan pada server.');
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server API berjalan pada http://localhost:${PORT}`);
  });
}
